/**
 * Library Database Service
 * =========================
 * 
 * A professional knowledge base management system using IndexedDB
 * for persistent storage of documents, URLs, videos, and text content.
 * 
 * Features:
 * - IndexedDB persistence (survives browser refresh)
 * - Full CRUD operations
 * - Advanced search and filtering
 * - Tag management system
 * - Import/Export functionality
 * - AI summary integration hooks
 * - Event-driven architecture
 * 
 * @version 1.0.0
 * @author DevSavvy AI Workspace
 */

import { openDB, deleteDB } from 'idb';

// =============================================================================
// CONFIGURATION
// =============================================================================

const DB_NAME = 'devsavvy_library';
const DB_VERSION = 1;
const STORE_NAME = 'documents';
const TAGS_STORE = 'tags';
const SETTINGS_STORE = 'settings';

// Document types enum
export const DocumentType = {
    PDF: 'pdf',
    DOCX: 'docx',
    TEXT: 'text',
    SPREADSHEET: 'spreadsheet',
    IMAGE: 'image',
    URL: 'url',
    VIDEO: 'video',
    CODE: 'code',
    MARKDOWN: 'markdown'
};

// Document source enum
export const DocumentSource = {
    UPLOADED: 'uploaded',
    IMPORTED: 'imported',
    GENERATED: 'generated',
    SCRAPED: 'scraped'
};

// Document status enum
export const DocumentStatus = {
    PROCESSING: 'processing',
    READY: 'ready',
    ERROR: 'error',
    ARCHIVED: 'archived'
};

// =============================================================================
// DATABASE INITIALIZATION
// =============================================================================

/**
 * Initialize and open the IndexedDB database
 * Creates stores and indexes if they don't exist
 */
async function initDB() {
    return openDB(DB_NAME, DB_VERSION, {
        upgrade(db, oldVersion, newVersion, transaction) {
            console.log(`📚 Upgrading Library DB from v${oldVersion} to v${newVersion}`);

            // Documents store
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const docStore = db.createObjectStore(STORE_NAME, {
                    keyPath: 'id'
                });

                // Create indexes for efficient querying
                docStore.createIndex('by_name', 'name');
                docStore.createIndex('by_type', 'type');
                docStore.createIndex('by_status', 'status');
                docStore.createIndex('by_source', 'metadata.source');
                docStore.createIndex('by_date', 'metadata.uploadDate');
                docStore.createIndex('by_favorite', 'metadata.isFavorite');
                docStore.createIndex('by_folder', 'metadata.folderId');
            }

            // Tags store for tag management
            if (!db.objectStoreNames.contains(TAGS_STORE)) {
                const tagStore = db.createObjectStore(TAGS_STORE, {
                    keyPath: 'id'
                });
                tagStore.createIndex('by_name', 'name', { unique: true });
                tagStore.createIndex('by_color', 'color');
            }

            // Settings store for library preferences
            if (!db.objectStoreNames.contains(SETTINGS_STORE)) {
                db.createObjectStore(SETTINGS_STORE, {
                    keyPath: 'key'
                });
            }
        },
        blocked() {
            console.warn('⚠️ Library DB blocked by older version');
        },
        blocking() {
            console.warn('⚠️ Library DB is blocking newer version');
        },
        terminated() {
            console.error('❌ Library DB connection terminated unexpectedly');
        }
    });
}

// Singleton database instance
let dbInstance = null;

/**
 * Get the database instance (singleton pattern)
 */
async function getDB() {
    if (!dbInstance) {
        dbInstance = await initDB();
    }
    return dbInstance;
}

// =============================================================================
// DOCUMENT DATA MODEL
// =============================================================================

/**
 * Create a new document object with proper structure
 * @param {Object} data - Document data
 * @returns {Object} - Properly structured document
 */
