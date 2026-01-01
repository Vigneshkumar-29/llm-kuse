/**
 * URL Processor Service
 * ======================
 * 
 * Handles fetching, parsing, and extracting content from web URLs.
 * Provides utilities for content extraction, summarization, and knowledge base integration.
 * 
 * Note: Due to CORS restrictions, direct fetching from browser is limited.
 * For production, implement a backend proxy or use a service like:
 * - AllOrigins
 * - CORS Anywhere (self-hosted)
 * - Your own backend endpoint
 * 
 * @version 1.0.0
 */

// =============================================================================
// CONFIGURATION
// =============================================================================

const CONFIG = {
    // Proxy URL for bypassing CORS (use your own in production)
    // Options: 'https://api.allorigins.win/raw?url=' or your backend
    proxyUrl: 'https://api.allorigins.win/raw?url=',

    // Maximum content length to process
    maxContentLength: 50000,

    // Request timeout in ms
    timeout: 15000,

    // User agent for requests
    userAgent: 'Mozilla/5.0 (compatible; URLProcessor/1.0)'
};

// =============================================================================
// URL VALIDATION & PARSING
// =============================================================================

/**
 * Validate if a string is a valid URL
 */
export const isValidUrl = (string) => {
    try {
        const url = new URL(string);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
        return false;
    }
};

/**
 * Normalize URL (add protocol if missing)
 */
export const normalizeUrl = (url) => {
    if (!url) return null;

    let normalized = url.trim();

    // Add protocol if missing
    if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
        normalized = 'https://' + normalized;
    }

    try {
        const parsed = new URL(normalized);
        return parsed.href;
    } catch {
        return null;
    }
};

/**
 * Extract domain from URL
 */
export const extractDomain = (url) => {
    try {
        const parsed = new URL(url);
        return parsed.hostname;
    } catch {
        return null;
    }
};

/**
 * Get URL metadata
 */
export const getUrlMetadata = (url) => {
    try {
        const parsed = new URL(url);
        return {
            href: parsed.href,
            protocol: parsed.protocol,
            hostname: parsed.hostname,
            pathname: parsed.pathname,
            search: parsed.search,
            hash: parsed.hash,
            origin: parsed.origin
        };
    } catch {
        return null;
    }
};

// =============================================================================
// CONTENT FETCHING
// =============================================================================

/**
 * Fetch URL content with proxy support
 */
