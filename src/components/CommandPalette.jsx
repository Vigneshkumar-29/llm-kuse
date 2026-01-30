import React, { useState, useEffect, useCallback } from 'react';
import { Command } from 'cmdk';
import {
    Search, Command as ComIcon, FileText, MessageSquare, LayoutGrid,
    Upload, PlusCircle, Settings, Moon, Sun, Sparkles, Zap, Code2,
    Youtube, Link2, BookOpen, Download, Share2, Trash2, Copy, Edit2,
    Clock, Cpu, FileCode, Folder, AlertCircle, Palette, RefreshCw,
    Save, Eye, ArrowRight, CornerDownLeft, ArrowUp, ArrowDown
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
    // Navigation
    { id: 'nav-chat', label: 'Go to AI Chat', description: 'Open chat interface', category: 'NAVIGATION', icon: MessageSquare, shortcut: ['⌘', '1'] },
    { id: 'nav-canvas', label: 'Go to Canvas', description: 'Open canvas workspace', category: 'NAVIGATION', icon: LayoutGrid, shortcut: ['⌘', '2'] },
    { id: 'nav-documents', label: 'Go to Documents', description: 'Open document editor', category: 'NAVIGATION', icon: FileText, shortcut: ['⌘', '3'] },
    { id: 'nav-youtube', label: 'Go to YouTube', description: 'Open YouTube processor', category: 'NAVIGATION', icon: Youtube, shortcut: ['⌘', '4'] },
    { id: 'nav-url', label: 'Go to URL Extract', description: 'Open URL extractor', category: 'NAVIGATION', icon: Link2, shortcut: ['⌘', '5'] },
    { id: 'nav-library', label: 'Go to Library', description: 'Open knowledge library', category: 'NAVIGATION', icon: BookOpen },
    // Actions
    { id: 'file-new', label: 'New Thread', description: 'Start a new conversation', category: 'FILE', icon: PlusCircle, shortcut: ['⌘', 'N'] },
    { id: 'file-upload', label: 'Upload Files', description: 'Upload documents', category: 'FILE', icon: Upload, shortcut: ['⌘', 'U'] },
    { id: 'action-workspace', label: 'Toggle Workspace', description: 'Show/hide workspace panel', category: 'ACTIONS', icon: Eye },
    { id: 'settings-theme', label: 'Toggle Theme', description: 'Switch dark/light mode', category: 'SETTINGS', icon: Moon, shortcut: ['⌘', 'T'] },
];

