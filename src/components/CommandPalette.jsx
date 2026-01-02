import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
    Search, Command, ArrowRight, FileText, MessageSquare, LayoutGrid,
    Upload, PlusCircle, Settings, Moon, Sun, Sparkles, Zap, Code2,
    Youtube, Link2, BookOpen, Download, Share2, Trash2, Copy, Edit2,
    Clock, Star, Hash, ChevronRight, Keyboard, X, CornerDownLeft,
    ArrowUp, ArrowDown, HelpCircle, ExternalLink, History, Cpu,
    FileCode, Image, Folder, Database, Terminal, Globe, Palette,
    RefreshCw, Save, Eye, FolderOpen, AlertCircle, CheckCircle, Info
} from 'lucide-react';

// Command categories
const CATEGORIES = {
    AI: { label: 'AI Actions', icon: Sparkles, color: 'text-purple-500', bg: 'bg-purple-50' },
    NAVIGATION: { label: 'Navigation', icon: LayoutGrid, color: 'text-blue-500', bg: 'bg-blue-50' },
    FILE: { label: 'Files', icon: FileText, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    ACTIONS: { label: 'Actions', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50' },
    SETTINGS: { label: 'Settings', icon: Settings, color: 'text-slate-500', bg: 'bg-slate-50' },
    RECENT: { label: 'Recent', icon: Clock, color: 'text-indigo-500', bg: 'bg-indigo-50' },
};

// Default commands
const DEFAULT_COMMANDS = [
    // AI Actions
    { id: 'ai-explain', label: 'Explain Code', description: 'Get AI explanation for code', category: 'AI', icon: Sparkles, shortcut: ['⌘', 'E'] },
    { id: 'ai-debug', label: 'Debug Code', description: 'Find and fix errors', category: 'AI', icon: Zap, shortcut: ['⌘', 'D'] },
    { id: 'ai-generate', label: 'Generate Code', description: 'Generate code from description', category: 'AI', icon: Code2 },
    { id: 'ai-summarize', label: 'Summarize Document', description: 'Create a summary', category: 'AI', icon: FileText },
    { id: 'ai-translate', label: 'Translate Text', description: 'Translate to another language', category: 'AI', icon: Globe },
    { id: 'ai-improve', label: 'Improve Writing', description: 'Enhance text quality', category: 'AI', icon: Edit2 },

    // Navigation
    { id: 'nav-chat', label: 'Go to AI Chat', description: 'Open chat interface', category: 'NAVIGATION', icon: MessageSquare, shortcut: ['⌘', '1'] },
    { id: 'nav-canvas', label: 'Go to Canvas', description: 'Open canvas workspace', category: 'NAVIGATION', icon: LayoutGrid, shortcut: ['⌘', '2'] },
    { id: 'nav-documents', label: 'Go to Documents', description: 'Open document editor', category: 'NAVIGATION', icon: FileText, shortcut: ['⌘', '3'] },
    { id: 'nav-youtube', label: 'Go to YouTube', description: 'Open YouTube processor', category: 'NAVIGATION', icon: Youtube, shortcut: ['⌘', '4'] },
    { id: 'nav-url', label: 'Go to URL Extract', description: 'Open URL extractor', category: 'NAVIGATION', icon: Link2, shortcut: ['⌘', '5'] },
    { id: 'nav-library', label: 'Go to Library', description: 'Open knowledge library', category: 'NAVIGATION', icon: BookOpen },

    // File Actions
    { id: 'file-new', label: 'New Thread', description: 'Start a new conversation', category: 'FILE', icon: PlusCircle, shortcut: ['⌘', 'N'] },
    { id: 'file-upload', label: 'Upload Files', description: 'Upload documents, images, etc.', category: 'FILE', icon: Upload, shortcut: ['⌘', 'U'] },
    { id: 'file-export', label: 'Export Chat', description: 'Export conversation as document', category: 'FILE', icon: Download },
    { id: 'file-save', label: 'Save Current Work', description: 'Save current state', category: 'FILE', icon: Save, shortcut: ['⌘', 'S'] },

    // Actions
    { id: 'action-copy', label: 'Copy Last Response', description: 'Copy AI response to clipboard', category: 'ACTIONS', icon: Copy },
    { id: 'action-share', label: 'Share Conversation', description: 'Share via link', category: 'ACTIONS', icon: Share2 },
    { id: 'action-refresh', label: 'Regenerate Response', description: 'Get a new AI response', category: 'ACTIONS', icon: RefreshCw },
    { id: 'action-clear', label: 'Clear Chat History', description: 'Delete all messages', category: 'ACTIONS', icon: Trash2 },
    { id: 'action-workspace', label: 'Toggle Workspace', description: 'Show/hide workspace panel', category: 'ACTIONS', icon: Eye },

    // Settings
    { id: 'settings-theme', label: 'Toggle Theme', description: 'Switch dark/light mode', category: 'SETTINGS', icon: Moon, shortcut: ['⌘', 'T'] },
    { id: 'settings-model', label: 'Change AI Model', description: 'Select different AI model', category: 'SETTINGS', icon: Cpu },
    { id: 'settings-preferences', label: 'Open Settings', description: 'Configure preferences', category: 'SETTINGS', icon: Settings, shortcut: ['⌘', ','] },
    { id: 'settings-shortcuts', label: 'Keyboard Shortcuts', description: 'View all shortcuts', category: 'SETTINGS', icon: Keyboard },
    { id: 'settings-help', label: 'Help & Feedback', description: 'Get help or report issues', category: 'SETTINGS', icon: HelpCircle },
];

// AI Quick Prompts
const AI_PROMPTS = [
    { id: 'prompt-1', label: 'Explain this in simple terms', icon: Sparkles },
    { id: 'prompt-2', label: 'Write unit tests for this code', icon: Code2 },
    { id: 'prompt-3', label: 'Optimize this for performance', icon: Zap },
    { id: 'prompt-4', label: 'Add comments to this code', icon: Edit2 },
    { id: 'prompt-5', label: 'Convert to TypeScript', icon: FileCode },
    { id: 'prompt-6', label: 'Create a README for this', icon: FileText },
    { id: 'prompt-7', label: 'Find potential bugs', icon: AlertCircle },
    { id: 'prompt-8', label: 'Refactor for readability', icon: Palette },
];

const CommandPalette = ({
    isOpen,
    onClose,
    onCommand,
    onModeChange,
    onNewThread,
    onUploadClick,
    recentItems = [],
    files = []
}) => {
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [activeCategory, setActiveCategory] = useState(null);
    const [mode, setMode] = useState('commands'); // 'commands', 'ai', 'files'
    const inputRef = useRef(null);
    const listRef = useRef(null);

    // Focus input when opened
    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setSelectedIndex(0);
            setActiveCategory(null);
            setMode('commands');
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    // Filter items - using a function to get filtered items
    const getFilteredItems = useCallback(() => {
        const q = query.toLowerCase().trim();

        if (mode === 'ai') {
            return AI_PROMPTS.filter(p =>
                p.label.toLowerCase().includes(q)
            );
        }

        if (mode === 'files') {
            const allFiles = [
                ...files.map(f => ({ ...f, category: 'FILE', type: 'file' })),
                ...recentItems.map(r => ({ ...r, category: 'RECENT', type: 'recent' }))
            ];
            return allFiles.filter(f =>
                f.name?.toLowerCase().includes(q) || f.title?.toLowerCase().includes(q)
            );
        }

        let items = DEFAULT_COMMANDS;
        if (activeCategory) {
            items = items.filter(c => c.category === activeCategory);
        }
        if (q) {
            items = items.filter(c =>
                c.label.toLowerCase().includes(q) ||
                c.description.toLowerCase().includes(q)
            );
        }
        return items;
    }, [query, mode, activeCategory, files, recentItems]);

    // Memoized filtered items for rendering
    const filteredItems = useMemo(() => getFilteredItems(), [getFilteredItems]);

    // Handle command selection
    const executeSelect = useCallback((item) => {
        if (mode === 'ai') {
            onCommand?.({ type: 'ai-prompt', prompt: item.label });
        } else if (mode === 'files') {
            onCommand?.({ type: 'open-file', file: item });
        } else {
            if (item.id?.startsWith('nav-')) {
                const modeMap = {
                    'nav-chat': 'chat',
                    'nav-canvas': 'canvas',
                    'nav-documents': 'documents',
                    'nav-youtube': 'youtube',
                    'nav-url': 'url',
                    'nav-library': 'library'
                };
                if (modeMap[item.id]) {
                    onModeChange?.(modeMap[item.id]);
                }
            } else if (item.id === 'file-new') {
                onNewThread?.();
            } else if (item.id === 'file-upload') {
                onUploadClick?.();
            } else {
                onCommand?.({ type: 'command', command: item });
            }
        }
        onClose();
    }, [mode, onCommand, onModeChange, onNewThread, onUploadClick, onClose]);

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isOpen) return;

            const items = getFilteredItems();

            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    setSelectedIndex(prev => Math.min(prev + 1, items.length - 1));
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setSelectedIndex(prev => Math.max(prev - 1, 0));
                    break;
                case 'Enter':
                    e.preventDefault();
                    setSelectedIndex(currentIdx => {
                        const currentItems = getFilteredItems();
                        if (currentItems[currentIdx]) {
                            executeSelect(currentItems[currentIdx]);
                        }
                        return currentIdx;
                    });
                    break;
                case 'Escape':
                    e.preventDefault();
                    onClose();
                    break;
                case 'Tab':
                    e.preventDefault();
                    setMode(prev => {
                        const modes = ['commands', 'ai', 'files'];
                        const currentIdx = modes.indexOf(prev);
                        return modes[(currentIdx + 1) % modes.length];
                    });
                    break;
                default:
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, getFilteredItems, executeSelect, onClose]);

    // Scroll selected item into view
    useEffect(() => {
        if (listRef.current) {
            const selectedEl = listRef.current.querySelector(`[data-index="${selectedIndex}"]`);
            selectedEl?.scrollIntoView({ block: 'nearest' });
        }
    }, [selectedIndex]);

    // Reset selected index when filter changes
    useEffect(() => {
        setSelectedIndex(0);
    }, [query, mode, activeCategory]);

    // Wrapper for handleSelect used in JSX
    const handleSelect = executeSelect;

    // Category quick filters
    const categoryButtons = Object.entries(CATEGORIES).map(([key, cat]) => (
        <button
            key={key}
            onClick={() => setActiveCategory(activeCategory === key ? null : key)}
            className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all
                ${activeCategory === key
                    ? `${cat.bg} ${cat.color} ring-2 ring-offset-1 ring-${cat.color.replace('text-', '')}/30`
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }
            `}
        >
            <cat.icon size={12} />
            {cat.label}
        </button>
    ));

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fade-in"
                onClick={onClose}
            />

            {/* Command Palette Modal */}
            <div className="fixed inset-0 flex items-start justify-center pt-[15vh] z-50 pointer-events-none">
                <div
                    className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden pointer-events-auto animate-scale-in"
                    style={{ maxHeight: '70vh' }}
                >
                    {/* Search Input */}
                    <div className="p-4 border-b border-slate-100">
                        <div className="flex items-center gap-3 px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
                            {mode === 'ai' ? (
                                <Sparkles size={18} className="text-purple-500" />
                            ) : mode === 'files' ? (
                                <Folder size={18} className="text-emerald-500" />
                            ) : (
                                <Search size={18} className="text-slate-400" />
                            )}
                            <input
                                ref={inputRef}
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder={
                                    mode === 'ai'
                                        ? 'Type an AI prompt or select one below...'
                                        : mode === 'files'
                                            ? 'Search your files and documents...'
                                            : 'Type a command or search...'
                                }
                                className="flex-1 bg-transparent border-none outline-none text-slate-800 placeholder-slate-400"
                            />
                            <div className="flex items-center gap-1">
                                <kbd className="px-1.5 py-0.5 rounded bg-slate-200 text-[10px] font-mono text-slate-500">ESC</kbd>
                            </div>
                        </div>

                        {/* Mode Tabs */}
                        <div className="flex items-center gap-2 mt-3">
                            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                                <button
                                    onClick={() => setMode('commands')}
                                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${mode === 'commands' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                >
                                    <Command size={12} className="inline mr-1" />
                                    Commands
                                </button>
                                <button
                                    onClick={() => setMode('ai')}
                                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${mode === 'ai' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                >
                                    <Sparkles size={12} className="inline mr-1" />
                                    AI Prompts
                                </button>
                                <button
                                    onClick={() => setMode('files')}
                                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${mode === 'files' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                >
                                    <FileText size={12} className="inline mr-1" />
                                    Files
                                </button>
                            </div>
                            <span className="text-[10px] text-slate-400 ml-auto">
                                Press <kbd className="px-1 py-0.5 rounded bg-slate-100 font-mono">Tab</kbd> to switch
                            </span>
                        </div>

                        {/* Category Filters (only in commands mode) */}
                        {mode === 'commands' && !query && (
                            <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
                                {categoryButtons}
                            </div>
                        )}
                    </div>

                    {/* Results List */}
                    <div
                        ref={listRef}
                        className="overflow-y-auto"
                        style={{ maxHeight: 'calc(70vh - 180px)' }}
                    >
                        {filteredItems.length === 0 ? (
                            <div className="p-8 text-center">
                                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                                    <Search size={20} className="text-slate-400" />
                                </div>
                                <p className="text-slate-500 font-medium">No results found</p>
                                <p className="text-sm text-slate-400 mt-1">Try a different search term</p>
                            </div>
                        ) : (
                            <div className="p-2">
                                {/* Group by category in commands mode */}
                                {mode === 'commands' && !query && !activeCategory ? (
                                    Object.entries(CATEGORIES).map(([key, cat]) => {
                                        const categoryItems = filteredItems.filter(i => i.category === key);
                                        if (categoryItems.length === 0) return null;

                                        return (
                                            <div key={key} className="mb-4">
                                                <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                    <cat.icon size={12} className={cat.color} />
                                                    {cat.label}
                                                </div>
                                                {categoryItems.slice(0, 3).map((item, idx) => {
                                                    const globalIdx = filteredItems.indexOf(item);
                                                    return (
                                                        <CommandItem
                                                            key={item.id}
                                                            item={item}
                                                            isSelected={selectedIndex === globalIdx}
                                                            index={globalIdx}
                                                            onSelect={() => handleSelect(item)}
                                                            onHover={() => setSelectedIndex(globalIdx)}
                                                        />
                                                    );
                                                })}
                                            </div>
                                        );
                                    })
                                ) : (
                                    filteredItems.map((item, idx) => (
                                        <CommandItem
                                            key={item.id || idx}
                                            item={item}
                                            isSelected={selectedIndex === idx}
                                            index={idx}
                                            onSelect={() => handleSelect(item)}
                                            onHover={() => setSelectedIndex(idx)}
                                            mode={mode}
                                        />
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer with hints */}
                    <div className="p-3 border-t border-slate-100 bg-slate-50/50">
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                            <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1">
                                    <ArrowUp size={10} />
                                    <ArrowDown size={10} />
                                    Navigate
                                </span>
                                <span className="flex items-center gap-1">
                                    <CornerDownLeft size={10} />
                                    Select
                                </span>
                                <span className="flex items-center gap-1">
                                    <kbd className="px-1 py-0.5 rounded bg-slate-200 font-mono">Tab</kbd>
                                    Switch Mode
                                </span>
                            </div>
                            <span className="flex items-center gap-1">
                                <Command size={10} />
                                <kbd className="px-1 py-0.5 rounded bg-slate-200 font-mono">K</kbd>
                                to open anytime
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

// Individual command item component
const CommandItem = ({ item, isSelected, index, onSelect, onHover, mode }) => {
    const Icon = item.icon || Command;
    const category = CATEGORIES[item.category];

    return (
        <div
            data-index={index}
            onClick={onSelect}
            onMouseEnter={onHover}
            className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all
                ${isSelected
                    ? 'bg-indigo-50 border border-indigo-200'
                    : 'hover:bg-slate-50 border border-transparent'
                }
            `}
        >
            <div className={`
                w-9 h-9 rounded-lg flex items-center justify-center
                ${isSelected ? 'bg-indigo-500 text-white' : category?.bg || 'bg-slate-100 text-slate-500'}
            `}>
                <Icon size={16} className={isSelected ? '' : category?.color || ''} />
            </div>
            <div className="flex-1 min-w-0">
                <div className={`font-medium text-sm ${isSelected ? 'text-indigo-900' : 'text-slate-700'}`}>
                    {item.label || item.name || item.title}
                </div>
                {item.description && (
                    <div className={`text-xs truncate ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`}>
                        {item.description}
                    </div>
                )}
            </div>
            {item.shortcut && (
                <div className="flex items-center gap-1">
                    {item.shortcut.map((key, idx) => (
                        <kbd
                            key={idx}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${isSelected ? 'bg-indigo-200 text-indigo-700' : 'bg-slate-100 text-slate-500'
                                }`}
                        >
                            {key}
                        </kbd>
                    ))}
                </div>
            )}
            {isSelected && (
                <ChevronRight size={16} className="text-indigo-500" />
            )}
        </div>
    );
};

export default CommandPalette;