export const fetchUrlContent = async (url, options = {}) => {
    const {
        useProxy = true,
        timeout = CONFIG.timeout,
        proxyUrl = CONFIG.proxyUrl
    } = options;

    const targetUrl = useProxy ? `${proxyUrl}${encodeURIComponent(url)}` : url;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(targetUrl, {
            method: 'GET',
            signal: controller.signal,
            headers: {
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
            }
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type') || '';
        const html = await response.text();

        return {
            success: true,
            html,
            contentType,
            url,
            fetchedAt: new Date().toISOString()
        };
    } catch (error) {
        clearTimeout(timeoutId);

        if (error.name === 'AbortError') {
            return { success: false, error: 'Request timeout', url };
        }

        return { success: false, error: error.message, url };
    }
};

// =============================================================================
// HTML PARSING & CONTENT EXTRACTION
// =============================================================================

/**
 * Parse HTML string into DOM
 */
export const parseHTML = (html) => {
    const parser = new DOMParser();
    return parser.parseFromString(html, 'text/html');
};

/**
 * Remove unwanted elements from DOM
 */
export const removeUnwantedElements = (doc) => {
    // Elements to remove
    const selectorsToRemove = [
        'script', 'style', 'noscript', 'iframe', 'svg',
        'nav', 'header', 'footer', 'aside',
        '[role="navigation"]', '[role="banner"]', '[role="contentinfo"]',
        '.nav', '.navbar', '.navigation', '.menu', '.sidebar',
        '.header', '.footer', '.ad', '.ads', '.advertisement',
        '.social', '.share', '.comments', '.comment-section',
        '.cookie', '.popup', '.modal', '.overlay',
        '#nav', '#navbar', '#navigation', '#menu', '#sidebar',
        '#header', '#footer', '#comments', '#ad', '#ads'
    ];

    selectorsToRemove.forEach(selector => {
        try {
            doc.querySelectorAll(selector).forEach(el => el.remove());
        } catch (e) {
            // Invalid selector, skip
        }
    });

    return doc;
};

/**
 * Extract metadata from HTML document
 */
export const extractMetadata = (doc) => {
    const getMetaContent = (name) => {
        const meta = doc.querySelector(`meta[name="${name}"], meta[property="${name}"], meta[property="og:${name}"]`);
        return meta ? meta.getAttribute('content') : null;
    };

    return {
        title: doc.title || getMetaContent('title') || getMetaContent('og:title'),
        description: getMetaContent('description') || getMetaContent('og:description'),
        author: getMetaContent('author'),
        keywords: getMetaContent('keywords'),
        image: getMetaContent('og:image') || getMetaContent('twitter:image'),
        siteName: getMetaContent('og:site_name'),
        type: getMetaContent('og:type'),
        publishedTime: getMetaContent('article:published_time'),
        modifiedTime: getMetaContent('article:modified_time')
    };
};

/**
 * Extract main content from article-like pages
 */
export const extractMainContent = (doc) => {
    // Priority selectors for main content
    const contentSelectors = [
        'article',
        '[role="main"]',
        'main',
        '.post-content',
        '.article-content',
        '.entry-content',
        '.content',
        '.post',
        '.article',
        '#content',
        '#main',
        '#article'
    ];

    let contentElement = null;

    // Try each selector
    for (const selector of contentSelectors) {
        const element = doc.querySelector(selector);
        if (element && element.textContent.trim().length > 200) {
            contentElement = element;
            break;
        }
    }

    // Fallback to body if no main content found
    if (!contentElement) {
        contentElement = doc.body;
    }

    return contentElement;
};

/**
 * Clean and extract text from element
 */
export const extractText = (element) => {
    if (!element) return '';

    // Clone to avoid modifying original
    const clone = element.cloneNode(true);

    // Get text content
    let text = clone.textContent || clone.innerText || '';

    // Clean up whitespace
    text = text
        .replace(/\s+/g, ' ')           // Multiple spaces to single
        .replace(/\n\s*\n/g, '\n\n')    // Multiple newlines to double
        .replace(/^\s+|\s+$/gm, '')     // Trim lines
        .trim();

    return text;
};

/**
 * Extract structured content (headings, paragraphs, lists)
 */
export const extractStructuredContent = (element) => {
    if (!element) return { headings: [], paragraphs: [], lists: [], links: [] };

    const headings = [];
    const paragraphs = [];
    const lists = [];
    const links = [];

    // Extract headings
    element.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(h => {
        const text = h.textContent.trim();
        if (text) {
            headings.push({
                level: parseInt(h.tagName[1]),
                text
            });
        }
    });

    // Extract paragraphs
    element.querySelectorAll('p').forEach(p => {
        const text = p.textContent.trim();
        if (text && text.length > 20) {
            paragraphs.push(text);
        }
    });

    // Extract lists
    element.querySelectorAll('ul, ol').forEach(list => {
        const items = [];
        list.querySelectorAll('li').forEach(li => {
            const text = li.textContent.trim();
            if (text) items.push(text);
        });
        if (items.length > 0) {
            lists.push({
                type: list.tagName.toLowerCase(),
                items
            });
        }
    });

    // Extract links
    element.querySelectorAll('a[href]').forEach(a => {
        const text = a.textContent.trim();
        const href = a.getAttribute('href');
        if (text && href && !href.startsWith('#') && !href.startsWith('javascript:')) {
            links.push({ text, href });
        }
    });

    return { headings, paragraphs, lists, links };
};

// =============================================================================
// MAIN EXTRACTION FUNCTION
// =============================================================================

/**
 * Full URL content extraction pipeline
 */
export const extractUrlContent = async (url, options = {}) => {
    // Validate URL
    const normalizedUrl = normalizeUrl(url);
    if (!normalizedUrl) {
        return { success: false, error: 'Invalid URL' };
    }

    // Fetch content
    const fetchResult = await fetchUrlContent(normalizedUrl, options);
    if (!fetchResult.success) {
        return fetchResult;
    }

    try {
        // Parse HTML
        const doc = parseHTML(fetchResult.html);

        // Remove unwanted elements
        removeUnwantedElements(doc);

        // Extract metadata
        const metadata = extractMetadata(doc);

        // Extract main content
        const contentElement = extractMainContent(doc);

        // Extract text
        const plainText = extractText(contentElement);

        // Extract structured content
        const structured = extractStructuredContent(contentElement);

        // Limit content length
        const truncatedText = plainText.slice(0, CONFIG.maxContentLength);

        return {
            success: true,
            url: normalizedUrl,
            metadata,
            content: {
                text: truncatedText,
                wordCount: truncatedText.split(/\s+/).length,
                charCount: truncatedText.length,
                truncated: plainText.length > CONFIG.maxContentLength
            },
            structured,
            extractedAt: new Date().toISOString()
        };
    } catch (error) {
        return { success: false, error: `Parsing error: ${error.message}`, url: normalizedUrl };
    }
};

// =============================================================================
// SUMMARY GENERATION
// =============================================================================

/**
 * Generate AI prompt for URL content summarization
 */
export const generateSummaryPrompt = (extractedContent, options = {}) => {
    const { summaryLength = 'medium', focus = 'general' } = options;

    const lengthGuide = {
        short: '50-100 words',
        medium: '150-250 words',
        long: '300-500 words'
    };

    return `Summarize the following webpage content.

## Source Information
- **Title:** ${extractedContent.metadata?.title || 'Unknown'}
- **URL:** ${extractedContent.url}
- **Word Count:** ${extractedContent.content?.wordCount || 'Unknown'}

## Content
${extractedContent.content?.text || 'No content available'}

## Instructions
1. Create a ${lengthGuide[summaryLength] || lengthGuide.medium} summary
2. Focus on: ${focus}
3. Highlight key points and takeaways
4. Maintain the original meaning and context
5. Use clear, concise language

${extractedContent.structured?.headings?.length > 0 ? `
## Main Sections Identified
${extractedContent.structured.headings.map(h => `${'#'.repeat(h.level)} ${h.text}`).join('\n')}
` : ''}

Please provide the summary:`;
};

/**
 * Generate key points extraction prompt
 */
export const generateKeyPointsPrompt = (extractedContent) => {
    return `Extract the key points from this webpage:

## Source
- **Title:** ${extractedContent.metadata?.title || 'Unknown'}
- **URL:** ${extractedContent.url}

## Content
${extractedContent.content?.text || 'No content available'}

## Instructions
1. Extract 5-10 main points
2. Each point should be 1-2 sentences
3. Focus on facts, insights, and actionable information
4. Order by importance
5. Include any statistics or data mentioned

List the key points:`;
};

// =============================================================================
// KNOWLEDGE BASE INTEGRATION
// =============================================================================

/**
 * Format extracted content for knowledge base storage
 */
export const formatForKnowledgeBase = (extractedContent) => {
    return {
        id: `url_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'webpage',
        source: {
            url: extractedContent.url,
            domain: extractDomain(extractedContent.url),
            title: extractedContent.metadata?.title,
            description: extractedContent.metadata?.description,
            author: extractedContent.metadata?.author,
            image: extractedContent.metadata?.image
        },
        content: {
            text: extractedContent.content?.text,
            wordCount: extractedContent.content?.wordCount,
            headings: extractedContent.structured?.headings,
            summary: null // To be filled after AI processing
        },
        metadata: {
            extractedAt: extractedContent.extractedAt,
            addedAt: new Date().toISOString()
        },
        tags: [],
        notes: ''
    };
};

/**
 * Create knowledge base entry with summary
 */
export const createKnowledgeEntry = async (url, aiSummaryFunction = null) => {
    // Extract content
    const extracted = await extractUrlContent(url);

    if (!extracted.success) {
        return { success: false, error: extracted.error };
    }

    // Format for knowledge base
    const entry = formatForKnowledgeBase(extracted);

    // Generate summary if AI function provided
    if (aiSummaryFunction) {
        const summaryPrompt = generateSummaryPrompt(extracted);
        try {
            const summary = await aiSummaryFunction(summaryPrompt);
            entry.content.summary = summary;
        } catch (error) {
            console.error('Summary generation failed:', error);
        }
    }

    return { success: true, entry };
};

// =============================================================================
// BATCH PROCESSING
// =============================================================================

/**
 * Process multiple URLs
 */
export const processMultipleUrls = async (urls, options = {}) => {
    const {
        concurrency = 3,
        onProgress = null
    } = options;

    const results = [];
    const total = urls.length;

    for (let i = 0; i < urls.length; i += concurrency) {
        const batch = urls.slice(i, i + concurrency);
        const batchResults = await Promise.all(
            batch.map(url => extractUrlContent(url))
        );

        results.push(...batchResults);

        if (onProgress) {
            onProgress({
                completed: Math.min(i + concurrency, total),
                total,
                percentage: Math.round((Math.min(i + concurrency, total) / total) * 100)
            });
        }
    }

    return results;
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Estimate reading time
 */
export const estimateReadingTime = (wordCount, wpm = 200) => {
    const minutes = Math.ceil(wordCount / wpm);
    return {
        minutes,
        formatted: minutes === 1 ? '1 min read' : `${minutes} min read`
    };
};

/**
 * Detect content type/category
 */
export const detectContentType = (extractedContent) => {
    const url = extractedContent.url?.toLowerCase() || '';
    const title = extractedContent.metadata?.title?.toLowerCase() || '';
    const text = extractedContent.content?.text?.toLowerCase() || '';

    // Check URL patterns
    if (url.includes('/blog/') || url.includes('/article/') || url.includes('/post/')) {
        return 'article';
    }
    if (url.includes('/docs/') || url.includes('/documentation/')) {
        return 'documentation';
    }
    if (url.includes('/product/') || url.includes('/shop/')) {
        return 'product';
    }
    if (url.includes('github.com') || url.includes('gitlab.com')) {
        return 'repository';
    }
    if (url.includes('stackoverflow.com') || url.includes('stackexchange.com')) {
        return 'qa';
    }

    // Check content patterns
    if (text.includes('how to') || text.includes('tutorial') || text.includes('guide')) {
        return 'tutorial';
    }
    if (text.includes('news') || text.includes('breaking') || text.includes('announced')) {
        return 'news';
    }

    return 'webpage';
};

// =============================================================================
// DEFAULT EXPORT
// =============================================================================

export const URLProcessor = {
    // Validation
    isValidUrl,
    normalizeUrl,
    extractDomain,
    getUrlMetadata,

    // Fetching
    fetchUrlContent,

    // Parsing
    parseHTML,
    removeUnwantedElements,
    extractMetadata,
    extractMainContent,
    extractText,
    extractStructuredContent,

    // Main extraction
    extractUrlContent,

    // AI Integration
    generateSummaryPrompt,
    generateKeyPointsPrompt,

    // Knowledge Base
    formatForKnowledgeBase,
    createKnowledgeEntry,

    // Batch Processing
    processMultipleUrls,

    // Utilities
    estimateReadingTime,
    detectContentType
};

export default URLProcessor;
