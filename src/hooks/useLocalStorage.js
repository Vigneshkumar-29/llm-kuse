/**
 * useLocalStorage Hook
 * ====================
 * 
 * A custom React hook for persisting state to localStorage with
 * automatic serialization/deserialization and cross-tab synchronization.
 * 
 * Features:
 * - Automatic JSON serialization
 * - Error handling with fallback
 * - Cross-tab synchronization via storage events
 * - SSR safe
 * 
 * @version 1.0.0
 */

import { useState, useEffect, useCallback } from 'react';

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Safely parse JSON with fallback
 */
const safeJsonParse = (value, fallback) => {
    try {
        return value ? JSON.parse(value) : fallback;
    } catch (error) {
        console.warn('Failed to parse localStorage value:', error);
        return fallback;
    }
};

/**
 * Safely stringify value
 */
const safeJsonStringify = (value) => {
    try {
        return JSON.stringify(value);
    } catch (error) {
        console.error('Failed to stringify value for localStorage:', error);
        return null;
    }
};

/**
 * Check if localStorage is available
 */
const isLocalStorageAvailable = () => {
    try {
        const testKey = '__localStorage_test__';
        window.localStorage.setItem(testKey, testKey);
        window.localStorage.removeItem(testKey);
        return true;
    } catch (e) {
        return false;
    }
};

// =============================================================================
// MAIN HOOK
// =============================================================================

/**
 * Custom hook for localStorage with state synchronization
 * 
 * @param {string} key - localStorage key
 * @param {*} initialValue - Initial/fallback value
 * @param {Object} options - Configuration options
 * @returns {[*, Function, Function]} - [storedValue, setValue, removeValue]
 */
