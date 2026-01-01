/**
 * useLibrary Hook
 * ================
 * 
 * A custom React hook for interacting with the Library service.
 * Provides stateful access to library data with automatic updates.
 * 
 * @version 1.0.0
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import LibraryService, {
    DocumentType,
    DocumentSource,
    DocumentStatus,
    subscribe,
    createDocument
} from '../services/Library';

// =============================================================================
// MAIN HOOK
// =============================================================================

/**
 * Hook for accessing and managing library documents
 * @param {Object} options - Hook options
 * @returns {Object} - Library state and methods
 */
export function useLibrary(options = {}) {
    const {
        autoLoad = true,
        type = null,
        tags = [],
        favoritesOnly = false,
        sortBy = 'metadata.uploadDate',
        sortOrder = 'desc',
        limit = null
    } = options;

    // State
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(autoLoad);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState(null);

    // ==========================================================================
    // DATA LOADING
    // ==========================================================================

    const loadDocuments = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const docs = await LibraryService.getAllDocuments({
                type,
                tags: tags.length > 0 ? tags : undefined,
                favoritesOnly,
                sortBy,
                sortOrder,
                limit
            });

            setDocuments(docs);
        } catch (err) {
            console.error('Failed to load documents:', err);
            setError(err.message || 'Failed to load documents');
        } finally {
            setLoading(false);
        }
    }, [type, tags, favoritesOnly, sortBy, sortOrder, limit]);

    const loadStats = useCallback(async () => {
        try {
            const libStats = await LibraryService.getLibraryStats();
            setStats(libStats);
        } catch (err) {
            console.error('Failed to load stats:', err);
        }
    }, []);

    // Auto-load on mount
    useEffect(() => {
        if (autoLoad) {
            loadDocuments();
            loadStats();
        }
    }, [autoLoad, loadDocuments, loadStats]);

    // Subscribe to library events
    useEffect(() => {
        const unsubscribers = [
            subscribe('document:added', () => { loadDocuments(); loadStats(); }),
            subscribe('document:updated', loadDocuments),
            subscribe('document:deleted', () => { loadDocuments(); loadStats(); }),
            subscribe('documents:bulkAdded', () => { loadDocuments(); loadStats(); }),
            subscribe('documents:bulkDeleted', () => { loadDocuments(); loadStats(); }),
            subscribe('library:cleared', () => { loadDocuments(); loadStats(); }),
            subscribe('library:imported', () => { loadDocuments(); loadStats(); })
        ];

        return () => unsubscribers.forEach(unsub => unsub());
    }, [loadDocuments, loadStats]);

    // ==========================================================================
    // DOCUMENT OPERATIONS
    // ==========================================================================

    const addDocument = useCallback(async (documentData) => {
        try {
            setError(null);
            const doc = await LibraryService.addDocument(documentData);
            return doc;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, []);

    const updateDocument = useCallback(async (id, updates) => {
        try {
            setError(null);
            const doc = await LibraryService.updateDocument(id, updates);
            return doc;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, []);

    const deleteDocument = useCallback(async (id) => {
        try {
            setError(null);
            await LibraryService.deleteDocument(id);
            return true;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, []);

    const toggleFavorite = useCallback(async (id) => {
        const doc = documents.find(d => d.id === id);
        if (doc) {
            return updateDocument(id, {
                metadata: { isFavorite: !doc.metadata.isFavorite }
            });
        }
    }, [documents, updateDocument]);

    // ==========================================================================
    // SEARCH
    // ==========================================================================

    const search = useCallback(async (query, searchOptions = {}) => {
        try {
            setLoading(true);
            setError(null);

            const results = await LibraryService.searchDocuments(query, {
                type,
                ...searchOptions
            });

            setDocuments(results);
            return results;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [type]);

    // ==========================================================================
    // BULK OPERATIONS
    // ==========================================================================

    const bulkDelete = useCallback(async (ids) => {
        try {
            setError(null);
            const count = await LibraryService.bulkDeleteDocuments(ids);
            return count;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, []);

    const bulkUpdateTags = useCallback(async (ids, tagsToAdd, tagsToRemove) => {
        try {
            setError(null);
            const count = await LibraryService.bulkUpdateTags(ids, tagsToAdd, tagsToRemove);
            return count;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, []);

    // ==========================================================================
    // COMPUTED VALUES
    // ==========================================================================

    const documentsByType = useMemo(() => {
        const grouped = {};
        documents.forEach(doc => {
            if (!grouped[doc.type]) {
                grouped[doc.type] = [];
            }
            grouped[doc.type].push(doc);
        });
        return grouped;
    }, [documents]);

    const favoriteDocuments = useMemo(() => {
        return documents.filter(doc => doc.metadata.isFavorite);
    }, [documents]);

    const recentDocuments = useMemo(() => {
        return [...documents]
            .sort((a, b) =>
                new Date(b.metadata.lastAccessed) - new Date(a.metadata.lastAccessed)
            )
            .slice(0, 10);
    }, [documents]);

    // ==========================================================================
    // RETURN
    // ==========================================================================

    return {
        // State
        documents,
        loading,
        error,
        stats,

        // Computed
        documentsByType,
        favoriteDocuments,
        recentDocuments,
        isEmpty: documents.length === 0,
        count: documents.length,

        // Operations
        refresh: loadDocuments,
        refreshStats: loadStats,
        addDocument,
        updateDocument,
        deleteDocument,
        toggleFavorite,
        search,
        bulkDelete,
        bulkUpdateTags,

        // Direct access to service
        service: LibraryService
    };
}

// =============================================================================
// SEARCH HOOK
// =============================================================================

/**
 * Hook for library search functionality
 * @param {string} initialQuery - Initial search query
 * @param {Object} options - Search options
 */
export function useLibrarySearch(initialQuery = '', options = {}) {
    const [query, setQuery] = useState(initialQuery);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const search = useCallback(async (searchQuery) => {
        if (!searchQuery.trim()) {
            setResults([]);
            return [];
        }

        try {
            setLoading(true);
            setError(null);

            const docs = await LibraryService.searchDocuments(searchQuery, options);
            setResults(docs);
            return docs;
        } catch (err) {
            setError(err.message);
            return [];
        } finally {
            setLoading(false);
        }
    }, [options]);

    // Debounced search effect
    useEffect(() => {
        const timer = setTimeout(() => {
            if (query) {
                search(query);
            } else {
                setResults([]);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query, search]);

    return {
        query,
        setQuery,
        results,
        loading,
        error,
        search,
        clearResults: () => setResults([])
    };
}

// =============================================================================
// TAGS HOOK
// =============================================================================

/**
 * Hook for tag management
 */
export function useLibraryTags() {
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadTags = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const allTags = await LibraryService.getAllTags();
            setTags(allTags);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadTags();
    }, [loadTags]);

    // Subscribe to tag events
    useEffect(() => {
        const unsubscribers = [
            subscribe('tag:created', loadTags),
            subscribe('tag:deleted', loadTags),
            subscribe('document:added', loadTags),
            subscribe('document:updated', loadTags),
            subscribe('document:deleted', loadTags)
        ];

        return () => unsubscribers.forEach(unsub => unsub());
    }, [loadTags]);

    const createTag = useCallback(async (tagData) => {
        try {
            const tag = await LibraryService.createTag(tagData);
            return tag;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, []);

    const deleteTag = useCallback(async (tagId) => {
        try {
            await LibraryService.deleteTag(tagId);
            return true;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, []);

    // Most used tags
    const popularTags = useMemo(() => {
        return tags.slice(0, 10);
    }, [tags]);

    return {
        tags,
        popularTags,
        loading,
        error,
        refresh: loadTags,
        createTag,
        deleteTag
    };
}

// =============================================================================
// DOCUMENT HOOK
// =============================================================================

/**
 * Hook for single document access
 * @param {string} documentId - Document ID
 */
export function useDocument(documentId) {
    const [document, setDocument] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadDocument = useCallback(async () => {
        if (!documentId) {
            setDocument(null);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const doc = await LibraryService.getDocument(documentId);
            setDocument(doc);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [documentId]);

    useEffect(() => {
        loadDocument();
    }, [loadDocument]);

    // Subscribe to updates for this document
    useEffect(() => {
        const handleUpdate = (updatedDoc) => {
            if (updatedDoc?.id === documentId) {
                setDocument(updatedDoc);
            }
        };

        const handleDelete = (data) => {
            if (data?.id === documentId) {
                setDocument(null);
            }
        };

        const unsubscribers = [
            subscribe('document:updated', handleUpdate),
            subscribe('document:deleted', handleDelete)
        ];

        return () => unsubscribers.forEach(unsub => unsub());
    }, [documentId]);

    const update = useCallback(async (updates) => {
        if (!documentId) return null;
        try {
            setError(null);
            const updated = await LibraryService.updateDocument(documentId, updates);
            setDocument(updated);
            return updated;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, [documentId]);

    const remove = useCallback(async () => {
        if (!documentId) return false;
        try {
            setError(null);
            await LibraryService.deleteDocument(documentId);
            setDocument(null);
            return true;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, [documentId]);

    return {
        document,
        loading,
        error,
        refresh: loadDocument,
        update,
        remove,
        exists: !!document
    };
}

// =============================================================================
// RECENT DOCUMENTS HOOK
// =============================================================================

/**
 * Hook for accessing recent documents
 * @param {number} limit - Maximum number of documents
 */
export function useRecentDocuments(limit = 10) {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadRecent = useCallback(async () => {
        try {
            setLoading(true);
            const docs = await LibraryService.getRecentDocuments(limit);
            setDocuments(docs);
        } catch (err) {
            console.error('Failed to load recent documents:', err);
        } finally {
            setLoading(false);
        }
    }, [limit]);

    useEffect(() => {
        loadRecent();
    }, [loadRecent]);

    useEffect(() => {
        const unsubscribers = [
            subscribe('document:added', loadRecent),
            subscribe('document:updated', loadRecent),
            subscribe('document:deleted', loadRecent)
        ];

        return () => unsubscribers.forEach(unsub => unsub());
    }, [loadRecent]);

    return { documents, loading, refresh: loadRecent };
}

// =============================================================================
// FAVORITES HOOK
// =============================================================================

/**
 * Hook for accessing favorite documents
 */
export function useFavoriteDocuments() {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadFavorites = useCallback(async () => {
        try {
            setLoading(true);
            const docs = await LibraryService.getFavoriteDocuments();
            setDocuments(docs);
        } catch (err) {
            console.error('Failed to load favorites:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadFavorites();
    }, [loadFavorites]);

    useEffect(() => {
        const unsubscribers = [
            subscribe('document:added', loadFavorites),
            subscribe('document:updated', loadFavorites),
            subscribe('document:deleted', loadFavorites)
        ];

        return () => unsubscribers.forEach(unsub => unsub());
    }, [loadFavorites]);

    return { documents, loading, refresh: loadFavorites };
}

// =============================================================================
// LIBRARY STATS HOOK
// =============================================================================

/**
 * Hook for library statistics
 */
export function useLibraryStats() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadStats = useCallback(async () => {
        try {
            setLoading(true);
            const libStats = await LibraryService.getLibraryStats();
            setStats(libStats);
        } catch (err) {
            console.error('Failed to load stats:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadStats();
    }, [loadStats]);

    useEffect(() => {
        const unsubscribers = [
            subscribe('document:added', loadStats),
            subscribe('document:deleted', loadStats),
            subscribe('documents:bulkAdded', loadStats),
            subscribe('documents:bulkDeleted', loadStats),
            subscribe('library:cleared', loadStats),
            subscribe('library:imported', loadStats)
        ];

        return () => unsubscribers.forEach(unsub => unsub());
    }, [loadStats]);

    return { stats, loading, refresh: loadStats };
}

// =============================================================================
// EXPORTS
// =============================================================================

export default useLibrary;

// Re-export enums for convenience
export { DocumentType, DocumentSource, DocumentStatus, createDocument };