export function createDocument(data) {
    const now = new Date().toISOString();

    return {
        // Core identifiers
        id: data.id || generateId(),
        name: data.name || 'Untitled Document',

        // Document type and content
        type: data.type || DocumentType.TEXT,
        content: data.content || '',
        contentPreview: data.contentPreview || truncateContent(data.content, 500),

        // Status tracking
        status: data.status || DocumentStatus.READY,

        // Rich metadata
        metadata: {
            // File information
            fileSize: data.metadata?.fileSize || 0,
            fileSizeFormatted: data.metadata?.fileSizeFormatted || formatFileSize(data.metadata?.fileSize || 0),
            mimeType: data.metadata?.mimeType || 'text/plain',
            pageCount: data.metadata?.pageCount || null,
            wordCount: data.metadata?.wordCount || countWords(data.content),
            characterCount: data.metadata?.characterCount || (data.content?.length || 0),

            // Source tracking
            source: data.metadata?.source || DocumentSource.UPLOADED,
            originalFileName: data.metadata?.originalFileName || data.name,
            sourceUrl: data.metadata?.sourceUrl || null,

            // Timestamps
            uploadDate: data.metadata?.uploadDate || now,
            lastModified: data.metadata?.lastModified || now,
            lastAccessed: data.metadata?.lastAccessed || now,

            // Organization
            folderId: data.metadata?.folderId || null,
            folderPath: data.metadata?.folderPath || '/',
            isFavorite: data.metadata?.isFavorite || false,
            isPinned: data.metadata?.isPinned || false,

            // Processing info
            processingTime: data.metadata?.processingTime || null,
            extractionMethod: data.metadata?.extractionMethod || null,

            // Custom metadata
            custom: data.metadata?.custom || {}
        },

        // Categorization
        tags: data.tags || [],

        // AI-generated content
        summary: data.summary || null,
        keyPoints: data.keyPoints || [],
        entities: data.entities || [],

        // Versioning
        version: data.version || 1,
        previousVersions: data.previousVersions || [],

        // Analytics
        analytics: {
            viewCount: data.analytics?.viewCount || 0,
            queryCount: data.analytics?.queryCount || 0,
            lastQueried: data.analytics?.lastQueried || null,
            relevanceScore: data.analytics?.relevanceScore || 0
        }
    };
}

// =============================================================================
// CRUD OPERATIONS
// =============================================================================

/**
 * Add a new document to the library
 * @param {Object} documentData - Document data (will be normalized)
 * @returns {Promise<Object>} - Created document
 */
export async function addDocument(documentData) {
    try {
        const db = await getDB();
        const document = createDocument(documentData);

        await db.put(STORE_NAME, document);

        // Update tag counts
        if (document.tags.length > 0) {
            await updateTagCounts(document.tags, 1);
        }

        console.log(`📄 Added document: ${document.name} (${document.id})`);
        emitEvent('document:added', document);

        return document;
    } catch (error) {
        console.error('❌ Failed to add document:', error);
        throw new LibraryError('Failed to add document', error);
    }
}

/**
 * Get a document by ID
 * @param {string} id - Document ID
 * @returns {Promise<Object|null>} - Document or null if not found
 */
export async function getDocument(id) {
    try {
        const db = await getDB();
        const document = await db.get(STORE_NAME, id);

        if (document) {
            // Update last accessed time
            document.metadata.lastAccessed = new Date().toISOString();
            document.analytics.viewCount += 1;
            await db.put(STORE_NAME, document);
        }

        return document || null;
    } catch (error) {
        console.error('❌ Failed to get document:', error);
        throw new LibraryError('Failed to get document', error);
    }
}

/**
 * Update an existing document
 * @param {string} id - Document ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} - Updated document
 */
export async function updateDocument(id, updates) {
    try {
        const db = await getDB();
        const existing = await db.get(STORE_NAME, id);

        if (!existing) {
            throw new LibraryError(`Document not found: ${id}`);
        }

        // Handle tag changes
        const oldTags = existing.tags || [];
        const newTags = updates.tags || oldTags;

        if (JSON.stringify(oldTags.sort()) !== JSON.stringify(newTags.sort())) {
            await updateTagCounts(oldTags, -1);
            await updateTagCounts(newTags, 1);
        }

        // Deep merge updates
        const updated = deepMerge(existing, {
            ...updates,
            metadata: {
                ...existing.metadata,
                ...updates.metadata,
                lastModified: new Date().toISOString()
            },
            version: existing.version + 1,
            previousVersions: [
                ...existing.previousVersions.slice(-4), // Keep last 5 versions
                {
                    version: existing.version,
                    modifiedAt: existing.metadata.lastModified,
                    changes: Object.keys(updates)
                }
            ]
        });

        await db.put(STORE_NAME, updated);

        console.log(`📝 Updated document: ${updated.name}`);
        emitEvent('document:updated', updated);

        return updated;
    } catch (error) {
        console.error('❌ Failed to update document:', error);
        throw new LibraryError('Failed to update document', error);
    }
}

