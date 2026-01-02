import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Menu, User, Sparkles, Zap, ArrowRight,
  LayoutGrid, FileText, Search, Paperclip
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import CodeBlock from './components/CodeBlock';
import Sidebar from './components/Sidebar';
import WorkspacePanel from './components/WorkspacePanel';
import FileUploadModal from './components/FileUploadModal';
import ContextSettings, { SourceReferenceDisplay } from './components/ContextSettings';
import { buildFileContext, extractSourceReferences } from './services/FileProcessor';
import { Canvas } from './components/Canvas';
import { DocumentEditor } from './components/Documents';
import Library from './components/Library/Library';
import { YouTubeEmbed } from './components/YouTube';
import { URLExtractor } from './components/URLExtractor';
import CommandPalette from './components/CommandPalette';

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
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
};

// Bento Grid Items
const BENTO_ITEMS = [
  {
    id: 'explain',
    icon: <Sparkles className="text-orange-600" size={24} />,
    title: "Explain Concept",
    desc: "Break down complex topics.",
    col: "col-span-1",
    bg: "bg-orange-50"
  },
  {
    id: 'debug',
    icon: <Zap className="text-amber-600" size={24} />,
    title: "Debug Code",
    desc: "Find and fix errors instantly.",
    col: "col-span-1",
    bg: "bg-amber-50"
  },
  {
    id: 'docs',
    icon: <FileText className="text-emerald-600" size={24} />,
    title: "Write Documentation",
    desc: "Generate comprehensive docs.",
    col: "col-span-2",
    bg: "bg-emerald-50"
  },
];

