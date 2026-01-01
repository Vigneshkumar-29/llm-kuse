/**
 * Web Scraping Backend Server
 * ============================
 * 
 * Simple Express server that provides URL scraping capabilities.
 * This bypasses CORS restrictions by fetching content server-side.
 * 
 * Dependencies:
 * npm install express cors axios cheerio puppeteer
 * 
 * Usage:
 * node server/scraping-server.js
 * 
 * @version 1.0.0
 */

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
// const puppeteer = require('puppeteer'); // Uncomment for dynamic content

const app = express();
const PORT = process.env.SCRAPING_PORT || 3001;

// =============================================================================
// MIDDLEWARE
// =============================================================================

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// =============================================================================
// USER AGENTS
// =============================================================================

const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0'
];

const getRandomUserAgent = () => USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

// =============================================================================
// CONTENT EXTRACTION HELPERS
// =============================================================================

/**
 * Extract metadata from HTML
 */
const extractMetadata = ($) => {
    const getMeta = (name) => {
        return $(`meta[name="${name}"]`).attr('content') ||
            $(`meta[property="${name}"]`).attr('content') ||
            $(`meta[property="og:${name}"]`).attr('content') ||
            null;
    };

    return {
        title: $('title').text() || getMeta('title') || getMeta('og:title'),
        description: getMeta('description') || getMeta('og:description'),
        author: getMeta('author'),
        keywords: getMeta('keywords'),
        image: getMeta('og:image') || getMeta('twitter:image'),
        siteName: getMeta('og:site_name'),
        type: getMeta('og:type'),
        publishedTime: getMeta('article:published_time'),
        modifiedTime: getMeta('article:modified_time'),
        canonical: $('link[rel="canonical"]').attr('href')
    };
};

/**
 * Remove unwanted elements
 */
const removeUnwantedElements = ($) => {
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
            $(selector).remove();
        } catch (e) {
            // Invalid selector, skip
        }
    });
};

/**
 * Extract main content
 */
const extractMainContent = ($) => {
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

    for (const selector of contentSelectors) {
        const element = $(selector);
        if (element.length && element.text().trim().length > 200) {
            return element;
        }
    }

    return $('body');
};

/**
 * Extract structured content
 */
const extractStructuredContent = ($, contentElement) => {
    const headings = [];
    const paragraphs = [];
    const lists = [];
    const links = [];

    contentElement.find('h1, h2, h3, h4, h5, h6').each((_, el) => {
        const text = $(el).text().trim();
        if (text) {
            headings.push({
                level: parseInt(el.tagName[1]),
                text
            });
        }
    });

    contentElement.find('p').each((_, el) => {
        const text = $(el).text().trim();
        if (text && text.length > 20) {
            paragraphs.push(text);
        }
    });

    contentElement.find('ul, ol').each((_, list) => {
        const items = [];
        $(list).find('li').each((_, li) => {
            const text = $(li).text().trim();
            if (text) items.push(text);
        });
        if (items.length > 0) {
            lists.push({
                type: list.tagName.toLowerCase(),
                items
            });
        }
    });

    contentElement.find('a[href]').each((_, a) => {
        const text = $(a).text().trim();
        const href = $(a).attr('href');
        if (text && href && !href.startsWith('#') && !href.startsWith('javascript:')) {
            links.push({ text, href });
        }
    });

    return { headings, paragraphs, lists, links };
};

// =============================================================================
// API ROUTES
// =============================================================================

/**
 * Health check
 */