/**
 * Delete a document from the library
 * @param {string} id - Document ID
 * @returns {Promise<boolean>} - Success status
 */
export async function deleteDocument(id) {
    try {
        const db = await getDB();
        const document = await db.get(STORE_NAME, id);

        if (!document) {
            return false;
        }

        // Update tag counts
        if (document.tags.length > 0) {
            await updateTagCounts(document.tags, -1);
        }

        await db.delete(STORE_NAME, id);

        console.log(`🗑️ Deleted document: ${document.name}`);
        emitEvent('document:deleted', { id, name: document.name });

        return true;
    } catch (error) {
        console.error('❌ Failed to delete document:', error);
        throw new LibraryError('Failed to delete document', error);
    }
}

/**
 * Get all documents in the library
 * @param {Object} options - Query options
 * @returns {Promise<Array>} - Array of documents
 */
export async function getAllDocuments(options = {}) {
    try {
        const db = await getDB();
        let documents = await db.getAll(STORE_NAME);

        // Apply filters
        if (options.type) {
            documents = documents.filter(doc => doc.type === options.type);
        }

        if (options.status) {
            documents = documents.filter(doc => doc.status === options.status);
        }

        if (options.source) {
            documents = documents.filter(doc => doc.metadata.source === options.source);
        }

        if (options.folderId) {
            documents = documents.filter(doc => doc.metadata.folderId === options.folderId);
        }

        if (options.favoritesOnly) {
            documents = documents.filter(doc => doc.metadata.isFavorite);
        }

        if (options.tags && options.tags.length > 0) {
            documents = documents.filter(doc =>
                options.tags.some(tag => doc.tags.includes(tag))
            );
        }

        // Apply sorting
        const sortField = options.sortBy || 'metadata.uploadDate';
        const sortOrder = options.sortOrder || 'desc';

        documents.sort((a, b) => {
            const aVal = getNestedValue(a, sortField);
            const bVal = getNestedValue(b, sortField);

            if (sortOrder === 'asc') {
                return aVal > bVal ? 1 : -1;
            }
            return aVal < bVal ? 1 : -1;
        });

        // Apply pagination
        if (options.limit) {
            const offset = options.offset || 0;
            documents = documents.slice(offset, offset + options.limit);
        }

        return documents;
    } catch (error) {
        console.error('❌ Failed to get all documents:', error);
        throw new LibraryError('Failed to get all documents', error);
    }
}

// =============================================================================
// SEARCH & FILTERING
// =============================================================================

/**
 * Search documents by query string
 * @param {string} query - Search query
 * @param {Object} options - Search options
 * @returns {Promise<Array>} - Matching documents with relevance scores
 */
export async function searchDocuments(query, options = {}) {
    try {
        if (!query || query.trim().length === 0) {
            return getAllDocuments(options);
        }

        const db = await getDB();
        const allDocs = await db.getAll(STORE_NAME);
        const queryLower = query.toLowerCase().trim();
        const queryTerms = queryLower.split(/\s+/);

        // Score and filter documents
        const results = allDocs
            .map(doc => {
                let score = 0;
                const matches = {
                    name: false,
                    content: false,
                    tags: false,
                    summary: false
                };

                // Name matching (highest weight)
                if (doc.name.toLowerCase().includes(queryLower)) {
                    score += 100;
                    matches.name = true;
                }

                // Exact phrase in content
                if (doc.content?.toLowerCase().includes(queryLower)) {
                    score += 50;
                    matches.content = true;
                }

                // Individual term matching
                queryTerms.forEach(term => {
                    if (doc.name.toLowerCase().includes(term)) score += 20;
                    if (doc.content?.toLowerCase().includes(term)) score += 10;
                    if (doc.summary?.toLowerCase().includes(term)) score += 15;
                });

                // Tag matching
                const tagMatch = doc.tags.some(tag =>
                    tag.toLowerCase().includes(queryLower) ||
                    queryTerms.some(term => tag.toLowerCase().includes(term))
                );
                if (tagMatch) {
                    score += 30;
                    matches.tags = true;
                }

                // Summary matching
                if (doc.summary?.toLowerCase().includes(queryLower)) {
                    score += 25;
                    matches.summary = true;
                }

                // Boost for favorites and recently accessed
                if (doc.metadata.isFavorite) score += 5;

                const daysSinceAccess = Math.floor(
                    (Date.now() - new Date(doc.metadata.lastAccessed).getTime()) /
                    (1000 * 60 * 60 * 24)
                );
                if (daysSinceAccess < 7) score += 10 - daysSinceAccess;

                return {
                    ...doc,
                    searchScore: score,
                    searchMatches: matches
                };
            })
            .filter(doc => doc.searchScore > 0)
            .sort((a, b) => b.searchScore - a.searchScore);

        // Apply type filter if specified
        let filteredResults = results;
        if (options.type) {
            filteredResults = results.filter(doc => doc.type === options.type);
        }

        // Apply limit
        if (options.limit) {
            filteredResults = filteredResults.slice(0, options.limit);
        }

        return filteredResults;
    } catch (error) {
        console.error('❌ Search failed:', error);
        throw new LibraryError('Search failed', error);
    }
}

