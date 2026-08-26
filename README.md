# Bom Sucesso Mailing - Gestão de Listas & Envio Multilíngue

Aplicação web interativa para gestão de listas de correio eletrónico, redação de e-mails em **4 idiomas** (Português, Inglês, Francês e Espanhol) com editor visual rico (WYSIWYG), interpolação dinâmica de variáveis (`{{name}}`, `{{email}}`, `{{language}}`, `{{date}}`), pré-visualização personalizada por contacto e disparo automatizado com base no idioma de cada destinatário.

## 🚀 Funcionalidades

- **Gestor de Destinatários & CSV**: Importação de ficheiros CSV com as colunas `name`, `email` e `language`, com deteção automática de cabeçalhos e normalização de idiomas.
- **Editor Visual em 4 Idiomas**: Separadores dedicados para **Português** (🇵🇹), **Inglês** (🇬🇧), **Francês** (🇫🇷) e **Espanhol** (🇪🇸).
- **Barra de Ferramentas de Formatação Avançada**: Títulos (H1, H2, H3), blocos de citação, listas de marcas e numeradas, hiperligações, seletor de cores de texto e realce de fundo, e alternador de código HTML.
- **Etiquetas de Personalização Dinâmicas**: Inserção rápida de `{{name}}`, `{{email}}`, `{{language}}`, `{{date}}` e `{{unsubscribe}}`.
- **Pré-visualização do Destinatário**: Selecione qualquer contacto da lista para ver o e-mail exato que irá receber no seu idioma.
- **Motor de Disparo Automatizado**: Barra de progresso em tempo real, controlo de velocidade, pausa/retoma/paragem, telemetria de envio e inspetor de mensagens entregues.
- **Guardar Rascunhos**: Gravação automática de modelos e lista de contactos no armazenamento local do navegador.
- **Exportação de Relatórios**: Exportação de relatórios de auditoria de entrega em formato CSV.

## 🛠️ Como Executar a Aplicação

### Opção 1: Diretamente no Navegador
Abra o ficheiro `index.html` em qualquer navegador web moderno.

### Opção 2: Servidor Local (PowerShell)
Execute o script no terminal:
```powershell
powershell -ExecutionPolicy Bypass -File .\server.ps1
```
Em seguida, aceda a **`http://localhost:8080`**.

## 📁 Estrutura do Projeto

```
├── index.html            # Estrutura e vistas da aplicação (em Português PT-PT)
├── style.css             # Folha de estilos com tema escuro e glassmorphism
├── csv-parser.js         # Analisador de CSV e normalizador de idiomas
├── editor.js             # Editor de texto formatado e gestor de modelos
├── mailer.js             # Motor de interpolação e simulador de telemetria
├── app.js                # Controlador principal da aplicação
├── sample_contacts.csv   # Ficheiro de exemplo com contactos em 4 idiomas
└── server.ps1            # Servidor HTTP estático em PowerShell
```

## 📄 Licença
MIT