app.get('/api/scrape/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

/**
 * Main scraping endpoint
 */
app.post('/api/scrape', async (req, res) => {
    const { url, options = {} } = req.body;

    if (!url) {
        return res.status(400).json({
            success: false,
            error: 'URL is required'
        });
    }

    // Validate URL
    try {
        new URL(url);
    } catch {
        return res.status(400).json({
            success: false,
            error: 'Invalid URL format'
        });
    }

    const {
        extractContent = true,
        extractMetadataFlag = true,
        screenshot = false,
        waitForSelector = null,
        timeout = 20000
    } = options;

    try {
        // Fetch the page
        const response = await axios.get(url, {
            headers: {
                'User-Agent': getRandomUserAgent(),
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate',
                'Connection': 'keep-alive'
            },
            timeout,
            maxRedirects: 5,
            responseType: 'text'
        });

        const html = response.data;
        const $ = cheerio.load(html);

        // Build response
        const result = {
            success: true,
            url,
            status: response.status,
            contentType: response.headers['content-type']
        };

        // Extract metadata
        if (extractMetadataFlag) {
            result.metadata = extractMetadata($);
        }

        // Extract content
        if (extractContent) {
            removeUnwantedElements($);
            const contentElement = extractMainContent($);
            const text = contentElement.text().replace(/\s+/g, ' ').trim();

            result.content = {
                text: text.slice(0, 100000), // Limit content length
                wordCount: text.split(/\s+/).length,
                charCount: text.length,
                truncated: text.length > 100000
            };

            result.structured = extractStructuredContent($, contentElement);
        }

        // Include raw HTML
        result.html = html;

        // Screenshot (requires puppeteer - uncomment if needed)
        // if (screenshot) {
        //     const browser = await puppeteer.launch({ headless: 'new' });
        //     const page = await browser.newPage();
        //     await page.goto(url, { waitUntil: 'networkidle0', timeout });
        //     if (waitForSelector) {
        //         await page.waitForSelector(waitForSelector, { timeout: 5000 }).catch(() => {});
        //     }
        //     const screenshotBuffer = await page.screenshot({ type: 'png', fullPage: false });
        //     result.screenshot = screenshotBuffer.toString('base64');
        //     await browser.close();
        // }

        res.json(result);

    } catch (error) {
        console.error(`Scraping error for ${url}:`, error.message);

        res.status(500).json({
            success: false,
            url,
            error: error.message,
            code: error.code || 'UNKNOWN'
        });
    }
});

/**
 * Batch scraping endpoint
 */
app.post('/api/scrape/batch', async (req, res) => {
    const { urls, options = {} } = req.body;

    if (!urls || !Array.isArray(urls)) {
        return res.status(400).json({
            success: false,
            error: 'URLs array is required'
        });
    }

    if (urls.length > 10) {
        return res.status(400).json({
            success: false,
            error: 'Maximum 10 URLs per batch request'
        });
    }

    const results = await Promise.all(
        urls.map(async (url) => {
            try {
                const response = await axios.get(url, {
                    headers: {
                        'User-Agent': getRandomUserAgent()
                    },
                    timeout: options.timeout || 15000
                });

                const $ = cheerio.load(response.data);
                removeUnwantedElements($);
                const contentElement = extractMainContent($);
                const text = contentElement.text().replace(/\s+/g, ' ').trim();

                return {
                    success: true,
                    url,
                    metadata: extractMetadata($),
                    content: {
                        text: text.slice(0, 50000),
                        wordCount: text.split(/\s+/).length
                    }
                };
            } catch (error) {
                return {
                    success: false,
                    url,
                    error: error.message
                };
            }
        })
    );

    res.json({
        success: true,
        total: urls.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results
    });
});

/**
 * Proxy endpoint for simple fetch
 */
app.get('/api/proxy', async (req, res) => {
    const { url } = req.query;

    if (!url) {
        return res.status(400).json({
            success: false,
            error: 'URL query parameter is required'
        });
    }

    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': getRandomUserAgent()
            },
            timeout: 15000,
            responseType: 'text'
        });

        res.set('Content-Type', response.headers['content-type'] || 'text/html');
        res.send(response.data);

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// =============================================================================
// ERROR HANDLING
// =============================================================================

app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// =============================================================================
// START SERVER
// =============================================================================

app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════╗
║           Web Scraping API Server                      ║
╠════════════════════════════════════════════════════════╣
║  Status:  RUNNING                                      ║
║  Port:    ${PORT}                                           ║
║  Time:    ${new Date().toISOString()}            ║
╠════════════════════════════════════════════════════════╣
║  Endpoints:                                            ║
║  • GET  /api/scrape/health    - Health check           ║
║  • POST /api/scrape           - Scrape single URL      ║
║  • POST /api/scrape/batch     - Scrape multiple URLs   ║
║  • GET  /api/proxy?url=       - Simple proxy           ║
╚════════════════════════════════════════════════════════╝
    `);
});

module.exports = app;
