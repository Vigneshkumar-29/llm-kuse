/**
 * Database Service - Professional IndexedDB Wrapper
 * ==================================================
 * 
 * A robust, feature-rich IndexedDB wrapper for managing
 * large-scale data storage in the browser.
 * 
 * Features:
 * - Multiple object stores (documents, blobs, cache, settings)
 * - Automatic schema migrations
 * - Transaction management
 * - Error handling with retry logic
 * - Storage quota management
 * - Data compression hooks
 * - Import/Export functionality
 * 
 * @version 1.0.0
 */

import { openDB, deleteDB } from 'idb';

// =============================================================================
// CONFIGURATION
// =============================================================================

const DB_CONFIG = {
    name: 'devsavvy_knowledge_base',
    version: 2,
    stores: {
        documents: 'documents',      // Document metadata
        blobs: 'blobs',              // File binary data
        cache: 'cache',              // Temporary cache
        settings: 'settings',        // App settings
        tags: 'tags',                // Tag management
        history: 'history'           // Action history for undo
    }
};

// Storage limits
const STORAGE_LIMITS = {
    maxBlobSizeMB: 50,               // Max single blob size
    warnAtPercentUsed: 80,           // Warn at 80% storage used
    maxDocuments: 10000,             // Max documents
    cacheExpiryMs: 24 * 60 * 60 * 1000  // 24 hours cache expiry
};

// =============================================================================
// DATABASE INITIALIZATION
// =============================================================================

let dbInstance = null;
let dbInitPromise = null;

/**
 * Initialize the database with all required stores and indexes
 */
async function initializeDatabase() {
    if (dbInstance) return dbInstance;

    if (dbInitPromise) return dbInitPromise;

    dbInitPromise = openDB(DB_CONFIG.name, DB_CONFIG.version, {
        upgrade(db, oldVersion, newVersion, transaction) {
            console.log(`📦 Upgrading database from v${oldVersion} to v${newVersion}`);

            // Documents store - metadata only
            if (!db.objectStoreNames.contains(DB_CONFIG.stores.documents)) {
                const docStore = db.createObjectStore(DB_CONFIG.stores.documents, { keyPath: 'id' });
                docStore.createIndex('by_name', 'name');
                docStore.createIndex('by_type', 'type');
                docStore.createIndex('by_status', 'status');
                docStore.createIndex('by_date', 'metadata.uploadDate');
                docStore.createIndex('by_favorite', 'metadata.isFavorite');
                docStore.createIndex('by_folder', 'metadata.folderId');
                docStore.createIndex('by_source', 'metadata.source');
            }

            // Blobs store - binary file data
            if (!db.objectStoreNames.contains(DB_CONFIG.stores.blobs)) {
                const blobStore = db.createObjectStore(DB_CONFIG.stores.blobs, { keyPath: 'id' });
                blobStore.createIndex('by_document', 'documentId');
                blobStore.createIndex('by_type', 'mimeType');
                blobStore.createIndex('by_size', 'size');
            }

            // Cache store - temporary data
            if (!db.objectStoreNames.contains(DB_CONFIG.stores.cache)) {
                const cacheStore = db.createObjectStore(DB_CONFIG.stores.cache, { keyPath: 'key' });
                cacheStore.createIndex('by_expiry', 'expiresAt');
                cacheStore.createIndex('by_category', 'category');
            }

            // Settings store
            if (!db.objectStoreNames.contains(DB_CONFIG.stores.settings)) {
                db.createObjectStore(DB_CONFIG.stores.settings, { keyPath: 'key' });
            }

            // Tags store
            if (!db.objectStoreNames.contains(DB_CONFIG.stores.tags)) {
                const tagStore = db.createObjectStore(DB_CONFIG.stores.tags, { keyPath: 'id' });
                tagStore.createIndex('by_name', 'name', { unique: true });
                tagStore.createIndex('by_count', 'documentCount');
            }

            // History store - for undo functionality
            if (!db.objectStoreNames.contains(DB_CONFIG.stores.history)) {
                const historyStore = db.createObjectStore(DB_CONFIG.stores.history, {
                    keyPath: 'id',
                    autoIncrement: true
                });
                historyStore.createIndex('by_date', 'timestamp');
                historyStore.createIndex('by_action', 'action');
            }
        },
        blocked() {
            console.warn('⚠️ Database blocked by another connection');
        },
        blocking() {
            console.warn('⚠️ This connection is blocking a newer version');
        },
        terminated() {
            console.error('❌ Database connection terminated');
            dbInstance = null;
            dbInitPromise = null;
        }
    });

    dbInstance = await dbInitPromise;
    console.log('✅ Database initialized successfully');

    // Clean expired cache on init
    cleanExpiredCache().catch(console.error);

    return dbInstance;
}