const AI_PROMPTS = [
    { id: 'prompt-1', label: 'Explain this in simple terms', icon: Sparkles },
    { id: 'prompt-2', label: 'Write unit tests for this code', icon: Code2 },
    { id: 'prompt-3', label: 'Optimize this for performance', icon: Zap },
    { id: 'prompt-4', label: 'Add comments to this code', icon: Edit2 },
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
    const [page, setPage] = useState('home'); // home, ai, files
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (isOpen) {
            // Reset state in a timeout to avoid synchronous update warning during render phase
            // if this effect is triggered by parent layout changes
            const timer = setTimeout(() => {
                setSearch('');
                setPage('home');
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const runCommand = useCallback((item) => {
        if (item.id?.startsWith('nav-')) {
            const modeMap = {
                'nav-chat': 'chat', 'nav-canvas': 'canvas', 'nav-documents': 'documents',
                'nav-youtube': 'youtube', 'nav-url': 'url', 'nav-library': 'library'
            };
            if (modeMap[item.id]) onModeChange?.(modeMap[item.id]);
        } else if (item.id === 'file-new') {
            onNewThread?.();
        } else if (item.id === 'file-upload') {
            onUploadClick?.();
        } else if (item.type === 'ai-prompt') {
            onCommand?.(item);
        } else if (item.type === 'open-file') {
            onCommand?.(item);
        } else if (item.id === 'show_ai') {
            setPage('ai');
            setSearch('');
            return;
        } else if (item.id === 'show_files') {
            setPage('files');
            setSearch('');
            return;
        } else {
            onCommand?.({ type: 'command', command: item });
        }
        onClose();
    }, [onModeChange, onNewThread, onUploadClick, onCommand, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-[15vh]" onClick={onClose}>
            <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden animate-scale-in" onClick={e => e.stopPropagation()}>
                <Command
                    filter={(value, search) => {
                        if (page !== 'home') return 1;
                        if (value.toLowerCase().includes(search.toLowerCase())) return 1;
                        return 0;
                    }}
                    className="w-full"
                    loop
                >
                    <div className="flex items-center border-b px-4 py-3 gap-3">
                        <Search className="w-5 h-5 text-gray-400" />
                        <Command.Input
                            value={search}
                            onValueChange={setSearch}
                            placeholder={page === 'ai' ? 'Search AI prompts...' : page === 'files' ? 'Search files...' : 'Type a command or search...'}
                            className="flex-1 text-lg outline-none placeholder:text-gray-400"
                            autoFocus
                        />
                        <div className="flex gap-2">
                            <kbd className="px-1.5 py-0.5 rounded bg-gray-100 text-xs font-mono text-gray-500">ESC</kbd>
                        </div>
                    </div>

                    <Command.List className="max-h-[60vh] overflow-y-auto p-2 scroll-py-2">
                        <Command.Empty className="p-8 text-center text-gray-500">No results found.</Command.Empty>

                        {page === 'home' && (
                            <>
                                <Command.Group heading="Quick Access">
                                    <Command.Item onSelect={() => runCommand({ id: 'show_files' })} className="cmd-item">
                                        <Folder className="w-4 h-4 mr-2" /> Search Files...
                                    </Command.Item>
                                    <Command.Item onSelect={() => runCommand({ id: 'show_ai' })} className="cmd-item">
                                        <Sparkles className="w-4 h-4 mr-2" /> AI Prompts...
                                    </Command.Item>
                                </Command.Group>

                                {[...new Set(DEFAULT_COMMANDS.map(c => c.category))].map(cat => (
                                    <Command.Group key={cat} heading={CATEGORIES[cat].label}>
                                        {DEFAULT_COMMANDS.filter(c => c.category === cat).map(item => (
                                            <Command.Item key={item.id} onSelect={() => runCommand(item)} className="cmd-item">
                                                {React.createElement(item.icon, { className: "w-4 h-4 mr-2" })}
                                                <span className="flex-1">{item.label}</span>
                                                {item.shortcut && (
                                                    <span className="text-xs text-gray-400 font-mono">{item.shortcut.join('')}</span>
                                                )}
                                            </Command.Item>
                                        ))}
                                    </Command.Group>
                                ))}
                            </>
                        )}

                        {page === 'ai' && (
                            <Command.Group heading="AI Prompts">
                                {AI_PROMPTS.map(item => (
                                    <Command.Item key={item.id} onSelect={() => runCommand({ type: 'ai-prompt', prompt: item.label })} className="cmd-item">
                                        <item.icon className="w-4 h-4 mr-2" />
                                        {item.label}
                                    </Command.Item>
                                ))}
                            </Command.Group>
                        )}

                        {page === 'files' && (
                            <Command.Group heading="Files">
                                {files.map(file => (
                                    <Command.Item key={file.id} onSelect={() => runCommand({ type: 'open-file', file })} className="cmd-item">
                                        <FileText className="w-4 h-4 mr-2" />
                                        {file.name}
                                    </Command.Item>
                                ))}
                                {recentItems.map(item => (
                                    <Command.Item key={item.id} onSelect={() => runCommand({ type: 'open-file', file: item })} className="cmd-item">
                                        <Clock className="w-4 h-4 mr-2" />
                                        {item.title}
                                    </Command.Item>
                                ))}
                            </Command.Group>
                        )}
                    </Command.List>

                    <div className="border-t p-2 text-xs text-gray-400 flex justify-between px-4 bg-gray-50/50">
                        <span>Use arrow keys to navigate</span>
                        <span>Press Enter to select</span>
                    </div>
                </Command>
            </div>

            <style jsx global>{`
                .cmd-item {
                    display: flex;
                    align-items: center;
                    padding: 0.75rem 1rem;
                    border-radius: 0.5rem;
                    cursor: pointer;
                    color: #374151;
                    user-select: none;
                }
                .cmd-item[data-selected="true"] {
                    background-color: #f3f4f6;
                    color: #111827;
                }
                [cmdk-group-heading] {
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: #9ca3af;
                    padding: 0.5rem 1rem 0.25rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
            `}</style>
        </div>
    );
};

export default CommandPalette;
