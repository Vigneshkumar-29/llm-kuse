/**
 * useDatabase Hook
 * =================
 * 
 * React hook for database operations with state management.
 * Provides easy access to IndexedDB storage, blob management, and settings.
 * 
 * @version 1.0.0
 */

import { useState, useEffect, useCallback } from 'react';
import DatabaseService from '../services/DatabaseService';

// =============================================================================
// MAIN DATABASE HOOK
// =============================================================================

/**
 * Hook for database storage info and management
 */
export function useDatabase() {
    const [info, setInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadInfo = useCallback(async () => {
        try {
            setLoading(true);
            const dbInfo = await DatabaseService.getDatabaseInfo();
            setInfo(dbInfo);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadInfo();
    }, [loadInfo]);

    const requestPersistence = useCallback(async () => {
        const result = await DatabaseService.requestPersistentStorage();
        await loadInfo();
        return result;
    }, [loadInfo]);

    const clearAll = useCallback(async () => {
        await DatabaseService.clearAllData();
        await loadInfo();
    }, [loadInfo]);

    const exportData = useCallback(async () => {
        const data = await DatabaseService.exportDatabase();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `knowledge-base-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();

        URL.revokeObjectURL(url);
    }, []);

    const importData = useCallback(async (file) => {
        const text = await file.text();
        const data = JSON.parse(text);
        const result = await DatabaseService.importDatabase(data, { skipExisting: true });
        await loadInfo();
        return result;
    }, [loadInfo]);

    return {
        info,
        loading,
        error,
        refresh: loadInfo,
        requestPersistence,
        clearAll,
        exportData,
        importData,
        isNearLimit: info?.storage?.isNearLimit || false
    };
}

// =============================================================================
// BLOB STORAGE HOOK
// =============================================================================

/**
 * Hook for blob storage operations
 */
export function useBlobStorage() {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState(null);

    const storeFile = useCallback(async (documentId, file) => {
        try {
            setUploading(true);
            setProgress(0);
            setError(null);

            // Simulate progress (IndexedDB doesn't have progress events)
            const progressInterval = setInterval(() => {
                setProgress(p => Math.min(p + 10, 90));
            }, 100);

            const result = await DatabaseService.storeBlob(documentId, file, {
                fileName: file.name,
                mimeType: file.type
            });

            clearInterval(progressInterval);
            setProgress(100);

            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setUploading(false);
            setTimeout(() => setProgress(0), 500);
        }
    }, []);

    const getFile = useCallback(async (blobId) => {
        try {
            setError(null);
            const result = await DatabaseService.getBlob(blobId);
            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, []);

    const deleteFile = useCallback(async (blobId) => {
        try {
            setError(null);
            await DatabaseService.deleteBlob(blobId);
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, []);

    const downloadFile = useCallback(async (blobId, fileName) => {
        const result = await getFile(blobId);
        if (!result) return;

        const url = URL.createObjectURL(result.blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName || result.metadata?.fileName || 'download';
        a.click();
        URL.revokeObjectURL(url);
    }, [getFile]);

    return {
        uploading,
        progress,
        error,
        storeFile,
        getFile,
        deleteFile,
        downloadFile
    };
}

// =============================================================================
// SETTINGS HOOK
// =============================================================================

/**
 * Hook for app settings with persistence
 * @param {string} key - Setting key
 * @param {any} defaultValue - Default value
 */
export function useSetting(key, defaultValue) {
    const [value, setValue] = useState(defaultValue);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        DatabaseService.getSetting(key, defaultValue)
            .then(v => {
                setValue(v);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [key, defaultValue]);

    const updateValue = useCallback(async (newValue) => {
        setValue(newValue);
        await DatabaseService.setSetting(key, newValue);
    }, [key]);

    return [value, updateValue, loading];
}

/**
 * Hook for multiple settings
 */
export function useSettings() {
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        DatabaseService.getAllSettings()
            .then(s => {
                setSettings(s);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const updateSetting = useCallback(async (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
        await DatabaseService.setSetting(key, value);
    }, []);

    const updateSettings = useCallback(async (newSettings) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
        for (const [key, value] of Object.entries(newSettings)) {
            await DatabaseService.setSetting(key, value);
        }
    }, []);

    return { settings, loading, updateSetting, updateSettings };
}

// =============================================================================
// CACHE HOOK
// =============================================================================

/**
 * Hook for cached data with automatic expiry
 * @param {string} key - Cache key
 * @param {Function} fetcher - Function to fetch data if not cached
 * @param {Object} options - Cache options
 */
export function useCache(key, fetcher, options = {}) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const load = useCallback(async (forceRefresh = false) => {
        try {
            setLoading(true);
            setError(null);

            // Check cache first
            if (!forceRefresh) {
                const cached = await DatabaseService.getCache(key);
                if (cached !== null) {
                    setData(cached);
                    setLoading(false);
                    return cached;
                }
            }

            // Fetch fresh data
            const freshData = await fetcher();

            // Store in cache
            await DatabaseService.setCache(key, freshData, {
                expiresAt: options.expiresAt,
                category: options.category
            });

            setData(freshData);
            return freshData;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [key, fetcher, options.expiresAt, options.category]);

    useEffect(() => {
        load();
    }, [load]);

    const invalidate = useCallback(async () => {
        await DatabaseService.deleteCache(key);
        await load(true);
    }, [key, load]);

    return { data, loading, error, refresh: () => load(true), invalidate };
}

// =============================================================================
// HISTORY HOOK
// =============================================================================

/**
 * Hook for action history (undo support)
 */
export function useHistory() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadHistory = useCallback(async () => {
        try {
            const h = await DatabaseService.getHistory(50);
            setHistory(h);
        } catch (err) {
            console.error('Failed to load history:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadHistory();
    }, [loadHistory]);

    const record = useCallback(async (action, data) => {
        await DatabaseService.recordHistory(action, data);
        await loadHistory();
    }, [loadHistory]);

    const clear = useCallback(async () => {
        await DatabaseService.clearHistory();
        setHistory([]);
    }, []);

    return { history, loading, record, clear, refresh: loadHistory };
}

// =============================================================================
// STORAGE INFO COMPONENT HOOK
// =============================================================================

/**
 * Hook for storage usage display
 */
export function useStorageInfo() {
    const [info, setInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        DatabaseService.getStorageInfo()
            .then(setInfo)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return {
        info,
        loading,
        usagePercent: info?.percentUsed || 0,
        usageFormatted: info?.usageFormatted || '0 B',
        quotaFormatted: info?.quotaFormatted || 'Unknown',
        isNearLimit: info?.isNearLimit || false,
        documentsCount: info?.documents?.count || 0,
        blobsCount: info?.blobs?.count || 0,
        blobsSize: info?.blobSizeFormatted || '0 B'
    };
}

// =============================================================================
// EXPORT
// =============================================================================

export default useDatabase;
