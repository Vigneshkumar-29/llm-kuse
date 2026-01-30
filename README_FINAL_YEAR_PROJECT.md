# AI-Powered Document Assistant
## Final Year Project - Intelligent Document Processing & Chat System

### 🎓 Project Overview
A professional AI-powered document assistant that enables intelligent conversations with your documents using local Large Language Models (LLMs). This system allows users to upload various document formats, process them, and interact with the content through natural language queries.

### ✨ Core Features

#### 1. **Intelligent Chat Interface**
- Real-time AI conversations powered by Ollama
- Context-aware responses based on uploaded documents
- Markdown support with syntax highlighting
- Message history and conversation management
- Export conversations to Markdown format

#### 2. **Advanced Document Processing**
- **Supported Formats:**
  - PDF documents
  - Microsoft Word (DOC, DOCX)
  - Images (PNG, JPG, JPEG) with OCR
  - Text files (TXT, MD)
  - Spreadsheets (CSV, XLSX)
  - Code files (JS, PY, HTML, CSS, etc.)

- **Processing Capabilities:**
  - Text extraction from all formats
  - OCR for scanned documents and images
  - Metadata extraction
  - Content preview and search
  - Batch processing support

#### 3. **Document Library Management**
- Organized document storage using IndexedDB
- Search and filter capabilities
- Document preview
- Metadata management
- Tag and categorization system

#### 4. **Document Editor**
- Create and edit documents
- Multiple templates (Reports, Meeting Notes, etc.)
- Export to PDF, DOCX, and Markdown
- Rich text editing capabilities

#### 5. **Context-Aware Responses**
- Source citation in AI responses
- Document reference tracking
- Source-only mode for focused queries
- Visual source indicators

### 🏗️ Technical Architecture

#### Frontend Stack
- **Framework:** React 19.2.0
- **Build Tool:** Vite 7.2.4
- **Styling:** Tailwind CSS 4.1.18
- **UI Components:** Lucide React icons
- **Markdown:** React Markdown with GFM support
- **Code Highlighting:** React Syntax Highlighter

#### Backend/AI
- **LLM Engine:** Ollama (Local deployment)
- **Default Model:** Llama 3.2
- **API:** RESTful endpoints via Vite proxy

#### Data Storage
- **Local Storage:** Browser LocalStorage for settings
- **Document Storage:** IndexedDB for documents
- **Session Management:** React state management

#### Document Processing
- **PDF:** pdfjs-dist 5.4.449
- **Word:** mammoth 1.11.0
- **Images:** tesseract.js 7.0.0 (OCR)
- **Spreadsheets:** xlsx 0.18.5

### 📋 System Requirements

#### Development Environment
- Node.js 18+ and npm
- Modern web browser (Chrome, Firefox, Edge)
- 4GB RAM minimum
- 10GB free disk space

#### For AI Features
- Ollama installed locally
- 8GB RAM recommended
- GPU recommended (optional, for faster inference)

### 🚀 Installation & Setup

#### 1. Clone the Repository
```bash
git clone <repository-url>
cd llm
```

#### 2. Install Dependencies
```bash
npm install
```

#### 3. Configure Environment
```bash
cp .env.example .env
```

Edit `.env` file:
```env
VITE_OLLAMA_BASE_URL=http://localhost:11434
VITE_DEFAULT_MODEL=llama3.2
```

#### 4. Install Ollama
Visit [ollama.ai](https://ollama.ai) and install for your platform.

#### 5. Pull AI Model
```bash
ollama pull llama3.2
```

#### 6. Start Development Server
```bash
npm run dev
```

Visit `http://localhost:5173`

### 📖 Usage Guide

#### Starting a Conversation
1. Launch the application
2. Wait for "Connected" status in sidebar
3. Type your message or upload documents
4. Press Enter or click Send

#### Uploading Documents
1. Click the paperclip icon or "Upload" button
2. Select one or more documents
3. Wait for processing to complete
4. Documents appear in context panel
5. Ask questions about your documents

#### Using the Library
1. Click "Library" in the sidebar
2. View all uploaded documents
3. Search, filter, or preview documents
4. Drag documents to chat for quick reference

#### Creating Documents
1. Click "Documents" in the sidebar
2. Choose a template or start blank
3. Edit content using the rich editor
4. Export to PDF, DOCX, or Markdown

### 🎯 Key Use Cases

1. **Academic Research**
   - Upload research papers
   - Ask questions about content
   - Generate summaries
   - Extract key findings

2. **Document Analysis**
   - Process legal documents
   - Extract important clauses
   - Compare multiple documents
   - Generate reports

3. **Code Understanding**
   - Upload code files
   - Get explanations
   - Debug assistance
   - Documentation generation

4. **Meeting Notes**
   - Create structured notes
   - AI-assisted summarization
   - Action item extraction
   - Export to various formats

### 🔒 Privacy & Security

- **100% Local Processing:** All AI inference runs locally via Ollama
- **No Cloud Dependencies:** Documents never leave your machine
- **Secure Storage:** IndexedDB with browser security
- **No Tracking:** No analytics or telemetry
- **Open Source:** Full transparency

### 🧪 Testing

Run linting:
```bash
npm run lint
```

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

### 📊 Project Statistics

- **Total Components:** 30+
- **Lines of Code:** ~15,000
- **Supported File Types:** 15+
- **AI Models Supported:** All Ollama models
- **Browser Compatibility:** Modern browsers (ES2020+)

### 🎓 Academic Contribution

This project demonstrates:
- Integration of LLMs in web applications
- Client-side document processing
- Real-time AI interactions
- Modern React patterns and hooks
- Responsive UI/UX design
- Local-first architecture
- Privacy-focused AI applications

### 📝 Future Enhancements

- [ ] Multi-language support
- [ ] Advanced document comparison
- [ ] Collaborative features
- [ ] Mobile responsive design improvements
- [ ] Voice input/output
- [ ] Custom model fine-tuning
- [ ] Advanced analytics dashboard
- [ ] Plugin system for extensibility

### 🤝 Credits

**Developed by:** [Your Name]
**Institution:** [Your University]
**Year:** 2026
**Supervisor:** [Supervisor Name]

### 📄 License

This project is developed as part of academic requirements.

### 🆘 Support & Documentation

For detailed documentation, see:
- `CANVAS_USER_GUIDE.md` - Feature documentation
- `ERROR_FIXES_SUMMARY.md` - Technical fixes
- `.env.example` - Configuration guide

### 🔗 References

- [Ollama Documentation](https://ollama.ai/docs)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)

---

**Note:** This is a professional academic project demonstrating modern web development practices and AI integration. All features are designed with user privacy and local-first principles in mind.
