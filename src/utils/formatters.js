/**
 * Formatters Utility Module
 * =========================
 * 
 * Common formatting utilities for dates, text, numbers, and more.
 * 
 * @version 1.0.0
 */

import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns';

// =============================================================================
// DATE FORMATTERS
// =============================================================================

/**
 * Format date to readable string
 * @param {Date|string} date - Date to format
 * @param {string} formatStr - Format string (date-fns format)
 * @returns {string}
 */
export const formatDate = (date, formatStr = 'MMM d, yyyy') => {
    if (!date) return '';

    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return '';

    return format(dateObj, formatStr);
};

/**
 * Format date with time
 * @param {Date|string} date - Date to format
 * @returns {string}
 */
export const formatDateTime = (date) => {
    return formatDate(date, 'MMM d, yyyy h:mm a');
};

/**
 * Format date as relative time (e.g., "2 hours ago")
 * @param {Date|string} date - Date to format
 * @returns {string}
 */
export const formatRelativeTime = (date) => {
    if (!date) return '';

    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return '';

    return formatDistanceToNow(dateObj, { addSuffix: true });
};

/**
 * Format date for display (smart - recent dates show relative, older show date)
 * @param {Date|string} date - Date to format
 * @returns {string}
 */
export const formatSmartDate = (date) => {
    if (!date) return '';

    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return '';

    const now = new Date();
    const diffDays = Math.floor((now - dateObj) / (1000 * 60 * 60 * 24));

    if (diffDays < 1) {
        return formatRelativeTime(dateObj);
    } else if (diffDays < 7) {
        return format(dateObj, 'EEEE'); // Day name
    } else if (diffDays < 365) {
        return format(dateObj, 'MMM d');
    } else {
        return format(dateObj, 'MMM d, yyyy');
    }
};

/**
 * Format ISO date string
 * @param {Date} date - Date to format
 * @returns {string}
 */
export const toISOString = (date) => {
    if (!date) return new Date().toISOString();
    return date instanceof Date ? date.toISOString() : date;
};

// =============================================================================
// NUMBER FORMATTERS
// =============================================================================

/**
 * Format number with commas
 * @param {number} num - Number to format
 * @returns {string}
 */
export const formatNumber = (num) => {
    if (num === null || num === undefined || isNaN(num)) return '0';
    return num.toLocaleString();
};

/**
 * Format number as compact (e.g., 1K, 1M)
 * @param {number} num - Number to format
 * @param {number} decimals - Decimal places
 * @returns {string}
 */
export const formatCompactNumber = (num, decimals = 1) => {
    if (num === null || num === undefined || isNaN(num)) return '0';

    if (num < 1000) return num.toString();
    if (num < 1000000) return `${(num / 1000).toFixed(decimals)}K`;
    if (num < 1000000000) return `${(num / 1000000).toFixed(decimals)}M`;
    return `${(num / 1000000000).toFixed(decimals)}B`;
};

/**
 * Format as percentage
 * @param {number} value - Value to format
 * @param {number} decimals - Decimal places
 * @returns {string}
 */
export const formatPercentage = (value, decimals = 1) => {
    if (value === null || value === undefined || isNaN(value)) return '0%';
    return `${value.toFixed(decimals)}%`;
};

/**
 * Format currency
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code
 * @param {string} locale - Locale string
 * @returns {string}
 */
export const formatCurrency = (amount, currency = 'USD', locale = 'en-US') => {
    if (amount === null || amount === undefined || isNaN(amount)) return '$0.00';

    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency
    }).format(amount);
};

// =============================================================================
// TEXT FORMATTERS
// =============================================================================

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @param {string} suffix - Suffix to add
 * @returns {string}
 */
export const truncateText = (text, maxLength = 100, suffix = '...') => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - suffix.length).trim() + suffix;
};

/**
 * Capitalize first letter
 * @param {string} text - Text to capitalize
 * @returns {string}
 */
