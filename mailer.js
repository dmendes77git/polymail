/**
 * Multi-Lingual Mailing List - Mailer Engine & Dispatch Simulator
 */

const MailerEngine = {
  isSending: false,
  isPaused: false,
  abortController: null,

  sentHistory: [],
  logs: [],

  // Interpolate variables in subject and body
  interpolate(text, recipient) {
    if (!text) return '';
    let result = text;

    const todayStr = new Date().toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const langNames = {
      pt: 'Português',
      en: 'English',
      fr: 'Français',
      es: 'Español'
    };

    // Clean up any editor span tags around variables first
    result = result.replace(/<span class="editor-variable-tag"[^>]*>(\{\{[^}]+\}\})<\/span>/gi, '$1');

    const vars = {
      '{{name}}': recipient.name || 'Friend',
      '{{Name}}': recipient.name || 'Friend',
      '{{NAME}}': (recipient.name || 'Friend').toUpperCase(),
      '{{email}}': recipient.email || '',
      '{{Email}}': recipient.email || '',
      '{{language}}': langNames[recipient.language] || recipient.language,
      '{{raw_language}}': recipient.rawLanguage || recipient.language,
      '{{date}}': todayStr,
      '{{unsubscribe}}': `<a href="#unsubscribe" style="color: #64748b; text-decoration: underline;">Unsubscribe / Cancelar inscrição</a>`
    };

    Object.entries(vars).forEach(([tag, val]) => {
      // Escape tag for regex
      const regex = new RegExp(tag.replace(/([{}])/g, '\\$1'), 'g');
      result = result.replace(regex, val);
    });

    return result;
  },

  // Generate rendered email for a specific recipient
  renderEmailForRecipient(recipient) {
    if (!recipient) return null;

    const lang = recipient.language || 'en';
    const template = window.MailEditor.getTemplateForLanguage(lang);

    const interpolatedSubject = this.interpolate(template.subject, recipient);
    const interpolatedBody = this.interpolate(template.body, recipient);

    return {
      recipient,
      language: lang,
      languageMeta: window.CSVParser.languages[lang] || { name: lang, flag: '🌐' },
      subject: interpolatedSubject,
      htmlBody: interpolatedBody,
      plainText: interpolatedBody.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(),
      renderedAt: new Date().toISOString()
    };
  },

  // Dispatch campaign to all valid recipients
  async dispatchCampaign(recipients, options = {}, callbacks = {}) {
    if (this.isSending) return;
    this.isSending = true;
    this.isPaused = false;

    const validRecipients = recipients.filter(r => r.isValidEmail);
    const total = validRecipients.length;

    if (total === 0) {
      this.isSending = false;
      if (callbacks.onError) callbacks.onError('No valid recipients found to send emails to.');
      return;
    }

    const delayMs = options.delayMs !== undefined ? options.delayMs : 250; // default 250ms per email
    const senderName = options.senderName || 'Mailing List Service';
    const senderEmail = options.senderEmail || 'campaign@news.company.com';

    if (callbacks.onStart) {
      callbacks.onStart({ total, recipients: validRecipients });
    }

    const batchId = `batch_${Date.now()}`;
    let sentCount = 0;
    let failedCount = 0;

    for (let i = 0; i < total; i++) {
      if (!this.isSending) {
        // Aborted
        break;
      }

      while (this.isPaused) {
        await new Promise(r => setTimeout(r, 200));
        if (!this.isSending) break;
      }

      const rec = validRecipients[i];
      const rendered = this.renderEmailForRecipient(rec);

      // Create dispatched record
      const dispatchRecord = {
        id: `mail_${Date.now()}_${i}`,
        batchId,
        recipientId: rec.id,
        recipientName: rec.name,
        recipientEmail: rec.email,
        language: rec.language,
        subject: rendered.subject,
        htmlBody: rendered.htmlBody,
        senderName,
        senderEmail,
        status: 'delivered',
        timestamp: new Date(),
        deliveredTimeStr: new Date().toLocaleTimeString()
      };

      // Record to history and logs
      this.sentHistory.unshift(dispatchRecord);
      this.logs.unshift({
        id: dispatchRecord.id,
        time: dispatchRecord.deliveredTimeStr,
        level: 'success',
        message: `Dispatched to ${rec.name} (${rec.email}) [${rec.language.toUpperCase()}]`,
        subject: rendered.subject,
        details: dispatchRecord
      });

      sentCount++;

      if (callbacks.onProgress) {
        callbacks.onProgress({
          index: i + 1,
          total,
          percent: Math.round(((i + 1) / total) * 100),
          currentRecipient: rec,
          record: dispatchRecord,
          sentCount,
          failedCount
        });
      }

      if (delayMs > 0 && i < total - 1) {
        await new Promise(r => setTimeout(r, delayMs));
      }
    }

    this.isSending = false;
    this.isPaused = false;

    if (callbacks.onComplete) {
      callbacks.onComplete({
        batchId,
        total,
        sentCount,
        failedCount,
        history: this.sentHistory
      });
    }

    this.saveSentHistory();
  },

  pause() {
    this.isPaused = true;
  },

  resume() {
    this.isPaused = false;
  },

  stop() {
    this.isSending = false;
    this.isPaused = false;
  },

  saveSentHistory() {
    try {
      // Keep last 200 sent emails in storage
      const toSave = this.sentHistory.slice(0, 200);
      localStorage.setItem('mailing_list_sent_history', JSON.stringify(toSave));
    } catch (e) {
      console.warn('Failed to save sent history to storage', e);
    }
  },

  loadSentHistory() {
    try {
      const saved = localStorage.getItem('mailing_list_sent_history');
      if (saved) {
        this.sentHistory = JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load sent history', e);
    }
  },

  exportLogsToCSV() {
    if (this.sentHistory.length === 0) return null;

    const headers = ['ID', 'Timestamp', 'Recipient Name', 'Recipient Email', 'Language', 'Subject', 'Status'];
    const rows = this.sentHistory.map(item => [
      `"${item.id}"`,
      `"${new Date(item.timestamp).toISOString()}"`,
      `"${(item.recipientName || '').replace(/"/g, '""')}"`,
      `"${(item.recipientEmail || '').replace(/"/g, '""')}"`,
      `"${(item.language || '').toUpperCase()}"`,
      `"${(item.subject || '').replace(/"/g, '""')}"`,
      `"${item.status}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    return csvContent;
  }
};

window.MailerEngine = MailerEngine;
