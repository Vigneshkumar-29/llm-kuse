/**
 * Web Scraping API Service
 * =========================
 * 
 * Provides multiple strategies for fetching web content
 * to overcome client-side CORS limitations.
 * 
 * Strategies:
 * 1. Direct fetch (same-origin only)
 * 2. CORS proxy services
 * 3. Backend API endpoint
 * 4. Browser extension bridge
 * 
 * @version 1.0.0
 */

// =============================================================================
// CONFIGURATION
// =============================================================================

const CONFIG = {
    // Backend API endpoint (set this to your server)
    backendApiUrl: process.env.REACT_APP_SCRAPING_API || '/api/scrape',

    // Public CORS proxies (for development/demo only)
    // In production, use your own proxy or backend
    corsProxies: [
        { name: 'AllOrigins', url: 'https://api.allorigins.win/raw?url=' },
        { name: 'CORS.SH', url: 'https://cors.sh/' },
        { name: 'ThingProxy', url: 'https://thingproxy.freeboard.io/fetch/' }
    ],

    // Request configuration
    timeout: 20000,
    maxRetries: 3,
    retryDelay: 1000,

    // Content limits
    maxContentLength: 100000,

    // User agents for requests
    userAgents: [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0'
    ]
};

// =============================================================================
// FETCH STRATEGIES
// =============================================================================

/**
 * Strategy 1: Direct Fetch (for same-origin or CORS-enabled sites)
 */
const directFetch = async (url, options = {}) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options.timeout || CONFIG.timeout);

    try {
        const response = await fetch(url, {
            method: 'GET',
            signal: controller.signal,
            headers: {
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                ...options.headers
            },
            mode: 'cors',
            credentials: 'omit'
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        return {
            success: true,
            html: await response.text(),
            strategy: 'direct',
            status: response.status
        };
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
};

/**
 * Strategy 2: CORS Proxy Fetch
 */
const proxyFetch = async (url, proxyConfig, options = {}) => {
    const proxyUrl = proxyConfig.url + encodeURIComponent(url);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options.timeout || CONFIG.timeout);

    try {
        const response = await fetch(proxyUrl, {
            method: 'GET',
            signal: controller.signal,
            headers: {
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                ...options.headers
            }
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`Proxy returned HTTP ${response.status}`);
        }

        return {
            success: true,
            html: await response.text(),
            strategy: 'proxy',
            proxyName: proxyConfig.name,
            status: response.status
        };
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
};

/**
 * Strategy 3: Backend API Fetch
 */
const backendFetch = async (url, options = {}) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options.timeout || CONFIG.timeout);

    try {
        const response = await fetch(CONFIG.backendApiUrl, {
            method: 'POST',
            signal: controller.signal,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            body: JSON.stringify({
                url,
                options: {
                    extractContent: true,
                    extractMetadata: true,
                    screenshot: options.screenshot || false,
                    waitForSelector: options.waitForSelector || null,
                    timeout: options.timeout || CONFIG.timeout
                }
            })
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || `Backend returned HTTP ${response.status}`);
        }

        const data = await response.json();

        return {
            success: true,
            html: data.html,
            metadata: data.metadata,
            content: data.content,
            screenshot: data.screenshot,
            strategy: 'backend',
            status: response.status
        };
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
};

/**
 * Strategy 4: Chrome Extension Bridge
 * Communicates with a companion browser extension for content extraction
 */
const extensionFetch = async (url, options = {}) => {
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            reject(new Error('Extension communication timeout'));
        }, options.timeout || CONFIG.timeout);

        // Check if extension is available
        if (!window.webScrapingExtension) {
            clearTimeout(timeout);
            reject(new Error('Browser extension not installed'));
            return;
        }

        // Send message to extension
        window.postMessage({
            type: 'SCRAPING_REQUEST',
            payload: { url, options }
        }, '*');

        // Listen for response
        const handleMessage = (event) => {
            if (event.data.type === 'SCRAPING_RESPONSE' && event.data.url === url) {
                clearTimeout(timeout);
                window.removeEventListener('message', handleMessage);

                if (event.data.success) {
                    resolve({
                        success: true,
                        html: event.data.html,
                        strategy: 'extension',
                        status: 200
                    });
                } else {
                    reject(new Error(event.data.error || 'Extension fetch failed'));
                }
            }
        };

        window.addEventListener('message', handleMessage);
    });
};

// =============================================================================
// MAIN SCRAPING SERVICE
// =============================================================================

