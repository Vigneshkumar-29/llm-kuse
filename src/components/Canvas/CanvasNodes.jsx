/**
 * Canvas Node Types - Professional Element Components
 * =====================================================
 * 
 * Step 3.2: Element Types Implementation
 * 
 * A comprehensive suite of canvas node components providing fully functional
 * elements for the Knowledge Canvas board.
 * 
 * ELEMENT TYPES:
 * 1. Text Note - Rich editable text block with markdown support
 * 2. AI Response Card - Chat response displayed as interactive card
 * 3. Image Element - Uploaded or URL-based images with editing
 * 4. Code Snippet - Syntax highlighted code block
 * 5. Document Reference - Link to library item with preview
 * 6. Connection Lines - Handled via custom edge styles
 * 
 * @version 2.0.0
 * @author Enhanced by Claude
 */

import React, { memo, useState, useCallback, useRef, useEffect } from 'react';
import { Handle, Position, NodeResizer, getBezierPath, EdgeLabelRenderer, BaseEdge } from '@xyflow/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
    FileText, Code, MessageSquare, Image as ImageIcon, Trash2,
    GripVertical, Copy, X, Check, ChevronDown, ChevronUp,
    ExternalLink, Download, Edit3, Eye, EyeOff, Maximize2,
    Link, Sparkles, Bot, File, FileCode, FileSpreadsheet,
    FileImage, FileVideo, FileAudio, Palette, Bold, Italic,
    List, Link2, Quote, Heading, RotateCcw, ZoomIn, Upload,
    RefreshCw, Clock, Hash, Tag, BookOpen, Layers
} from 'lucide-react';

// =============================================================================
// SHARED UTILITIES
// =============================================================================

const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const truncateText = (text, maxLength = 100) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

