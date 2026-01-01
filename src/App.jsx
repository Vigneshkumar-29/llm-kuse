import React, { useState, useRef, useEffect } from 'react';
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
import { YouTubeEmbed } from './components/YouTube';

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

  // File Upload State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  // Context-Aware Chat State
  const [sourceOnlyMode, setSourceOnlyMode] = useState(false);
  const [showContextSettings, setShowContextSettings] = useState(false);
  const [referencedSources, setReferencedSources] = useState([]);

  // Mode State
  const [activeMode, setActiveMode] = useState('chat');

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

  // Auto-detect available models
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
        } else {
          console.warn("No models found in Ollama.");
          setConnectionStatus("No Models Found");
        }
      } catch (e) {
        console.warn("Model detection failed, using default.", e);
        setConnectionStatus("Ready (Default Model)");
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

    // Create system-enhanced message for API (includes file context)
    const messageForAPI = {
      role: 'user',
      content: fileContext
        ? `${messageText}\n\n${fileContext}`
        : messageText
    };

    const newMessages = [...messages, userMsg];
    const messagesForAPI = [...messages, messageForAPI];

    setMessages(newMessages);
    setInput("");
    setIsLoading(true);
    setConnectionStatus("Processing...");
    setReferencedSources([]); // Reset references for new message

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
      setConnectionStatus("Disconnected");
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `**Connection Error**\n\nUnable to reach the AI backend. Please ensure:\n\n` +
          `• Google Colab notebook is running\n` +
          `• Ngrok tunnel is active\n` +
          `• The URL in \`.env\` is correct\n` +
          `• A valid model is installed (tried using: \`${model}\`)\n\n` +
          `*Technical details: ${error.message}*`
      }]);
    } finally {
      setIsLoading(false);
    }
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

  return (
    <div className="flex h-screen overflow-hidden bg-background text-primary selection:bg-accent/20 font-sans">

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
                      <p className="text-secondary text-lg font-light max-w-xl mx-auto">
                        Your persistent AI workspace ({model}).
                      </p>
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

      </div>
    </div>
  );
}

export default App;