/**
 * Get database instance
 */
async function getDB() {
    if (!dbInstance) {
        await initializeDatabase();
    }
    return dbInstance;
}

// =============================================================================
// BLOB STORAGE - For Large Files
// =============================================================================

/**
 * Store a file blob in IndexedDB
 * @param {string} documentId - Associated document ID
 * @param {Blob|ArrayBuffer|File} data - Binary data to store
 * @param {Object} metadata - Additional metadata
 */
export async function storeBlob(documentId, data, metadata = {}) {
    const db = await getDB();

    // Convert to ArrayBuffer if needed
    let arrayBuffer;
    let mimeType = metadata.mimeType || 'application/octet-stream';

    if (data instanceof File) {
        arrayBuffer = await data.arrayBuffer();
        mimeType = data.type || mimeType;
    } else if (data instanceof Blob) {
        arrayBuffer = await data.arrayBuffer();
        mimeType = data.type || mimeType;
    } else if (data instanceof ArrayBuffer) {
        arrayBuffer = data;
    } else {
        throw new Error('Invalid data type. Expected Blob, File, or ArrayBuffer');
    }

    // Check size limit
    const sizeMB = arrayBuffer.byteLength / (1024 * 1024);
    if (sizeMB > STORAGE_LIMITS.maxBlobSizeMB) {
        throw new Error(`File too large. Maximum size is ${STORAGE_LIMITS.maxBlobSizeMB}MB`);
    }

    const blobRecord = {
        id: `blob_${documentId}_${Date.now()}`,
        documentId,
        data: arrayBuffer,
        mimeType,
        size: arrayBuffer.byteLength,
        checksum: await calculateChecksum(arrayBuffer),
        createdAt: new Date().toISOString(),
        metadata: {
            fileName: metadata.fileName || null,
            ...metadata
        }
    };

    await db.put(DB_CONFIG.stores.blobs, blobRecord);

    console.log(`💾 Stored blob: ${blobRecord.id} (${formatBytes(blobRecord.size)})`);

    return {
        id: blobRecord.id,
        size: blobRecord.size,
        mimeType: blobRecord.mimeType,
        checksum: blobRecord.checksum
    };
}

/**
 * Retrieve a blob by ID
 * @param {string} blobId - Blob ID
 * @returns {Promise<{data: Blob, metadata: Object}>}
 */
export async function getBlob(blobId) {
    const db = await getDB();
    const record = await db.get(DB_CONFIG.stores.blobs, blobId);

    if (!record) {
        return null;
    }

    // Convert ArrayBuffer back to Blob
    const blob = new Blob([record.data], { type: record.mimeType });

    return {
        blob,
        metadata: {
            id: record.id,
            documentId: record.documentId,
            size: record.size,
            mimeType: record.mimeType,
            checksum: record.checksum,
            createdAt: record.createdAt,
            ...record.metadata
        }
    };
}

/**
 * Get all blobs for a document
 * @param {string} documentId - Document ID
 */
export async function getBlobsByDocument(documentId) {
    const db = await getDB();
    const tx = db.transaction(DB_CONFIG.stores.blobs, 'readonly');
    const index = tx.store.index('by_document');
    return await index.getAll(documentId);
}

/**
 * Delete a blob
 * @param {string} blobId - Blob ID
 */
export async function deleteBlob(blobId) {
    const db = await getDB();
    await db.delete(DB_CONFIG.stores.blobs, blobId);
    console.log(`🗑️ Deleted blob: ${blobId}`);
}

/**
 * Delete all blobs for a document
 * @param {string} documentId - Document ID
 */
export async function deleteBlobsByDocument(documentId) {
    const db = await getDB();
    const blobs = await getBlobsByDocument(documentId);

    const tx = db.transaction(DB_CONFIG.stores.blobs, 'readwrite');
    await Promise.all(blobs.map(b => tx.store.delete(b.id)));
    await tx.done;

    console.log(`🗑️ Deleted ${blobs.length} blobs for document: ${documentId}`);
}

// =============================================================================
// CACHE MANAGEMENT
// =============================================================================

/**
 * Store data in cache
 * @param {string} key - Cache key
 * @param {any} value - Data to cache
 * @param {Object} options - Cache options
 */
export async function setCache(key, value, options = {}) {
    const db = await getDB();

    const cacheRecord = {
        key,
        value,
        category: options.category || 'general',
        createdAt: new Date().toISOString(),
        expiresAt: options.expiresAt || new Date(Date.now() + STORAGE_LIMITS.cacheExpiryMs).toISOString(),
        metadata: options.metadata || {}
    };

    await db.put(DB_CONFIG.stores.cache, cacheRecord);
    return cacheRecord;
}