// Copy to clipboard with feedback
const useCopyToClipboard = () => {
    const [copied, setCopied] = useState(false);

    const copy = useCallback((text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, []);

    return { copied, copy };
};

// =============================================================================
// NODE WRAPPER - ENHANCED SHARED CONTAINER
// =============================================================================

const NodeWrapper = memo(({
    children,
    selected,
    color = 'gray',
    onDelete,
    title,
    icon: Icon,
    badge,
    footer,
    header,
    className = '',
    minWidth = 240,
    minHeight = 120,
    actions
}) => {
    const colorClasses = {
        gray: { bg: 'from-gray-50 to-gray-100/50', border: 'border-gray-200', accent: 'text-gray-600', ring: 'ring-gray-200' },
        blue: { bg: 'from-blue-50 to-blue-100/50', border: 'border-blue-200', accent: 'text-blue-600', ring: 'ring-blue-200' },
        amber: { bg: 'from-amber-50 to-amber-100/50', border: 'border-amber-200', accent: 'text-amber-600', ring: 'ring-amber-200' },
        purple: { bg: 'from-purple-50 to-purple-100/50', border: 'border-purple-200', accent: 'text-purple-600', ring: 'ring-purple-200' },
        pink: { bg: 'from-pink-50 to-pink-100/50', border: 'border-pink-200', accent: 'text-pink-600', ring: 'ring-pink-200' },
        emerald: { bg: 'from-emerald-50 to-emerald-100/50', border: 'border-emerald-200', accent: 'text-emerald-600', ring: 'ring-emerald-200' },
        indigo: { bg: 'from-indigo-50 to-indigo-100/50', border: 'border-indigo-200', accent: 'text-indigo-600', ring: 'ring-indigo-200' },
        rose: { bg: 'from-rose-50 to-rose-100/50', border: 'border-rose-200', accent: 'text-rose-600', ring: 'ring-rose-200' }
    };

    const colors = colorClasses[color] || colorClasses.gray;

    return (
        <div className={`
            relative rounded-2xl border-2 bg-white shadow-lg transition-all duration-200
            ${selected ? `border-indigo-500 ring-2 ${colors.ring}` : colors.border}
            hover:shadow-xl
            ${className}
        `} style={{ minWidth, minHeight }}>
            <NodeResizer
                minWidth={minWidth}
                minHeight={minHeight}
                isVisible={selected}
                lineClassName="!border-indigo-400"
                handleClassName="!w-3 !h-3 !bg-indigo-500 !border-white"
            />

            {/* Header */}
            <div className={`
                flex items-center gap-2 px-3 py-2.5 border-b bg-gradient-to-r 
                ${colors.bg} rounded-t-xl
            `}>
                <GripVertical size={14} className="text-gray-400 cursor-grab active:cursor-grabbing" />
                {Icon && <Icon size={15} className={colors.accent} />}
                <span className="text-xs font-semibold text-gray-700 flex-1 truncate">{title}</span>

                {badge && (
                    <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded-full ${colors.accent} bg-white/60`}>
                        {badge}
                    </span>
                )}

                {actions && (
                    <div className="flex items-center gap-1">
                        {actions}
                    </div>
                )}

                <button
                    onClick={() => onDelete?.()}
                    className="p-1 rounded-lg hover:bg-white/50 text-gray-400 hover:text-red-500 transition-colors"
                >
                    <X size={13} />
                </button>
            </div>

            {/* Custom Header Content */}
            {header && <div className="px-3 py-2 border-b bg-gray-50/50">{header}</div>}

            {/* Content */}
            <div className="p-3">
                {children}
            </div>

            {/* Footer */}
            {footer && (
                <div className="px-3 py-2 border-t bg-gray-50/50 rounded-b-xl">
                    {footer}
                </div>
            )}

            {/* Connection Handles - Enhanced styling */}
            <Handle
                type="target"
                position={Position.Top}
                className="!w-3 !h-3 !bg-gray-400 !border-2 !border-white hover:!bg-indigo-500 transition-colors"
            />
            <Handle
                type="source"
                position={Position.Bottom}
                className="!w-3 !h-3 !bg-gray-400 !border-2 !border-white hover:!bg-indigo-500 transition-colors"
            />
            <Handle
                type="target"
                position={Position.Left}
                id="left"
                className="!w-3 !h-3 !bg-gray-400 !border-2 !border-white hover:!bg-indigo-500 transition-colors"
            />
            <Handle
                type="source"
                position={Position.Right}
                id="right"
                className="!w-3 !h-3 !bg-gray-400 !border-2 !border-white hover:!bg-indigo-500 transition-colors"
            />
        </div>
    );
});

NodeWrapper.displayName = 'NodeWrapper';

// =============================================================================
// 1. TEXT NOTE - EDITABLE TEXT BLOCK
// =============================================================================

const TextNode = memo(({ id, data, selected }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [content, setContent] = useState(data.content || '');
    const [title, setTitle] = useState(data.title || 'New Note');
    const [showPreview, setShowPreview] = useState(true);
    const textareaRef = useRef(null);

    useEffect(() => {
        if (isEditing && textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.selectionStart = textareaRef.current.value.length;
        }
    }, [isEditing]);

    const handleSave = useCallback(() => {
        setIsEditing(false);
        data.onUpdate?.(id, { content, title });
    }, [id, content, title, data]);

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Escape') {
            setIsEditing(false);
        } else if (e.key === 'Enter' && e.ctrlKey) {
            handleSave();
        }
    }, [handleSave]);

    const insertMarkdown = useCallback((prefix, suffix = '') => {
        if (!textareaRef.current) return;
        const start = textareaRef.current.selectionStart;
        const end = textareaRef.current.selectionEnd;
        const text = content;
        const selectedText = text.substring(start, end);
        const newText = text.substring(0, start) + prefix + selectedText + suffix + text.substring(end);
        setContent(newText);

        setTimeout(() => {
            textareaRef.current.focus();
            textareaRef.current.selectionStart = start + prefix.length;
            textareaRef.current.selectionEnd = start + prefix.length + selectedText.length;
        }, 0);
    }, [content]);

    const actions = (
        <button
            onClick={() => setShowPreview(!showPreview)}
            className="p-1 rounded hover:bg-white/50 text-gray-400"
            title={showPreview ? "Edit mode" : "Preview mode"}
        >
            {showPreview ? <Edit3 size={12} /> : <Eye size={12} />}
        </button>
    );

    return (
        <NodeWrapper
            selected={selected}
            color="blue"
            title={title}
            icon={FileText}
            onDelete={() => data.onDelete?.(id)}
            actions={actions}
            badge={content.length > 0 ? `${content.split(/\s+/).filter(Boolean).length}w` : null}
            minWidth={280}
        >
            {isEditing ? (
                <div className="space-y-2">
                    {/* Title Input */}
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-2 py-1.5 text-sm font-medium border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                        placeholder="Note title..."
                    />

                    {/* Formatting Toolbar */}
                    <div className="flex items-center gap-1 p-1 bg-gray-50 rounded-lg">
                        <button onClick={() => insertMarkdown('**', '**')} className="p-1 rounded hover:bg-gray-200" title="Bold">
                            <Bold size={12} />
                        </button>
                        <button onClick={() => insertMarkdown('*', '*')} className="p-1 rounded hover:bg-gray-200" title="Italic">
                            <Italic size={12} />
                        </button>
                        <button onClick={() => insertMarkdown('## ')} className="p-1 rounded hover:bg-gray-200" title="Heading">
                            <Heading size={12} />
                        </button>
                        <button onClick={() => insertMarkdown('- ')} className="p-1 rounded hover:bg-gray-200" title="List">
                            <List size={12} />
                        </button>
                        <button onClick={() => insertMarkdown('[', '](url)')} className="p-1 rounded hover:bg-gray-200" title="Link">
                            <Link2 size={12} />
                        </button>
                        <button onClick={() => insertMarkdown('> ')} className="p-1 rounded hover:bg-gray-200" title="Quote">
                            <Quote size={12} />
                        </button>
                    </div>

                    {/* Text Area */}
                    <textarea
                        ref={textareaRef}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        onBlur={handleSave}
                        onKeyDown={handleKeyDown}
                        className="w-full min-h-[120px] p-2 text-sm border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-200 font-mono"
                        placeholder="Write your note in Markdown..."
                    />

                    <p className="text-[10px] text-gray-400">Ctrl+Enter to save • Esc to cancel</p>
                </div>
            ) : (
                <div
                    onDoubleClick={() => setIsEditing(true)}
                    className="min-h-[80px] cursor-text"
                >
                    {content ? (
                        showPreview ? (
                            <div className="prose-clean text-sm">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {content}
                                </ReactMarkdown>
                            </div>
                        ) : (
                            <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono bg-gray-50 p-2 rounded">
                                {content}
                            </pre>
                        )
                    ) : (
                        <p className="text-sm text-gray-400 italic">Double-click to edit this note...</p>
                    )}
                </div>
            )}
        </NodeWrapper>
    );
});

TextNode.displayName = 'TextNode';

// =============================================================================
// 2. AI RESPONSE CARD - CHAT RESPONSE AS CARD
// =============================================================================

const AIResponseNode = memo(({ id, data, selected }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [showSources, setShowSources] = useState(false);
    const { copied, copy } = useCopyToClipboard();

    const formattedDate = formatDate(data.timestamp);

    const footer = (
        <div className="flex items-center justify-between text-[10px] text-gray-400">
            <div className="flex items-center gap-2">
                {data.model && (
                    <span className="flex items-center gap-1">
                        <Bot size={10} />
                        {data.model}
                    </span>
                )}
                {data.timestamp && (
                    <span className="flex items-center gap-1">
                        <Clock size={10} />
                        {formattedDate}
                    </span>
                )}
            </div>
            <div className="flex items-center gap-1">
                <button
                    onClick={() => copy(data.response || '')}
                    className="p-1 rounded hover:bg-gray-200 transition-colors"
                    title="Copy response"
                >
                    {copied ? <Check size={10} className="text-green-500" /> : <Copy size={10} />}
                </button>
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="p-1 rounded hover:bg-gray-200 transition-colors"
                    title={isExpanded ? "Collapse" : "Expand"}
                >
                    {isExpanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                </button>
            </div>
        </div>
    );

    return (
        <NodeWrapper
            selected={selected}
            color="purple"
            title="AI Response"
            icon={Sparkles}
            onDelete={() => data.onDelete?.(id)}
            footer={footer}
            minWidth={320}
            badge={data.model?.split('/').pop()}
        >
            <div className="space-y-3">
                {/* Query Section */}
                {data.query && (
                    <div className="p-2.5 rounded-xl bg-gray-100/80 border border-gray-200">
                        <div className="flex items-start gap-2">
                            <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                                <span className="text-[10px] font-bold text-gray-600">Q</span>
                            </div>
                            <p className="text-sm text-gray-700 flex-1">{data.query}</p>
                        </div>
                    </div>
                )}

                {/* Response Section */}
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100">
                    <div className="flex items-start gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                            <Sparkles size={12} className="text-white" />
                        </div>
                        <div className={`flex-1 ${isExpanded ? '' : 'max-h-[100px] overflow-hidden relative'}`}>
                            <div className="prose-clean text-sm">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {data.response || 'AI response will appear here...'}
                                </ReactMarkdown>
                            </div>
                            {!isExpanded && (
                                <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-purple-50 to-transparent" />
                            )}
                        </div>
                    </div>
                </div>

                {/* Sources Section */}
                {data.sources && data.sources.length > 0 && (
                    <div>
                        <button
                            onClick={() => setShowSources(!showSources)}
                            className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800"
                        >
                            <BookOpen size={12} />
                            {showSources ? 'Hide' : 'Show'} {data.sources.length} source{data.sources.length > 1 ? 's' : ''}
                        </button>

                        {showSources && (
                            <div className="mt-2 space-y-1">
                                {data.sources.map((source, idx) => (
                                    <div key={idx} className="flex items-center gap-2 p-1.5 rounded bg-gray-50 text-xs">
                                        <FileText size={10} className="text-gray-400" />
                                        <span className="text-gray-600 truncate flex-1">{source.name || source}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </NodeWrapper>
    );
});

AIResponseNode.displayName = 'AIResponseNode';

// =============================================================================
// 3. IMAGE ELEMENT - UPLOADED OR URL IMAGES
// =============================================================================

const ImageNode = memo(({ id, data, selected }) => {
    const [isEditing, setIsEditing] = useState(!data.src);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState(data.src || '');
    const [caption, setCaption] = useState(data.caption || '');
    const [showZoom, setShowZoom] = useState(false);
    const fileInputRef = useRef(null);

    const handleImageLoad = useCallback(() => {
        setLoading(false);
        setError(false);
    }, []);

    const handleImageError = useCallback(() => {
        setLoading(false);
        setError(true);
    }, []);

    const handleUrlSubmit = useCallback(() => {
        if (imageUrl.trim()) {
            setLoading(true);
            setIsEditing(false);
            data.onUpdate?.(id, { src: imageUrl, caption });
        }
    }, [id, imageUrl, caption, data]);

    const handleFileUpload = useCallback((e) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const dataUrl = event.target.result;
                setImageUrl(dataUrl);
                setLoading(true);
                setIsEditing(false);
                data.onUpdate?.(id, { src: dataUrl, caption, fileName: file.name });
            };
            reader.readAsDataURL(file);
        }
    }, [id, caption, data]);

    const actions = data.src && (
        <>
            <button
                onClick={() => setShowZoom(true)}
                className="p-1 rounded hover:bg-white/50 text-gray-400"
                title="Zoom"
            >
                <ZoomIn size={12} />
            </button>
            <button
                onClick={() => setIsEditing(true)}
                className="p-1 rounded hover:bg-white/50 text-gray-400"
                title="Edit"
            >
                <Edit3 size={12} />
            </button>
        </>
    );

    return (
        <NodeWrapper
            selected={selected}
            color="pink"
            title={data.title || 'Image'}
            icon={ImageIcon}
            onDelete={() => data.onDelete?.(id)}
            actions={actions}
            minWidth={260}
            minHeight={180}
        >
            {isEditing ? (
                <div className="space-y-3">
                    {/* URL Input */}
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Image URL</label>
                        <input
                            type="url"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            placeholder="https://example.com/image.jpg"
                            className="w-full px-2 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200"
                        />
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-2">
                        <div className="flex-1 h-px bg-gray-200" />
                        <span className="text-xs text-gray-400">or</span>
                        <div className="flex-1 h-px bg-gray-200" />
                    </div>

                    {/* File Upload */}
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl hover:border-pink-300 hover:bg-pink-50/50 transition-colors"
                    >
                        <Upload size={20} className="mx-auto text-gray-400 mb-1" />
                        <span className="text-xs text-gray-500 block">Upload from device</span>
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                    />

                    {/* Caption */}
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Caption (optional)</label>
                        <input
                            type="text"
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                            placeholder="Describe this image..."
                            className="w-full px-2 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                        <button
                            onClick={handleUrlSubmit}
                            disabled={!imageUrl.trim()}
                            className="flex-1 py-1.5 text-xs font-medium text-white bg-pink-500 rounded-lg hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Add Image
                        </button>
                        {data.src && (
                            <button
                                onClick={() => setIsEditing(false)}
                                className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </div>
            ) : (
                <div>
                    {loading && (
                        <div className="w-full h-[150px] rounded-lg bg-gray-100 animate-pulse flex items-center justify-center">
                            <RefreshCw size={24} className="text-gray-400 animate-spin" />
                        </div>
                    )}

                    {error && (
                        <div className="w-full h-[150px] rounded-lg bg-red-50 border border-red-200 flex flex-col items-center justify-center">
                            <ImageIcon size={32} className="text-red-300 mb-2" />
                            <p className="text-xs text-red-500">Failed to load image</p>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="mt-2 text-xs text-red-600 hover:underline"
                            >
                                Try another URL
                            </button>
                        </div>
                    )}

                    {data.src && !error && (
                        <img
                            src={data.src}
                            alt={data.alt || caption || 'Canvas image'}
                            onLoad={handleImageLoad}
                            onError={handleImageError}
                            className={`w-full h-auto rounded-lg object-cover max-h-[300px] cursor-pointer ${loading ? 'hidden' : ''}`}
                            onClick={() => setShowZoom(true)}
                        />
                    )}

                    {!data.src && !loading && !error && (
                        <div
                            className="w-full h-[150px] rounded-lg bg-gray-100 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
                            onClick={() => setIsEditing(true)}
                        >
                            <ImageIcon size={32} className="text-gray-300 mb-2" />
                            <p className="text-xs text-gray-400">Click to add image</p>
                        </div>
                    )}

                    {caption && !loading && !error && (
                        <p className="mt-2 text-xs text-gray-500 text-center italic">{caption}</p>
                    )}
                </div>
            )}

            {/* Zoom Modal */}
            {showZoom && data.src && (
                <div
                    className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-8"
                    onClick={() => setShowZoom(false)}
                >
                    <button
                        onClick={() => setShowZoom(false)}
                        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20"
                    >
                        <X size={24} />
                    </button>
                    <img
                        src={data.src}
                        alt={data.alt || caption || 'Zoomed image'}
                        className="max-w-full max-h-full object-contain rounded-lg"
                    />
                </div>
            )}
        </NodeWrapper>
    );
});

ImageNode.displayName = 'ImageNode';

// =============================================================================
// 4. CODE SNIPPET - SYNTAX HIGHLIGHTED CODE BLOCK
// =============================================================================

const LANGUAGE_OPTIONS = [
    { value: 'javascript', label: 'JavaScript', icon: '🟨' },
    { value: 'typescript', label: 'TypeScript', icon: '🔷' },
    { value: 'python', label: 'Python', icon: '🐍' },
    { value: 'html', label: 'HTML', icon: '🔶' },
    { value: 'css', label: 'CSS', icon: '🎨' },
    { value: 'json', label: 'JSON', icon: '📋' },
    { value: 'sql', label: 'SQL', icon: '🗃️' },
    { value: 'bash', label: 'Bash', icon: '💻' },
    { value: 'java', label: 'Java', icon: '☕' },
    { value: 'csharp', label: 'C#', icon: '🔵' },
    { value: 'cpp', label: 'C++', icon: '⚡' },
    { value: 'go', label: 'Go', icon: '🐹' },
    { value: 'rust', label: 'Rust', icon: '🦀' },
    { value: 'php', label: 'PHP', icon: '🐘' },
    { value: 'ruby', label: 'Ruby', icon: '💎' },
    { value: 'markdown', label: 'Markdown', icon: '📝' }
];

const CodeNode = memo(({ id, data, selected }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [code, setCode] = useState(data.code || '// Your code here');
    const [language, setLanguage] = useState(data.language || 'javascript');
    const [filename, setFilename] = useState(data.filename || '');
    const { copied, copy } = useCopyToClipboard();
    const textareaRef = useRef(null);

    const lineCount = code.split('\n').length;
    const currentLang = LANGUAGE_OPTIONS.find(l => l.value === language) || LANGUAGE_OPTIONS[0];

    const handleSave = useCallback(() => {
        setIsEditing(false);
        data.onUpdate?.(id, { code, language, filename });
    }, [id, code, language, filename, data]);

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = e.target.selectionStart;
            const end = e.target.selectionEnd;
            const newCode = code.substring(0, start) + '  ' + code.substring(end);
            setCode(newCode);
            setTimeout(() => {
                e.target.selectionStart = e.target.selectionEnd = start + 2;
            }, 0);
        } else if (e.key === 'Escape') {
            setIsEditing(false);
        } else if (e.key === 'Enter' && e.ctrlKey) {
            handleSave();
        }
    }, [code, handleSave]);

    const actions = (
        <button
            onClick={() => copy(code)}
            className="p-1 rounded hover:bg-white/50 text-gray-400 transition-colors"
            title="Copy code"
        >
            {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
        </button>
    );

    const header = (
        <div className="flex items-center gap-2">
            <select
                value={language}
                onChange={(e) => {
                    setLanguage(e.target.value);
                    data.onUpdate?.(id, { language: e.target.value });
                }}
                className="text-xs px-2 py-1 rounded border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-amber-200"
            >
                {LANGUAGE_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                        {option.icon} {option.label}
                    </option>
                ))}
            </select>
            <input
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                onBlur={() => data.onUpdate?.(id, { filename })}
                placeholder="filename.js"
                className="flex-1 text-xs px-2 py-1 rounded border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-amber-200"
            />
        </div>
    );

    const footer = (
        <div className="flex items-center justify-between text-[10px] text-gray-400">
            <span>{lineCount} line{lineCount !== 1 ? 's' : ''}</span>
            <span>{code.length} characters</span>
        </div>
    );

    return (
        <NodeWrapper
            selected={selected}
            color="amber"
            title={filename || `Code (${currentLang.label})`}
            icon={Code}
            onDelete={() => data.onDelete?.(id)}
            actions={actions}
            header={header}
            footer={footer}
            minWidth={320}
        >
            {isEditing ? (
                <div className="space-y-1">
                    <textarea
                        ref={textareaRef}
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        onBlur={handleSave}
                        onKeyDown={handleKeyDown}
                        spellCheck={false}
                        className="w-full min-h-[150px] p-3 text-xs font-mono leading-relaxed bg-gray-900 text-emerald-400 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-amber-200"
                        placeholder="Enter your code..."
                        autoFocus
                    />
                    <p className="text-[10px] text-gray-400">Tab for indent • Ctrl+Enter to save</p>
                </div>
            ) : (
                <div
                    onDoubleClick={() => setIsEditing(true)}
                    className="relative cursor-text group"
                >
                    {/* Line Numbers */}
                    <div className="absolute left-0 top-0 p-3 text-xs font-mono text-gray-500 select-none">
                        {code.split('\n').map((_, i) => (
                            <div key={i} className="leading-relaxed">{i + 1}</div>
                        ))}
                    </div>

                    {/* Code Content */}
                    <pre className="min-h-[150px] p-3 pl-10 text-xs font-mono leading-relaxed bg-gradient-to-br from-gray-900 to-gray-800 text-emerald-400 rounded-lg overflow-auto">
                        <code className={`language-${language}`}>
                            {code}
                        </code>
                    </pre>

                    {/* Edit Overlay (on hover) */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <span className="px-2 py-1 text-xs bg-white/90 rounded text-gray-600 shadow">
                            Double-click to edit
                        </span>
                    </div>
                </div>
            )}
        </NodeWrapper>
    );
});

CodeNode.displayName = 'CodeNode';

// =============================================================================
// 5. DOCUMENT REFERENCE - LINK TO LIBRARY ITEM
// =============================================================================

const DOCUMENT_ICONS = {
    pdf: FileText,
    doc: File,
    docx: File,
    txt: FileText,
    md: FileText,
    csv: FileSpreadsheet,
    xlsx: FileSpreadsheet,
    xls: FileSpreadsheet,
    json: FileCode,
    js: FileCode,
    ts: FileCode,
    py: FileCode,
    html: FileCode,
    css: FileCode,
    png: FileImage,
    jpg: FileImage,
    jpeg: FileImage,
    gif: FileImage,
    webp: FileImage,
    svg: FileImage,
    mp4: FileVideo,
    webm: FileVideo,
    mp3: FileAudio,
    wav: FileAudio
};

const getDocumentIcon = (type) => {
    return DOCUMENT_ICONS[type?.toLowerCase()] || File;
};

const DOCUMENT_COLORS = {
    pdf: 'red',
    doc: 'blue',
    docx: 'blue',
    txt: 'gray',
    md: 'gray',
    csv: 'emerald',
    xlsx: 'emerald',
    xls: 'emerald',
    json: 'amber',
    js: 'amber',
    ts: 'blue',
    py: 'blue',
    html: 'orange',
    css: 'purple',
    png: 'pink',
    jpg: 'pink',
    jpeg: 'pink',
    gif: 'pink',
    webp: 'pink',
    svg: 'pink',
    mp4: 'red',
    webm: 'red',
    mp3: 'purple',
    wav: 'purple'
};

const COLOR_CLASSES = {
    red: 'bg-red-100 text-red-600 border-red-200',
    blue: 'bg-blue-100 text-blue-600 border-blue-200',
    gray: 'bg-gray-100 text-gray-600 border-gray-200',
    emerald: 'bg-emerald-100 text-emerald-600 border-emerald-200',
    amber: 'bg-amber-100 text-amber-600 border-amber-200',
    orange: 'bg-orange-100 text-orange-600 border-orange-200',
    purple: 'bg-purple-100 text-purple-600 border-purple-200',
    pink: 'bg-pink-100 text-pink-600 border-pink-200'
};

const getDocumentColor = (type) => {
    return COLOR_CLASSES[DOCUMENT_COLORS[type?.toLowerCase()]] || COLOR_CLASSES.gray;
};

const DocumentNode = memo(({ id, data, selected }) => {
    const [showPreview, setShowPreview] = useState(false);
    const { copied, copy } = useCopyToClipboard();

    const DocIcon = getDocumentIcon(data.type);
    const colorClass = getDocumentColor(data.type);

    const footer = (
        <div className="flex items-center gap-2">
            <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex-1 py-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
            >
                {showPreview ? 'Hide Preview' : 'Show Preview'}
            </button>
            <button
                onClick={() => data.onOpen?.(data)}
                className="px-3 py-1.5 text-xs font-medium text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-colors"
            >
                Open
            </button>
        </div>
    );

    const actions = (
        <>
            <button
                onClick={() => copy(data.preview || data.content || data.name)}
                className="p-1 rounded hover:bg-white/50 text-gray-400"
                title="Copy content"
            >
                {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
            </button>
            {data.url && (
                <a
                    href={data.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 rounded hover:bg-white/50 text-gray-400"
                    title="Open original"
                >
                    <ExternalLink size={12} />
                </a>
            )}
        </>
    );

    return (
        <NodeWrapper
            selected={selected}
            color="emerald"
            title={data.name || 'Document'}
            icon={DocIcon}
            onDelete={() => data.onDelete?.(id)}
            footer={footer}
            actions={actions}
            minWidth={280}
        >
            <div className="space-y-3">
                {/* Document Icon & Info */}
                <div className={`flex items-center gap-3 p-3 rounded-xl border ${colorClass}`}>
                    <div className="p-2 rounded-lg bg-white/50">
                        <DocIcon size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{data.name}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span className="uppercase font-medium">{data.type}</span>
                            {data.size && (
                                <>
                                    <span>•</span>
                                    <span>{data.size}</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tags */}
                {data.tags && data.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {data.tags.slice(0, 3).map((tag, idx) => (
                            <span key={idx} className="px-2 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-600 rounded-full">
                                #{tag}
                            </span>
                        ))}
                        {data.tags.length > 3 && (
                            <span className="px-2 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-500 rounded-full">
                                +{data.tags.length - 3}
                            </span>
                        )}
                    </div>
                )}

                {/* Preview Content */}
                {showPreview && data.preview && (
                    <div className="p-3 rounded-lg bg-gray-50 border border-gray-100 max-h-[150px] overflow-auto">
                        <p className="text-xs text-gray-600 whitespace-pre-wrap">
                            {truncateText(data.preview, 500)}
                        </p>
                    </div>
                )}

                {/* Metadata */}
                {(data.pageCount || data.wordCount || data.uploadDate) && (
                    <div className="flex items-center gap-3 text-[10px] text-gray-400">
                        {data.pageCount && (
                            <span className="flex items-center gap-1">
                                <Layers size={10} />
                                {data.pageCount} pages
                            </span>
                        )}
                        {data.wordCount && (
                            <span className="flex items-center gap-1">
                                <Hash size={10} />
                                {data.wordCount.toLocaleString()} words
                            </span>
                        )}
                        {data.uploadDate && (
                            <span className="flex items-center gap-1">
                                <Clock size={10} />
                                {formatDate(data.uploadDate)}
                            </span>
                        )}
                    </div>
                )}
            </div>
        </NodeWrapper>
    );
});

DocumentNode.displayName = 'DocumentNode';

// =============================================================================
// 6. STICKY NOTE - QUICK NOTES
// =============================================================================

const STICKY_COLORS = {
    yellow: { bg: 'bg-yellow-100', border: 'border-yellow-300', text: 'text-yellow-900' },
    pink: { bg: 'bg-pink-100', border: 'border-pink-300', text: 'text-pink-900' },
    green: { bg: 'bg-green-100', border: 'border-green-300', text: 'text-green-900' },
    blue: { bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-900' },
    purple: { bg: 'bg-purple-100', border: 'border-purple-300', text: 'text-purple-900' },
    orange: { bg: 'bg-orange-100', border: 'border-orange-300', text: 'text-orange-900' }
};

const StickyNode = memo(({ id, data, selected }) => {
    const [content, setContent] = useState(data.content || '');
    const [showColorPicker, setShowColorPicker] = useState(false);
    const color = data.color || 'yellow';
    const colors = STICKY_COLORS[color] || STICKY_COLORS.yellow;

    const handleColorChange = useCallback((newColor) => {
        data.onUpdate?.(id, { color: newColor });
        setShowColorPicker(false);
    }, [id, data]);

    return (
        <div className={`
            relative min-w-[180px] min-h-[180px] rounded-lg border-2 shadow-lg
            ${colors.bg} ${colors.border} ${selected ? 'ring-2 ring-gray-400' : ''}
            transition-all duration-200
        `}>
            <NodeResizer minWidth={150} minHeight={150} isVisible={selected} />

            {/* Handles */}
            <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-gray-400" />
            <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-gray-400" />
            <Handle type="target" position={Position.Left} id="left" className="!w-2 !h-2 !bg-gray-400" />
            <Handle type="source" position={Position.Right} id="right" className="!w-2 !h-2 !bg-gray-400" />

            {/* Header */}
            <div className="flex items-center justify-between px-3 py-1.5">
                <button
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    className="p-1 rounded hover:bg-black/5 text-gray-500"
                    title="Change color"
                >
                    <Palette size={12} />
                </button>
                <button
                    onClick={() => data.onDelete?.(id)}
                    className="p-1 rounded hover:bg-black/10 text-gray-500 hover:text-red-500"
                >
                    <X size={12} />
                </button>
            </div>

            {/* Color Picker */}
            {showColorPicker && (
                <div className="absolute top-8 left-3 z-10 flex gap-1 p-2 bg-white rounded-lg shadow-lg border">
                    {Object.keys(STICKY_COLORS).map((colorName) => (
                        <button
                            key={colorName}
                            onClick={() => handleColorChange(colorName)}
                            className={`w-6 h-6 rounded-full ${STICKY_COLORS[colorName].bg} border-2 ${color === colorName ? 'ring-2 ring-gray-400' : ''
                                } hover:scale-110 transition-transform`}
                        />
                    ))}
                </div>
            )}

            {/* Content */}
            <div className="px-3 pb-3 h-full">
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onBlur={() => data.onUpdate?.(id, { content })}
                    placeholder="Write a quick note..."
                    className={`w-full h-full min-h-[130px] bg-transparent text-sm resize-none focus:outline-none ${colors.text}`}
                />
            </div>

            {/* Word count footer */}
            {content && (
                <div className="absolute bottom-2 right-3 text-[10px] text-gray-400">
                    {content.split(/\s+/).filter(Boolean).length}w
                </div>
            )}
        </div>
    );
});

StickyNode.displayName = 'StickyNode';

// =============================================================================
// 7. CUSTOM EDGE - CONNECTION LINES
// =============================================================================

const CustomEdge = ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
    data
}) => {
    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    return (
        <>
            <BaseEdge
                id={id}
                path={edgePath}
                markerEnd={markerEnd}
                style={{
                    ...style,
                    stroke: data?.color || '#94a3b8',
                    strokeWidth: data?.strokeWidth || 2,
                }}
            />
            {data?.label && (
                <EdgeLabelRenderer>
                    <div
                        style={{
                            position: 'absolute',
                            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
                            pointerEvents: 'all',
                        }}
                        className="px-2 py-1 text-xs bg-white border rounded-full shadow-sm text-gray-600"
                    >
                        {data.label}
                    </div>
                </EdgeLabelRenderer>
            )}
        </>
    );
};

// =============================================================================
// EXPORTS
// =============================================================================

export {
    TextNode,
    CodeNode,
    AIResponseNode,
    ImageNode,
    DocumentNode,
    StickyNode,
    CustomEdge
};
