/**
 * Bom Sucesso Mailing - Editor de Texto Formatado (WYSIWYG) & Gestor de Modelos
 * Idioma de Interface: Português (PT-PT)
 */

const MailEditor = {
  activeLanguage: 'pt', // Padrão: Português

  templates: {
    pt: {
      subject: 'Olá {{name}}, temos novidades exclusivas para si!',
      body: `<h2>Olá, {{name}}! 👋</h2>
<p>Esperamos que esta mensagem o encontre bem. Temos o prazer de partilhar consigo as mais recentes atualizações e melhorias preparadas especialmente a pensar em si.</p>
<p><strong>Destaques da semana:</strong></p>
<ul>
  <li>Novas funcionalidades de automação de campanhas personalizadas</li>
  <li>Segmentação inteligente com base no idioma e preferências</li>
  <li>Relatórios analíticos de entrega e telemetria em tempo real</li>
</ul>
<p>Caso tenha alguma dúvida, basta responder diretamente a este e-mail ({{email}}). A nossa equipa de apoio está totalmente ao seu dispor.</p>
<p style="margin-top: 24px;">Com os melhores cumprimentos,<br><strong>A Equipa Bom Sucesso Mailing</strong></p>`
    },
    en: {
      subject: 'Hello {{name}}, we have exciting news for you!',
      body: `<h2>Hello, {{name}}! 👋</h2>
<p>We hope you are having a wonderful week. We are thrilled to share the latest updates and exclusive enhancements tailored for you.</p>
<p><strong>Highlights of the week:</strong></p>
<ul>
  <li>New campaign automation workflows</li>
  <li>Intelligent segmentation by language and geography</li>
  <li>Real-time deliverability analytics and live telemetry</li>
</ul>
<p>If you have any questions, simply reply directly to this email at {{email}}. Our support team is here to assist you anytime.</p>
<p style="margin-top: 24px;">Best regards,<br><strong>The Bom Sucesso Team</strong></p>`
    },
    fr: {
      subject: 'Bonjour {{name}}, nous avons des nouvelles exclusives pour vous !',
      body: `<h2>Bonjour, {{name}} ! 👋</h2>
<p>Nous espérons que vous passez une excellente semaine. Nous sommes ravis de partager avec vous les dernières nouveautés de notre service.</p>
<p><strong>Points forts de la semaine :</strong></p>
<ul>
  <li>Nouveaux flux d'automatisation de campagnes</li>
  <li>Segmentation intelligente par langue et préférences</li>
  <li>Analyses détaillées de délivrabilité en direct</li>
</ul>
<p>Pour toute question, n'hésitez pas à répondre directement à ce message ({{email}}). Notre équipe se tient à votre entière disposition.</p>
<p style="margin-top: 24px;">Bien cordialement,<br><strong>L'équipe Bom Sucesso</strong></p>`
    },
    es: {
      subject: '¡Hola {{name}}, tenemos novedades increíbles para ti!',
      body: `<h2>¡Hola, {{name}}! 👋</h2>
<p>Esperamos que tengas una excelente semana. Nos complace presentarte las últimas actualizaciones y ventajas diseñadas especialmente para ti.</p>
<p><strong>Lo más destacado de la semana:</strong></p>
<ul>
  <li>Nuevas funciones de automatización para tus campañas</li>
  <li>Segmentación inteligente por idioma y preferencias</li>
  <li>Estadísticas de entrega e informes en tiempo real</li>
</ul>
<p>Si tienes alguna consulta, no dudes en responder directamente a este correo ({{email}}). Nuestro equipo está a tu entera disposición.</p>
<p style="margin-top: 24px;">Un cordial saludo,<br><strong>El Equipo Bom Sucesso</strong></p>`
    }
  },

  isHtmlMode: false,

  presets: {
    welcome: {
      name: 'Boas-vindas & Onboarding',
      pt: {
        subject: 'Bem-vindo(a) à Bom Sucesso, {{name}}!',
        body: `<h2>Damos-lhe as boas-vindas à nossa comunidade, {{name}}! 🎉</h2>
<p>Estamos muito felizes por tê-lo(a) connosco! A sua conta associada ao endereço <strong>{{email}}</strong> já se encontra ativa.</p>
<p>Eis 3 passos rápidos para começar:</p>
<ol>
  <li>Complete o seu perfil e preferências de comunicação</li>
  <li>Explore o painel de controlo interativo</li>
  <li>Crie a sua primeira lista de envio personalizada</li>
</ol>
<p>Qualquer dúvida que surja, estamos sempre à sua inteira disposição!</p>
<p>Com os melhores cumprimentos,<br><strong>Equipa de Boas-Vindas Bom Sucesso</strong></p>`
      },
      en: {
        subject: 'Welcome aboard, {{name}}!',
        body: `<h2>Welcome to our community, {{name}}! 🎉</h2>
<p>We are thrilled to welcome you! Your account registered with <strong>{{email}}</strong> is all set.</p>
<p>Here are 3 quick steps to get started:</p>
<ol>
  <li>Complete your profile and language preferences</li>
  <li>Explore the interactive dashboard</li>
  <li>Launch your first personalized mailing campaign</li>
</ol>
<p>If you need any guidance, we are just an email away!</p>
<p>Warm regards,<br><strong>The Bom Sucesso Team</strong></p>`
      },
      fr: {
        subject: 'Bienvenue à bord, {{name}} !',
        body: `<h2>Bienvenue dans notre communauté, {{name}} ! 🎉</h2>
<p>Nous sommes ravis de vous accueillir ! Votre compte associé à <strong>{{email}}</strong> est prêt.</p>
<p>Voici 3 étapes rapides pour bien débuter :</p>
<ol>
  <li>Complétez votre profil et vos préférences linguistiques</li>
  <li>Découvrez votre tableau de bord interactif</li>
  <li>Créez votre première campagne d'envoi ciblée</li>
</ol>
<p>Nous restons à votre écoute pour toute question !</p>
<p>Chaleureusement,<br><strong>L'équipe Bom Sucesso</strong></p>`
      },
      es: {
        subject: '¡Te damos la bienvenida a bordo, {{name}}!',
        body: `<h2>¡Bienvenido/a a nuestra comunidad, {{name}}! 🎉</h2>
<p>¡Estamos encantados de tenerte con nosotros! Tu cuenta registrada con <strong>{{email}}</strong> ya está lista.</p>
<p>Aquí tienes 3 pasos sencillos para comenzar:</p>
<ol>
  <li>Completa tu perfil y preferencias de idioma</li>
  <li>Explora el panel interactivo</li>
  <li>Envía tu primera campaña segmentada</li>
</ol>
<p>¡Cualquier duda, estamos a tu total disposición!</p>
<p>Saludos cordiales,<br><strong>El Equipo Bom Sucesso</strong></p>`
      }
    },

    product_launch: {
      name: 'Lançamento de Produto & Novidades',
      pt: {
        subject: '🚀 Grande Lançamento: Conheça as novas ferramentas, {{name}}!',
        body: `<h2>O futuro das comunicações chegou, {{name}}! 🚀</h2>
<p>Hoje lançamos oficialmente a nova versão da plataforma Bom Sucesso Mailing para gestão de listas e disparos multilíngues automatizados.</p>
<p><strong>Novidades principais:</strong></p>
<ul>
  <li>Editor visual avançado com suporte a formatação rica</li>
  <li>Envio dinâmico adaptado ao idioma de cada destinatário</li>
  <li>Pré-visualização individual por contacto em tempo real</li>
</ul>
<p>Aceda à sua conta e aproveite todas as novas funcionalidades!</p>`
      },
      en: {
        subject: '🚀 Major Launch: Discover our new tools, {{name}}!',
        body: `<h2>The future of communication is here, {{name}}! 🚀</h2>
<p>Today we are officially launching our brand new multi-lingual mailing and campaign distribution engine.</p>
<p><strong>What's new:</strong></p>
<ul>
  <li>Visual WYSIWYG editor with rich formatting controls</li>
  <li>Dynamic language-based dispatch for each recipient</li>
  <li>Real-time individual recipient inbox preview</li>
</ul>
<p>Log in now to experience the next-level mailing workflow!</p>`
      },
      fr: {
        subject: '🚀 Grand Lancement : Découvrez nos nouveaux outils, {{name}} !',
        body: `<h2>L'avenir des communications est là, {{name}} ! 🚀</h2>
<p>Nous inaugurons aujourd'hui notre nouvelle plateforme d'envoi multilingue et de gestion de listes de diffusion.</p>
<p><strong>Nouveautés majeures :</strong></p>
<ul>
  <li>Éditeur visuel avec mise en page avancée</li>
  <li>Envoi ciblé automatique selon la langue du destinataire</li>
  <li>Aperçu personnalisé par contact en temps réel</li>
</ul>
<p>Connectez-vous dès maintenant pour tester ces fonctionnalités !</p>`
      },
      es: {
        subject: '🚀 Gran Lanzamiento: Descubre las nuevas herramientas, {{name}}!',
        body: `<h2>¡El futuro de las comunicaciones ya está aquí, {{name}}! 🚀</h2>
<p>Hoy presentamos oficialmente nuestra nueva plataforma de listas de correo y envíos multilingües automatizados.</p>
<p><strong>Novedades destacadas:</strong></p>
<ul>
  <li>Editor visual con controles de formato avanzados</li>
  <li>Envío segmentado automático según el idioma de cada contacto</li>
  <li>Vista previa personalizada en tiempo real por destinatario</li>
</ul>
<p>¡Inicia sesión ahora y aprovecha todas las nuevas funciones!</p>`
      }
    }
  },

  init() {
    this.loadFromStorage();
    this.bindEvents();
    this.renderCurrentLanguage();
  },

  bindEvents() {
    const editorBody = document.getElementById('rich-editor-content');
    const subjectInput = document.getElementById('mail-subject-input');
    const htmlSourceArea = document.getElementById('html-source-content');

    if (editorBody) {
      editorBody.addEventListener('input', () => {
        if (!this.isHtmlMode) {
          this.templates[this.activeLanguage].body = editorBody.innerHTML;
          this.updateTabStatus();
        }
      });
    }

    if (subjectInput) {
      subjectInput.addEventListener('input', (e) => {
        this.templates[this.activeLanguage].subject = e.target.value;
        this.updateTabStatus();
      });
    }

    if (htmlSourceArea) {
      htmlSourceArea.addEventListener('input', (e) => {
        if (this.isHtmlMode) {
          this.templates[this.activeLanguage].body = e.target.value;
          this.updateTabStatus();
        }
      });
    }

    // Botões dos separadores de idioma
    document.querySelectorAll('.lang-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const lang = btn.getAttribute('data-lang');
        this.switchLanguage(lang);
      });
    });

    // Botões de formatação
    document.querySelectorAll('[data-format-cmd]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const cmd = btn.getAttribute('data-format-cmd');
        const val = btn.getAttribute('data-format-val') || null;
        this.execCommand(cmd, val);
      });
    });

    // Seletores de cores
    const textColorPicker = document.getElementById('text-color-picker');
    if (textColorPicker) {
      textColorPicker.addEventListener('input', (e) => {
        this.execCommand('foreColor', e.target.value);
      });
    }

    const bgColorPicker = document.getElementById('bg-color-picker');
    if (bgColorPicker) {
      bgColorPicker.addEventListener('input', (e) => {
        this.execCommand('hiliteColor', e.target.value);
      });
    }

    // Inserção de etiquetas dinâmicas
    document.querySelectorAll('.tag-pill-btn').forEach(pill => {
      pill.addEventListener('click', (e) => {
        e.preventDefault();
        const tag = pill.getAttribute('data-tag');
        this.insertTag(tag);
      });
    });

    // Inserir hiperligação
    const insertLinkBtn = document.getElementById('btn-insert-link');
    if (insertLinkBtn) {
      insertLinkBtn.addEventListener('click', () => {
        const url = prompt('Introduza o endereço URL da hiperligação (ex: https://exemplo.com):', 'https://');
        if (url && url !== 'https://') {
          this.execCommand('createLink', url);
        }
      });
    }

    // Alternar modo HTML
    const toggleHtmlBtn = document.getElementById('btn-toggle-html');
    if (toggleHtmlBtn) {
      toggleHtmlBtn.addEventListener('click', () => {
        this.toggleHtmlMode();
      });
    }

    // Seletor de modelos pré-definidos
    const presetSelect = document.getElementById('template-preset-select');
    if (presetSelect) {
      presetSelect.addEventListener('change', (e) => {
        const presetKey = e.target.value;
        if (presetKey && this.presets[presetKey]) {
          if (confirm(`Pretende carregar o modelo pré-definido "${this.presets[presetKey].name}"? Isto irá preencher os 4 idiomas.`)) {
            this.loadPreset(presetKey);
          }
          e.target.value = '';
        }
      });
    }
  },

  switchLanguage(lang) {
    if (!this.templates[lang]) return;
    this.saveCurrentToState();
    this.activeLanguage = lang;

    document.querySelectorAll('.lang-tab-btn').forEach(btn => {
      const btnLang = btn.getAttribute('data-lang');
      if (btnLang === lang) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    this.renderCurrentLanguage();
  },

  saveCurrentToState() {
    const editorBody = document.getElementById('rich-editor-content');
    const subjectInput = document.getElementById('mail-subject-input');
    const htmlSourceArea = document.getElementById('html-source-content');

    if (subjectInput) {
      this.templates[this.activeLanguage].subject = subjectInput.value;
    }

    if (this.isHtmlMode && htmlSourceArea) {
      this.templates[this.activeLanguage].body = htmlSourceArea.value;
    } else if (editorBody) {
      this.templates[this.activeLanguage].body = editorBody.innerHTML;
    }
  },

  renderCurrentLanguage() {
    const t = this.templates[this.activeLanguage] || { subject: '', body: '' };
    const subjectInput = document.getElementById('mail-subject-input');
    const editorBody = document.getElementById('rich-editor-content');
    const htmlSourceArea = document.getElementById('html-source-content');
    const currentLangBadge = document.getElementById('editor-current-lang-badge');

    if (subjectInput) subjectInput.value = t.subject || '';
    if (editorBody) editorBody.innerHTML = t.body || '';
    if (htmlSourceArea) htmlSourceArea.value = t.body || '';

    if (currentLangBadge) {
      const names = {
        pt: 'Português',
        en: 'Inglês',
        fr: 'Francês',
        es: 'Espanhol'
      };
      currentLangBadge.textContent = names[this.activeLanguage] || this.activeLanguage;
    }

    this.updateTabStatus();
  },

  updateTabStatus() {
    ['pt', 'en', 'fr', 'es'].forEach(lang => {
      const t = this.templates[lang];
      const hasSubject = t.subject && t.subject.trim().length > 0;
      const hasBody = t.body && t.body.trim().replace(/<[^>]*>/g, '').length > 0;
      const badge = document.querySelector(`.lang-status-pill[data-lang="${lang}"]`);

      if (badge) {
        if (hasSubject && hasBody) {
          badge.className = 'lang-status-pill status-ready';
          badge.textContent = '✓ Pronto';
        } else if (hasSubject || hasBody) {
          badge.className = 'lang-status-pill status-partial';
          badge.textContent = '• Rascunho';
        } else {
          badge.className = 'lang-status-pill status-empty';
          badge.textContent = 'Vazio';
        }
      }
    });
  },

  execCommand(cmd, val = null) {
    if (this.isHtmlMode) return;
    const editor = document.getElementById('rich-editor-content');
    if (!editor) return;

    editor.focus();

    if (cmd === 'formatBlock' && val) {
      document.execCommand('formatBlock', false, `<${val}>`);
    } else {
      document.execCommand(cmd, false, val);
    }

    this.templates[this.activeLanguage].body = editor.innerHTML;
    this.updateTabStatus();
  },

  insertTag(tag) {
    if (this.isHtmlMode) {
      const textarea = document.getElementById('html-source-content');
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        textarea.value = text.substring(0, start) + tag + text.substring(end);
        textarea.selectionStart = textarea.selectionEnd = start + tag.length;
        this.templates[this.activeLanguage].body = textarea.value;
      }
      return;
    }

    const editor = document.getElementById('rich-editor-content');
    if (!editor) return;
    editor.focus();

    const selection = window.getSelection();
    if (selection.getRangeAt && selection.rangeCount) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      
      const span = document.createElement('span');
      span.className = 'editor-variable-tag';
      span.textContent = tag;
      span.contentEditable = 'false';
      
      range.insertNode(span);
      
      range.setStartAfter(span);
      range.setEndAfter(span);
      selection.removeAllRanges();
      selection.addRange(range);
    } else {
      editor.innerHTML += ` <span class="editor-variable-tag" contenteditable="false">${tag}</span> `;
    }

    this.templates[this.activeLanguage].body = editor.innerHTML;
    this.updateTabStatus();
  },

  toggleHtmlMode() {
    this.isHtmlMode = !this.isHtmlMode;
    const editor = document.getElementById('rich-editor-content');
    const textarea = document.getElementById('html-source-content');
    const toggleBtn = document.getElementById('btn-toggle-html');
    const toolbar = document.getElementById('rich-editor-toolbar');

    if (this.isHtmlMode) {
      textarea.value = editor.innerHTML;
      editor.style.display = 'none';
      textarea.style.display = 'block';
      if (toggleBtn) toggleBtn.innerHTML = '<span class="icon">👁️</span> Editor Visual';
      if (toolbar) toolbar.classList.add('toolbar-disabled');
    } else {
      editor.innerHTML = textarea.value;
      this.templates[this.activeLanguage].body = textarea.value;
      textarea.style.display = 'none';
      editor.style.display = 'block';
      if (toggleBtn) toggleBtn.innerHTML = '<span class="icon">&lt;/&gt;</span> Código HTML';
      if (toolbar) toolbar.classList.remove('toolbar-disabled');
    }
  },

  loadPreset(presetKey) {
    const preset = this.presets[presetKey];
    if (!preset) return;

    ['pt', 'en', 'fr', 'es'].forEach(lang => {
      if (preset[lang]) {
        this.templates[lang] = {
          subject: preset[lang].subject,
          body: preset[lang].body
        };
      }
    });

    this.renderCurrentLanguage();
    this.saveToStorage();
  },

  saveToStorage() {
    this.saveCurrentToState();
    try {
      localStorage.setItem('bomsucesso_mailing_templates', JSON.stringify(this.templates));
      return true;
    } catch (e) {
      console.warn('Falha ao guardar modelos no armazenamento local:', e);
      return false;
    }
  },

  loadFromStorage() {
    try {
      const saved = localStorage.getItem('bomsucesso_mailing_templates') || localStorage.getItem('mailing_list_templates');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.pt && parsed.en && parsed.fr && parsed.es) {
          this.templates = parsed;
        }
      }
    } catch (e) {
      console.warn('Falha ao carregar modelos do armazenamento local:', e);
    }
  },

  getTemplateForLanguage(langKey) {
    const key = ['pt', 'en', 'fr', 'es'].includes(langKey) ? langKey : 'pt';
    return this.templates[key] || this.templates['pt'];
  },

  validateAllTemplates() {
    const missing = [];
    ['pt', 'en', 'fr', 'es'].forEach(lang => {
      const t = this.templates[lang];
      if (!t.subject || !t.subject.trim() || !t.body || !t.body.trim().replace(/<[^>]*>/g, '').trim()) {
        missing.push(lang);
      }
    });
    return {
      isValid: missing.length === 0,
      missing
    };
  }
};

window.MailEditor = MailEditor;
