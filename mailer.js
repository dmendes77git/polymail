/**
 * Bom Sucesso Mailing - Motor de Disparo & Simulador de Telemetria
 * Idioma de Interface: Português (PT-PT)
 */

const MailerEngine = {
  isSending: false,
  isPaused: false,
  abortController: null,

  sentHistory: [],
  logs: [],

  // Interpolar variáveis no assunto e no corpo do e-mail
  interpolate(text, recipient) {
    if (!text) return '';
    let result = text;

    const todayStr = new Date().toLocaleDateString('pt-PT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const langNames = {
      pt: 'Português',
      en: 'Inglês',
      fr: 'Francês',
      es: 'Espanhol'
    };

    // Limpar quaisquer etiquetas span em torno das variáveis
    result = result.replace(/<span class="editor-variable-tag"[^>]*>(\{\{[^}]+\}\})<\/span>/gi, '$1');

    const vars = {
      '{{name}}': recipient.name || 'Caro(a) Cliente',
      '{{Name}}': recipient.name || 'Caro(a) Cliente',
      '{{NAME}}': (recipient.name || 'Caro(a) Cliente').toUpperCase(),
      '{{email}}': recipient.email || '',
      '{{Email}}': recipient.email || '',
      '{{language}}': langNames[recipient.language] || recipient.language,
      '{{raw_language}}': recipient.rawLanguage || recipient.language,
      '{{date}}': todayStr,
      '{{unsubscribe}}': `<a href="#cancelar-inscricao" style="color: #64748b; text-decoration: underline;">Cancelar inscrição / Unsubscribe</a>`
    };

    Object.entries(vars).forEach(([tag, val]) => {
      const regex = new RegExp(tag.replace(/([{}])/g, '\\$1'), 'g');
      result = result.replace(regex, val);
    });

    return result;
  },

  // Gerar e-mail renderizado para um destinatário específico
  renderEmailForRecipient(recipient) {
    if (!recipient) return null;

    const lang = recipient.language || 'pt';
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

  // Disparar campanha para todos os destinatários válidos
  async dispatchCampaign(recipients, options = {}, callbacks = {}) {
    if (this.isSending) return;
    this.isSending = true;
    this.isPaused = false;

    const validRecipients = recipients.filter(r => r.isValidEmail);
    const total = validRecipients.length;

    if (total === 0) {
      this.isSending = false;
      if (callbacks.onError) callbacks.onError('Nenhum destinatário válido encontrado para envio.');
      return;
    }

    const delayMs = options.delayMs !== undefined ? options.delayMs : 250;
    const senderName = options.senderName || 'Bom Sucesso Mailing';
    const senderEmail = options.senderEmail || 'ownersbomsucesso@gmail.com';

    if (callbacks.onStart) {
      callbacks.onStart({ total, recipients: validRecipients });
    }

    const batchId = `lote_${Date.now()}`;
    let sentCount = 0;
    let failedCount = 0;

    for (let i = 0; i < total; i++) {
      if (!this.isSending) {
        break; // Cancelado
      }

      while (this.isPaused) {
        await new Promise(r => setTimeout(r, 200));
        if (!this.isSending) break;
      }

      const rec = validRecipients[i];
      const rendered = this.renderEmailForRecipient(rec);

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
        deliveredTimeStr: new Date().toLocaleTimeString('pt-PT')
      };

      this.sentHistory.unshift(dispatchRecord);
      this.logs.unshift({
        id: dispatchRecord.id,
        time: dispatchRecord.deliveredTimeStr,
        level: 'success',
        message: `Enviado para ${rec.name} (${rec.email}) [${rec.language.toUpperCase()}]`,
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
      const toSave = this.sentHistory.slice(0, 200);
      localStorage.setItem('bomsucesso_mailing_sent_history', JSON.stringify(toSave));
    } catch (e) {
      console.warn('Falha ao guardar histórico no armazenamento local', e);
    }
  },

  loadSentHistory() {
    try {
      const saved = localStorage.getItem('bomsucesso_mailing_sent_history') || localStorage.getItem('mailing_list_sent_history');
      if (saved) {
        this.sentHistory = JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Falha ao carregar histórico de envios', e);
    }
  },

  exportLogsToCSV() {
    if (this.sentHistory.length === 0) return null;

    const headers = ['ID', 'Data_Hora', 'Nome_Destinatario', 'Email_Destinatario', 'Idioma', 'Assunto', 'Estado'];
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
