import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Menu, User, Sparkles, MessageSquare,
  Paperclip, Download, ArrowRight
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import CodeBlock from './components/CodeBlock';
import Sidebar from './components/Sidebar';
import FileUploadModal from './components/FileUploadModal';
import ContextSettings, { SourceReferenceDisplay } from './components/ContextSettings';
import { buildFileContext, extractSourceReferences } from './services/FileProcessor';
import CommandPalette from './components/CommandPalette';
import aiService from './services/AIService';
import ExportService from './services/ExportService';
import VoiceInputButton from './components/VoiceInputButton';

// --- CONFIGURATION ---
const DEFAULT_MODEL = "llama3.2";
const STORAGE_KEY = "devsavvy_current_thread";

// Custom Hook for LocalStorage
const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      setStoredValue(currentValue => {
        const valueToStore = value instanceof Function ? value(currentValue) : value;
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        return valueToStore;
      });
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
};

// Professional Feature Card
const FEATURE_CARD = {
  id: 'chat',
  icon: <MessageSquare className="text-blue-600" size={28} />,
  title: "Intelligent AI Chat",
  desc: "Have natural conversations with AI powered by local LLMs for complete privacy",
  gradient: "from-blue-50 to-blue-100"
};

function App() {
  // State
  const [messages, setMessages] = useLocalStorage(STORAGE_KEY, []);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");
  const [model, setModel] = useState(DEFAULT_MODEL);
  const [availableModels, setAvailableModels] = useState([]);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // File Upload State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  // Context-Aware Chat State
  const [sourceOnlyMode, setSourceOnlyMode] = useState(false);
  const [showContextSettings, setShowContextSettings] = useState(false);
  const [referencedSources, setReferencedSources] = useState([]);

  // Mode State
  const [activeMode, setActiveMode] = useState('chat');

  // Command Palette State
  const [showCommandPalette, setShowCommandPalette] = useState(false);

  // Refs
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (activeMode === 'chat') {
      scrollToBottom();
    }
  }, [messages, isLoading, activeMode]);

  // Auto-detect available models or enable demo mode
  const checkConnection = useCallback(async () => {
    try {
      setConnectionStatus("Connecting...");

      // Use centralized AI service
      const result = await aiService.checkConnection();

      if (result.connected) {
        setAvailableModels(result.models || []);
        setModel(result.selectedModel);
        setConnectionStatus("Ready");
        setIsDemoMode(false);
        console.log(`Connected to Ollama. Model: ${result.selectedModel}`);
      } else {
        console.warn("Ollama not available. Enabling demo mode.");
        setAvailableModels([]);
        setConnectionStatus("Demo Mode");
        setIsDemoMode(true);
        setModel("demo");
      }
    } catch (e) {
      console.warn("Ollama not available. Enabling demo mode.", e.message);
      setAvailableModels([]);
      setConnectionStatus("Demo Mode");
      setIsDemoMode(true);
      setModel("demo");
    }
  }, []);

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  useEffect(() => {
    if (messages.length > 0 && window.innerWidth > 1024) {
      // Optional: could auto-open workspace logic
    }
    if (activeMode === 'chat') {
      inputRef.current?.focus();
    }
  }, [activeMode, messages.length]);

  const handleSend = async (customMessage = null) => {
    const messageText = customMessage || input;
    if (!messageText.trim()) return;

    // Build file context using the professional service
    let fileContext = '';
    if (uploadedFiles.length > 0) {
      fileContext = buildFileContext(uploadedFiles, {
        sourceOnlyMode: sourceOnlyMode,
        maxContentLength: 4000
      });
    }

    // Create user message (visible to user without file context)
    const userMsg = { role: 'user', content: messageText };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);
    setReferencedSources([]);

    // Demo mode - simulate AI response
    if (isDemoMode) {
      setConnectionStatus("Demo Mode");
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 700));

      const demoResponse = generateDemoResponse(messageText, uploadedFiles);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: demoResponse,
        referencedSources: []
      }]);

      setIsLoading(false);
      return;
    }

    // Real API call
    setConnectionStatus("Processing...");

    // Create system-enhanced message for API (includes file context)
    const systemPrompt = {
      role: 'system',
      content: `You are DevSavvy, an intelligent coding assistant. 
      - Always format your responses using clean, readable Markdown.
      - Use code blocks with language identifiers for code (e.g., \`\`\`javascript).
      - Use bolding for key terms and headers for sections.
      - If explaining code, break it down step-by-step.
      - Be concise. Avoid unnecessary conversational filler.
      - Adapt your technical level to the user's question. If the user asks a simple question, give a simple answer.
      - If you don't know the answer, admit it. Do not make up information.`
    };

    const messageForAPI = {
      role: 'user',
      content: fileContext
        ? `${messageText}\n\n${fileContext}`
        : messageText
    };

    // Limit history to last 10 messages for performance
    const recentMessages = messages.slice(-10);
    const messagesForAPI = [systemPrompt, ...recentMessages, messageForAPI];

    try {
      const response = await fetch('/ollama/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: model,
          messages: messagesForAPI,
          stream: false
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error (${response.status}): ${errorText || response.statusText}`);
      }

      const data = await response.json();
      setConnectionStatus("Connected");

      if (data.message) {
        // Extract source references from AI response
        const sources = extractSourceReferences(data.message.content);
        setReferencedSources(sources);

        // Store sources with the message for display
        const enrichedMessage = {
          ...data.message,
          referencedSources: sources
        };

        setMessages(prev => [...prev, enrichedMessage]);

        // Auto-expand context settings if sources were cited
        if (sources.length > 0) {
          setShowContextSettings(true);
        }
      } else if (data.error) {
        throw new Error(data.error);
      } else {
        throw new Error("Invalid response format");
      }

    } catch (error) {
      console.error("Connection Error:", error);
      // Fall back to demo mode on error
      setConnectionStatus("Demo Mode (Fallback)");
      setIsDemoMode(true);

      const demoResponse = generateDemoResponse(messageText, uploadedFiles);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: demoResponse,
        referencedSources: []
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate demo responses based on user input
  const generateDemoResponse = (userMessage, files) => {
    const msg = userMessage.toLowerCase();

    // Check if there are uploaded files
    if (files.length > 0) {
      const file = files[0];
      const content = file.extractedContent || file.content || '';
      const contentPreview = content ? content.substring(0, 300) + '...' : 'No text content extracted.';
      const wordCount = content ? content.split(/\s+/).length : 0;

      return `### 📄 Analysis of **${file.name}**\n\n` +
        `**File Stats:**\n` +
        `- **Size:** ${(file.size / 1024).toFixed(2)} KB\n` +
        `- **Words:** ${wordCount}\n` +
        `- **Type:** ${file.type}\n\n` +
        `**Content Preview:**\n` +
        `> ${contentPreview.replace(/\n/g, '\n> ')}\n\n` +
        `**Simulated Insights (Demo Mode):**\n` +
        `1. This document appears to contain **${wordCount > 1000 ? 'detailed' : 'brief'}** information.\n` +
        `2. Key topics typically found in this type of file include specifications, requirements, or documentation.\n` +
        `3. To get a *real* AI summary and semantic Q&A, please ensure **Ollama** is running locally.\n\n` +
        `*(You can retry the connection by clicking the status indicator in the sidebar)*`;
    }

    // Code-related responses
    if (msg.includes('code') || msg.includes('function') || msg.includes('javascript') || msg.includes('python')) {
      return `Here's an example of what I can help you with:\n\n` +
        `\`\`\`javascript\n// Example: A simple utility function\nfunction greet(name) {\n  return \`Hello, \${name}! Welcome to DevSavvy.\`;\n}\n\nconsole.log(greet('Developer'));\n\`\`\`\n\n` +
        `In full mode with Ollama connected, I can:\n` +
        `- Generate complete code solutions\n` +
        `- Debug your existing code\n` +
        `- Explain complex algorithms\n` +
        `- Convert between programming languages`;
    }

    // Explain-related responses
    if (msg.includes('explain') || msg.includes('what is') || msg.includes('how does')) {
      return `Great question! In demo mode, I'll give you a brief overview.\n\n` +
        `**DevSavvy** is an AI-powered knowledge workspace that helps you:\n\n` +
        `1. 📄 **Process Documents** - Upload and analyze PDFs, images, and more\n` +
        `2. 🎨 **Create on Canvas** - Visual brainstorming with AI assistance\n` +
        `3. 🎬 **Extract from Videos** - Get insights from YouTube content\n` +
        `4. 🔗 **Parse URLs** - Extract and summarize web content\n\n` +
        `*Connect to Ollama for full AI-powered explanations!*`;
    }

    // Debug-related responses
    if (msg.includes('debug') || msg.includes('error') || msg.includes('fix')) {
      return `I'd love to help debug! Here's how I can assist:\n\n` +
        `**Common Debugging Steps:**\n` +
        `1. Check console for error messages\n` +
        `2. Verify variable types and values\n` +
        `3. Review recent code changes\n` +
        `4. Test with simplified inputs\n\n` +
        `Share your code when connected to Ollama, and I'll provide specific fixes!`;
    }

    // Help/introduction
    if (msg.includes('help') || msg.includes('hello') || msg.includes('hi') || msg.includes('start')) {
      return `👋 **Welcome to DevSavvy!**

I'm running in **Demo Mode** right now. Here's what you can explore:

| Feature | Status |
|:--------|:-------|
| 💬 Chat Interface | ✅ Working |
| 📁 File Upload | ✅ Working |
| 🎨 Canvas | ✅ Working |
| 📝 Documents | ✅ Working |
| 🤖 AI Responses | ⚠️ Demo Only |

**To enable full AI:**

1. Install [Ollama](https://ollama.ai)
2. Run: \`ollama run llama3.2\`
3. Refresh this page

Try asking me about code, explanations, or debugging!`;
    }

    // Default response
    return `Thanks for your message! I'm currently in **Demo Mode**.\n\n` +
      `Your query: *"${userMessage}"*\n\n` +
      `In demo mode, I provide sample responses to showcase the interface. ` +
      `For full AI capabilities including:\n\n` +
      `- 🧠 Intelligent code generation\n` +
      `- 📖 Document analysis\n` +
      `- 💡 Creative brainstorming\n` +
      `- 🔍 Deep explanations\n\n` +
      `Please connect Ollama by running \`ollama run llama3.2\` in your terminal.`;
  };

  const handleNewThread = useCallback(() => {
    setMessages([]);
    setInput("");
    setUploadedFiles([]);
    setSourceOnlyMode(false);
    setShowContextSettings(false);
    setReferencedSources([]);
    if (activeMode === 'chat') {
      inputRef.current?.focus();
    }
  }, [activeMode, setMessages, setInput, setUploadedFiles, setSourceOnlyMode, setShowContextSettings, setReferencedSources]);

  const handleFilesChange = (files) => {
    setUploadedFiles(files);
    // Auto-show context settings when files are uploaded
    if (files.length > 0) {
      setShowContextSettings(true);
    }
  };

  // Handle Command Palette actions
  const handleCommand = useCallback((action) => {
    switch (action.type) {
      case 'ai-prompt':
        setInput(action.prompt);
        if (inputRef.current) {
          inputRef.current.focus();
        }
        break;
      case 'command': {
        const cmd = action.command;
        if (cmd.id === 'action-clear') {
          handleNewThread();
        } else if (cmd.id === 'settings-theme') {
          // Theme toggle would go here
          console.log('Toggle theme');
        }
        break;
      }
      default:
        break;
    }
  }, [handleNewThread]);

  return (
    <div className="flex h-screen overflow-hidden bg-background text-primary selection:bg-accent/20 font-sans">

      {/* COMMAND PALETTE */}
      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        onCommand={handleCommand}
        onModeChange={setActiveMode}
        onNewThread={handleNewThread}
        onUploadClick={() => {
          setShowCommandPalette(false);
          setShowUploadModal(true);
        }}
        files={uploadedFiles}
        recentItems={[]}
      />

      {/* FILE UPLOAD MODAL */}
      <FileUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        uploadedFiles={uploadedFiles}
        onFilesChange={handleFilesChange}
      />

      {/* MODULAR SIDEBAR */}
      <Sidebar
        showSidebar={showSidebar}
        connectionStatus={connectionStatus}
        modelName={model}
        availableModels={availableModels}
        onNewThread={handleNewThread}
        onUploadClick={() => setShowUploadModal(true)}
        showUploadBadge={uploadedFiles.length === 0}
        activeMode={activeMode}
        onModeChange={setActiveMode}
        onModelChange={(newModel) => {
          setModel(newModel);
          aiService.setModel(newModel); // Ensure service is updated too
          console.log(`Model changed to: ${newModel}`);
        }}
        onRetryConnection={checkConnection}
      />

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex overflow-hidden relative">

        {activeMode === 'chat' && (
          <>
            {/* CHAT PANEL */}
            <div className="flex-1 flex flex-col h-full bg-background transition-all duration-500">

              {/* Header */}
              <header className="h-16 flex items-center justify-between px-6 z-10 border-b border-transparent">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowSidebar(!showSidebar)}
                    className="p-2 rounded-lg hover:bg-black/5 text-secondary transition-colors"
                  >
                    <Menu size={20} />
                  </button>
                  {!showSidebar && <span className="font-serif font-bold text-lg">DevSavvy</span>}
                </div>

                <div className="flex items-center gap-3">
                  {/* Command Palette Button */}
                  {/* Export Button - Only show when there are messages */}
                  {messages.length > 0 && (
                    <button
                      onClick={() => ExportService.downloadChatMarkdown(messages, 'DevSavvy Chat')}
                      className="p-2 rounded-lg hover:bg-black/5 text-secondary transition-colors"
                      title="Export conversation"
                    >
                      <Download size={18} />
                    </button>
                  )}

                  <div className="w-8 h-8 rounded-full bg-surface-highlight border border-black/5 flex items-center justify-center">
                    <User size={16} className="text-secondary" />
                  </div>
                </div>
              </header>

              {/* Chat Scroll Area */}
              <div className="flex-1 overflow-y-auto px-4 scroll-smooth">
                {messages.length === 0 ? (

                  /* BENTO GRID WELCOME SCREEN */
                  <div className="h-full flex flex-col items-center justify-center max-w-4xl mx-auto pb-20 animate-enter">

                    <div className="text-center mb-12">
                      <h1 className="font-bold text-4xl md:text-5xl text-gray-900 mb-4 tracking-tight">
                        AI Document Assistant
                      </h1>
                      <p className="text-gray-600 text-lg font-light max-w-xl mx-auto mb-3">
                        Process documents, chat with AI, and manage your knowledge library - all with 100% local privacy.
                      </p>
                      {isDemoMode ? (
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-full text-amber-700 text-sm">
                          <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                          <span>Demo Mode - AI responses are simulated</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full text-emerald-700 text-sm">
                          <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                          <span>Connected to {model}</span>
                        </div>
                      )}
                    </div>

                    <div className="w-full max-w-md px-6 mx-auto">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl border border-black/5 text-center transition-all hover:scale-[1.02] hover:shadow-xl">
                        <div className="mb-6 bg-white/60 w-16 h-16 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-lg mx-auto">
                          {FEATURE_CARD.icon}
                        </div>
                        <h3 className="font-serif text-2xl font-bold text-gray-900 mb-3">{FEATURE_CARD.title}</h3>
                        <p className="text-base text-gray-600 leading-relaxed">{FEATURE_CARD.desc}</p>
                      </div>
                    </div>
                  </div>

                ) : (

                  /* MESSAGES LIST */
                  <div className="max-w-3xl mx-auto py-8 space-y-10 pb-32">
                    {messages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex gap-6 animate-enter ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                        style={{ animationDelay: `${idx * 0.1}s` }}
                      >
                        {/* Avatar */}
                        <div className={`
                              w-10 h-10 rounded-full shrink-0 flex items-center justify-center shadow-sm border border-black/5
                              ${msg.role === 'assistant' ? 'bg-white' : 'bg-primary'}
                            `}>
                          {msg.role === 'assistant'
                            ? <Sparkles size={18} className="text-accent" />
                            : <User size={18} className="text-white" />
                          }
                        </div>

                        {/* Message Content */}
                        <div className={`flex-1 ${msg.role === 'user' ? 'text-right' : 'text-left'} min-w-0`}>
                          <div className="font-serif font-medium text-sm text-secondary mb-1">
                            {msg.role === 'assistant' ? 'DevSavvy AI' : 'You'}
                          </div>
                          {msg.role === 'assistant' ? (
                            <div className="prose-clean bg-white p-6 rounded-2xl shadow-card border border-black/5 max-w-full overflow-hidden">
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                  a: ({ ...props }) => <a target="_blank" rel="noopener noreferrer" {...props} />,
                                  code({ inline, className, children, ...props }) {
                                    const match = /language-(\w+)/.exec(className || '')
                                    return !inline && match ? (
                                      <CodeBlock
                                        language={match[1]}
                                        value={String(children).replace(/\n$/, '')}
                                        {...props}
                                      />
                                    ) : (
                                      <code className={className} {...props}>
                                        {children}
                                      </code>
                                    )
                                  }
                                }}
                              >
                                {msg.content}
                              </ReactMarkdown>

                              {/* Source References */}
                              {msg.referencedSources && msg.referencedSources.length > 0 && (
                                <SourceReferenceDisplay
                                  referencedSources={msg.referencedSources}
                                  uploadedFiles={uploadedFiles}
                                />
                              )}
                            </div>
                          ) : (
                            <div className="inline-block bg-surface-highlight px-6 py-4 rounded-2xl text-primary text-base leading-relaxed border border-black/5 text-left">
                              {msg.content}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {isLoading && (
                      <div className="flex gap-6 animate-enter">
                        <div className="w-10 h-10 rounded-full bg-white shrink-0 flex items-center justify-center shadow-sm border border-black/5">
                          <Sparkles size={18} className="text-accent animate-spin" />
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-card border border-black/5 flex items-center gap-2">
                          <span className="text-sm text-secondary animate-pulse">
                            {sourceOnlyMode ? 'Analyzing sources...' : 'Thinking...'}
                          </span>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* FLOATING COMMAND BAR */}
              <div className="absolute bottom-8 left-0 right-0 px-4 pointer-events-none z-20">
                <div className="mx-auto w-full max-w-3xl pointer-events-auto transition-all">

                  {/* Context Settings Panel (replaces simple file indicator) */}
                  {uploadedFiles.length > 0 && (
                    <div className="mb-3">
                      <ContextSettings
                        uploadedFiles={uploadedFiles}
                        sourceOnlyMode={sourceOnlyMode}
                        onSourceOnlyModeChange={setSourceOnlyMode}
                        referencedSources={referencedSources}
                        isExpanded={showContextSettings}
                        onToggleExpand={() => setShowContextSettings(!showContextSettings)}
                      />
                    </div>
                  )}

                  <div className="float-input flex items-center p-2 pl-4">
                    {/* Attachment Button */}
                    <button
                      onClick={() => setShowUploadModal(true)}
                      className={`p-2 rounded-lg transition-colors mr-2 ${uploadedFiles.length > 0
                        ? 'text-accent hover:bg-accent/10'
                        : 'text-subtle hover:text-secondary hover:bg-black/5'
                        }`}
                      title="Attach files"
                    >
                      <Paperclip size={18} />
                    </button>

                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend()}
                      placeholder={uploadedFiles.length > 0
                        ? (sourceOnlyMode ? 'Ask about your sources...' : 'Ask about your files...')
                        : `Message ${model}...`}
                      disabled={isLoading}
                      className="flex-1 bg-transparent border-none outline-none text-primary placeholder-subtle text-base py-3"
                    />

                    {/* Voice Input Button */}
                    <VoiceInputButton
                      onTranscript={(text) => setInput(prev => prev + (prev ? ' ' : '') + text)}
                    />

                    <button
                      onClick={() => handleSend()}
                      disabled={isLoading || !input.trim()}
                      className="p-3 bg-primary text-white rounded-xl hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                    >
                      <ArrowRight size={20} />
                    </button>
                  </div>
                  <div className="text-center mt-3">
                    <span className="text-[11px] text-secondary/60 bg-white/50 backdrop-blur px-2 py-1 rounded-full border border-black/5">
                      {uploadedFiles.length > 0
                        ? (sourceOnlyMode
                          ? `🔒 Source-Only Mode • ${uploadedFiles.length} files`
                          : `${uploadedFiles.length} files ready • AI will use as context`)
                        : `Powered by ${model} • Press Enter to send`
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}

export default App;

