/**
 * Library Component - Professional Knowledge Base UI
 * ===================================================
 * 
 * Features:
 * - Grid/List view toggle
 * - Real-time search with highlighting
 * - Filter by type and tags
 * - Document preview modal
 * - Delete/Rename operations
 * - Drag to canvas support
 * - Bulk operations
 * - Statistics dashboard
 * 
 * @version 2.0.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Search, Grid, List, Filter, Plus, Trash2, Star,
    Download, RefreshCw, X, SortAsc, SortDesc, Clock,
    Tag, Database, FolderOpen, AlertCircle, Loader2, BookOpen
} from 'lucide-react';
import LibraryService, { DocumentType, subscribe } from '../../services/Library';
import LibraryItem, { TYPE_CONFIG } from './LibraryItem';
import DocumentPreview from './DocumentPreview';

// =============================================================================
// CONFIGURATION
// =============================================================================

const VIEW_MODES = { GRID: 'grid', LIST: 'list' };

const TYPE_FILTERS = [
    { value: null, label: 'All Types' },
    { value: DocumentType.PDF, label: 'PDF' },
    { value: DocumentType.DOCX, label: 'Documents' },
    { value: DocumentType.SPREADSHEET, label: 'Spreadsheets' },
    { value: DocumentType.IMAGE, label: 'Images' },
    { value: DocumentType.URL, label: 'URLs' },
    { value: DocumentType.CODE, label: 'Code' }
];

const SORT_OPTIONS = [
    { value: 'metadata.uploadDate', label: 'Date Added' },
    { value: 'name', label: 'Name' },
    { value: 'metadata.fileSize', label: 'Size' },
    { value: 'analytics.viewCount', label: 'Most Viewed' }
];

// =============================================================================
// STATS CARD
// =============================================================================

const StatsCard = ({ icon: Icon, label, value, color }) => (
    <div className={`p-4 rounded-2xl bg-gradient-to-br ${color} border`}>
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/60 flex items-center justify-center shadow-sm">
                <Icon size={20} className="text-gray-700" />
            </div>
            <div>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-xs text-gray-600">{label}</p>
            </div>
        </div>
    </div>
);

// =============================================================================
// EMPTY STATE
// =============================================================================

const EmptyState = ({ searchQuery, onUpload }) => (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mb-6 shadow-lg">
            <FolderOpen size={48} className="text-indigo-400" />
        </div>
        {searchQuery ? (
            <>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-500 max-w-md">
                    No documents match "<span className="font-semibold">{searchQuery}</span>". Try adjusting your search.
                </p>
            </>
        ) : (
            <>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Your library is empty</h3>
                <p className="text-gray-500 max-w-md mb-6">
                    Start building your knowledge base by uploading documents.
                </p>
                <button onClick={onUpload} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-500 text-white font-medium hover:bg-indigo-600 shadow-lg shadow-indigo-200">
                    <Plus size={20} />
                    Add Your First Document
                </button>
            </>
        )}
    </div>
);

// =============================================================================
// CONFIRM DELETE DIALOG
// =============================================================================

const ConfirmDialog = ({ isOpen, count, onConfirm, onCancel, isLoading }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                        <AlertCircle size={24} className="text-red-500" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Delete {count} Document{count > 1 ? 's' : ''}?</h3>
                        <p className="text-sm text-gray-500">This action cannot be undone.</p>
                    </div>
                </div>
                <div className="flex justify-end gap-3">
                    <button onClick={onCancel} disabled={isLoading} className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 font-medium disabled:opacity-50">
                        Cancel
                    </button>
                    <button onClick={onConfirm} disabled={isLoading} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 disabled:opacity-50">
                        {isLoading && <Loader2 size={16} className="animate-spin" />}
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

// =============================================================================
// MAIN LIBRARY COMPONENT
// =============================================================================

const Library = ({ isOpen, onClose, onAddToChat, onUploadClick }) => {
    // Data state
    const [documents, setDocuments] = useState([]);
    const [tags, setTags] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // View state
    const [viewMode, setViewMode] = useState(VIEW_MODES.GRID);
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState(null);
    const [tagFilter, setTagFilter] = useState(null);
    const [sortBy, setSortBy] = useState('metadata.uploadDate');
    const [sortOrder, setSortOrder] = useState('desc');
    const [showFilters, setShowFilters] = useState(false);

    // Selection state
    const [selectedIds, setSelectedIds] = useState(new Set());

    // Modals
    const [previewDoc, setPreviewDoc] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, ids: [] });
    const [deleting, setDeleting] = useState(false);

    // ==========================================================================
    // DATA LOADING
    // ==========================================================================

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const [docs, allTags, libStats] = await Promise.all([
                searchQuery
                    ? LibraryService.searchDocuments(searchQuery, { type: typeFilter })
                    : LibraryService.getAllDocuments({ type: typeFilter, tags: tagFilter ? [tagFilter] : undefined, sortBy, sortOrder }),
                LibraryService.getAllTags(),
                LibraryService.getLibraryStats()
            ]);

            setDocuments(docs);
            setTags(allTags);
            setStats(libStats);
        } catch (err) {
            setError('Failed to load library');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [searchQuery, typeFilter, tagFilter, sortBy, sortOrder]);

    useEffect(() => {
        if (isOpen) loadData();
    }, [isOpen, loadData]);

    useEffect(() => {
        const unsubs = [
            subscribe('document:added', loadData),
            subscribe('document:updated', loadData),
            subscribe('document:deleted', loadData),
            subscribe('documents:bulkDeleted', loadData)
        ];
        return () => unsubs.forEach(u => u());
    }, [loadData]);

    // ==========================================================================
    // HANDLERS
    // ==========================================================================

    const handleSelect = useCallback((id) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    }, []);

    const handleSelectAll = useCallback(() => {
        setSelectedIds(prev => prev.size === documents.length ? new Set() : new Set(documents.map(d => d.id)));
    }, [documents]);

    const handleToggleFavorite = useCallback(async (id) => {
        const doc = documents.find(d => d.id === id);
        if (doc) {
            await LibraryService.updateDocument(id, { metadata: { isFavorite: !doc.metadata?.isFavorite } });
        }
    }, [documents]);

    const handleRename = useCallback(async (id, newName) => {
        await LibraryService.updateDocument(id, { name: newName });
    }, []);

    const handleDelete = useCallback(async () => {
        try {
            setDeleting(true);
            await LibraryService.bulkDeleteDocuments(deleteConfirm.ids);
            setSelectedIds(new Set());
            setDeleteConfirm({ open: false, ids: [] });
        } catch (err) {
            console.error('Delete failed:', err);
        } finally {
            setDeleting(false);
        }
    }, [deleteConfirm.ids]);

    const handleExport = useCallback(async () => {
        await LibraryService.downloadLibraryExport();
    }, []);

    // ==========================================================================
    // RENDER
    // ==========================================================================

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-40 flex">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

            {/* Panel */}
            <div className="relative ml-auto w-full max-w-5xl bg-white shadow-2xl flex flex-col animate-slide-in-right">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                            <BookOpen size={24} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Knowledge Library</h2>
                            <p className="text-sm text-gray-500">{stats?.totalDocuments || 0} documents • {stats?.totalSizeFormatted || '0 B'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={handleExport} className="p-2.5 rounded-xl hover:bg-white/60 text-gray-500" title="Export">
                            <Download size={20} />
                        </button>
                        <button onClick={loadData} className="p-2.5 rounded-xl hover:bg-white/60 text-gray-500" title="Refresh">
                            <RefreshCw size={20} />
                        </button>
                        <button onClick={onClose} className="p-2.5 rounded-xl hover:bg-white/60 text-gray-500">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Stats */}
                {stats && !searchQuery && documents.length > 0 && (
                    <div className="grid grid-cols-4 gap-3 p-4 border-b bg-gray-50/50">
                        <StatsCard icon={Database} label="Documents" value={stats.totalDocuments} color="from-indigo-50 to-blue-50 border-indigo-100" />
                        <StatsCard icon={Star} label="Favorites" value={stats.favorites} color="from-amber-50 to-orange-50 border-amber-100" />
                        <StatsCard icon={Tag} label="Tags" value={stats.totalTags} color="from-emerald-50 to-teal-50 border-emerald-100" />
                        <StatsCard icon={Clock} label="This Week" value={stats.recentlyAdded} color="from-pink-50 to-rose-50 border-pink-100" />
                    </div>
                )}

                {/* Toolbar */}
                <div className="p-4 border-b space-y-3">
                    <div className="flex items-center gap-3">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search documents, tags, content..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
                            />
                        </div>

                        {/* Filter toggle */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`p-3 rounded-xl border transition-colors ${showFilters ? 'border-indigo-500 bg-indigo-50 text-indigo-600' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                        >
                            <Filter size={18} />
                        </button>

                        {/* View toggle */}
                        <div className="flex border border-gray-200 rounded-xl p-1">
                            <button onClick={() => setViewMode(VIEW_MODES.GRID)} className={`p-2 rounded-lg ${viewMode === VIEW_MODES.GRID ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400'}`}>
                                <Grid size={18} />
                            </button>
                            <button onClick={() => setViewMode(VIEW_MODES.LIST)} className={`p-2 rounded-lg ${viewMode === VIEW_MODES.LIST ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400'}`}>
                                <List size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Filters */}
                    {showFilters && (
                        <div className="flex flex-wrap items-center gap-3 pt-2">
                            <select value={typeFilter || ''} onChange={(e) => setTypeFilter(e.target.value || null)} className="px-3 py-2 rounded-xl border border-gray-200 text-sm">
                                {TYPE_FILTERS.map(f => <option key={f.label} value={f.value || ''}>{f.label}</option>)}
                            </select>
                            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-3 py-2 rounded-xl border border-gray-200 text-sm">
                                {SORT_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                            </select>
                            <button onClick={() => setSortOrder(o => o === 'asc' ? 'desc' : 'asc')} className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50">
                                {sortOrder === 'asc' ? <SortAsc size={18} /> : <SortDesc size={18} />}
                            </button>
                            {tags.length > 0 && (
                                <select value={tagFilter || ''} onChange={(e) => setTagFilter(e.target.value || null)} className="px-3 py-2 rounded-xl border border-gray-200 text-sm">
                                    <option value="">All Tags</option>
                                    {tags.map(t => <option key={t.id} value={t.name}>{t.name} ({t.documentCount})</option>)}
                                </select>
                            )}
                        </div>
                    )}

                    {/* Bulk actions */}
                    {selectedIds.size > 0 && (
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-indigo-50 border border-indigo-200">
                            <span className="text-sm font-medium text-indigo-700">{selectedIds.size} selected</span>
                            <div className="flex-1" />
                            <button onClick={() => setSelectedIds(new Set())} className="px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-white">Clear</button>
                            <button onClick={() => setDeleteConfirm({ open: true, ids: Array.from(selectedIds) })} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-red-600 bg-white hover:bg-red-50 border border-red-200">
                                <Trash2 size={14} /> Delete
                            </button>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-4">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <Loader2 size={32} className="animate-spin text-indigo-500" />
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center h-64 text-red-500">
                            <AlertCircle size={48} className="mb-4" />
                            <p>{error}</p>
                            <button onClick={loadData} className="mt-4 px-4 py-2 rounded-xl bg-red-100 text-red-600 font-medium">Retry</button>
                        </div>
                    ) : documents.length === 0 ? (
                        <EmptyState searchQuery={searchQuery} onUpload={onUploadClick} />
                    ) : (
                        <div className={viewMode === VIEW_MODES.GRID ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' : 'space-y-2'}>
                            {documents.map(doc => (
                                <LibraryItem
                                    key={doc.id}
                                    document={doc}
                                    viewMode={viewMode}
                                    isSelected={selectedIds.has(doc.id)}
                                    onSelect={handleSelect}
                                    onOpen={setPreviewDoc}
                                    onDelete={(id) => setDeleteConfirm({ open: true, ids: [id] })}
                                    onRename={handleRename}
                                    onToggleFavorite={handleToggleFavorite}
                                    isDraggable={true}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t bg-gray-50 flex items-center justify-between">
                    <button onClick={handleSelectAll} className="text-sm text-gray-500 hover:text-gray-700">
                        {selectedIds.size === documents.length ? 'Deselect All' : 'Select All'}
                    </button>
                    <button onClick={onUploadClick} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500 text-white font-medium hover:bg-indigo-600 shadow-lg shadow-indigo-200">
                        <Plus size={18} /> Add Document
                    </button>
                </div>
            </div>

            {/* Modals */}
            {previewDoc && (
                <DocumentPreview document={previewDoc} onClose={() => setPreviewDoc(null)} onAddToChat={onAddToChat} />
            )}

            <ConfirmDialog
                isOpen={deleteConfirm.open}
                count={deleteConfirm.ids.length}
                onConfirm={handleDelete}
                onCancel={() => setDeleteConfirm({ open: false, ids: [] })}
                isLoading={deleting}
            />
        </div>
    );
};

export default Library;
