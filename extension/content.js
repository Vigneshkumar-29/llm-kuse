/**
 * DevSavvy Web Scraper - Content Script
 * =======================================
 * 
 * Injected into web pages to enable communication
 * between the web app and the extension.
 */

// Mark extension as available
window.webScrapingExtension = true;

// Listen for messages from the web page
window.addEventListener('message', async (event) => {
    // Only accept messages from same window
    if (event.source !== window) return;

    if (event.data.type === 'SCRAPING_REQUEST') {
        const { url, options } = event.data.payload;

        try {
            // Send request to background script
            const response = await chrome.runtime.sendMessage({
                type: url ? 'EXTRACT_URL' : 'EXTRACT_PAGE',
                url,
                options
            });

            // Send response back to page
            window.postMessage({
                type: 'SCRAPING_RESPONSE',
                url: url || window.location.href,
                success: response.success,
                html: response.data?.html,
                text: response.data?.text,
                metadata: response.data?.metadata,
                headings: response.data?.headings,
                links: response.data?.links,
                error: response.error
            }, '*');

        } catch (error) {
            window.postMessage({
                type: 'SCRAPING_RESPONSE',
                url: url || window.location.href,
                success: false,
                error: error.message
            }, '*');
        }
    }

    if (event.data.type === 'CHECK_EXTENSION') {
        window.postMessage({
            type: 'EXTENSION_STATUS',
            available: true,
            version: '1.0.0'
        }, '*');
    }
});

// Notify page that extension is ready
window.postMessage({ type: 'EXTENSION_READY' }, '*');

console.log('DevSavvy Web Scraper content script loaded');
