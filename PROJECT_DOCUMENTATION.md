# AI Document Assistant - Final Year Project Documentation

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Features](#features)
4. [Technology Stack](#technology-stack)
5. [Installation Guide](#installation-guide)
6. [User Manual](#user-manual)
7. [Development Guide](#development-guide)
8. [Testing](#testing)
9. [Deployment](#deployment)
10. [Future Enhancements](#future-enhancements)

---

## 1. Project Overview

### 1.1 Introduction
The AI Document Assistant is a sophisticated web application that enables users to interact with their documents using natural language through locally-hosted Large Language Models (LLMs). This project demonstrates the integration of modern web technologies with AI capabilities while maintaining user privacy through local processing.

### 1.2 Problem Statement
- Traditional document management systems lack intelligent search and query capabilities
- Cloud-based AI solutions raise privacy concerns
- Users need a way to extract insights from multiple document formats
- There's a need for context-aware AI assistance that understands document content

### 1.3 Objectives
- ✅ Create an intuitive chat interface for AI interactions
- ✅ Support multiple document formats (PDF, DOCX, images, etc.)
- ✅ Implement local AI processing for privacy
- ✅ Provide document management and organization features
- ✅ Enable context-aware responses based on uploaded documents
- ✅ Offer document creation and editing capabilities

### 1.4 Scope
**Included:**
- AI-powered chat interface
- Document upload and processing
- Library management system
- Document editor with templates
- Export functionality
- Context-aware responses

**Excluded:**
- Cloud storage integration
- Multi-user collaboration
- Mobile native applications
- Real-time collaboration features

---

## 2. System Architecture

### 2.1 High-Level Architecture
```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐│
│  │   Chat   │  │ Document │  │ Library  │  │ Editor  ││
│  │Interface │  │ Upload   │  │ Manager  │  │         ││
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘│
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              Services Layer                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │   AI     │  │   File   │  │ Database │             │
│  │ Service  │  │Processor │  │ Service  │             │
│  └──────────┘  └──────────┘  └──────────┘             │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              Storage & AI Backend                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │IndexedDB │  │  Local   │  │  Ollama  │             │
│  │          │  │ Storage  │  │   LLM    │             │
│  └──────────┘  └──────────┘  └──────────┘             │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Component Architecture

#### Frontend Components
- **App.jsx**: Main application container
- **Sidebar**: Navigation and mode switching
- **Chat Components**: Message display and input
- **Document Components**: Upload, preview, and editing
- **Library**: Document management interface
- **Command Palette**: Quick actions and search

#### Services
- **AIService**: Handles communication with Ollama
- **FileProcessor**: Processes various document formats
- **DatabaseService**: Manages IndexedDB operations
- **ExportService**: Handles document exports

### 2.3 Data Flow
1. User uploads document → FileProcessor extracts content
2. Content stored in IndexedDB via DatabaseService
3. User sends chat message → AIService processes with context
4. Ollama generates response → Displayed in chat interface
5. User can export conversation or documents

---

## 3. Features

### 3.1 Core Features

#### AI Chat Interface
- Real-time conversations with AI
- Markdown rendering with syntax highlighting
- Message history persistence
- Context-aware responses
- Source citation and references

#### Document Processing
**Supported Formats:**
- PDF (text extraction)
- Microsoft Word (DOC, DOCX)
- Images (PNG, JPG, JPEG) with OCR
- Text files (TXT, MD)
- Spreadsheets (CSV, XLSX)
- Code files (JS, PY, HTML, CSS, etc.)

**Processing Features:**
- Automatic text extraction
- OCR for scanned documents
- Metadata extraction
- Content preview
- Batch processing

#### Library Management
- Document storage and organization
- Search and filter capabilities
- Preview functionality
- Metadata management
- Drag-and-drop support

#### Document Editor
- Rich text editing
- Multiple templates:
  - Reports
  - Meeting Notes
  - CV/Resume
  - Presentations
  - Invoices
- Export to PDF, DOCX, Markdown

### 3.2 Advanced Features

#### Context-Aware Chat
- Source-only mode for focused queries
- Document reference tracking
- Visual source indicators
- Citation in responses

#### Export Functionality
- Chat history export (Markdown)
- Document export (PDF, DOCX, MD)
- Formatted output
- Metadata inclusion

---

## 4. Technology Stack

### 4.1 Frontend Technologies
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2.0 | UI Framework |
| Vite | 7.2.4 | Build Tool |
| Tailwind CSS | 4.1.18 | Styling |
| Lucide React | 0.562.0 | Icons |
| React Markdown | 10.1.0 | Markdown Rendering |
| Framer Motion | 12.23.26 | Animations |

### 4.2 Document Processing
| Library | Purpose |
|---------|---------|
| pdfjs-dist | PDF processing |
| mammoth | Word document processing |
| tesseract.js | OCR for images |
| xlsx | Spreadsheet processing |

### 4.3 AI & Backend
| Technology | Purpose |
|------------|---------|
| Ollama | Local LLM hosting |
| Llama 3.2 | Default AI model |
| IndexedDB | Client-side database |

### 4.4 Development Tools
| Tool | Purpose |
|------|---------|
| ESLint | Code linting |
| npm | Package management |
| Git | Version control |

---

## 5. Installation Guide

### 5.1 Prerequisites
- Node.js 18 or higher
- npm 9 or higher
- Modern web browser
- 8GB RAM (recommended)
- 10GB free disk space

### 5.2 Step-by-Step Installation

#### Step 1: Install Ollama
```bash
# Visit https://ollama.ai and download for your OS
# Or use package manager:

# macOS
brew install ollama

# Linux
curl -fsSL https://ollama.ai/install.sh | sh

# Windows
# Download installer from ollama.ai
```

#### Step 2: Pull AI Model
```bash
ollama pull llama3.2
```

#### Step 3: Clone Repository
```bash
git clone <repository-url>
cd llm
```

#### Step 4: Install Dependencies
```bash
npm install
```

#### Step 5: Configure Environment
```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_OLLAMA_BASE_URL=http://localhost:11434
VITE_DEFAULT_MODEL=llama3.2
VITE_AI_TIMEOUT=60000
```

#### Step 6: Start Development Server
```bash
npm run dev
```

Visit `http://localhost:5173`

### 5.3 Production Build
```bash
npm run build
npm run preview
```

---

## 6. User Manual

### 6.1 Getting Started

#### First Launch
1. Open the application in your browser
2. Wait for "Connected" status in sidebar
3. You're ready to start!

#### Basic Chat
1. Type your message in the input box
2. Press Enter or click Send
3. Wait for AI response
4. Continue the conversation

### 6.2 Working with Documents

#### Uploading Documents
1. Click the paperclip icon (📎) or "Upload" button
2. Select one or more files
3. Wait for processing (progress shown)
4. Documents appear in context panel

#### Asking About Documents
1. Upload your documents
2. Type questions like:
   - "Summarize this document"
   - "What are the key points?"
   - "Find information about [topic]"
3. AI responds with context from your documents

#### Using the Library
1. Click "Library" in sidebar
2. View all uploaded documents
3. Use search to find specific documents
4. Click to preview or add to chat

### 6.3 Creating Documents

#### Using Templates
1. Click "Documents" in sidebar
2. Choose a template:
   - Report
   - Meeting Notes
   - CV/Resume
   - Presentation
   - Invoice
3. Fill in the content
4. Export to desired format

#### Custom Documents
1. Click "Documents" → "Blank Document"
2. Use the rich text editor
3. Format as needed
4. Export when done

### 6.4 Advanced Features

#### Context-Aware Mode
1. Upload documents
2. Enable "Source Only Mode" in context settings
3. AI will only use uploaded documents for answers

#### Exporting Conversations
1. Click the download icon (⬇️) in header
2. Conversation saved as Markdown file
3. Includes all messages and metadata

---

## 7. Development Guide

### 7.1 Project Structure
```
llm/
├── src/
│   ├── components/      # React components
│   │   ├── Chat/       # Chat interface
│   │   ├── Documents/  # Document editor
│   │   ├── Library/    # Library management
│   │   └── Common/     # Shared components
│   ├── services/       # Business logic
│   │   ├── AIService.js
│   │   ├── FileProcessor.js
│   │   └── DatabaseService.js
│   ├── hooks/          # Custom React hooks
│   ├── utils/          # Utility functions
│   └── templates/      # Document templates
├── public/             # Static assets
└── dist/              # Build output
```

### 7.2 Adding New Features

#### Adding a New Document Format
1. Update `FileProcessor.js`
2. Add format detection
3. Implement extraction logic
4. Update UI to show new format

#### Adding a New AI Model
1. Pull model with Ollama: `ollama pull <model>`
2. Model automatically appears in dropdown
3. No code changes needed!

### 7.3 Code Style Guidelines
- Use functional components with hooks
- Follow ESLint rules
- Use Tailwind for styling
- Comment complex logic
- Keep components small and focused

---

## 8. Testing

### 8.1 Manual Testing Checklist

#### Chat Functionality
- [ ] Send message and receive response
- [ ] Message history persists
- [ ] Markdown renders correctly
- [ ] Code blocks have syntax highlighting
- [ ] Export conversation works

#### Document Upload
- [ ] PDF upload and extraction
- [ ] Word document processing
- [ ] Image OCR works
- [ ] Multiple file upload
- [ ] Progress indicators show

#### Library
- [ ] Documents appear after upload
- [ ] Search finds documents
- [ ] Preview works
- [ ] Delete removes documents
- [ ] Drag to chat works

#### Document Editor
- [ ] Templates load correctly
- [ ] Editing works
- [ ] Export to PDF works
- [ ] Export to DOCX works
- [ ] Export to Markdown works

### 8.2 Performance Testing
- Test with large documents (>10MB)
- Test with many documents (>100)
- Test long conversations (>50 messages)
- Monitor memory usage
- Check response times

---

## 9. Deployment

### 9.1 Production Build
```bash
npm run build
```

Output in `dist/` folder.

### 9.2 Deployment Options

#### Option 1: Static Hosting
- Deploy `dist/` folder to:
  - Netlify
  - Vercel
  - GitHub Pages
  - AWS S3 + CloudFront

#### Option 2: Self-Hosted
```bash
npm install -g serve
serve -s dist -p 3000
```

#### Option 3: Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

### 9.3 Environment Configuration
Update `.env` for production:
```env
VITE_OLLAMA_BASE_URL=https://your-ollama-server.com
VITE_DEFAULT_MODEL=llama3.2
```

---

## 10. Future Enhancements

### 10.1 Planned Features
- [ ] Multi-language support (i18n)
- [ ] Voice input/output
- [ ] Advanced document comparison
- [ ] Collaborative features
- [ ] Mobile responsive improvements
- [ ] Custom model fine-tuning
- [ ] Analytics dashboard
- [ ] Plugin system

### 10.2 Technical Improvements
- [ ] Code splitting for better performance
- [ ] Progressive Web App (PWA)
- [ ] Offline mode
- [ ] Better error handling
- [ ] Comprehensive test suite
- [ ] TypeScript migration
- [ ] Accessibility improvements

---

## Appendix

### A. Troubleshooting

#### Ollama Not Connecting
1. Check if Ollama is running: `ollama list`
2. Verify URL in `.env`
3. Check firewall settings
4. Try restarting Ollama

#### Documents Not Processing
1. Check file size (<50MB recommended)
2. Verify file format is supported
3. Check browser console for errors
4. Try smaller file first

#### Slow Performance
1. Close unused browser tabs
2. Clear browser cache
3. Reduce number of uploaded documents
4. Use smaller AI model

### B. Keyboard Shortcuts
- `Ctrl/Cmd + K`: Open command palette
- `Enter`: Send message
- `Shift + Enter`: New line in message
- `Esc`: Close modals

### C. API Reference
See `src/services/AIService.js` for AI API methods.
See `src/services/FileProcessor.js` for file processing methods.

---

**Document Version:** 1.0.0  
**Last Updated:** January 30, 2026  
**Author:** [Your Name]  
**Institution:** [Your University]