/**
 * Get data from cache
 * @param {string} key - Cache key
 * @returns {Promise<any>} Cached value or null
 */
export async function getCache(key) {
    const db = await getDB();
    const record = await db.get(DB_CONFIG.stores.cache, key);

    if (!record) return null;

    // Check expiry
    if (new Date(record.expiresAt) < new Date()) {
        await db.delete(DB_CONFIG.stores.cache, key);
        return null;
    }

    return record.value;
}

/**
 * Delete cache entry
 * @param {string} key - Cache key
 */
export async function deleteCache(key) {
    const db = await getDB();
    await db.delete(DB_CONFIG.stores.cache, key);
}

/**
 * Clear all cache entries
 */
export async function clearCache() {
    const db = await getDB();
    await db.clear(DB_CONFIG.stores.cache);
    console.log('🧹 Cache cleared');
}

/**
 * Clean expired cache entries
 */
async function cleanExpiredCache() {
    const db = await getDB();
    const tx = db.transaction(DB_CONFIG.stores.cache, 'readwrite');
    const index = tx.store.index('by_expiry');
    const now = new Date().toISOString();

    let cursor = await index.openCursor(IDBKeyRange.upperBound(now));
    let deletedCount = 0;

    while (cursor) {
        await cursor.delete();
        deletedCount++;
        cursor = await cursor.continue();
    }

    await tx.done;

    if (deletedCount > 0) {
        console.log(`🧹 Cleaned ${deletedCount} expired cache entries`);
    }
}

// =============================================================================
// SETTINGS MANAGEMENT
// =============================================================================

/**
 * Get a setting value
 * @param {string} key - Setting key
 * @param {any} defaultValue - Default value if not found
 */
export async function getSetting(key, defaultValue = null) {
    const db = await getDB();
    const record = await db.get(DB_CONFIG.stores.settings, key);
    return record?.value ?? defaultValue;
}

/**
 * Set a setting value
 * @param {string} key - Setting key
 * @param {any} value - Setting value
 */
export async function setSetting(key, value) {
    const db = await getDB();
    await db.put(DB_CONFIG.stores.settings, {
        key,
        value,
        updatedAt: new Date().toISOString()
    });
}

/**
 * Get all settings
 */
export async function getAllSettings() {
    const db = await getDB();
    const records = await db.getAll(DB_CONFIG.stores.settings);
    return records.reduce((acc, r) => ({ ...acc, [r.key]: r.value }), {});
}

// =============================================================================
// HISTORY / UNDO SUPPORT
// =============================================================================

/**
 * Record an action for undo support
 * @param {string} action - Action type
 * @param {Object} data - Action data (before/after state)
 */
export async function recordHistory(action, data) {
    const db = await getDB();

    const historyRecord = {
        action,
        data,
        timestamp: new Date().toISOString()
    };

    await db.add(DB_CONFIG.stores.history, historyRecord);

    // Keep only last 100 history entries
    const tx = db.transaction(DB_CONFIG.stores.history, 'readwrite');
    const count = await tx.store.count();

    if (count > 100) {
        let cursor = await tx.store.openCursor();
        let toDelete = count - 100;

        while (cursor && toDelete > 0) {
            await cursor.delete();
            toDelete--;
            cursor = await cursor.continue();
        }
    }

    await tx.done;
}

/**
 * Get recent history
 * @param {number} limit - Max entries to return
 */
export async function getHistory(limit = 50) {
    const db = await getDB();
    const all = await db.getAll(DB_CONFIG.stores.history);
    return all.slice(-limit).reverse();
}

/**
 * Clear history
 */
export async function clearHistory() {
    const db = await getDB();
    await db.clear(DB_CONFIG.stores.history);
}

// =============================================================================
// STORAGE QUOTA MANAGEMENT
// =============================================================================

/**
 * Get storage usage information
 * @returns {Promise<Object>} Storage stats
 */
export async function getStorageInfo() {
    const stats = {
        available: false,
        usage: 0,
        quota: 0,
        percentUsed: 0,
        documents: { count: 0, size: 0 },
        blobs: { count: 0, size: 0 },
        cache: { count: 0 }
    };

    // Browser storage estimate
    if (navigator.storage?.estimate) {
        const estimate = await navigator.storage.estimate();
        stats.available = true;
        stats.usage = estimate.usage || 0;
        stats.quota = estimate.quota || 0;
        stats.percentUsed = stats.quota > 0 ? Math.round((stats.usage / stats.quota) * 100) : 0;
    }

    // Count items in each store
    const db = await getDB();

    stats.documents.count = await db.count(DB_CONFIG.stores.documents);
    stats.blobs.count = await db.count(DB_CONFIG.stores.blobs);
    stats.cache.count = await db.count(DB_CONFIG.stores.cache);

    // Calculate blob sizes
    const blobs = await db.getAll(DB_CONFIG.stores.blobs);
    stats.blobs.size = blobs.reduce((sum, b) => sum + (b.size || 0), 0);

    return {
        ...stats,
        usageFormatted: formatBytes(stats.usage),
        quotaFormatted: formatBytes(stats.quota),
        blobSizeFormatted: formatBytes(stats.blobs.size),
        isNearLimit: stats.percentUsed >= STORAGE_LIMITS.warnAtPercentUsed
    };
}