export const WebScrapingAPI = {
    /**
     * Configuration
     */
    config: CONFIG,

    /**
     * Update configuration
     */
    configure(options) {
        Object.assign(CONFIG, options);
    },

    /**
     * Set backend API URL
     */
    setBackendUrl(url) {
        CONFIG.backendApiUrl = url;
    },

    /**
     * Fetch URL with automatic strategy selection
     */
    async fetch(url, options = {}) {
        const {
            strategies = ['backend', 'proxy', 'direct'],
            onStrategyChange = null,
            ...fetchOptions
        } = options;

        const errors = [];

        for (const strategy of strategies) {
            try {
                if (onStrategyChange) {
                    onStrategyChange(strategy);
                }

                let result;

                switch (strategy) {
                    case 'direct':
                        result = await directFetch(url, fetchOptions);
                        break;

                    case 'proxy':
                        // Try each proxy in order
                        for (const proxy of CONFIG.corsProxies) {
                            try {
                                result = await proxyFetch(url, proxy, fetchOptions);
                                break;
                            } catch (proxyError) {
                                errors.push(`${proxy.name}: ${proxyError.message}`);
                            }
                        }
                        if (!result) {
                            throw new Error('All proxies failed');
                        }
                        break;

                    case 'backend':
                        result = await backendFetch(url, fetchOptions);
                        break;

                    case 'extension':
                        result = await extensionFetch(url, fetchOptions);
                        break;

                    default:
                        throw new Error(`Unknown strategy: ${strategy}`);
                }

                if (result && result.success) {
                    return {
                        ...result,
                        url,
                        fetchedAt: new Date().toISOString()
                    };
                }
            } catch (error) {
                errors.push(`${strategy}: ${error.message}`);
            }
        }

        return {
            success: false,
            url,
            errors,
            message: 'All fetch strategies failed'
        };
    },

    /**
     * Fetch with retry logic
     */
    async fetchWithRetry(url, options = {}) {
        const maxRetries = options.maxRetries || CONFIG.maxRetries;
        const retryDelay = options.retryDelay || CONFIG.retryDelay;

        let lastError;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const result = await this.fetch(url, options);
                if (result.success) {
                    return result;
                }
                lastError = new Error(result.message);
            } catch (error) {
                lastError = error;
            }

            if (attempt < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
            }
        }

        return {
            success: false,
            url,
            error: lastError?.message || 'Max retries exceeded'
        };
    },

    /**
     * Batch fetch multiple URLs
     */
    async batchFetch(urls, options = {}) {
        const {
            concurrency = 3,
            onProgress = null,
            ...fetchOptions
        } = options;

        const results = [];
        const total = urls.length;

        for (let i = 0; i < urls.length; i += concurrency) {
            const batch = urls.slice(i, i + concurrency);
            const batchResults = await Promise.all(
                batch.map(url => this.fetch(url, fetchOptions))
            );

            results.push(...batchResults);

            if (onProgress) {
                onProgress({
                    completed: Math.min(i + concurrency, total),
                    total,
                    percentage: Math.round((Math.min(i + concurrency, total) / total) * 100),
                    results: batchResults
                });
            }
        }

        return results;
    },

    /**
     * Check which strategies are available
     */
    async checkAvailableStrategies() {
        const available = [];

        // Check direct (always available but may not work due to CORS)
        available.push({ strategy: 'direct', available: true, note: 'Limited by CORS' });

        // Check proxies
        for (const proxy of CONFIG.corsProxies) {
            try {
                const response = await fetch(proxy.url + encodeURIComponent('https://example.com'), {
                    method: 'HEAD',
                    signal: AbortSignal.timeout(5000)
                });
                available.push({
                    strategy: 'proxy',
                    name: proxy.name,
                    available: response.ok
                });
            } catch {
                available.push({
                    strategy: 'proxy',
                    name: proxy.name,
                    available: false
                });
            }
        }

        // Check backend
        try {
            const response = await fetch(CONFIG.backendApiUrl.replace('/scrape', '/health'), {
                method: 'GET',
                signal: AbortSignal.timeout(5000)
            });
            available.push({
                strategy: 'backend',
                available: response.ok,
                url: CONFIG.backendApiUrl
            });
        } catch {
            available.push({
                strategy: 'backend',
                available: false,
                url: CONFIG.backendApiUrl
            });
        }

        // Check extension
        available.push({
            strategy: 'extension',
            available: !!window.webScrapingExtension
        });

        return available;
    },

    /**
     * Get random user agent
     */
    getRandomUserAgent() {
        return CONFIG.userAgents[Math.floor(Math.random() * CONFIG.userAgents.length)];
    }
};

// =============================================================================
// BACKEND API SPECIFICATION (for implementation reference)
// =============================================================================

/**
 * Backend API Specification
 * 
 * Implement this API on your server (Node.js, Python, etc.)
 * 
 * POST /api/scrape
 * 
 * Request Body:
 * {
 *   "url": "https://example.com",
 *   "options": {
 *     "extractContent": true,
 *     "extractMetadata": true,
 *     "screenshot": false,
 *     "waitForSelector": null,
 *     "timeout": 20000
 *   }
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "url": "https://example.com",
 *   "html": "<html>...</html>",
 *   "content": {
 *     "text": "...",
 *     "wordCount": 1234
 *   },
 *   "metadata": {
 *     "title": "Example",
 *     "description": "..."
 *   },
 *   "screenshot": "base64..."  // if requested
 * }
 * 
 * GET /api/scrape/health
 * Returns: { "status": "ok" }
 */

export const BACKEND_API_SPEC = {
    endpoint: '/api/scrape',
    method: 'POST',
    requestBody: {
        url: 'string (required)',
        options: {
            extractContent: 'boolean',
            extractMetadata: 'boolean',
            screenshot: 'boolean',
            waitForSelector: 'string (CSS selector)',
            timeout: 'number (ms)'
        }
    },
    response: {
        success: 'boolean',
        url: 'string',
        html: 'string',
        content: 'object',
        metadata: 'object',
        screenshot: 'string (base64)'
    }
};

export default WebScrapingAPI;