function App() {
  // State
  const [messages, setMessages] = useLocalStorage(STORAGE_KEY, []);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showWorkspace, setShowWorkspace] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");
  const [model, setModel] = useState(DEFAULT_MODEL);
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
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const res = await fetch('/ollama/api/tags');
        if (!res.ok) throw new Error('Failed to fetch models');

        const data = await res.json();
        const availableModels = data.models?.map(m => m.name) || [];

        if (availableModels.length > 0) {
          // Priority list for auto-selection
          const priorities = ['llama3.2', 'llama3', 'mistral', 'llama2', 'gemma'];
          const bestMatch = priorities.find(p => availableModels.some(m => m.includes(p)));

          if (bestMatch) {
            const exactMatch = availableModels.find(m => m.includes(bestMatch));
            setModel(exactMatch);
            console.log(`Auto-selected model: ${exactMatch}`);
          } else {
            setModel(availableModels[0]);
            console.log(`Fallback to first model: ${availableModels[0]}`);
          }
          setConnectionStatus("Ready");
          setIsDemoMode(false);
        } else {
          console.warn("No models found in Ollama. Enabling demo mode.");
          setConnectionStatus("Demo Mode");
          setIsDemoMode(true);
          setModel("demo");
        }
      } catch (e) {
        console.warn("Ollama not available. Enabling demo mode.", e.message);
        setConnectionStatus("Demo Mode");
        setIsDemoMode(true);
        setModel("demo");
      }
    };

    fetchModels();
  }, []);

  useEffect(() => {
    if (messages.length > 0 && window.innerWidth > 1024) {
      // Optional: could auto-open workspace logic
    }
    if (activeMode === 'chat') {
      inputRef.current?.focus();
    }
  }, [activeMode]);

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

      if (demoResponse.includes("```")) {
        setShowWorkspace(true);
      }
      setIsLoading(false);
      return;
    }

    // Real API call
    setConnectionStatus("Processing...");

    // Create system-enhanced message for API (includes file context)
    const messageForAPI = {
      role: 'user',
      content: fileContext
        ? `${messageText}\n\n${fileContext}`
        : messageText
    };

    const messagesForAPI = [...messages, messageForAPI];

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

        if (data.message.content.includes("```")) {
          setShowWorkspace(true);
        }

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
      const fileNames = files.map(f => f.name).join(', ');
      return `I can see you've uploaded: **${fileNames}**\n\n` +
        `In demo mode, I can't fully analyze these files, but here's what I can help with:\n\n` +
        `1. **File Organization** - I can suggest ways to categorize your documents\n` +
        `2. **Summarization** - Once connected to an AI backend, I can summarize content\n` +
        `3. **Q&A** - Ask questions about your files when connected to Ollama\n\n` +
        `*To enable full AI capabilities, please start Ollama with a model like llama3.2*`;
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
      return `👋 **Welcome to DevSavvy!**\n\n` +
        `I'm running in **Demo Mode** right now. Here's what you can explore:\n\n` +
        `| Feature | Status |\n|---------|--------|\n` +
        `| 💬 Chat Interface | ✅ Working |\n` +
        `| 📁 File Upload | ✅ Working |\n` +
        `| 🎨 Canvas | ✅ Working |\n` +
        `| 📝 Documents | ✅ Working |\n` +
        `| 🤖 AI Responses | ⚠️ Demo Only |\n\n` +
        `**To enable full AI:**\n` +
        `1. Install [Ollama](https://ollama.ai)\n` +
        `2. Run: \`ollama run llama3.2\`\n` +
        `3. Refresh this page\n\n` +
        `Try asking me about code, explanations, or debugging!`;
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

  const handleNewThread = () => {
    setMessages([]);
    setShowWorkspace(false);
    setInput("");
    setUploadedFiles([]);
    setSourceOnlyMode(false);
    setShowContextSettings(false);
    setReferencedSources([]);
    if (activeMode === 'chat') {
      inputRef.current?.focus();
    }
  };

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
      case 'command':
        const cmd = action.command;
        if (cmd.id === 'action-clear') {
          handleNewThread();
        } else if (cmd.id === 'action-workspace') {
          setShowWorkspace(!showWorkspace);
        } else if (cmd.id === 'settings-theme') {
          // Theme toggle would go here
          console.log('Toggle theme');
        }
        break;
      default:
        break;
    }
  }, [showWorkspace]);

  // Handle adding content from Library/Documents to Chat
  const handleAddToChat = useCallback((content) => {
    setActiveMode('chat');
    // If content is an object (document), extract text or name
    const textToAdd = typeof content === 'string' ? content : (content.content || `Ref: ${content.name}`);

    setInput(prev => {
      const separator = prev ? '\n\n' : '';
      return `${prev}${separator}${textToAdd}`;
    });

    // Focus input after a short delay to allow mode switch
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  }, []);

  // Global keyboard shortcut for Command Palette
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Cmd/Ctrl + K to open command palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
        onNewThread={handleNewThread}
        onUploadClick={() => setShowUploadModal(true)}
        showUploadBadge={uploadedFiles.length === 0}
        activeMode={activeMode}
        onModeChange={setActiveMode}
        onModelChange={(newModel) => {
          setModel(newModel);
          console.log(`Model changed to: ${newModel}`);
        }}
      />

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex overflow-hidden relative">

        {activeMode === 'chat' && (
          <>
            {/* CHAT PANEL */}
            <div className={`flex-1 flex flex-col h-full bg-background transition-all duration-500 ${showWorkspace ? 'max-w-[50%]' : 'max-w-full'}`}>

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
                  <button
                    onClick={() => setShowCommandPalette(true)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm transition-colors"
                    title="Command Palette (Ctrl+K)"
                  >
                    <Search size={14} />
                    <span className="hidden md:inline">Search...</span>
                    <kbd className="hidden md:flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white text-[10px] text-slate-500 font-mono border border-slate-200">
                      ⌘K
                    </kbd>
                  </button>
                  <button
                    onClick={() => setShowWorkspace(!showWorkspace)}
                    className={`p-2 rounded-lg transition-colors ${showWorkspace ? 'bg-accent/10 text-accent' : 'hover:bg-black/5 text-secondary'}`}
                    title="Toggle Workspace Split View"
                  >
                    <LayoutGrid size={20} />
                  </button>
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
                      <h1 className="font-serif text-4xl md:text-5xl text-primary mb-4 tracking-tight">
                        What will you <span className="text-accent italic">create</span> today?
                      </h1>
                      <p className="text-secondary text-lg font-light max-w-xl mx-auto mb-3">
                        Your persistent AI workspace.
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

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl px-6">
                      {BENTO_ITEMS.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleSend(`${item.title}`)}
                          className={`${item.col} ${item.bg} p-6 rounded-2xl border border-black/5 text-left transition-all hover:scale-[1.02] hover:shadow-lg group`}
                        >
                          <div className="mb-4 bg-white/60 w-12 h-12 rounded-xl flex items-center justify-center backdrop-blur-sm shadow-sm group-hover:scale-110 transition-transform">
                            {item.icon}
                          </div>
                          <h3 className="font-serif text-xl font-medium text-primary mb-1">{item.title}</h3>
                          <p className="text-sm text-secondary/80">{item.desc}</p>
                        </button>
                      ))}
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
                              w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center shadow-sm border border-black/5
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
                                components={{
                                  code({ node, inline, className, children, ...props }) {
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
                        <div className="w-10 h-10 rounded-full bg-white flex-shrink-0 flex items-center justify-center shadow-sm border border-black/5">
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
                <div className={`mx-auto w-full pointer-events-auto transition-all ${showWorkspace ? 'max-w-xl' : 'max-w-3xl'}`}>

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

            {/* MODULAR WORKSPACE PANEL */}
            <WorkspacePanel
              showWorkspace={showWorkspace}
              onClose={() => setShowWorkspace(false)}
            />
          </>
        )}

        {activeMode === 'canvas' && (
          <div className="w-full h-full">
            <Canvas />
          </div>
        )}

        {activeMode === 'documents' && (
          <div className="w-full h-full">
            <DocumentEditor />
          </div>
        )}

        {activeMode === 'youtube' && (
          <div className="w-full h-full">
            <YouTubeEmbed />
          </div>
        )}

        {activeMode === 'url' && (
          <div className="w-full h-full">
            <URLExtractor />
          </div>
        )}

        {activeMode === 'library' && (
          <div className="w-full h-full">
            <Library
              isOpen={true}
              onAddToChat={handleAddToChat}
              onUploadClick={() => setShowUploadModal(true)}
            />
          </div>
        )}

      </div>
    </div>
  );
}

export default App;