export const useLocalStorage = (key, initialValue, options = {}) => {
    const {
        serialize = safeJsonStringify,
        deserialize = safeJsonParse,
        syncAcrossTabs = true
    } = options;

    // Get initial value from localStorage or use default
    const [storedValue, setStoredValue] = useState(() => {
        if (typeof window === 'undefined' || !isLocalStorageAvailable()) {
            return initialValue;
        }

        try {
            const item = window.localStorage.getItem(key);
            return item !== null ? deserialize(item, initialValue) : initialValue;
        } catch (error) {
            console.warn(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    });

    // Track if this is the initial render
    const [isInitialized, setIsInitialized] = useState(false);

    /**
     * Set value in state and localStorage
     */
    const setValue = useCallback((value) => {
        try {
            // Allow value to be a function (like useState)
            const valueToStore = value instanceof Function ? value(storedValue) : value;

            // Save to state
            setStoredValue(valueToStore);

            // Save to localStorage
            if (typeof window !== 'undefined' && isLocalStorageAvailable()) {
                const serialized = serialize(valueToStore);
                if (serialized !== null) {
                    window.localStorage.setItem(key, serialized);
                }
            }
        } catch (error) {
            console.error(`Error setting localStorage key "${key}":`, error);
        }
    }, [key, storedValue, serialize]);

    /**
     * Remove value from localStorage
     */
    const removeValue = useCallback(() => {
        try {
            setStoredValue(initialValue);
            if (typeof window !== 'undefined' && isLocalStorageAvailable()) {
                window.localStorage.removeItem(key);
            }
        } catch (error) {
            console.error(`Error removing localStorage key "${key}":`, error);
        }
    }, [key, initialValue]);

    /**
     * Sync with other tabs
     */
    useEffect(() => {
        if (!syncAcrossTabs || typeof window === 'undefined') return;

        const handleStorageChange = (event) => {
            if (event.key === key && event.newValue !== null) {
                try {
                    const newValue = deserialize(event.newValue, initialValue);
                    setStoredValue(newValue);
                } catch (error) {
                    console.warn(`Error syncing localStorage key "${key}":`, error);
                }
            } else if (event.key === key && event.newValue === null) {
                // Key was removed in another tab
                setStoredValue(initialValue);
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [key, initialValue, deserialize, syncAcrossTabs]);

    // Mark as initialized after first render
    useEffect(() => {
        setIsInitialized(true);
    }, []);

    return [storedValue, setValue, removeValue, { isInitialized }];
};

// =============================================================================
// ADDITIONAL HOOKS
// =============================================================================

/**
 * Hook for boolean localStorage values with toggle
 */
export const useLocalStorageBoolean = (key, initialValue = false) => {
    const [value, setValue, removeValue] = useLocalStorage(key, initialValue);

    const toggle = useCallback(() => {
        setValue(prev => !prev);
    }, [setValue]);

    const setTrue = useCallback(() => setValue(true), [setValue]);
    const setFalse = useCallback(() => setValue(false), [setValue]);

    return [value, { toggle, setTrue, setFalse, set: setValue, remove: removeValue }];
};

/**
 * Hook for array localStorage values with array methods
 */
export const useLocalStorageArray = (key, initialValue = []) => {
    const [array, setArray, removeValue] = useLocalStorage(key, initialValue);

    const push = useCallback((item) => {
        setArray(prev => [...prev, item]);
    }, [setArray]);

    const pop = useCallback(() => {
        setArray(prev => prev.slice(0, -1));
    }, [setArray]);

    const filter = useCallback((predicate) => {
        setArray(prev => prev.filter(predicate));
    }, [setArray]);

    const removeAt = useCallback((index) => {
        setArray(prev => prev.filter((_, i) => i !== index));
    }, [setArray]);

    const clear = useCallback(() => {
        setArray([]);
    }, [setArray]);

    return [array, { push, pop, filter, removeAt, clear, set: setArray, remove: removeValue }];
};

/**
 * Hook for object localStorage values with merge capabilities
 */
export const useLocalStorageObject = (key, initialValue = {}) => {
    const [object, setObject, removeValue] = useLocalStorage(key, initialValue);

    const merge = useCallback((updates) => {
        setObject(prev => ({ ...prev, ...updates }));
    }, [setObject]);

    const setKey = useCallback((k, value) => {
        setObject(prev => ({ ...prev, [k]: value }));
    }, [setObject]);

    const removeKey = useCallback((k) => {
        setObject(prev => {
            const { [k]: _, ...rest } = prev;
            return rest;
        });
    }, [setObject]);

    const reset = useCallback(() => {
        setObject(initialValue);
    }, [setObject, initialValue]);

    return [object, { merge, setKey, removeKey, reset, set: setObject, remove: removeValue }];
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get all localStorage keys matching a pattern
 */
export const getLocalStorageKeys = (pattern = null) => {
    if (typeof window === 'undefined' || !isLocalStorageAvailable()) return [];

    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (!pattern || key.includes(pattern))) {
            keys.push(key);
        }
    }
    return keys;
};

/**
 * Clear all localStorage keys matching a pattern
 */
export const clearLocalStoragePattern = (pattern) => {
    if (typeof window === 'undefined' || !isLocalStorageAvailable()) return;

    const keys = getLocalStorageKeys(pattern);
    keys.forEach(key => localStorage.removeItem(key));
};

/**
 * Get localStorage usage info
 */
export const getLocalStorageUsage = () => {
    if (typeof window === 'undefined' || !isLocalStorageAvailable()) {
        return { used: 0, total: 0, percentage: 0 };
    }

    let used = 0;
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
            used += (localStorage.getItem(key)?.length || 0) * 2; // UTF-16
        }
    }

    const total = 5 * 1024 * 1024; // 5MB typical limit
    return {
        used,
        total,
        percentage: (used / total) * 100,
        usedFormatted: `${(used / 1024).toFixed(2)} KB`,
        remainingFormatted: `${((total - used) / 1024).toFixed(2)} KB`
    };
};

// =============================================================================
// DEFAULT EXPORT
// =============================================================================

export default useLocalStorage;