export const capitalize = (text) => {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1);
};

/**
 * Capitalize each word
 * @param {string} text - Text to capitalize
 * @returns {string}
 */
export const capitalizeWords = (text) => {
    if (!text) return '';
    return text.split(' ').map(word => capitalize(word)).join(' ');
};

/**
 * Convert to slug (URL-friendly string)
 * @param {string} text - Text to convert
 * @returns {string}
 */
export const toSlug = (text) => {
    if (!text) return '';
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
};

/**
 * Convert camelCase to Title Case
 * @param {string} text - Text to convert
 * @returns {string}
 */
export const camelToTitle = (text) => {
    if (!text) return '';
    return text
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .trim();
};

/**
 * Strip HTML tags from string
 * @param {string} html - HTML string
 * @returns {string}
 */
export const stripHtml = (html) => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '');
};

/**
 * Strip Markdown formatting
 * @param {string} markdown - Markdown string
 * @returns {string}
 */
export const stripMarkdown = (markdown) => {
    if (!markdown) return '';
    return markdown
        .replace(/^#{1,6}\s/gm, '')
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/\[(.*?)\]\(.*?\)/g, '$1')
        .replace(/^> (.*$)/gm, '$1')
        .replace(/`{1,3}(.*?)`{1,3}/gs, '$1')
        .replace(/^- /gm, '• ')
        .replace(/^---$/gm, '')
        .trim();
};

/**
 * Highlight search term in text
 * @param {string} text - Text to search in
 * @param {string} term - Search term
 * @param {string} highlightClass - CSS class for highlight
 * @returns {string} - HTML string with highlights
 */
export const highlightText = (text, term, highlightClass = 'bg-yellow-200') => {
    if (!text || !term) return text;
    const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, `<mark class="${highlightClass}">$1</mark>`);
};

// =============================================================================
// WORD / CHARACTER COUNT
// =============================================================================

/**
 * Count words in text
 * @param {string} text - Text to count
 * @returns {number}
 */
export const countWords = (text) => {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
};

/**
 * Count characters in text
 * @param {string} text - Text to count
 * @param {boolean} includeSpaces - Include spaces in count
 * @returns {number}
 */
export const countCharacters = (text, includeSpaces = true) => {
    if (!text) return 0;
    return includeSpaces ? text.length : text.replace(/\s/g, '').length;
};

/**
 * Estimate reading time
 * @param {string} text - Text to estimate
 * @param {number} wordsPerMinute - Reading speed
 * @returns {string}
 */
export const estimateReadingTime = (text, wordsPerMinute = 200) => {
    const words = countWords(text);
    const minutes = Math.ceil(words / wordsPerMinute);

    if (minutes < 1) return 'Less than a minute';
    if (minutes === 1) return '1 minute read';
    return `${minutes} minute read`;
};

// =============================================================================
// PLURALIZATION
// =============================================================================

/**
 * Pluralize word based on count
 * @param {number} count - Count
 * @param {string} singular - Singular form
 * @param {string} plural - Plural form (optional, defaults to singular + 's')
 * @returns {string}
 */
export const pluralize = (count, singular, plural = null) => {
    const word = count === 1 ? singular : (plural || `${singular}s`);
    return `${count} ${word}`;
};

// =============================================================================
// DEFAULT EXPORT
// =============================================================================

export default {
    // Date formatters
    formatDate,
    formatDateTime,
    formatRelativeTime,
    formatSmartDate,
    toISOString,

    // Number formatters
    formatNumber,
    formatCompactNumber,
    formatPercentage,
    formatCurrency,

    // Text formatters
    truncateText,
    capitalize,
    capitalizeWords,
    toSlug,
    camelToTitle,
    stripHtml,
    stripMarkdown,
    highlightText,

    // Counting
    countWords,
    countCharacters,
    estimateReadingTime,

    // Pluralization
    pluralize
};
