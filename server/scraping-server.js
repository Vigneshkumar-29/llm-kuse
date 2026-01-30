/**
 * Web Scraping Backend Server
 * ============================
 * 
 * Express server that provides:
 * 1. URL scraping capabilities (bypassing CORS)
 * 2. YouTube transcript fetching
 * 3. YouTube video metadata
 * 
 * Dependencies:
 * npm install express cors axios cheerio youtube-transcript
 * 
 * Usage:
 * node server/scraping-server.js
 * 
 * @version 1.1.0
 */

import express from 'express';
import cors from 'cors';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { YoutubeTranscript } from 'youtube-transcript';

const app = express();
const PORT = process.env.SCRAPING_PORT || 3001;

// =============================================================================
// MIDDLEWARE
// =============================================================================

app.use(cors({
    origin: '*',  // Allow all origins for local development
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS']
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
// HELPER FUNCTIONS
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
        '.cookie', '.popup', '.modal', '.overlay'
    ];

    selectorsToRemove.forEach(selector => {
        try {
            $(selector).remove();
        } catch {
            // Invalid selector, skip
        }
    });
};

/**
 * Extract main content
 */
const extractMainContent = ($) => {
    const contentSelectors = [
        'article', '[role="main"]', 'main',
        '.post-content', '.article-content', '.entry-content',
        '.content', '.post', '.article', '#content', '#main'
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
            headings.push({ level: parseInt(el.tagName[1]), text });
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
            lists.push({ type: list.tagName.toLowerCase(), items });
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
        version: '1.1.0'
    });
});

/**
 * YOUTUBE TRANSCRIPT ENDPOINT
 * Fetches transcript for a given video ID or URL
 */
app.get('/api/youtube/transcript', async (req, res) => {
    const { videoId, url, lang } = req.query;
    
    // Extract ID from URL if not provided directly
    let targetId = videoId;
    if (!targetId && url) {
        const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
        if (match) targetId = match[1];
    }

    if (!targetId) {
        return res.status(400).json({ 
            success: false, 
            error: 'Video ID or URL is required' 
        });
    }

    try {
        console.log(`Fetching transcript for video: ${targetId}`);
        
        // Fetch transcript using youtube-transcript package
        const transcript = await YoutubeTranscript.fetchTranscript(targetId, {
            lang: lang || 'en'
        });

        if (!transcript || transcript.length === 0) {
            throw new Error('No transcript available for this video');
        }

        // Format for frontend
        res.json({
            success: true,
            videoId: targetId,
            language: lang || 'en',
            transcript: transcript.map(item => ({
                text: item.text,
                start: item.offset / 1000, // Convert to seconds
                duration: item.duration / 1000
            }))
        });

    } catch (error) {
        console.error(`Transcript error for ${targetId}:`, error.message);
        
        const isDisabled = error.message.includes('captions are disabled');
        
        res.status(isDisabled ? 404 : 500).json({
            success: false,
            videoId: targetId,
            error: isDisabled ? 'Captions are disabled for this video' : error.message
        });
    }
});

/**
 * Main scraping endpoint for generic URLs
 */
app.post('/api/scrape', async (req, res) => {
    const { url, options = {} } = req.body;

    if (!url) {
        return res.status(400).json({ success: false, error: 'URL is required' });
    }

    try {
        // Fetch the page
        const response = await axios.get(url, {
            headers: {
                'User-Agent': getRandomUserAgent(),
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
            },
            timeout: options.timeout || 20000,
            maxRedirects: 5
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
        result.metadata = extractMetadata($);

        // Extract content
        removeUnwantedElements($);
        const contentElement = extractMainContent($);
        const text = contentElement.text().replace(/\s+/g, ' ').trim();

        result.content = {
            text: text.slice(0, 100000), // Limit content length
            wordCount: text.split(/\s+/).length,
            charCount: text.length
        };

        result.structured = extractStructuredContent($, contentElement);

        res.json(result);

    } catch (error) {
        console.error(`Scraping error for ${url}:`, error.message);
        res.status(500).json({
            success: false,
            url,
            error: error.message
        });
    }
});

// =============================================================================
// START SERVER
// =============================================================================

app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════╗
║           Web & YouTube Scraping Server                ║
╠════════════════════════════════════════════════════════╣
║  Status:  RUNNING                                      ║
║  Port:    ${PORT}                                      ║
║  Endpoints:                                            ║
║  • POST /api/scrape           - Scrape websites        ║
║  • GET  /api/youtube/transcript - Get detailed captions║
║  • GET  /api/scrape/health    - Health check           ║
╚════════════════════════════════════════════════════════╝
    `);
});

export default app;