/**
 * Get documents by type
 * @param {string} type - Document type
 * @returns {Promise<Array>} - Documents of specified type
 */
export async function getDocumentsByType(type) {
    return getAllDocuments({ type });
}

/**
 * Get documents by tags
 * @param {Array<string>} tags - Tags to filter by
 * @param {string} mode - 'any' or 'all'
 * @returns {Promise<Array>} - Matching documents
 */
export async function getDocumentsByTags(tags, mode = 'any') {
    try {
        const db = await getDB();
        const allDocs = await db.getAll(STORE_NAME);

        return allDocs.filter(doc => {
            if (mode === 'all') {
                return tags.every(tag => doc.tags.includes(tag));
            }
            return tags.some(tag => doc.tags.includes(tag));
        });
    } catch (error) {
        console.error('❌ Failed to get documents by tags:', error);
        throw new LibraryError('Failed to get documents by tags', error);
    }
}

/**
 * Get recent documents
 * @param {number} limit - Maximum number of documents
 * @returns {Promise<Array>} - Recent documents
 */
export async function getRecentDocuments(limit = 10) {
    return getAllDocuments({
        sortBy: 'metadata.lastAccessed',
        sortOrder: 'desc',
        limit
    });
}

/**
 * Get favorite documents
 * @returns {Promise<Array>} - Favorite documents
 */
export async function getFavoriteDocuments() {
    return getAllDocuments({ favoritesOnly: true });
}

// =============================================================================
// TAG MANAGEMENT
// =============================================================================

/**
 * Create a new tag
 * @param {Object} tagData - Tag data
 * @returns {Promise<Object>} - Created tag
 */
export async function createTag(tagData) {
    try {
        const db = await getDB();

        const tag = {
            id: generateId(),
            name: tagData.name.toLowerCase().trim(),
            color: tagData.color || generateTagColor(),
            icon: tagData.icon || null,
            description: tagData.description || '',
            documentCount: 0,
            createdAt: new Date().toISOString()
        };

        await db.put(TAGS_STORE, tag);
        emitEvent('tag:created', tag);

        return tag;
    } catch (error) {
        console.error('❌ Failed to create tag:', error);
        throw new LibraryError('Failed to create tag', error);
    }
}

/**
 * Get all tags
 * @returns {Promise<Array>} - All tags
 */
export async function getAllTags() {
    try {
        const db = await getDB();
        const tags = await db.getAll(TAGS_STORE);
        return tags.sort((a, b) => b.documentCount - a.documentCount);
    } catch (error) {
        console.error('❌ Failed to get tags:', error);
        throw new LibraryError('Failed to get tags', error);
    }
}

/**
 * Update tag counts when documents change
 * @param {Array<string>} tagNames - Tag names
 * @param {number} delta - Change amount (+1 or -1)
 */
async function updateTagCounts(tagNames, delta) {
    try {
        const db = await getDB();

        for (const tagName of tagNames) {
            const tx = db.transaction(TAGS_STORE, 'readwrite');
            const index = tx.store.index('by_name');
            let tag = await index.get(tagName.toLowerCase());

            if (tag) {
                tag.documentCount = Math.max(0, (tag.documentCount || 0) + delta);
                await tx.store.put(tag);
            } else if (delta > 0) {
                // Auto-create tag if it doesn't exist
                await tx.store.put({
                    id: generateId(),
                    name: tagName.toLowerCase(),
                    color: generateTagColor(),
                    documentCount: 1,
                    createdAt: new Date().toISOString()
                });
            }

            await tx.done;
        }
    } catch (error) {
        console.error('⚠️ Failed to update tag counts:', error);
    }
}