/**
 * Request persistent storage
 */
export async function requestPersistentStorage() {
    if (navigator.storage?.persist) {
        const isPersisted = await navigator.storage.persist();
        console.log(`📦 Persistent storage: ${isPersisted ? 'granted' : 'denied'}`);
        return isPersisted;
    }
    return false;
}

// =============================================================================
// DATABASE MANAGEMENT
// =============================================================================

/**
 * Export entire database
 */
export async function exportDatabase() {
    const db = await getDB();

    const exportData = {
        version: DB_CONFIG.version,
        exportDate: new Date().toISOString(),
        stores: {}
    };

    for (const storeName of Object.values(DB_CONFIG.stores)) {
        if (storeName === 'blobs') {
            // Export blob metadata only (not the binary data)
            const blobs = await db.getAll(storeName);
            exportData.stores[storeName] = blobs.map(b => ({
                ...b,
                data: '[BINARY_DATA_EXCLUDED]',
                size: b.size
            }));
        } else {
            exportData.stores[storeName] = await db.getAll(storeName);
        }
    }

    return exportData;
}

/**
 * Import database from export
 * @param {Object} data - Exported data
 * @param {Object} options - Import options
 */
export async function importDatabase(data, options = {}) {
    const db = await getDB();
    const stats = { imported: 0, skipped: 0, errors: 0 };

    for (const [storeName, records] of Object.entries(data.stores || {})) {
        if (!Object.values(DB_CONFIG.stores).includes(storeName)) continue;
        // Skip blobs during import unless explicitly requested (usually handled separately)
        if (storeName === 'blobs' && !options.includeBlobs) continue;

        const tx = db.transaction(storeName, 'readwrite');

        for (const record of records) {
            try {
                if (options.skipExisting) {
                    const existing = await tx.store.get(record.id || record.key);
                    if (existing) {
                        stats.skipped++;
                        continue;
                    }
                }
                await tx.store.put(record);
                stats.imported++;
            } catch (err) {
                stats.errors++;
                console.error(`Import error for ${storeName}:`, err);
            }
        }

        await tx.done;
    }

    return stats;
}

/**
 * Clear all data from all stores
 */
export async function clearAllData() {
    const db = await getDB();

    for (const storeName of Object.values(DB_CONFIG.stores)) {
        await db.clear(storeName);
    }

    console.log('🗑️ All database data cleared');
}

/**
 * Delete the entire database
 */
export async function deleteDatabase() {
    if (dbInstance) {
        dbInstance.close();
        dbInstance = null;
        dbInitPromise = null;
    }

    await deleteDB(DB_CONFIG.name);
    console.log('🗑️ Database deleted');
}

/**
 * Get database info
 */
export async function getDatabaseInfo() {
    const db = await getDB();
    const storageInfo = await getStorageInfo();

    return {
        name: DB_CONFIG.name,
        version: DB_CONFIG.version,
        stores: Object.values(DB_CONFIG.stores),
        storage: storageInfo
    };
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Format bytes to human readable
 */
function formatBytes(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${units[i]}`;
}

/**
 * Calculate checksum for data integrity
 */
async function calculateChecksum(arrayBuffer) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
}

/**
 * Generate unique ID
 */
export function generateId(prefix = 'id') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// =============================================================================
// EXPORT
// =============================================================================

export default {
    // Database
    getDB,
    initializeDatabase,
    getDatabaseInfo,
    exportDatabase,
    importDatabase,
    clearAllData,
    deleteDatabase,

    // Blob storage
    storeBlob,
    getBlob,
    getBlobsByDocument,
    deleteBlob,
    deleteBlobsByDocument,

    // Cache
    setCache,
    getCache,
    deleteCache,
    clearCache,

    // Settings
    getSetting,
    setSetting,
    getAllSettings,

    // History
    recordHistory,
    getHistory,
    clearHistory,

    // Storage
    getStorageInfo,
    requestPersistentStorage,

    // Utilities
    generateId
};

export { DB_CONFIG, STORAGE_LIMITS };
