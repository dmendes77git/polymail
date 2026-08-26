# PolyMail - Multi-Lingual Mailing List Application

An interactive web application for managing multi-lingual mailing lists, composing rich-text emails in 4 languages (Portuguese, English, French, Spanish) with dynamic variable interpolation (`{{name}}`, `{{email}}`, `{{language}}`, `{{date}}`), previewing individual recipient messages, and dispatching targeted emails based on recipient language preference.

## 🚀 Features

- **CSV Audience Manager**: Upload CSV files with `name`, `email`, and `language` fields with smart column auto-detection and language normalizer.
- **4-Language WYSIWYG Mail Composer**: Dedicated tabs for **Portuguese** (🇵🇹/🇧🇷), **English** (🇬🇧/🇺🇸), **French** (🇫🇷), and **Spanish** (🇪🇸).
- **Advanced Formatting Toolbar**: Headings (H1, H2, H3), blockquotes, lists, links, text and background colors, clean formatting, and raw HTML toggle.
- **Personalization Variables**: Dynamic tags `{{name}}`, `{{email}}`, `{{language}}`, `{{date}}`, and `{{unsubscribe}}`.
- **Live Recipient Simulator**: Select any contact from the CSV to preview the exact email they will receive in their language.
- **Automated Dispatch Engine**: Real-time progress bar, speed control, pause/resume/stop controls, live streaming delivery logs, and sent email inspector.
- **Local Storage Drafts**: Save campaign drafts and recipient lists locally.
- **Export Reports**: Export delivery audit logs as CSV.

## 🛠️ Getting Started

### Option 1: Direct in Browser
Simply open `index.html` in any modern web browser.

### Option 2: Local Static Server
Run the PowerShell server script:
```powershell
powershell -ExecutionPolicy Bypass -File .\server.ps1
```
Then navigate to `http://localhost:8080`.

## 📁 Project Structure

```
├── index.html            # Main UI layout and 4 workflow tabs
├── style.css             # Dark-theme stylesheet with glassmorphism
├── csv-parser.js         # CSV parser and language normalizer
├── editor.js             # WYSIWYG editor and 4-language template manager
├── mailer.js             # Personalization engine and campaign dispatcher
├── app.js                # Core controller and storage manager
├── sample_contacts.csv   # Sample contact list in 4 languages
└── server.ps1            # Local PowerShell HTTP web server
```

## 📄 License
MIT
