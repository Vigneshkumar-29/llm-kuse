import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
    Code2, ExternalLink, Download, X, LayoutGrid, Play, Eye, EyeOff,
    FileText, Image, Maximize2, Minimize2, Copy, Check, RefreshCw,
    PanelLeftClose, PanelLeft, Columns, Square, SplitSquareHorizontal,
    ChevronDown, Plus, Trash2, Settings, ZoomIn, ZoomOut, RotateCcw,
    FileCode, FileJson, Terminal, Palette, Moon, Sun, Save, Share2
} from 'lucide-react';

// Supported file types for preview
const FILE_TYPES = {
    html: { icon: FileCode, color: 'text-orange-500', bg: 'bg-orange-50', label: 'HTML' },
    css: { icon: Palette, color: 'text-blue-500', bg: 'bg-blue-50', label: 'CSS' },
    javascript: { icon: FileCode, color: 'text-yellow-500', bg: 'bg-yellow-50', label: 'JavaScript' },
    json: { icon: FileJson, color: 'text-green-500', bg: 'bg-green-50', label: 'JSON' },
    markdown: { icon: FileText, color: 'text-purple-500', bg: 'bg-purple-50', label: 'Markdown' },
    text: { icon: FileText, color: 'text-slate-500', bg: 'bg-slate-50', label: 'Text' },
    image: { icon: Image, color: 'text-pink-500', bg: 'bg-pink-50', label: 'Image' },
    code: { icon: Terminal, color: 'text-emerald-500', bg: 'bg-emerald-50', label: 'Code' },
};

// Default tabs
const DEFAULT_TABS = [
    { id: 'welcome', title: 'Getting Started', type: 'markdown', content: '# Welcome to Workspace\n\nThis is your creative space for viewing code, documents, and images.\n\n## Features\n- **Live Preview**: See HTML/JS code in action\n- **Split View**: Compare side by side\n- **Tabbed Interface**: Work with multiple artifacts\n- **Export**: Download your work\n\nGenerate some code or upload files to get started!' },
];