/**
 * Delete a tag (removes from all documents)
 * @param {string} tagId - Tag ID
 * @returns {Promise<boolean>} - Success status
 */
export async function deleteTag(tagId) {
    try {
        const db = await getDB();
        const tag = await db.get(TAGS_STORE, tagId);

        if (!tag) return false;

        // Remove tag from all documents
        const allDocs = await db.getAll(STORE_NAME);
        for (const doc of allDocs) {
            if (doc.tags.includes(tag.name)) {
                doc.tags = doc.tags.filter(t => t !== tag.name);
                await db.put(STORE_NAME, doc);
            }
        }

        await db.delete(TAGS_STORE, tagId);
        emitEvent('tag:deleted', tag);

        return true;
    } catch (error) {
        console.error('❌ Failed to delete tag:', error);
        throw new LibraryError('Failed to delete tag', error);
    }
}

// =============================================================================
// BULK OPERATIONS
// =============================================================================

/**
 * Add multiple documents at once
 * @param {Array<Object>} documents - Array of document data
 * @returns {Promise<Array>} - Created documents
 */
export async function bulkAddDocuments(documents) {
    try {
        const db = await getDB();
        const created = [];

        const tx = db.transaction(STORE_NAME, 'readwrite');

        for (const docData of documents) {
            const document = createDocument(docData);
            await tx.store.put(document);
            created.push(document);
        }

        await tx.done;

        console.log(`📚 Bulk added ${created.length} documents`);
        emitEvent('documents:bulkAdded', { count: created.length });

        return created;
    } catch (error) {
        console.error('❌ Bulk add failed:', error);
        throw new LibraryError('Bulk add failed', error);
    }
}

/**
 * Delete multiple documents
 * @param {Array<string>} ids - Document IDs to delete
 * @returns {Promise<number>} - Number of deleted documents
 */
export async function bulkDeleteDocuments(ids) {
    try {
        const db = await getDB();
        let deletedCount = 0;

        const tx = db.transaction(STORE_NAME, 'readwrite');

        for (const id of ids) {
            const doc = await tx.store.get(id);
            if (doc) {
                await tx.store.delete(id);
                deletedCount++;
            }
        }

        await tx.done;

        console.log(`🗑️ Bulk deleted ${deletedCount} documents`);
        emitEvent('documents:bulkDeleted', { count: deletedCount });

        return deletedCount;
    } catch (error) {
        console.error('❌ Bulk delete failed:', error);
        throw new LibraryError('Bulk delete failed', error);
    }
}

/**
 * Update tags on multiple documents
 * @param {Array<string>} ids - Document IDs
 * @param {Array<string>} tagsToAdd - Tags to add
 * @param {Array<string>} tagsToRemove - Tags to remove
 * @returns {Promise<number>} - Number of updated documents
 */
export async function bulkUpdateTags(ids, tagsToAdd = [], tagsToRemove = []) {
    try {
        const db = await getDB();
        let updatedCount = 0;

        for (const id of ids) {
            const doc = await db.get(STORE_NAME, id);
            if (doc) {
                let tags = [...doc.tags];

                // Remove tags
                tags = tags.filter(t => !tagsToRemove.includes(t));

                // Add tags
                for (const tag of tagsToAdd) {
                    if (!tags.includes(tag)) {
                        tags.push(tag);
                    }
                }

                await updateDocument(id, { tags });
                updatedCount++;
            }
        }

        return updatedCount;
    } catch (error) {
        console.error('❌ Bulk update tags failed:', error);
        throw new LibraryError('Bulk update tags failed', error);
    }
}

// =============================================================================
// IMPORT / EXPORT
// =============================================================================

/**
 * Export library to JSON
 * @param {Object} options - Export options
 * @returns {Promise<Object>} - Exported data
 */
