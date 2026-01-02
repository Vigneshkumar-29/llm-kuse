/**
 * ExportService - Data Export Utilities
 * ======================================
 * 
 * Provides various export formats for conversations, canvas, and documents.
 */

class ExportService {
    /**
     * Export conversation as Markdown
     */
    static exportChatAsMarkdown(messages, options = {}) {
        const { title = 'Chat Export', includeTimestamps = true } = options;

        let markdown = `# ${title}\n\n`;
        markdown += `*Exported on ${new Date().toLocaleString()}*\n\n`;
        markdown += `---\n\n`;

        messages.forEach((msg, index) => {
            const role = msg.role === 'user' ? '👤 **You**' : '🤖 **AI**';
            markdown += `### ${role}\n\n`;
            markdown += `${msg.content}\n\n`;
            if (includeTimestamps && msg.timestamp) {
                markdown += `*${new Date(msg.timestamp).toLocaleString()}*\n\n`;
            }
            if (index < messages.length - 1) {
                markdown += `---\n\n`;
            }
        });

        return markdown;
    }

    /**
     * Export conversation as JSON
     */
    static exportChatAsJSON(messages, options = {}) {
        const { title = 'Chat Export', model = 'unknown' } = options;

        return JSON.stringify({
            title,
            model,
            exportedAt: new Date().toISOString(),
            messageCount: messages.length,
            messages: messages.map(msg => ({
                role: msg.role,
                content: msg.content,
                timestamp: msg.timestamp || new Date().toISOString()
            }))
        }, null, 2);
    }

    /**
     * Export canvas as JSON
     */
    static exportCanvasAsJSON(nodes, edges, options = {}) {
        const { title = 'Canvas Export' } = options;

        return JSON.stringify({
            title,
            exportedAt: new Date().toISOString(),
            nodeCount: nodes.length,
            edgeCount: edges.length,
            nodes,
            edges
        }, null, 2);
    }

    /**
     * Download file to user's device
     */
    static downloadFile(content, filename, mimeType = 'text/plain') {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    /**
     * Export chat as Markdown file
     */
    static downloadChatMarkdown(messages, title = 'chat') {
        const markdown = this.exportChatAsMarkdown(messages, { title });
        const filename = `${title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.md`;
        this.downloadFile(markdown, filename, 'text/markdown');
    }

    /**
     * Export chat as JSON file
     */
    static downloadChatJSON(messages, title = 'chat', model) {
        const json = this.exportChatAsJSON(messages, { title, model });
        const filename = `${title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.json`;
        this.downloadFile(json, filename, 'application/json');
    }

    /**
     * Export canvas as JSON file
     */
    static downloadCanvasJSON(nodes, edges, title = 'canvas') {
        const json = this.exportCanvasAsJSON(nodes, edges, { title });
        const filename = `${title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.json`;
        this.downloadFile(json, filename, 'application/json');
    }

    /**
     * Copy to clipboard
     */
    static async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            console.error('Failed to copy:', err);
            return false;
        }
    }

    /**
     * Export chat as HTML
     */
    static exportChatAsHTML(messages, options = {}) {
        const { title = 'Chat Export' } = options;

        const styles = `
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background: #f9fafb; }
            .message { margin: 16px 0; padding: 16px; border-radius: 12px; }
            .user { background: #e0e7ff; }
            .assistant { background: white; border: 1px solid #e5e7eb; }
            .role { font-weight: 600; margin-bottom: 8px; color: #374151; }
            .content { line-height: 1.6; color: #4b5563; }
            h1 { color: #111827; }
            .meta { color: #9ca3af; font-size: 12px; margin-top: 10px; }
        `;

        let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>${styles}</style>
</head>
<body>
    <h1>${title}</h1>
    <p class="meta">Exported on ${new Date().toLocaleString()}</p>
`;

        messages.forEach(msg => {
            const roleLabel = msg.role === 'user' ? '👤 You' : '🤖 AI';
            html += `
    <div class="message ${msg.role}">
        <div class="role">${roleLabel}</div>
        <div class="content">${msg.content.replace(/\n/g, '<br>')}</div>
    </div>`;
        });

        html += `
</body>
</html>`;

        return html;
    }

    /**
     * Download chat as HTML
     */
    static downloadChatHTML(messages, title = 'chat') {
        const html = this.exportChatAsHTML(messages, { title });
        const filename = `${title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.html`;
        this.downloadFile(html, filename, 'text/html');
    }
}

export default ExportService;