const WorkspacePanel = ({ showWorkspace, onClose, artifacts = [], activeArtifact, onArtifactChange }) => {
    // Tabs state
    const [tabs, setTabs] = useState(DEFAULT_TABS);
    const [activeTab, setActiveTab] = useState('welcome');

    // View state
    const [viewMode, setViewMode] = useState('preview'); // 'code', 'preview', 'split'
    const [splitRatio, setSplitRatio] = useState(50);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    // Preview state
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);
    const [previewError, setPreviewError] = useState(null);
    const [copied, setCopied] = useState(false);

    // Image viewer state
    const [imageZoom, setImageZoom] = useState(100);
    const [imageRotation, setImageRotation] = useState(0);

    // Refs
    const previewRef = useRef(null);
    const iframeRef = useRef(null);
    const containerRef = useRef(null);

    // Sync artifacts with tabs
    useEffect(() => {
        if (artifacts && artifacts.length > 0) {
            const newTabs = artifacts.map(artifact => ({
                id: artifact.id || `artifact-${Date.now()}`,
                title: artifact.title || 'Untitled',
                type: artifact.type || 'code',
                content: artifact.content || '',
                language: artifact.language
            }));
            setTabs(prev => [...DEFAULT_TABS, ...newTabs]);
        }
    }, [artifacts]);

    // Get current tab
    const currentTab = useMemo(() => {
        return tabs.find(t => t.id === activeTab) || tabs[0];
    }, [tabs, activeTab]);

    // Detect content type
    const detectContentType = (content, language) => {
        if (language) {
            if (['html', 'htm'].includes(language.toLowerCase())) return 'html';
            if (['css'].includes(language.toLowerCase())) return 'css';
            if (['js', 'javascript', 'jsx', 'ts', 'tsx'].includes(language.toLowerCase())) return 'javascript';
            if (['json'].includes(language.toLowerCase())) return 'json';
            if (['md', 'markdown'].includes(language.toLowerCase())) return 'markdown';
        }

        // Auto-detect from content
        if (content?.includes('<!DOCTYPE') || content?.includes('<html')) return 'html';
        if (content?.startsWith('{') || content?.startsWith('[')) return 'json';
        if (content?.includes('function') || content?.includes('const ') || content?.includes('let ')) return 'javascript';

        return 'code';
    };

    // Generate live preview for HTML/JS
    const generatePreview = () => {
        if (!currentTab?.content) return;

        setIsPreviewLoading(true);
        setPreviewError(null);

        try {
            const content = currentTab.content;
            const type = detectContentType(content, currentTab.language);

            if (type === 'html' && iframeRef.current) {
                const doc = iframeRef.current.contentDocument;
                doc.open();
                doc.write(content);
                doc.close();
            } else if (type === 'javascript' && iframeRef.current) {
                const htmlWrapper = `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <style>
                            body { font-family: system-ui, sans-serif; padding: 20px; }
                            .output { padding: 10px; background: #f5f5f5; border-radius: 8px; margin: 10px 0; }
                        </style>
                    </head>
                    <body>
                        <div id="output"></div>
                        <script>
                            const consoleOutput = document.getElementById('output');
                            const originalLog = console.log;
                            console.log = function(...args) {
                                const div = document.createElement('div');
                                div.className = 'output';
                                div.textContent = args.map(a => 
                                    typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)
                                ).join(' ');
                                consoleOutput.appendChild(div);
                                originalLog.apply(console, args);
                            };
                            try {
                                ${content}
                            } catch(e) {
                                console.log('Error:', e.message);
                            }
                        </script>
                    </body>
                    </html>
                `;
                const doc = iframeRef.current.contentDocument;
                doc.open();
                doc.write(htmlWrapper);
                doc.close();
            }
        } catch (error) {
            setPreviewError(error.message);
        } finally {
            setIsPreviewLoading(false);
        }
    };

    // Run preview on content change
    useEffect(() => {
        if (viewMode !== 'code' && currentTab?.content) {
            const timer = setTimeout(generatePreview, 500);
            return () => clearTimeout(timer);
        }
    }, [currentTab?.content, viewMode]);

    // Copy to clipboard
    const handleCopy = async () => {
        if (currentTab?.content) {
            await navigator.clipboard.writeText(currentTab.content);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    // Download artifact
    const handleDownload = () => {
        if (!currentTab?.content) return;

        const type = detectContentType(currentTab.content, currentTab.language);
        const extensions = { html: 'html', css: 'css', javascript: 'js', json: 'json', markdown: 'md' };
        const ext = extensions[type] || 'txt';

        const blob = new Blob([currentTab.content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${currentTab.title || 'artifact'}.${ext}`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // Close tab
    const closeTab = (tabId) => {
        const newTabs = tabs.filter(t => t.id !== tabId);
        if (newTabs.length === 0) {
            setTabs(DEFAULT_TABS);
            setActiveTab('welcome');
        } else {
            if (activeTab === tabId) {
                setActiveTab(newTabs[newTabs.length - 1].id);
            }
            setTabs(newTabs);
        }
    };

    // Toggle fullscreen
    const toggleFullscreen = () => {
        if (!document.fullscreenElement && containerRef.current) {
            containerRef.current.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    // Image controls
    const handleZoomIn = () => setImageZoom(prev => Math.min(prev + 25, 300));
    const handleZoomOut = () => setImageZoom(prev => Math.max(prev - 25, 25));
    const handleRotate = () => setImageRotation(prev => (prev + 90) % 360);
    const handleResetImage = () => { setImageZoom(100); setImageRotation(0); };

    // Get file type info
    const fileTypeInfo = FILE_TYPES[detectContentType(currentTab?.content, currentTab?.language)] || FILE_TYPES.code;

    return (
        <div
            ref={containerRef}
            className={`
                border-l border-slate-200/80 bg-white relative
                transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)]
                ${showWorkspace ? 'w-[50%] translate-x-0 opacity-100' : 'w-0 translate-x-20 opacity-0 overflow-hidden'}
                ${isDarkMode ? 'dark bg-slate-900' : ''}
            `}
        >
            <div className="h-full flex flex-col min-w-[400px]">
                {/* Workspace Header */}
                <div className={`h-14 flex items-center justify-between px-4 border-b ${isDarkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-100 bg-white'}`}>
                    {/* Left: Title & Type Badge */}
                    <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg ${fileTypeInfo.bg} flex items-center justify-center`}>
                            <fileTypeInfo.icon size={16} className={fileTypeInfo.color} />
                        </div>
                        <div>
                            <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Workspace</span>
                            <span className={`text-xs ml-2 px-2 py-0.5 rounded-full ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-500'}`}>
                                {fileTypeInfo.label}
                            </span>
                        </div>
                    </div>

                    {/* Center: View Mode Toggle */}
                    <div className={`flex items-center gap-1 p-1 rounded-lg ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
                        <button
                            onClick={() => setViewMode('code')}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${viewMode === 'code'
                                    ? 'bg-white shadow-sm text-slate-800'
                                    : `${isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'}`
                                }`}
                        >
                            <Code2 size={14} className="inline mr-1" />
                            Code
                        </button>
                        <button
                            onClick={() => setViewMode('preview')}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${viewMode === 'preview'
                                    ? 'bg-white shadow-sm text-slate-800'
                                    : `${isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'}`
                                }`}
                        >
                            <Eye size={14} className="inline mr-1" />
                            Preview
                        </button>
                        <button
                            onClick={() => setViewMode('split')}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${viewMode === 'split'
                                    ? 'bg-white shadow-sm text-slate-800'
                                    : `${isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'}`
                                }`}
                        >
                            <SplitSquareHorizontal size={14} className="inline mr-1" />
                            Split
                        </button>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-1">
                        <button
                            onClick={generatePreview}
                            className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
                            title="Refresh Preview"
                        >
                            <RefreshCw size={16} className={isPreviewLoading ? 'animate-spin' : ''} />
                        </button>
                        <button
                            onClick={handleCopy}
                            className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
                            title="Copy Code"
                        >
                            {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                        </button>
                        <button
                            onClick={handleDownload}
                            className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
                            title="Download"
                        >
                            <Download size={16} />
                        </button>
                        <button
                            onClick={() => setIsDarkMode(!isDarkMode)}
                            className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
                            title="Toggle Theme"
                        >
                            {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
                        </button>
                        <button
                            onClick={toggleFullscreen}
                            className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
                            title="Fullscreen"
                        >
                            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                        </button>
                        <div className="w-px h-6 bg-slate-200 mx-1" />
                        <button
                            onClick={onClose}
                            className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-red-900/50 text-slate-400 hover:text-red-400' : 'hover:bg-red-50 text-slate-500 hover:text-red-500'}`}
                            title="Close Workspace"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>

                {/* Tabs Bar */}
                <div className={`flex items-center gap-1 px-2 py-1.5 border-b overflow-x-auto scrollbar-hide ${isDarkMode ? 'border-slate-700 bg-slate-800/50' : 'border-slate-100 bg-slate-50/50'}`}>
                    {tabs.map((tab) => {
                        const tabTypeInfo = FILE_TYPES[detectContentType(tab.content, tab.language)] || FILE_TYPES.code;
                        return (
                            <div
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                                    group flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer
                                    transition-all min-w-max
                                    ${activeTab === tab.id
                                        ? `${isDarkMode ? 'bg-slate-700 text-white' : 'bg-white text-slate-800 shadow-sm'}`
                                        : `${isDarkMode ? 'text-slate-400 hover:bg-slate-700/50' : 'text-slate-500 hover:bg-white/50'}`
                                    }
                                `}
                            >
                                <tabTypeInfo.icon size={12} className={tabTypeInfo.color} />
                                <span className="max-w-[120px] truncate">{tab.title}</span>
                                {tab.id !== 'welcome' && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); closeTab(tab.id); }}
                                        className={`opacity-0 group-hover:opacity-100 p-0.5 rounded transition-all ${isDarkMode ? 'hover:bg-slate-600' : 'hover:bg-slate-200'}`}
                                    >
                                        <X size={12} />
                                    </button>
                                )}
                            </div>
                        );
                    })}
                    <button className={`p-1.5 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-slate-700 text-slate-500' : 'hover:bg-slate-100 text-slate-400'}`}>
                        <Plus size={14} />
                    </button>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-hidden">
                    {currentTab ? (
                        <div className={`h-full flex ${viewMode === 'split' ? 'flex-row' : 'flex-col'}`}>
                            {/* Code Panel */}
                            {(viewMode === 'code' || viewMode === 'split') && (
                                <div
                                    className={`overflow-auto ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'} ${viewMode === 'split' ? 'w-1/2 border-r border-slate-200' : 'flex-1'}`}
                                >
                                    <pre className={`p-4 text-sm font-mono whitespace-pre-wrap ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                                        <code>{currentTab.content || '// No content available'}</code>
                                    </pre>
                                </div>
                            )}

                            {/* Preview Panel */}
                            {(viewMode === 'preview' || viewMode === 'split') && (
                                <div className={`overflow-hidden ${viewMode === 'split' ? 'w-1/2' : 'flex-1'} ${isDarkMode ? 'bg-white' : 'bg-white'}`}>
                                    {/* Image Preview */}
                                    {currentTab.type === 'image' ? (
                                        <div className="h-full flex flex-col">
                                            {/* Image Toolbar */}
                                            <div className="flex items-center justify-center gap-2 p-2 border-b border-slate-100 bg-slate-50">
                                                <button onClick={handleZoomOut} className="p-1.5 hover:bg-slate-200 rounded-lg" title="Zoom Out">
                                                    <ZoomOut size={16} />
                                                </button>
                                                <span className="text-xs font-mono text-slate-500 w-12 text-center">{imageZoom}%</span>
                                                <button onClick={handleZoomIn} className="p-1.5 hover:bg-slate-200 rounded-lg" title="Zoom In">
                                                    <ZoomIn size={16} />
                                                </button>
                                                <div className="w-px h-4 bg-slate-200 mx-1" />
                                                <button onClick={handleRotate} className="p-1.5 hover:bg-slate-200 rounded-lg" title="Rotate">
                                                    <RotateCcw size={16} />
                                                </button>
                                                <button onClick={handleResetImage} className="p-1.5 hover:bg-slate-200 rounded-lg text-xs" title="Reset">
                                                    Reset
                                                </button>
                                            </div>
                                            <div className="flex-1 overflow-auto flex items-center justify-center p-4 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzlIj48cmVjdCB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiNmMWYxZjEiLz48cmVjdCB4PSIxMCIgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjZmZmIi8+PHJlY3QgeT0iMTAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0iI2ZmZiIvPjxyZWN0IHg9IjEwIiB5PSIxMCIgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjZjFmMWYxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')]">
                                                <img
                                                    src={currentTab.content}
                                                    alt={currentTab.title}
                                                    style={{
                                                        transform: `scale(${imageZoom / 100}) rotate(${imageRotation}deg)`,
                                                        transition: 'transform 0.2s ease',
                                                    }}
                                                    className="max-w-full max-h-full object-contain shadow-lg rounded-lg"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        /* HTML/JS Live Preview */
                                        <div className="h-full relative">
                                            {isPreviewLoading && (
                                                <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                                                    <div className="flex items-center gap-2 text-slate-500">
                                                        <RefreshCw size={16} className="animate-spin" />
                                                        <span className="text-sm">Loading preview...</span>
                                                    </div>
                                                </div>
                                            )}
                                            {previewError && (
                                                <div className="absolute top-2 left-2 right-2 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600 z-10">
                                                    <strong>Error:</strong> {previewError}
                                                </div>
                                            )}
                                            <iframe
                                                ref={iframeRef}
                                                title="Preview"
                                                className="w-full h-full border-none bg-white"
                                                sandbox="allow-scripts allow-same-origin"
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        /* Empty State */
                        <div className={`h-full flex flex-col items-center justify-center text-center p-8 ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
                            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg mb-6 ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
                                <LayoutGrid size={40} className={isDarkMode ? 'text-slate-600' : 'text-slate-300'} />
                            </div>
                            <h3 className={`font-serif text-2xl font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                                No active artifact
                            </h3>
                            <p className={`max-w-sm mb-6 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                When you generate code, documents, or images, they will appear here for focused viewing and editing.
                            </p>
                            <div className="flex gap-3">
                                <button className="px-4 py-2 bg-indigo-500 text-white rounded-xl text-sm font-medium hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-500/25">
                                    <Plus size={16} className="inline mr-1" />
                                    Create New
                                </button>
                                <button
                                    onClick={onClose}
                                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                                >
                                    Close Workspace
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Status Bar */}
                <div className={`h-7 flex items-center justify-between px-3 text-[10px] border-t ${isDarkMode ? 'border-slate-700 bg-slate-800 text-slate-500' : 'border-slate-100 bg-slate-50 text-slate-400'}`}>
                    <div className="flex items-center gap-3">
                        <span>{currentTab?.title || 'No file'}</span>
                        <span className="text-slate-300">|</span>
                        <span>{currentTab?.content?.length || 0} characters</span>
                        <span className="text-slate-300">|</span>
                        <span>{currentTab?.content?.split('\n').length || 0} lines</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={`flex items-center gap-1 ${viewMode === 'preview' ? 'text-emerald-500' : ''}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${viewMode === 'preview' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                            Live Preview {viewMode === 'preview' ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkspacePanel;