export async function exportLibrary(options = {}) {
    try {
        const db = await getDB();

        const exportData = {
            version: '1.0',
            exportDate: new Date().toISOString(),
            documents: await db.getAll(STORE_NAME),
            tags: await db.getAll(TAGS_STORE),
            settings: await db.getAll(SETTINGS_STORE)
        };

        // Optionally exclude content to reduce size
        if (options.excludeContent) {
            exportData.documents = exportData.documents.map(doc => ({
                ...doc,
                content: '[EXCLUDED]',
                contentPreview: doc.contentPreview
            }));
        }

        return exportData;
    } catch (error) {
        console.error('❌ Export failed:', error);
        throw new LibraryError('Export failed', error);
    }
}

/**
 * Import library from JSON
 * @param {Object} data - Import data
 * @param {Object} options - Import options
 * @returns {Promise<Object>} - Import statistics
 */
export async function importLibrary(data, options = {}) {
    try {
        const db = await getDB();
        const stats = { documents: 0, tags: 0, skipped: 0 };

        // Import documents
        if (data.documents) {
            for (const doc of data.documents) {
                if (options.skipExisting) {
                    const existing = await db.get(STORE_NAME, doc.id);
                    if (existing) {
                        stats.skipped++;
                        continue;
                    }
                }

                await db.put(STORE_NAME, {
                    ...doc,
                    metadata: {
                        ...doc.metadata,
                        source: DocumentSource.IMPORTED,
                        importedAt: new Date().toISOString()
                    }
                });
                stats.documents++;
            }
        }

        // Import tags
        if (data.tags) {
            for (const tag of data.tags) {
                await db.put(TAGS_STORE, tag);
                stats.tags++;
            }
        }

        emitEvent('library:imported', stats);
        return stats;
    } catch (error) {
        console.error('❌ Import failed:', error);
        throw new LibraryError('Import failed', error);
    }
}

/**
 * Download library export as JSON file
 */
export async function downloadLibraryExport() {
    const data = await exportLibrary();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `devsavvy-library-${new Date().toISOString().split('T')[0]}.json`;
    a.click();

    URL.revokeObjectURL(url);
}

// =============================================================================
// STATISTICS & ANALYTICS
// =============================================================================

/**
 * Get library statistics
 * @returns {Promise<Object>} - Library stats
 */
export async function getLibraryStats() {
    try {
        const db = await getDB();
        const documents = await db.getAll(STORE_NAME);
        const tags = await db.getAll(TAGS_STORE);

        const stats = {
            totalDocuments: documents.length,
            totalTags: tags.length,

            byType: {},
            byStatus: {},
            bySource: {},

            totalSize: 0,
            totalWords: 0,

            recentlyAdded: 0,
            favorites: 0,

            mostUsedTags: [],

            oldestDocument: null,
            newestDocument: null
        };

        // Calculate statistics
        documents.forEach(doc => {
            // By type
            stats.byType[doc.type] = (stats.byType[doc.type] || 0) + 1;

            // By status
            stats.byStatus[doc.status] = (stats.byStatus[doc.status] || 0) + 1;

            // By source
            const source = doc.metadata.source;
            stats.bySource[source] = (stats.bySource[source] || 0) + 1;

            // Totals
            stats.totalSize += doc.metadata.fileSize || 0;
            stats.totalWords += doc.metadata.wordCount || 0;

            // Favorites
            if (doc.metadata.isFavorite) stats.favorites++;

            // Recently added (last 7 days)
            const uploadDate = new Date(doc.metadata.uploadDate);
            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            if (uploadDate > weekAgo) stats.recentlyAdded++;
        });

        // Format total size
        stats.totalSizeFormatted = formatFileSize(stats.totalSize);

        // Most used tags
        stats.mostUsedTags = tags
            .sort((a, b) => b.documentCount - a.documentCount)
            .slice(0, 10);

        // Date range
        if (documents.length > 0) {
            const sorted = [...documents].sort(
                (a, b) => new Date(a.metadata.uploadDate) - new Date(b.metadata.uploadDate)
            );
            stats.oldestDocument = sorted[0];
            stats.newestDocument = sorted[sorted.length - 1];
        }

        return stats;
    } catch (error) {
        console.error('❌ Failed to get stats:', error);
        throw new LibraryError('Failed to get stats', error);
    }
}

/**
 * Record a document query (for analytics)
 * @param {string} documentId - Document ID
 */
export async function recordDocumentQuery(documentId) {
    try {
        const db = await getDB();
        const doc = await db.get(STORE_NAME, documentId);

        if (doc) {
            doc.analytics.queryCount += 1;
            doc.analytics.lastQueried = new Date().toISOString();
            await db.put(STORE_NAME, doc);
        }
    } catch (error) {
        console.error('⚠️ Failed to record query:', error);
    }
}

