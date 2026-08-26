/**
 * PolyMail - Multi-Lingual Mailing List Application Controller
 */

const App = {
  recipients: [],
  filteredRecipients: [],
  selectedPreviewRecipientId: null,
  activeTab: 'tab-audience',

  init() {
    // 1. Initialize Sub-modules
    window.CSVParser = window.CSVParser || {};
    window.MailEditor.init();
    window.MailerEngine.loadSentHistory();

    // 2. Load contacts from storage
    this.loadContactsFromStorage();

    // 3. Bind UI Events
    this.bindNavigation();
    this.bindCSVUpload();
    this.bindContactActions();
    this.bindPreviewView();
    this.bindDispatchCenter();
    this.bindModals();
    this.bindSaveDraft();

    // 4. Initial Render
    this.renderAudienceTable();
    this.updateStatsCards();
    this.renderTerminalLogs();
    this.updateHeaderBadges();

    // Auto-load sample contacts if list is empty for immediate rich experience
    if (this.recipients.length === 0) {
      this.loadSampleContacts(false);
    }
  },

  // Toast Notification System
  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icons = {
      success: '✅',
      error: '❌',
      info: 'ℹ️',
      warning: '⚠️'
    };

    toast.innerHTML = `
      <span style="font-size: 1.1rem;">${icons[type] || 'ℹ️'}</span>
      <div style="flex: 1;">${message}</div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(20px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  },

  // Navigation Tabs Switching
  bindNavigation() {
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');
        this.switchTab(targetTab);
      });
    });

    // Next Step Shortcut Buttons
    const gotoComposer = document.getElementById('btn-goto-composer');
    if (gotoComposer) {
      gotoComposer.addEventListener('click', () => this.switchTab('tab-composer'));
    }

    const gotoPreview = document.getElementById('btn-goto-preview');
    if (gotoPreview) {
      gotoPreview.addEventListener('click', () => this.switchTab('tab-preview'));
    }

    const gotoDispatch = document.getElementById('btn-goto-dispatch');
    if (gotoDispatch) {
      gotoDispatch.addEventListener('click', () => this.switchTab('tab-dispatch'));
    }

    const headerSendBtn = document.getElementById('btn-header-send');
    if (headerSendBtn) {
      headerSendBtn.addEventListener('click', () => this.openConfirmDispatchModal());
    }
  },

  switchTab(tabId) {
    this.activeTab = tabId;

    // Update Nav Buttons
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      if (btn.getAttribute('data-tab') === tabId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Update Views
    document.querySelectorAll('.tab-view').forEach(view => {
      if (view.id === tabId) {
        view.classList.add('active');
      } else {
        view.classList.remove('active');
      }
    });

    // Tab-specific hooks
    if (tabId === 'tab-preview') {
      this.renderPreviewRecipientList();
      this.renderPreviewCard();
    } else if (tabId === 'tab-dispatch') {
      this.updateDispatchHero();
    } else if (tabId === 'tab-composer') {
      window.MailEditor.renderCurrentLanguage();
    }
  },

  // CSV File Upload & Dropzone
  bindCSVUpload() {
    const dropzone = document.getElementById('csv-dropzone');
    const fileInput = document.getElementById('csv-file-input');

    if (!dropzone || !fileInput) return;

    dropzone.addEventListener('click', () => fileInput.click());

    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('drag-over');
    });

    dropzone.addEventListener('dragleave', () => {
      dropzone.classList.remove('drag-over');
    });

    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('drag-over');
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        this.handleFileUpload(e.dataTransfer.files[0]);
      }
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length > 0) {
        this.handleFileUpload(e.target.files[0]);
        e.target.value = ''; // reset
      }
    });

    // Load sample buttons
    const sampleBtn = document.getElementById('btn-load-sample');
    if (sampleBtn) {
      sampleBtn.addEventListener('click', () => this.loadSampleContacts(true));
    }

    const emptySampleBtn = document.getElementById('btn-empty-load-sample');
    if (emptySampleBtn) {
      emptySampleBtn.addEventListener('click', () => this.loadSampleContacts(true));
    }
  },

  handleFileUpload(file) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const csvText = e.target.result;
      const parsed = window.CSVParser.parse(csvText);

      if (parsed.recipients.length === 0) {
        this.showToast('No valid recipient rows found in the CSV file.', 'error');
        return;
      }

      this.recipients = parsed.recipients;
      this.saveContactsToStorage();
      this.renderAudienceTable();
      this.updateStatsCards();
      this.updateHeaderBadges();

      this.showToast(`Imported ${parsed.recipients.length} recipients across 4 languages!`, 'success');
    };

    reader.onerror = () => {
      this.showToast('Failed to read the uploaded CSV file.', 'error');
    };

    reader.readAsText(file);
  },

  loadSampleContacts(showNotification = true) {
    const sampleCSV = `name,email,language
Ana Silva,ana.silva@empresa.pt,Portuguese
Johnathan Miller,john.miller@techcorp.com,English
Camille Dupont,camille.dupont@paris-solutions.fr,French
Carlos Mendoza,carlos.mendoza@negocios.es,Spanish
Mateo Rossi,mateo.rossi@lisboa-tech.pt,pt
Sarah Jenkins,sarah.jenkins@globalmedia.org,en
Étienne Moreau,etienne.moreau@lyon-design.fr,fr
Lucía Fernandez,lucia.fernandez@madrid-digital.es,es
Thiago Oliveira,thiago.oliveira@saopaulo.br,Portuguese
Emily Watson,emily.watson@startup.io,English
Claire Beauchamp,claire.beauchamp@marseille.fr,French
Diego Ramirez,diego.ramirez@buenosaires.ar,Spanish`;

    const parsed = window.CSVParser.parse(sampleCSV);
    this.recipients = parsed.recipients;
    this.saveContactsToStorage();
    this.renderAudienceTable();
    this.updateStatsCards();
    this.updateHeaderBadges();

    if (showNotification) {
      this.showToast('Loaded 12 sample contacts (Portuguese, English, French, Spanish).', 'success');
    }
  },

  // Audience Table & Filtering
  bindContactActions() {
    const searchInput = document.getElementById('contact-search-input');
    const langFilter = document.getElementById('contact-lang-filter');
    const clearBtn = document.getElementById('btn-clear-contacts');

    if (searchInput) {
      searchInput.addEventListener('input', () => this.filterAndRenderContacts());
    }

    if (langFilter) {
      langFilter.addEventListener('change', () => this.filterAndRenderContacts());
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (this.recipients.length === 0) return;
        if (confirm('Are you sure you want to clear all recipients from your audience?')) {
          this.recipients = [];
          this.saveContactsToStorage();
          this.renderAudienceTable();
          this.updateStatsCards();
          this.updateHeaderBadges();
          this.showToast('Audience cleared.', 'info');
        }
      });
    }
  },

  filterAndRenderContacts() {
    const searchInput = document.getElementById('contact-search-input');
    const langFilter = document.getElementById('contact-lang-filter');

    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const selectedLang = langFilter ? langFilter.value : 'all';

    this.filteredRecipients = this.recipients.filter(rec => {
      const matchesSearch = !query || 
        rec.name.toLowerCase().includes(query) || 
        rec.email.toLowerCase().includes(query);

      const matchesLang = selectedLang === 'all' || rec.language === selectedLang;

      return matchesSearch && matchesLang;
    });

    this.renderTableRows(this.filteredRecipients);
  },

  renderAudienceTable() {
    this.filterAndRenderContacts();
  },

  renderTableRows(list) {
    const tbody = document.getElementById('contacts-table-body');
    const emptyState = document.getElementById('contacts-empty-state');
    if (!tbody || !emptyState) return;

    if (list.length === 0) {
      tbody.innerHTML = '';
      emptyState.style.display = 'block';
      return;
    }

    emptyState.style.display = 'none';

    const langBadges = {
      pt: '<span class="badge-lang badge-lang-pt">🇵🇹 Português</span>',
      en: '<span class="badge-lang badge-lang-en">🇬🇧 English</span>',
      fr: '<span class="badge-lang badge-lang-fr">🇫🇷 Français</span>',
      es: '<span class="badge-lang badge-lang-es">🇪🇸 Español</span>',
      unknown: '<span class="badge-lang badge-lang-unknown">🌐 Unknown (Default EN)</span>'
    };

    tbody.innerHTML = list.map((r, idx) => `
      <tr>
        <td style="color: var(--text-dim); font-size: 0.8rem;">${idx + 1}</td>
        <td>
          <strong style="color: var(--text-main); font-size: 0.9rem;">${this.escapeHtml(r.name)}</strong>
        </td>
        <td>
          <code style="color: #94a3b8; font-family: var(--font-mono);">${this.escapeHtml(r.email)}</code>
        </td>
        <td>${langBadges[r.language] || langBadges.unknown}</td>
        <td>
          ${r.isValidEmail 
            ? '<span class="email-valid">● Valid</span>' 
            : '<span class="email-invalid">● Invalid Email</span>'}
        </td>
        <td style="text-align: right;">
          <button class="btn btn-secondary btn-sm" onclick="App.previewRecipient('${r.id}')" title="Preview email in recipient's language">
            👁️
          </button>
          <button class="btn btn-danger btn-sm" onclick="App.deleteRecipient('${r.id}')" title="Delete recipient">
            🗑️
          </button>
        </td>
      </tr>
    `).join('');
  },

  deleteRecipient(id) {
    this.recipients = this.recipients.filter(r => r.id !== id);
    this.saveContactsToStorage();
    this.renderAudienceTable();
    this.updateStatsCards();
    this.updateHeaderBadges();
    this.showToast('Recipient removed', 'info');
  },

  updateStatsCards() {
    let pt = 0, en = 0, fr = 0, es = 0;
    this.recipients.forEach(r => {
      if (r.isValidEmail) {
        if (r.language === 'pt') pt++;
        else if (r.language === 'en') en++;
        else if (r.language === 'fr') fr++;
        else if (r.language === 'es') es++;
      }
    });

    const ptEl = document.getElementById('stat-pt-count');
    const enEl = document.getElementById('stat-en-count');
    const frEl = document.getElementById('stat-fr-count');
    const esEl = document.getElementById('stat-es-count');

    if (ptEl) ptEl.textContent = pt;
    if (enEl) enEl.textContent = en;
    if (frEl) frEl.textContent = fr;
    if (esEl) esEl.textContent = es;
  },

  updateHeaderBadges() {
    const contactBadge = document.getElementById('badge-total-contacts');
    const sentBadge = document.getElementById('badge-sent-count');

    if (contactBadge) contactBadge.textContent = `${this.recipients.length}`;
    if (sentBadge) sentBadge.textContent = `${window.MailerEngine.sentHistory.length} Sent`;
  },

  // View 3: Recipient Previewer
  bindPreviewView() {
    const searchInput = document.getElementById('preview-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', () => this.renderPreviewRecipientList());
    }
  },

  renderPreviewRecipientList() {
    const container = document.getElementById('preview-recipient-list');
    const searchInput = document.getElementById('preview-search-input');
    if (!container) return;

    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const filtered = this.recipients.filter(r => 
      !query || r.name.toLowerCase().includes(query) || r.email.toLowerCase().includes(query)
    );

    if (filtered.length === 0) {
      container.innerHTML = `<div style="padding: 2rem; text-align: center; color: var(--text-dim); font-size: 0.85rem;">No contacts available</div>`;
      return;
    }

    if (!this.selectedPreviewRecipientId && filtered.length > 0) {
      this.selectedPreviewRecipientId = filtered[0].id;
    }

    const flags = { pt: '🇵🇹', en: '🇬🇧', fr: '🇫🇷', es: '🇪🇸' };

    container.innerHTML = filtered.map(r => {
      const isSelected = r.id === this.selectedPreviewRecipientId;
      return `
        <div class="recipient-picker-item ${isSelected ? 'active' : ''}" onclick="App.selectPreviewRecipient('${r.id}')">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div class="picker-item-name">${this.escapeHtml(r.name)}</div>
            <span style="font-size: 1.1rem;">${flags[r.language] || '🌐'}</span>
          </div>
          <div class="picker-item-email">${this.escapeHtml(r.email)}</div>
          <div style="font-size: 0.72rem; color: var(--text-dim); text-transform: uppercase;">
            Language: <strong style="color: #c7d2fe;">${r.language.toUpperCase()}</strong>
          </div>
        </div>
      `;
    }).join('');
  },

  selectPreviewRecipient(id) {
    this.selectedPreviewRecipientId = id;
    this.renderPreviewRecipientList();
    this.renderPreviewCard();
  },

  previewRecipient(id) {
    this.selectedPreviewRecipientId = id;
    this.switchTab('tab-preview');
  },

  renderPreviewCard() {
    const rec = this.recipients.find(r => r.id === this.selectedPreviewRecipientId) || this.recipients[0];
    if (!rec) {
      const bodyEl = document.getElementById('preview-rendered-body');
      if (bodyEl) bodyEl.innerHTML = '<p style="color: #64748b;">No recipient selected. Upload contacts first.</p>';
      return;
    }

    const rendered = window.MailerEngine.renderEmailForRecipient(rec);
    if (!rendered) return;

    const activeName = document.getElementById('preview-active-name');
    const subjectEl = document.getElementById('preview-rendered-subject');
    const toName = document.getElementById('preview-to-name');
    const toEmail = document.getElementById('preview-to-email');
    const langBadge = document.getElementById('preview-lang-badge');
    const bodyEl = document.getElementById('preview-rendered-body');
    const dateLabel = document.getElementById('preview-date-label');

    if (activeName) activeName.textContent = `${rec.name} (${rec.language.toUpperCase()})`;
    if (subjectEl) subjectEl.textContent = rendered.subject;
    if (toName) toName.textContent = rec.name;
    if (toEmail) toEmail.textContent = rec.email;
    if (bodyEl) bodyEl.innerHTML = rendered.htmlBody;
    if (dateLabel) dateLabel.textContent = new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

    if (langBadge) {
      const badgeClasses = {
        pt: 'badge-lang-pt',
        en: 'badge-lang-en',
        fr: 'badge-lang-fr',
        es: 'badge-lang-es'
      };
      const names = {
        pt: '🇵🇹 Portuguese',
        en: '🇬🇧 English',
        fr: '🇫🇷 French',
        es: '🇪🇸 Spanish'
      };
      langBadge.className = `badge-lang ${badgeClasses[rec.language] || 'badge-lang-unknown'}`;
      langBadge.textContent = names[rec.language] || rec.language;
    }
  },

  // View 4: Dispatch & Sending Center
  bindDispatchCenter() {
    const startBtn = document.getElementById('btn-start-dispatch');
    const pauseBtn = document.getElementById('btn-pause-dispatch');
    const stopBtn = document.getElementById('btn-stop-dispatch');
    const exportBtn = document.getElementById('btn-export-csv');
    const clearLogsBtn = document.getElementById('btn-clear-logs');

    if (startBtn) {
      startBtn.addEventListener('click', () => this.openConfirmDispatchModal());
    }

    if (pauseBtn) {
      pauseBtn.addEventListener('click', () => {
        if (window.MailerEngine.isPaused) {
          window.MailerEngine.resume();
          pauseBtn.innerHTML = '⏸️ Pause';
          this.showToast('Dispatch resumed', 'info');
        } else {
          window.MailerEngine.pause();
          pauseBtn.innerHTML = '▶️ Resume';
          this.showToast('Dispatch paused', 'info');
        }
      });
    }

    if (stopBtn) {
      stopBtn.addEventListener('click', () => {
        window.MailerEngine.stop();
        this.showToast('Dispatch stopped', 'warning');
      });
    }

    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const csv = window.MailerEngine.exportLogsToCSV();
        if (!csv) {
          this.showToast('No sent logs available to export.', 'warning');
          return;
        }

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `polymail_dispatch_report_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        this.showToast('Exported delivery audit report CSV.', 'success');
      });
    }

    if (clearLogsBtn) {
      clearLogsBtn.addEventListener('click', () => {
        window.MailerEngine.logs = [];
        window.MailerEngine.sentHistory = [];
        window.MailerEngine.saveSentHistory();
        this.renderTerminalLogs();
        this.updateHeaderBadges();
        this.showToast('Sent logs cleared.', 'info');
      });
    }
  },

  updateDispatchHero() {
    const totalEl = document.getElementById('dispatch-total-recipients');
    const validCount = this.recipients.filter(r => r.isValidEmail).length;
    if (totalEl) totalEl.textContent = validCount;
  },

  openConfirmDispatchModal() {
    const modal = document.getElementById('modal-confirm-dispatch');
    if (!modal) return;

    let pt = 0, en = 0, fr = 0, es = 0;
    this.recipients.forEach(r => {
      if (r.isValidEmail) {
        if (r.language === 'pt') pt++;
        else if (r.language === 'en') en++;
        else if (r.language === 'fr') fr++;
        else if (r.language === 'es') es++;
      }
    });

    document.getElementById('modal-breakdown-pt').textContent = pt;
    document.getElementById('modal-breakdown-en').textContent = en;
    document.getElementById('modal-breakdown-fr').textContent = fr;
    document.getElementById('modal-breakdown-es').textContent = es;

    // Check template validation
    const val = window.MailEditor.validateAllTemplates();
    const warnEl = document.getElementById('modal-warning-missing');
    if (warnEl) {
      if (!val.isValid) {
        warnEl.style.display = 'block';
        warnEl.textContent = `⚠️ Warning: Templates for [${val.missing.join(', ').toUpperCase()}] are incomplete!`;
      } else {
        warnEl.style.display = 'none';
      }
    }

    modal.classList.add('active');
  },

  startDispatchExecution() {
    const progressSection = document.getElementById('dispatch-progress-section');
    const progressBar = document.getElementById('dispatch-progress-bar');
    const percentText = document.getElementById('dispatch-percent-text');
    const counterText = document.getElementById('dispatch-counter-text');
    const statusText = document.getElementById('dispatch-status-text');
    const currentContactEl = document.getElementById('dispatch-current-contact');
    const speedSelect = document.getElementById('dispatch-speed-select');

    const delayMs = speedSelect ? parseInt(speedSelect.value, 10) : 400;

    if (progressSection) progressSection.style.display = 'block';

    window.MailerEngine.dispatchCampaign(
      this.recipients,
      { delayMs },
      {
        onStart: ({ total }) => {
          if (statusText) statusText.textContent = 'Dispatching emails...';
          if (progressBar) progressBar.style.width = '0%';
          if (percentText) percentText.textContent = '0%';
          if (counterText) counterText.textContent = `(0 / ${total})`;
        },
        onProgress: ({ index, total, percent, currentRecipient, record }) => {
          if (progressBar) progressBar.style.width = `${percent}%`;
          if (percentText) percentText.textContent = `${percent}%`;
          if (counterText) counterText.textContent = `(${index} / ${total})`;
          if (currentContactEl) currentContactEl.textContent = `${currentRecipient.name} <${currentRecipient.email}> [${currentRecipient.language.toUpperCase()}]`;

          this.appendTerminalLog({
            time: record.deliveredTimeStr,
            name: currentRecipient.name,
            email: currentRecipient.email,
            lang: currentRecipient.language.toUpperCase(),
            subject: record.subject,
            id: record.id
          });

          this.updateHeaderBadges();
        },
        onComplete: ({ total, sentCount }) => {
          if (statusText) statusText.textContent = `🎉 Campaign Finished! Successfully dispatched ${sentCount} emails.`;
          if (progressBar) progressBar.style.width = '100%';
          if (percentText) percentText.textContent = '100%';
          this.showToast(`Campaign completed! ${sentCount} multi-lingual emails delivered.`, 'success');
          this.updateHeaderBadges();
        },
        onError: (err) => {
          this.showToast(err, 'error');
        }
      }
    );
  },

  appendTerminalLog(entry) {
    const feed = document.getElementById('terminal-feed');
    if (!feed) return;

    // Remove empty placeholder if present
    if (feed.children.length === 1 && feed.children[0].textContent.includes('No dispatch activity')) {
      feed.innerHTML = '';
    }

    const row = document.createElement('div');
    row.className = 'log-entry';
    row.innerHTML = `
      <span class="log-time">[${entry.time}]</span>
      <span class="log-status-ok">SENT</span>
      <span class="log-lang">[${entry.lang}]</span>
      <span style="flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
        To: <strong style="color: #ffffff;">${this.escapeHtml(entry.name)}</strong> &lt;${this.escapeHtml(entry.email)}&gt; — <em>"${this.escapeHtml(entry.subject)}"</em>
      </span>
      <button class="btn btn-secondary btn-sm" style="padding: 1px 6px; font-size: 0.7rem;" onclick="App.inspectSentEmail('${entry.id}')">Inspect</button>
    `;

    feed.prepend(row);
  },

  renderTerminalLogs() {
    const feed = document.getElementById('terminal-feed');
    if (!feed) return;

    if (window.MailerEngine.sentHistory.length === 0) {
      feed.innerHTML = `
        <div style="color: var(--text-dim); text-align: center; padding: 2rem 0;">
          No dispatch activity recorded yet. Launch a campaign above to see real-time streaming logs.
        </div>
      `;
      return;
    }

    feed.innerHTML = window.MailerEngine.sentHistory.map(item => `
      <div class="log-entry">
        <span class="log-time">[${item.deliveredTimeStr || new Date(item.timestamp).toLocaleTimeString()}]</span>
        <span class="log-status-ok">SENT</span>
        <span class="log-lang">[${(item.language || 'en').toUpperCase()}]</span>
        <span style="flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
          To: <strong style="color: #ffffff;">${this.escapeHtml(item.recipientName)}</strong> &lt;${this.escapeHtml(item.recipientEmail)}&gt; — <em>"${this.escapeHtml(item.subject)}"</em>
        </span>
        <button class="btn btn-secondary btn-sm" style="padding: 1px 6px; font-size: 0.7rem;" onclick="App.inspectSentEmail('${item.id}')">Inspect</button>
      </div>
    `).join('');
  },

  inspectSentEmail(mailId) {
    const record = window.MailerEngine.sentHistory.find(h => h.id === mailId);
    if (!record) return;

    const modal = document.getElementById('modal-inspect-email');
    const content = document.getElementById('modal-inspect-content');
    if (!modal || !content) return;

    content.innerHTML = `
      <div style="background: var(--bg-card-elevated); padding: 1rem; border-radius: var(--radius-md); margin-bottom: 1rem; font-size: 0.85rem; border: 1px solid var(--border-subtle);">
        <div style="margin-bottom: 4px;"><strong>Dispatched Time:</strong> ${new Date(record.timestamp).toLocaleString()}</div>
        <div style="margin-bottom: 4px;"><strong>Recipient:</strong> ${this.escapeHtml(record.recipientName)} &lt;${this.escapeHtml(record.recipientEmail)}&gt;</div>
        <div style="margin-bottom: 4px;"><strong>Language Sent:</strong> <span class="badge-lang badge-lang-${record.language}">[${(record.language || '').toUpperCase()}]</span></div>
        <div style="margin-bottom: 4px;"><strong>Subject:</strong> <span style="color: #a5b4fc; font-weight: 600;">${this.escapeHtml(record.subject)}</span></div>
        <div><strong>Status:</strong> <span style="color: #34d399; font-weight: 600;">Delivered ✓</span></div>
      </div>

      <div style="border: 1px solid var(--border-subtle); border-radius: var(--radius-md); overflow: hidden;">
        <div style="background: #f8fafc; color: #1e293b; padding: 1.5rem; font-size: 0.92rem; line-height: 1.6;">
          ${record.htmlBody}
        </div>
      </div>
    `;

    modal.classList.add('active');
  },

  // Modals Controller
  bindModals() {
    document.querySelectorAll('.modal-backdrop').forEach(modal => {
      // Close when clicking outside or close buttons
      modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target.classList.contains('modal-close-btn')) {
          modal.classList.remove('active');
        }
      });
    });

    // Close on Escape key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-backdrop.active').forEach(m => m.classList.remove('active'));
      }
    });

    // Confirm Dispatch
    const confirmBtn = document.getElementById('btn-modal-confirm-send');
    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => {
        document.getElementById('modal-confirm-dispatch').classList.remove('active');
        this.switchTab('tab-dispatch');
        this.startDispatchExecution();
      });
    }

    // Manual Add Contact Modal
    const openAddBtn = document.getElementById('btn-open-add-contact');
    const modalAdd = document.getElementById('modal-add-recipient');
    const submitAddBtn = document.getElementById('btn-submit-add-recipient');

    if (openAddBtn && modalAdd) {
      openAddBtn.addEventListener('click', () => {
        modalAdd.classList.add('active');
      });
    }

    if (submitAddBtn) {
      submitAddBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const nameInput = document.getElementById('manual-name');
        const emailInput = document.getElementById('manual-email');
        const langInput = document.getElementById('manual-lang');

        const name = nameInput ? nameInput.value.trim() : '';
        const email = emailInput ? emailInput.value.trim() : '';
        const lang = langInput ? langInput.value : 'pt';

        if (!name || !email) {
          this.showToast('Please enter both recipient name and email.', 'warning');
          return;
        }

        const isValid = window.CSVParser.isValidEmail(email);
        const newRec = {
          id: `rec_${Date.now()}_manual`,
          name,
          email,
          rawLanguage: lang,
          language: lang,
          isValidEmail: isValid,
          status: isValid ? 'ready' : 'invalid_email'
        };

        this.recipients.unshift(newRec);
        this.saveContactsToStorage();
        this.renderAudienceTable();
        this.updateStatsCards();
        this.updateHeaderBadges();

        if (nameInput) nameInput.value = '';
        if (emailInput) emailInput.value = '';

        modalAdd.classList.remove('active');
        this.showToast(`Added ${name} to mailing list!`, 'success');
      });
    }
  },

  // Save Campaign Draft
  bindSaveDraft() {
    const saveBtn = document.getElementById('btn-save-draft');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        window.MailEditor.saveToStorage();
        this.saveContactsToStorage();
        this.showToast('Campaign draft and all 4 language templates saved to local storage! 💾', 'success');
      });
    }
  },

  saveContactsToStorage() {
    try {
      localStorage.setItem('mailing_list_contacts', JSON.stringify(this.recipients));
    } catch (e) {
      console.warn('Failed to save contacts to storage', e);
    }
  },

  loadContactsFromStorage() {
    try {
      const saved = localStorage.getItem('mailing_list_contacts');
      if (saved) {
        this.recipients = JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load contacts from storage', e);
    }
  },

  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
};

// Bootstrap when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
