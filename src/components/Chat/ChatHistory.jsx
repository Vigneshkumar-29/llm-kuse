/**
 * Chat Components - ChatHistory
 * =============================
 * 
 * Chat history sidebar component for managing conversation threads.
 * 
 * @version 1.0.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageSquare, Plus, Search, Trash2, Edit2, Check, X,
    MoreHorizontal, Star, Archive, Clock, ChevronDown
} from 'lucide-react';
import { formatSmartDate } from '../../utils/formatters';

// =============================================================================
// CHAT HISTORY COMPONENT
// =============================================================================

const ChatHistory = ({
    conversations = [],
    activeId = null,
    onSelect,
    onNew,
    onDelete,
    onRename,
    onArchive,
    onStar,
    className = ''
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editTitle, setEditTitle] = useState('');
    const [showArchived, setShowArchived] = useState(false);

    // Filter and group conversations
    const { activeConversations, archivedConversations, filteredConversations } = useMemo(() => {
        const active = conversations.filter(c => !c.archived);
        const archived = conversations.filter(c => c.archived);

        let filtered = showArchived ? archived : active;

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(c =>
                c.title?.toLowerCase().includes(query) ||
                c.lastMessage?.toLowerCase().includes(query)
            );
        }

        return {
            activeConversations: active,
            archivedConversations: archived,
            filteredConversations: filtered
        };
    }, [conversations, searchQuery, showArchived]);

    // Group by date
    const groupedConversations = useMemo(() => {
        const groups = {
            today: [],
            yesterday: [],
            thisWeek: [],
            thisMonth: [],
            older: []
        };

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);

        filteredConversations.forEach(conv => {
            const convDate = new Date(conv.updatedAt || conv.createdAt);

            if (convDate >= today) {
                groups.today.push(conv);
            } else if (convDate >= yesterday) {
                groups.yesterday.push(conv);
            } else if (convDate >= weekAgo) {
                groups.thisWeek.push(conv);
            } else if (convDate >= monthAgo) {
                groups.thisMonth.push(conv);
            } else {
                groups.older.push(conv);
            }
        });

        return groups;
    }, [filteredConversations]);

    // Handle rename
    const startEditing = (conv) => {
        setEditingId(conv.id);
        setEditTitle(conv.title || 'New Chat');
    };

    const saveEdit = () => {
        if (editingId && editTitle.trim()) {
            onRename?.(editingId, editTitle.trim());
        }
        setEditingId(null);
        setEditTitle('');
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditTitle('');
    };

    // Render conversation item
    const renderConversation = (conv) => (
        <motion.div
            key={conv.id}
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className={`
                group relative rounded-lg cursor-pointer
                transition-colors
                ${conv.id === activeId
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-900 dark:text-indigo-100'
                    : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }
            `}
            onClick={() => onSelect?.(conv.id)}
        >
            <div className="flex items-start gap-3 p-3">
                {/* Icon */}
                <div className={`
                    flex-shrink-0 w-8 h-8 rounded-lg
                    flex items-center justify-center
                    ${conv.starred
                        ? 'bg-amber-100 dark:bg-amber-900/30'
                        : 'bg-neutral-100 dark:bg-neutral-800'
                    }
                `}>
                    {conv.starred ? (
                        <Star size={14} className="text-amber-500 fill-amber-500" />
                    ) : (
                        <MessageSquare size={14} className="text-neutral-500" />
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    {editingId === conv.id ? (
                        <div className="flex items-center gap-1">
                            <input
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') saveEdit();
                                    if (e.key === 'Escape') cancelEdit();
                                }}
                                className="flex-1 px-2 py-1 text-sm rounded
                                          bg-white dark:bg-neutral-900
                                          border border-indigo-500
                                          focus:outline-none"
                                autoFocus
                                onClick={(e) => e.stopPropagation()}
                            />
                            <button
                                onClick={(e) => { e.stopPropagation(); saveEdit(); }}
                                className="p-1 rounded hover:bg-green-100 dark:hover:bg-green-900/30"
                            >
                                <Check size={14} className="text-green-600" />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); cancelEdit(); }}
                                className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30"
                            >
                                <X size={14} className="text-red-600" />
                            </button>
                        </div>
                    ) : (
                        <>
                            <h4 className="text-sm font-medium truncate text-neutral-900 dark:text-white">
                                {conv.title || 'New Chat'}
                            </h4>
                            <p className="text-xs text-neutral-500 truncate mt-0.5">
                                {conv.lastMessage || 'No messages yet'}
                            </p>
                            <p className="text-xs text-neutral-400 mt-1">
                                {formatSmartDate(conv.updatedAt || conv.createdAt)}
                            </p>
                        </>
                    )}
                </div>

                {/* Actions */}
                {editingId !== conv.id && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={(e) => { e.stopPropagation(); onStar?.(conv.id); }}
                            className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700"
                            title={conv.starred ? 'Unstar' : 'Star'}
                        >
                            <Star size={14} className={conv.starred ? 'text-amber-500 fill-amber-500' : 'text-neutral-400'} />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); startEditing(conv); }}
                            className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700"
                            title="Rename"
                        >
                            <Edit2 size={14} className="text-neutral-400" />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onArchive?.(conv.id); }}
                            className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700"
                            title={conv.archived ? 'Unarchive' : 'Archive'}
                        >
                            <Archive size={14} className="text-neutral-400" />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete?.(conv.id); }}
                            className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30"
                            title="Delete"
                        >
                            <Trash2 size={14} className="text-red-400" />
                        </button>
                    </div>
                )}
            </div>
        </motion.div>
    );

    // Render group
    const renderGroup = (title, items) => {
        if (items.length === 0) return null;

        return (
            <div className="mb-4">
                <h3 className="px-3 py-2 text-xs font-medium text-neutral-400 uppercase tracking-wider">
                    {title}
                </h3>
                <div className="space-y-1">
                    <AnimatePresence>
                        {items.map(renderConversation)}
                    </AnimatePresence>
                </div>
            </div>
        );
    };

    return (
        <div className={`flex flex-col h-full ${className}`}>
            {/* Header */}
            <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
                <button
                    onClick={onNew}
                    className="w-full flex items-center justify-center gap-2 
                              px-4 py-2.5 rounded-xl
                              bg-indigo-600 hover:bg-indigo-700
                              text-white text-sm font-medium
                              transition-colors"
                >
                    <Plus size={18} />
                    New Chat
                </button>
            </div>

            {/* Search */}
            <div className="p-3 border-b border-neutral-200 dark:border-neutral-800">
                <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search conversations..."
                        className="w-full pl-9 pr-3 py-2 rounded-lg
                                  bg-neutral-100 dark:bg-neutral-800
                                  text-sm text-neutral-900 dark:text-white
                                  placeholder:text-neutral-400
                                  focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                </div>
            </div>

            {/* Toggle Archived */}
            {archivedConversations.length > 0 && (
                <button
                    onClick={() => setShowArchived(!showArchived)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-500 
                              hover:text-neutral-700 dark:hover:text-neutral-300"
                >
                    <Archive size={14} />
                    {showArchived ? 'Show Active' : `Archived (${archivedConversations.length})`}
                    <ChevronDown size={14} className={`ml-auto transition-transform ${showArchived ? 'rotate-180' : ''}`} />
                </button>
            )}

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto p-2">
                {filteredConversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 text-neutral-400">
                        <MessageSquare size={24} className="mb-2 opacity-40" />
                        <p className="text-sm">No conversations found</p>
                    </div>
                ) : (
                    <>
                        {renderGroup('Today', groupedConversations.today)}
                        {renderGroup('Yesterday', groupedConversations.yesterday)}
                        {renderGroup('This Week', groupedConversations.thisWeek)}
                        {renderGroup('This Month', groupedConversations.thisMonth)}
                        {renderGroup('Older', groupedConversations.older)}
                    </>
                )}
            </div>
        </div>
    );
};

export default ChatHistory;
