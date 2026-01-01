/**
 * Document Export Service
 * =======================
 * 
 * Handles exporting content to various document formats.
 * Supported formats: PDF, DOCX, HTML, Markdown, Plain Text.
 * 
 * Dependencies:
 * - jspdf
 * - html2pdf.js
 * - docx
 * 
 * @version 1.0.0
 */

import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, BorderStyle } from 'docx';
import html2pdf from 'html2pdf.js';
// Note: jsPDF is often used internally by html2pdf, but can be used directly for specific needs.

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Trigger file download in browser
 */
const downloadFile = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
};

// =============================================================================
// EXPORT HANDLERS
// =============================================================================

export const DocumentExport = {

    /**
     * Export as Markdown (simply saves the string)
     */
    toMarkdown: (content, filename = 'document.md') => {
        const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
        downloadFile(blob, filename.endsWith('.md') ? filename : `${filename}.md`);
    },

    /**
     * Export as Plain Text (strips markdown)
     */
    toPlainText: (content, filename = 'document.txt') => {
        // Simple markdown stripping
        const plainText = content
            .replace(/^#{1,6}\s/gm, '') // Remove headers
            .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
            .replace(/\*(.*?)\*/g, '$1') // Remove italic
            .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links
            .replace(/^> (.*$)/gm, '$1') // Remove blockquotes
            .replace(/`{1,3}(.*?)`{1,3}/g, '$1') // Remove code
            .replace(/^- /gm, '• ') // Replace list markers
            .replace(/^---$/gm, '________________________________') // Replace rules
            .trim();

        const blob = new Blob([plainText], { type: 'text/plain;charset=utf-8' });
        downloadFile(blob, filename.endsWith('.txt') ? filename : `${filename}.txt`);
    },

    /**
     * Export as HTML
     */
    toHTML: (content, filename = 'document.html') => {
        // Convert Markdown to HTML (requires a markdown parser, but we can do a simple wrap for now 
        // or rely on what's passed if we passed HTML. Assuming we pass rendered HTML or Markdown).
        // Best practice: Pass the already rendered HTML container ID or element.

        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>${filename}</title>
    <style>
        body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; max-width: 800px; margin: 2rem auto; padding: 0 1rem; color: #333; }
        h1, h2, h3 { color: #111; }
        code { background: #f4f4f4; padding: 0.2rem 0.4rem; rounded: 4px; }
        pre { background: #f4f4f4; padding: 1rem; overflow-x: auto; }
        table { border-collapse: collapse; width: 100%; margin: 1rem 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f8f9fa; }
        blockquote { border-left: 4px solid #ddd; padding-left: 1rem; color: #666; margin: 1rem 0; }
    </style>
</head>
<body>
    ${content} 
</body>
</html>`;

        const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
        downloadFile(blob, filename.endsWith('.html') ? filename : `${filename}.html`);
    },

    /**
     * Export as PDF using html2pdf.js
     * Ideally, pass the DOM element ID to render.
     */
    toPDF: async (elementId, filename = 'document.pdf', options = {}) => {
        const element = document.getElementById(elementId);
        if (!element) throw new Error(`Element with ID '${elementId}' not found`);

        const defaultOptions = {
            margin: 10,
            filename: filename.endsWith('.pdf') ? filename : `${filename}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
            ...options
        };

        try {
            await html2pdf().set(defaultOptions).from(element).save();
            return true;
        } catch (error) {
            console.error('PDF Export failed:', error);
            throw error;
        }
    },

    /**
     * Export as DOCX using 'docx' library
     * This needs to parse Markdown to Docx nodes. 
     * For simplicity implementation, we'll split by newlines and create basic paragraphs.
     * A full Markdown-to-Docx parser is complex.
     */
    toDOCX: async (content, filename = 'document.docx') => {
        try {
            // Very basic parser: split by lines
            const lines = content.split('\n');
            const docChildren = [];

            for (const line of lines) {
                let paragraph;

                // Headers
                if (line.startsWith('# ')) {
                    paragraph = new Paragraph({ text: line.replace('# ', ''), heading: HeadingLevel.HEADING_1 });
                } else if (line.startsWith('## ')) {
                    paragraph = new Paragraph({ text: line.replace('## ', ''), heading: HeadingLevel.HEADING_2 });
                } else if (line.startsWith('### ')) {
                    paragraph = new Paragraph({ text: line.replace('### ', ''), heading: HeadingLevel.HEADING_3 });
                }
                // Lists
                else if (line.trim().startsWith('- ')) {
                    paragraph = new Paragraph({ text: line.replace('- ', ''), bullet: { level: 0 } });
                }
                // Standard Text (with basic bold handling attempt)
                else if (line.trim().length > 0) {
                    // Check for bold wrapping **text**
                    // This is a naive implementation; complex inline styles usually require an AST.
                    paragraph = new Paragraph({
                        children: [new TextRun(line)]
                    });
                } else {
                    // Empty line
                    paragraph = new Paragraph({ text: "" });
                }

                docChildren.push(paragraph);
            }

            const doc = new Document({
                sections: [{
                    properties: {},
                    children: docChildren,
                }],
            });

            const blob = await Packer.toBlob(doc);
            downloadFile(blob, filename.endsWith('.docx') ? filename : `${filename}.docx`);
            return true;
        } catch (error) {
            console.error('DOCX Export failed:', error);
            throw error;
        }
    }
};

export default DocumentExport;
