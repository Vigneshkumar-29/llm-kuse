/**
 * DevSavvy Web Scraper - Popup Script
 * =====================================
 */

let extractedData = null;

// DOM Elements
const extractBtn = document.getElementById('extractBtn');
const copyBtn = document.getElementById('copyBtn');
const resultCard = document.getElementById('resultCard');
const errorEl = document.getElementById('error');
const resultTitle = document.getElementById('resultTitle');
const resultUrl = document.getElementById('resultUrl');
const wordCount = document.getElementById('wordCount');
const headingCount = document.getElementById('headingCount');
const linkCount = document.getElementById('linkCount');

// Extract page content
extractBtn.addEventListener('click', async () => {
    extractBtn.disabled = true;
    extractBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="animate-spin">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6v6l4 2"/>
        </svg>
        Extracting...
    `;

    errorEl.style.display = 'none';
    resultCard.classList.remove('active');
    copyBtn.style.display = 'none';

    try {
        // Get current tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        // Send extraction request
        const response = await chrome.runtime.sendMessage({
            type: 'EXTRACT_PAGE'
        });

        if (response.success) {
            extractedData = response.data;

            // Update UI
            resultTitle.textContent = response.data.metadata?.title || 'Untitled Page';
            resultUrl.textContent = tab.url;
            wordCount.textContent = response.data.wordCount?.toLocaleString() || '0';
            headingCount.textContent = response.data.headings?.length || '0';
            linkCount.textContent = response.data.links?.length || '0';

            resultCard.classList.add('active');
            copyBtn.style.display = 'flex';
        } else {
            throw new Error(response.error || 'Extraction failed');
        }

    } catch (error) {
        errorEl.textContent = error.message;
        errorEl.style.display = 'block';
    } finally {
        extractBtn.disabled = false;
        extractBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Extract This Page
        `;
    }
});

// Copy to clipboard
copyBtn.addEventListener('click', async () => {
    if (!extractedData) return;

    try {
        const formattedData = {
            title: extractedData.metadata?.title,
            url: resultUrl.textContent,
            text: extractedData.text,
            wordCount: extractedData.wordCount,
            headings: extractedData.headings,
            extractedAt: extractedData.extractedAt
        };

        await navigator.clipboard.writeText(JSON.stringify(formattedData, null, 2));

        copyBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"/>
            </svg>
            Copied!
        `;

        setTimeout(() => {
            copyBtn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
                Copy to Clipboard
            `;
        }, 2000);

    } catch (error) {
        errorEl.textContent = 'Failed to copy';
        errorEl.style.display = 'block';
    }
});

// Check extension status on load
chrome.runtime.sendMessage({ type: 'GET_STATUS' }, (response) => {
    if (response) {
        document.getElementById('version').textContent = response.version || '1.0.0';
    }
});
