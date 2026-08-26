/**
 * Bom Sucesso Mailing - Analisador e Normalizador de Ficheiros CSV
 * Idioma de Interface: Português (PT-PT)
 */

const CSVParser = {
  // Normalizar strings de idioma para os 4 códigos suportados: 'pt', 'en', 'fr', 'es'
  normalizeLanguage(rawLang) {
    if (!rawLang) return 'pt'; // padrão em português
    const clean = String(rawLang).trim().toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    // Português
    if (['pt', 'por', 'portuguese', 'portugues', 'portugues (pt)', 'portugues (br)', 'pt-br', 'pt-pt', 'brasil', 'brazil', 'portugal', 'lingua portuguesa'].includes(clean)) {
      return 'pt';
    }
    // Inglês
    if (['en', 'eng', 'english', 'ingles', 'anglais', 'en-us', 'en-gb', 'uk', 'usa', 'us'].includes(clean)) {
      return 'en';
    }
    // Francês
    if (['fr', 'fra', 'fre', 'french', 'francais', 'fr-fr', 'fr-ca', 'france'].includes(clean)) {
      return 'fr';
    }
    // Espanhol
    if (['es', 'spa', 'spanish', 'espanol', 'espanhol', 'es-es', 'es-mx', 'spain', 'espana'].includes(clean)) {
      return 'es';
    }

    // Verificação de prefixos
    if (clean.startsWith('pt')) return 'pt';
    if (clean.startsWith('en')) return 'en';
    if (clean.startsWith('fr')) return 'fr';
    if (clean.startsWith('es')) return 'es';

    return 'unknown';
  },

  // Metadados dos 4 idiomas suportados
  languages: {
    pt: { code: 'pt', name: 'Português', nativeName: 'Português', flag: '🇵🇹', icon: '🇵🇹' },
    en: { code: 'en', name: 'Inglês', nativeName: 'English', flag: '🇬🇧', icon: '🇬🇧' },
    fr: { code: 'fr', name: 'Francês', nativeName: 'Français', flag: '🇫🇷', icon: '🇫🇷' },
    es: { code: 'es', name: 'Espanhol', nativeName: 'Español', flag: '🇪🇸', icon: '🇪🇸' }
  },

  // Validação de formato de e-mail
  isValidEmail(email) {
    if (!email) return false;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).trim());
  },

  // Deteção automática de delimitador (, ; \t |)
  detectDelimiter(text) {
    const sample = text.slice(0, 1000);
    const commas = (sample.match(/,/g) || []).length;
    const semicolons = (sample.match(/;/g) || []).length;
    const tabs = (sample.match(/\t/g) || []).length;

    if (semicolons > commas && semicolons > tabs) return ';';
    if (tabs > commas && tabs > semicolons) return '\t';
    return ',';
  },

  // Analisador de texto CSV em conformidade com RFC-4180
  parse(csvText) {
    if (!csvText || !csvText.trim()) {
      return { recipients: [], stats: this.getEmptyStats(), errors: ['O conteúdo do ficheiro CSV está vazio.'] };
    }

    const delimiter = this.detectDelimiter(csvText);
    const lines = [];
    let currentLine = [];
    let currentCell = '';
    let inQuotes = false;

    for (let i = 0; i < csvText.length; i++) {
      const char = csvText[i];
      const nextChar = csvText[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          currentCell += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        currentLine.push(currentCell.trim());
        currentCell = '';
      } else if ((char === '\r' || char === '\n') && !inQuotes) {
        if (char === '\r' && nextChar === '\n') i++;
        currentLine.push(currentCell.trim());
        if (currentLine.some(c => c.length > 0)) {
          lines.push(currentLine);
        }
        currentLine = [];
        currentCell = '';
      } else {
        currentCell += char;
      }
    }

    if (currentCell.length > 0 || currentLine.length > 0) {
      currentLine.push(currentCell.trim());
      if (currentLine.some(c => c.length > 0)) {
        lines.push(currentLine);
      }
    }

    if (lines.length === 0) {
      return { recipients: [], stats: this.getEmptyStats(), errors: ['Nenhuma linha de dados encontrada no ficheiro CSV.'] };
    }

    // Identificar linha de cabeçalhos
    const rawHeaders = lines[0].map(h => h.toLowerCase().trim().replace(/['"]/g, ''));
    let nameIdx = -1;
    let emailIdx = -1;
    let langIdx = -1;

    rawHeaders.forEach((h, idx) => {
      const normH = h.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (nameIdx === -1 && (normH.includes('name') || normH.includes('nome') || normH.includes('nom') || normH.includes('nombre') || normH === 'recipient' || normH === 'contact' || normH === 'destinatario')) {
        nameIdx = idx;
      }
      if (emailIdx === -1 && (normH.includes('mail') || normH.includes('correo') || normH.includes('courriel') || normH.includes('correio'))) {
        emailIdx = idx;
      }
      if (langIdx === -1 && (normH.includes('lang') || normH.includes('idiom') || normH.includes('lingua') || normH.includes('locale') || normH.includes('country') || normH.includes('pais'))) {
        langIdx = idx;
      }
    });

    if (emailIdx === -1) {
      if (lines.length > 1) {
        lines[1].forEach((cell, idx) => {
          if (cell.includes('@') && emailIdx === -1) emailIdx = idx;
        });
      }
    }
    if (nameIdx === -1) nameIdx = 0;
    if (emailIdx === -1) emailIdx = 1;
    if (langIdx === -1) langIdx = 2;

    const recipients = [];
    const errors = [];
    const stats = this.getEmptyStats();

    for (let i = 1; i < lines.length; i++) {
      const row = lines[i];
      if (row.length === 0 || row.every(c => !c)) continue;

      const rawName = row[nameIdx] || 'Estimado(a) Cliente';
      const rawEmail = row[emailIdx] || '';
      const rawLang = row[langIdx] || '';

      const normalizedLang = this.normalizeLanguage(rawLang);
      const isEmailValid = this.isValidEmail(rawEmail);

      const recipient = {
        id: `rec_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 4)}`,
        name: rawName,
        email: rawEmail,
        rawLanguage: rawLang || 'Não especificado',
        language: normalizedLang === 'unknown' ? 'pt' : normalizedLang,
        originalLanguageKey: normalizedLang,
        isValidEmail: isEmailValid,
        status: isEmailValid ? 'ready' : 'invalid_email',
        rowNumber: i + 1
      };

      if (!isEmailValid) {
        errors.push(`Linha ${i + 1}: Endereço de e-mail inválido "${rawEmail}" para ${rawName}`);
      }

      recipients.push(recipient);

      stats.total++;
      if (isEmailValid) {
        stats.valid++;
        const langKey = recipient.language;
        if (stats.byLanguage[langKey] !== undefined) {
          stats.byLanguage[langKey]++;
        } else {
          stats.byLanguage.other = (stats.byLanguage.other || 0) + 1;
        }
      } else {
        stats.invalid++;
      }
    }

    return {
      recipients,
      stats,
      errors,
      headers: {
        detected: { nameIdx, emailIdx, langIdx },
        raw: lines[0]
      }
    };
  },

  getEmptyStats() {
    return {
      total: 0,
      valid: 0,
      invalid: 0,
      byLanguage: {
        pt: 0,
        en: 0,
        fr: 0,
        es: 0,
        other: 0
      }
    };
  }
};

window.CSVParser = CSVParser;
