/**
 * DevSavvy Web Scraper - Background Service Worker
 * ==================================================
 * 
 * Handles communication between the extension popup, 
 * content scripts, and the web application.
 */

// =============================================================================
// MESSAGE HANDLING
// =============================================================================

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'EXTRACT_PAGE') {
        extractCurrentPage(sender.tab).then(sendResponse);
        return true; // Keep channel open for async response
    }

    if (message.type === 'EXTRACT_URL') {
        extractFromUrl(message.url).then(sendResponse);
        return true;
    }

    if (message.type === 'GET_STATUS') {
        sendResponse({ status: 'active', version: '1.0.0' });
        return false;
    }
});

// =============================================================================
// EXTRACTION FUNCTIONS
// =============================================================================

/**
 * Extract content from the current active tab
 */
async function extractCurrentPage(tab) {
    try {
        const results = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: extractPageContent
        });

        if (results && results[0]) {
            return {
                success: true,
                data: results[0].result,
                url: tab.url,
                title: tab.title
            };
        }

        return { success: false, error: 'No results from content script' };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * Extract content from a specific URL by opening it in a background tab
 */
async function extractFromUrl(url) {
    try {
        // Create a new tab
        const tab = await chrome.tabs.create({ url, active: false });

        // Wait for page to load
        await new Promise(resolve => {
            chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
                if (tabId === tab.id && info.status === 'complete') {
                    chrome.tabs.onUpdated.removeListener(listener);
                    resolve();
                }
            });
        });

        // Wait a bit more for dynamic content
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Extract content
        const results = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: extractPageContent
        });

        // Close the tab
        await chrome.tabs.remove(tab.id);

        if (results && results[0]) {
            return {
                success: true,
                data: results[0].result,
                url
            };
        }

        return { success: false, error: 'Extraction failed' };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// =============================================================================
// CONTENT EXTRACTION (Injected into pages)
// =============================================================================

function extractPageContent() {
    // Remove unwanted elements
    const selectorsToRemove = [
        'script', 'style', 'noscript', 'iframe', 'svg',
        'nav', 'header', 'footer', 'aside',
        '.nav', '.navbar', '.sidebar', '.ad', '.ads',
        '.social', '.share', '.comments', '.cookie', '.popup'
    ];

    // Clone body to avoid modifying actual page
    const clone = document.body.cloneNode(true);

    selectorsToRemove.forEach(selector => {
        try {
            clone.querySelectorAll(selector).forEach(el => el.remove());
        } catch (e) { }
    });

    // Extract metadata
    const getMeta = (name) => {
        const el = document.querySelector(`meta[name="${name}"], meta[property="${name}"], meta[property="og:${name}"]`);
        return el ? el.getAttribute('content') : null;
    };

    const metadata = {
        title: document.title,
        description: getMeta('description') || getMeta('og:description'),
        author: getMeta('author'),
        image: getMeta('og:image'),
        siteName: getMeta('og:site_name'),
        url: window.location.href
    };

    // Find main content
    const contentSelectors = ['article', 'main', '[role="main"]', '.content', '.post', '#content'];
    let mainContent = null;

    for (const selector of contentSelectors) {
        const el = clone.querySelector(selector);
        if (el && el.textContent.trim().length > 200) {
            mainContent = el;
            break;
        }
    }

    if (!mainContent) {
        mainContent = clone;
    }

    // Extract text
    const text = mainContent.textContent
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 100000);

    // Extract headings
    const headings = [];
    mainContent.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(h => {
        const t = h.textContent.trim();
        if (t) {
            headings.push({ level: parseInt(h.tagName[1]), text: t });
        }
    });

    // Extract links
    const links = [];
    mainContent.querySelectorAll('a[href]').forEach(a => {
        const t = a.textContent.trim();
        const href = a.getAttribute('href');
        if (t && href && !href.startsWith('#')) {
            links.push({ text: t.slice(0, 100), href });
        }
    });

    return {
        html: mainContent.innerHTML,
        text,
        wordCount: text.split(/\s+/).length,
        metadata,
        headings: headings.slice(0, 50),
        links: links.slice(0, 100),
        extractedAt: new Date().toISOString()
    };
}

// =============================================================================
// EXTERNAL COMMUNICATION
// =============================================================================

// Listen for messages from web pages (DevSavvy app)
chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
    if (message.type === 'SCRAPING_REQUEST') {
        if (message.url) {
            extractFromUrl(message.url).then(sendResponse);
        } else {
            // Get current tab content
            chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
                if (tabs[0]) {
                    const result = await extractCurrentPage(tabs[0]);
                    sendResponse(result);
                } else {
                    sendResponse({ success: false, error: 'No active tab' });
                }
            });
        }
        return true;
    }
});

console.log('DevSavvy Web Scraper extension loaded');