// =============================================================================
// DATABASE MANAGEMENT
// =============================================================================

/**
 * Clear all documents from the library
 * @returns {Promise<void>}
 */
export async function clearLibrary() {
    try {
        const db = await getDB();
        await db.clear(STORE_NAME);
        await db.clear(TAGS_STORE);

        console.log('🧹 Library cleared');
        emitEvent('library:cleared');
    } catch (error) {
        console.error('❌ Failed to clear library:', error);
        throw new LibraryError('Failed to clear library', error);
    }
}

/**
 * Delete the entire database
 * @returns {Promise<void>}
 */
export async function deleteDatabase() {
    try {
        dbInstance = null;
        await deleteDB(DB_NAME);
        console.log('🗑️ Database deleted');
    } catch (error) {
        console.error('❌ Failed to delete database:', error);
        throw new LibraryError('Failed to delete database', error);
    }
}

/**
 * Get database info
 * @returns {Promise<Object>}
 */
export async function getDatabaseInfo() {
    const db = await getDB();
    const documents = await db.count(STORE_NAME);
    const tags = await db.count(TAGS_STORE);

    return {
        name: DB_NAME,
        version: DB_VERSION,
        documentCount: documents,
        tagCount: tags
    };
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Generate a unique ID
 */
function generateId() {
    return `doc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Format file size in human-readable format
 */
function formatFileSize(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${units[i]}`;
}

/**
 * Count words in text
 */
function countWords(text) {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Truncate content for preview
 */
function truncateContent(content, maxLength = 500) {
    if (!content) return '';
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
}

/**
 * Generate a random tag color
 */
function generateTagColor() {
    const colors = [
        '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
        '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
        '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
        '#ec4899', '#f43f5e'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Deep merge objects
 */
function deepMerge(target, source) {
    const result = { ...target };

    for (const key of Object.keys(source)) {
        if (source[key] !== null && typeof source[key] === 'object' && !Array.isArray(source[key])) {
            result[key] = deepMerge(result[key] || {}, source[key]);
        } else {
            result[key] = source[key];
        }
    }

    return result;
}

/**
 * Get nested object value by dot notation
 */
function getNestedValue(obj, path) {
    return path.split('.').reduce((acc, part) => acc?.[part], obj);
}

// =============================================================================
// EVENT SYSTEM
// =============================================================================

const eventListeners = new Map();

/**
 * Subscribe to library events
 * @param {string} event - Event name
 * @param {Function} callback - Event handler
 * @returns {Function} - Unsubscribe function
 */
export function subscribe(event, callback) {
    if (!eventListeners.has(event)) {
        eventListeners.set(event, new Set());
    }
    eventListeners.get(event).add(callback);

    return () => {
        eventListeners.get(event)?.delete(callback);
    };
}

/**
 * Emit a library event
 */
function emitEvent(event, data) {
    eventListeners.get(event)?.forEach(callback => {
        try {
            callback(data);
        } catch (error) {
            console.error(`Event handler error for ${event}:`, error);
        }
    });
}

// =============================================================================
// CUSTOM ERROR CLASS
// =============================================================================

class LibraryError extends Error {
    constructor(message, cause = null) {
        super(message);
        this.name = 'LibraryError';
        this.cause = cause;
    }
}

// =============================================================================
// DEFAULT EXPORT
// =============================================================================

export default {
    // CRUD
    addDocument,
    getDocument,
    updateDocument,
    deleteDocument,
    getAllDocuments,

    // Search
    searchDocuments,
    getDocumentsByType,
    getDocumentsByTags,
    getRecentDocuments,
    getFavoriteDocuments,

    // Tags
    createTag,
    getAllTags,
    deleteTag,

    // Bulk operations
    bulkAddDocuments,
    bulkDeleteDocuments,
    bulkUpdateTags,

    // Import/Export
    exportLibrary,
    importLibrary,
    downloadLibraryExport,

    // Stats
    getLibraryStats,
    recordDocumentQuery,
    getDatabaseInfo,

    // Database management
    clearLibrary,
    deleteDatabase,

    // Events
    subscribe,

    // Utilities
    createDocument,

    // Enums
    DocumentType,
    DocumentSource,
    DocumentStatus
};
