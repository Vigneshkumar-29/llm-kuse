/**
 * LibraryItem Component
 * =====================
 * Individual document card with drag support, preview, and actions
 */

import React, { useState, useRef } from 'react';
import {
    FileText, Image, FileSpreadsheet, Video, Link2, Code,
    Star, StarOff, Trash2, Edit2, Eye, GripVertical,
    Check, Loader2, MoreHorizontal, X
} from 'lucide-react';
import { DocumentType, DocumentStatus } from '../../services/Library';

// Document type configurations
export const TYPE_CONFIG = {
    [DocumentType.PDF]: { icon: FileText, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200', label: 'PDF' },
    [DocumentType.DOCX]: { icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200', label: 'DOCX' },
    [DocumentType.TEXT]: { icon: FileText, color: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-200', label: 'TXT' },
    [DocumentType.SPREADSHEET]: { icon: FileSpreadsheet, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200', label: 'Excel' },
    [DocumentType.IMAGE]: { icon: Image, color: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-200', label: 'Image' },
    [DocumentType.VIDEO]: { icon: Video, color: 'text-pink-500', bg: 'bg-pink-50', border: 'border-pink-200', label: 'Video' },
    [DocumentType.URL]: { icon: Link2, color: 'text-cyan-500', bg: 'bg-cyan-50', border: 'border-cyan-200', label: 'URL' },
    [DocumentType.CODE]: { icon: Code, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200', label: 'Code' },
    [DocumentType.MARKDOWN]: { icon: FileText, color: 'text-indigo-500', bg: 'bg-indigo-50', border: 'border-indigo-200', label: 'MD' }
};

// Format relative date
export function formatRelativeDate(dateString) {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        if (diffHours === 0) {
            const diffMins = Math.floor(diffMs / (1000 * 60));
            return diffMins <= 1 ? 'Just now' : `${diffMins}m ago`;
        }
        return `${diffHours}h ago`;
    } else if (diffDays === 1) return 'Yesterday';
    else if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Rename Modal
const RenameModal = ({ document, onSave, onClose }) => {
    const [name, setName] = useState(document.name);
    const inputRef = useRef(null);

    React.useEffect(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (name.trim()) {
            onSave(name.trim());
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
            <form
                onSubmit={handleSubmit}
                onClick={e => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-scale-in"
            >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Rename Document</h3>
                <input
                    ref={inputRef}
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 
                             focus:ring-2 focus:ring-indigo-100 outline-none mb-4"
                    placeholder="Document name"
                />
                <div className="flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100">
                        Cancel
                    </button>
                    <button type="submit" className="px-4 py-2 rounded-xl bg-indigo-500 text-white hover:bg-indigo-600">
                        Save
                    </button>
                </div>
            </form>
        </div>
    );
};

// Main LibraryItem Component
const LibraryItem = ({
    document,
    viewMode = 'grid',
    isSelected = false,
    onSelect,
    onOpen,
    onDelete,
    onRename,
    onToggleFavorite,
    onDragStart,
    isDraggable = true
}) => {
    const [showMenu, setShowMenu] = useState(false);
    const [showRename, setShowRename] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const itemRef = useRef(null);

    const config = TYPE_CONFIG[document.type] || TYPE_CONFIG[DocumentType.TEXT];
    const Icon = config.icon;

    // Drag handlers
    const handleDragStart = (e) => {
        if (!isDraggable) return;
        setIsDragging(true);
        e.dataTransfer.setData('application/json', JSON.stringify({
            type: 'library-document',
            document: document
        }));
        e.dataTransfer.effectAllowed = 'copy';
        onDragStart?.(document);
    };

    const handleDragEnd = () => {
        setIsDragging(false);
    };

    const handleRename = (newName) => {
        onRename?.(document.id, newName);
        setShowRename(false);
    };

    // Grid View
    if (viewMode === 'grid') {
        return (
            <>
                <div
                    ref={itemRef}
                    draggable={isDraggable}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onClick={() => onOpen?.(document)}
                    className={`
                        group relative p-4 rounded-2xl border-2 cursor-pointer select-none
                        transition-all duration-200 hover:shadow-lg
                        ${isDragging ? 'opacity-50 scale-95' : 'hover:scale-[1.02]'}
                        ${isSelected ? 'border-indigo-500 bg-indigo-50/50 shadow-md' : `${config.border} ${config.bg} hover:border-indigo-300`}
                    `}
                >
                    {/* Drag handle */}
                    {isDraggable && (
                        <div className="absolute top-2 left-2 p-1 rounded opacity-0 group-hover:opacity-100 
                                      text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing">
                            <GripVertical size={14} />
                        </div>
                    )}

                    {/* Selection checkbox */}
                    <div
                        onClick={(e) => { e.stopPropagation(); onSelect?.(document.id); }}
                        className={`absolute top-3 right-10 w-5 h-5 rounded-md border-2 flex items-center justify-center
                            transition-all ${isSelected ? 'bg-indigo-500 border-indigo-500' : 'border-gray-300 bg-white opacity-0 group-hover:opacity-100'}`}
                    >
                        {isSelected && <Check size={12} className="text-white" />}
                    </div>

                    {/* Favorite button */}
                    <button
                        onClick={(e) => { e.stopPropagation(); onToggleFavorite?.(document.id); }}
                        className={`absolute top-3 right-3 transition-all ${document.metadata?.isFavorite ? 'text-amber-500' : 'text-gray-400 opacity-0 group-hover:opacity-100 hover:text-amber-500'}`}
                    >
                        {document.metadata?.isFavorite ? <Star size={16} fill="currentColor" /> : <StarOff size={16} />}
                    </button>

                    {/* Document icon */}
                    <div className={`w-12 h-12 rounded-xl ${config.bg} flex items-center justify-center mb-3 border ${config.border}`}>
                        <Icon className={config.color} size={24} />
                    </div>

                    {/* Document info */}
                    <h3 className="font-semibold text-gray-900 truncate mb-1" title={document.name}>
                        {document.name}
                    </h3>
                    <p className="text-xs text-gray-500 mb-2">
                        {document.metadata?.fileSizeFormatted || '0 B'} • {formatRelativeDate(document.metadata?.uploadDate)}
                    </p>

                    {/* Tags */}
                    {document.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                            {document.tags.slice(0, 2).map(tag => (
                                <span key={tag} className="px-2 py-0.5 text-xs rounded-full bg-white/80 text-gray-600 border">
                                    {tag}
                                </span>
                            ))}
                            {document.tags.length > 2 && (
                                <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-500">
                                    +{document.tags.length - 2}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Quick actions */}
                    <div className="absolute bottom-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={(e) => { e.stopPropagation(); onOpen?.(document); }}
                            className="p-1.5 rounded-lg bg-white shadow-sm hover:bg-gray-50 text-gray-500"
                            title="Preview"
                        >
                            <Eye size={14} />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); setShowRename(true); }}
                            className="p-1.5 rounded-lg bg-white shadow-sm hover:bg-gray-50 text-gray-500"
                            title="Rename"
                        >
                            <Edit2 size={14} />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete?.(document.id); }}
                            className="p-1.5 rounded-lg bg-white shadow-sm hover:bg-red-50 text-gray-500 hover:text-red-500"
                            title="Delete"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>

                    {/* Processing indicator */}
                    {document.status === DocumentStatus.PROCESSING && (
                        <div className="absolute inset-0 bg-white/80 rounded-2xl flex items-center justify-center">
                            <Loader2 size={24} className="animate-spin text-indigo-500" />
                        </div>
                    )}
                </div>

                {showRename && (
                    <RenameModal document={document} onSave={handleRename} onClose={() => setShowRename(false)} />
                )}
            </>
        );
    }

    // List View
    return (
        <>
            <div
                ref={itemRef}
                draggable={isDraggable}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onClick={() => onOpen?.(document)}
                className={`
                    group flex items-center gap-4 p-3 rounded-xl border-2 cursor-pointer select-none
                    transition-all duration-200 hover:shadow-md
                    ${isDragging ? 'opacity-50' : ''}
                    ${isSelected ? 'border-indigo-500 bg-indigo-50/50' : 'border-gray-100 hover:border-gray-200 bg-white'}
                `}
            >
                {/* Drag handle */}
                {isDraggable && (
                    <div className="text-gray-400 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100">
                        <GripVertical size={16} />
                    </div>
                )}

                {/* Checkbox */}
                <div
                    onClick={(e) => { e.stopPropagation(); onSelect?.(document.id); }}
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0
                        ${isSelected ? 'bg-indigo-500 border-indigo-500' : 'border-gray-300 bg-white'}`}
                >
                    {isSelected && <Check size={12} className="text-white" />}
                </div>

                {/* Icon */}
                <div className={`w-10 h-10 rounded-lg ${config.bg} flex items-center justify-center shrink-0 border ${config.border}`}>
                    <Icon className={config.color} size={20} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900 truncate">{document.name}</h3>
                        {document.metadata?.isFavorite && <Star size={14} className="text-amber-500 shrink-0" fill="currentColor" />}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className={`px-1.5 py-0.5 rounded ${config.bg} ${config.color} font-medium`}>{config.label}</span>
                        <span>{document.metadata?.fileSizeFormatted}</span>
                        <span>•</span>
                        <span>{formatRelativeDate(document.metadata?.uploadDate)}</span>
                    </div>
                </div>

                {/* Tags */}
                <div className="hidden md:flex items-center gap-1">
                    {document.tags?.slice(0, 2).map(tag => (
                        <span key={tag} className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">{tag}</span>
                    ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                    <button onClick={(e) => { e.stopPropagation(); onToggleFavorite?.(document.id); }} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-amber-500">
                        {document.metadata?.isFavorite ? <Star size={16} fill="currentColor" /> : <StarOff size={16} />}
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setShowRename(true); }} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400">
                        <Edit2 size={16} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onDelete?.(document.id); }} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-red-500">
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            {showRename && (
                <RenameModal document={document} onSave={handleRename} onClose={() => setShowRename(false)} />
            )}
        </>
    );
};

export default LibraryItem;
