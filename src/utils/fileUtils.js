/**
 * File Utilities
 * ===============
 * 
 * Common file handling utilities used across the application.
 * 
 * @version 1.0.0
 */

// =============================================================================
// FILE SIZE UTILITIES
// =============================================================================

/**
 * Format bytes into human-readable file size
 * @param {number} bytes - File size in bytes
 * @param {number} decimals - Number of decimal places
 * @returns {string} - Formatted file size
 */
export const formatFileSize = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    if (!bytes || isNaN(bytes)) return 'Unknown';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

/**
 * Parse file size string to bytes
 * @param {string} sizeStr - Size string like "2.5 MB"
 * @returns {number} - Size in bytes
 */
export const parseFileSize = (sizeStr) => {
    const units = {
        'bytes': 1,
        'kb': 1024,
        'mb': 1024 * 1024,
        'gb': 1024 * 1024 * 1024,
        'tb': 1024 * 1024 * 1024 * 1024
    };

    const match = sizeStr.toLowerCase().match(/^([\d.]+)\s*(\w+)$/);
    if (!match) return 0;

    const [, value, unit] = match;
    return parseFloat(value) * (units[unit] || 1);
};

// =============================================================================
// FILE TYPE UTILITIES
// =============================================================================

/**
 * Get file extension from filename
 * @param {string} filename - File name
 * @returns {string} - Extension without dot
 */
export const getFileExtension = (filename) => {
    if (!filename) return '';
    const parts = filename.split('.');
    return parts.length > 1 ? parts.pop().toLowerCase() : '';
};

/**
 * Get file name without extension
 * @param {string} filename - File name
 * @returns {string} - Name without extension
 */
export const getFileNameWithoutExtension = (filename) => {
    if (!filename) return '';
    const lastDotIndex = filename.lastIndexOf('.');
    return lastDotIndex !== -1 ? filename.substring(0, lastDotIndex) : filename;
};

/**
 * Check if file type is supported
 * @param {string} mimeType - MIME type
 * @returns {boolean}
 */
export const isSupportedFileType = (mimeType) => {
    const supportedTypes = [
        'application/pdf',
        'text/plain',
        'text/csv',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'image/png',
        'image/jpeg',
        'image/jpg',
        'image/gif',
        'image/webp'
    ];
    return supportedTypes.includes(mimeType);
};

/**
 * Get file category from MIME type
 * @param {string} mimeType - MIME type
 * @returns {string} - Category: document, spreadsheet, image, text, unknown
 */
export const getFileCategory = (mimeType) => {
    if (!mimeType) return 'unknown';

    if (mimeType.includes('pdf') || mimeType.includes('word')) return 'document';
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel') || mimeType.includes('csv')) return 'spreadsheet';
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('text/')) return 'text';
    if (mimeType.includes('video/')) return 'video';
    if (mimeType.includes('audio/')) return 'audio';

    return 'unknown';
};

/**
 * Get icon name for file type
 * @param {string} mimeType - MIME type
 * @returns {string} - Lucide icon name
 */
export const getFileIcon = (mimeType) => {
    const category = getFileCategory(mimeType);
    const iconMap = {
        document: 'FileText',
        spreadsheet: 'FileSpreadsheet',
        image: 'Image',
        text: 'FileCode',
        video: 'Video',
        audio: 'Music',
        unknown: 'File'
    };
    return iconMap[category] || 'File';
};

// =============================================================================
// FILE VALIDATION
// =============================================================================

/**
 * Validate file size
 * @param {File} file - File object
 * @param {number} maxSizeMB - Maximum size in MB
 * @returns {Object} - { valid: boolean, error?: string }
 */
export const validateFileSize = (file, maxSizeMB = 25) => {
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
        return {
            valid: false,
            error: `File size (${formatFileSize(file.size)}) exceeds maximum allowed size (${maxSizeMB} MB)`
        };
    }
    return { valid: true };
};

/**
 * Validate file type
 * @param {File} file - File object
 * @param {string[]} allowedTypes - Array of allowed MIME types
 * @returns {Object} - { valid: boolean, error?: string }
 */
export const validateFileType = (file, allowedTypes = null) => {
    const types = allowedTypes || [
        'application/pdf',
        'text/plain',
        'text/csv',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'image/png',
        'image/jpeg'
    ];

    if (!types.includes(file.type)) {
        return {
            valid: false,
            error: `File type "${file.type || 'unknown'}" is not supported`
        };
    }
    return { valid: true };
};

/**
 * Full file validation
 * @param {File} file - File object
 * @param {Object} options - Validation options
 * @returns {Object} - { valid: boolean, errors: string[] }
 */
export const validateFile = (file, options = {}) => {
    const { maxSizeMB = 25, allowedTypes = null } = options;
    const errors = [];

    const sizeValidation = validateFileSize(file, maxSizeMB);
    if (!sizeValidation.valid) errors.push(sizeValidation.error);

    const typeValidation = validateFileType(file, allowedTypes);
    if (!typeValidation.valid) errors.push(typeValidation.error);

    return {
        valid: errors.length === 0,
        errors
    };
};

// =============================================================================
// FILE READING UTILITIES
// =============================================================================

/**
 * Read file as text
 * @param {File} file - File object
 * @returns {Promise<string>}
 */
export const readFileAsText = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Failed to read file as text'));
        reader.readAsText(file);
    });
};

/**
 * Read file as Data URL
 * @param {File} file - File object
 * @returns {Promise<string>}
 */
export const readFileAsDataURL = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Failed to read file as Data URL'));
        reader.readAsDataURL(file);
    });
};

/**
 * Read file as ArrayBuffer
 * @param {File} file - File object
 * @returns {Promise<ArrayBuffer>}
 */
export const readFileAsArrayBuffer = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Failed to read file as ArrayBuffer'));
        reader.readAsArrayBuffer(file);
    });
};

// =============================================================================
// FILE DOWNLOAD UTILITIES
// =============================================================================

/**
 * Trigger file download from Blob
 * @param {Blob} blob - Blob data
 * @param {string} filename - Download filename
 */
export const downloadBlob = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
};

/**
 * Download text content as file
 * @param {string} content - Text content
 * @param {string} filename - Download filename
 * @param {string} mimeType - MIME type
 */
export const downloadTextFile = (content, filename, mimeType = 'text/plain') => {
    const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
    downloadBlob(blob, filename);
};

/**
 * Download JSON as file
 * @param {Object} data - JSON data
 * @param {string} filename - Download filename
 */
export const downloadJSON = (data, filename) => {
    const content = JSON.stringify(data, null, 2);
    downloadTextFile(content, filename, 'application/json');
};

// =============================================================================
// UNIQUE ID GENERATION
// =============================================================================

/**
 * Generate unique file ID
 * @param {string} prefix - Optional prefix
 * @returns {string}
 */
export const generateFileId = (prefix = 'file') => {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// =============================================================================
// DEFAULT EXPORT
// =============================================================================

export default {
    formatFileSize,
    parseFileSize,
    getFileExtension,
    getFileNameWithoutExtension,
    isSupportedFileType,
    getFileCategory,
    getFileIcon,
    validateFileSize,
    validateFileType,
    validateFile,
    readFileAsText,
    readFileAsDataURL,
    readFileAsArrayBuffer,
    downloadBlob,
    downloadTextFile,
    downloadJSON,
    generateFileId
};
