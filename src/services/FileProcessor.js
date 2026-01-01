/**
 * FileProcessor Service - Enhanced Version
 * =========================================
 * Handles extraction of text content from various file types
 * using professional libraries: pdfjs-dist, xlsx, tesseract.js
 */

import * as pdfjsLib from 'pdfjs-dist';
import * as XLSX from 'xlsx';
import mammoth from 'mammoth';

// Configure PDF.js worker for v5.x
// Use the bundled worker from the package
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
).toString();

// =============================================================================
// PDF EXTRACTION
// =============================================================================

/**
 * Extract text content from a PDF file
 * @param {File} file - PDF file to process
 * @returns {Promise<string>} - Extracted text content
 */
export const extractTextFromPdf = async (file) => {
    try {
        console.log('[PDF Extractor] Starting extraction for:', file.name);
        const arrayBuffer = await file.arrayBuffer();
        console.log('[PDF Extractor] ArrayBuffer size:', arrayBuffer.byteLength);

        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        console.log('[PDF Extractor] PDF loaded, pages:', pdf.numPages);

        const numPages = pdf.numPages;
        let fullText = '';

        for (let pageNum = 1; pageNum <= numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const textContent = await page.getTextContent();

            const pageText = textContent.items
                .map(item => item.str)
                .join(' ')
                .replace(/\s+/g, ' ')
                .trim();

            fullText += `\n--- Page ${pageNum} ---\n${pageText}\n`;
            console.log(`[PDF Extractor] Page ${pageNum}: ${pageText.length} chars extracted`);
        }

        console.log('[PDF Extractor] Total extracted:', fullText.length, 'chars');

        return {
            content: fullText.trim() || '[PDF contains no extractable text - may be image-based]',
            metadata: {
                pageCount: numPages,
                title: pdf.fingerprints?.[0] || 'Unknown'
            }
        };
    } catch (error) {
        console.error('[PDF Extractor] Error:', error);
        return {
            content: `[Error extracting PDF: ${error.message}]`,
            metadata: { error: error.message }
        };
    }
};

// =============================================================================
// EXCEL/CSV EXTRACTION
// =============================================================================

/**
 * Extract text content from Excel or CSV file
 * @param {File} file - Excel/CSV file to process
 * @returns {Promise<string>} - Extracted text content
 */
export const extractTextFromSpreadsheet = async (file) => {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });

        let fullText = '';
        const sheetSummary = [];

        workbook.SheetNames.forEach((sheetName, index) => {
            const worksheet = workbook.Sheets[sheetName];

            // Convert to JSON for easier processing
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            if (jsonData.length > 0) {
                const headers = jsonData[0] || [];
                const dataRows = jsonData.slice(1);

                fullText += `\n=== Sheet: ${sheetName} ===\n`;
                fullText += `Columns: ${headers.join(', ')}\n`;
                fullText += `Rows: ${dataRows.length}\n\n`;

                // Add sample data (first 10 rows)
                const sampleRows = dataRows.slice(0, 10);
                sampleRows.forEach((row, rowIndex) => {
                    const rowData = headers.map((header, colIndex) => {
                        const value = row[colIndex];
                        return `${header}: ${value !== undefined ? value : 'N/A'}`;
                    }).join(' | ');
                    fullText += `Row ${rowIndex + 1}: ${rowData}\n`;
                });

                if (dataRows.length > 10) {
                    fullText += `... and ${dataRows.length - 10} more rows\n`;
                }

                sheetSummary.push({
                    name: sheetName,
                    rows: dataRows.length,
                    columns: headers.length
                });
            }
        });

        return {
            content: fullText.trim() || '[Spreadsheet is empty]',
            metadata: {
                sheetCount: workbook.SheetNames.length,
                sheets: sheetSummary
            }
        };
    } catch (error) {
        console.error('Spreadsheet extraction error:', error);
        return {
            content: `[Error extracting spreadsheet: ${error.message}]`,
            metadata: { error: error.message }
        };
    }
};

// =============================================================================
// TEXT FILE EXTRACTION
// =============================================================================

/**
 * Extract text content from a plain text file
 * @param {File} file - Text file to process
 * @returns {Promise<string>} - File content
 */
export const extractTextFromTxt = async (file) => {
    try {
        const text = await file.text();
        return {
            content: text.trim() || '[File is empty]',
            metadata: {
                lineCount: text.split('\n').length,
                wordCount: text.split(/\s+/).filter(w => w.length > 0).length,
                charCount: text.length
            }
        };
    } catch (error) {
        return {
            content: `[Error reading text file: ${error.message}]`,
            metadata: { error: error.message }
        };
    }
};

/**
 * Extract text content from a CSV file
 * @param {File} file - CSV file to process
 * @returns {Promise<string>} - Parsed CSV content
 */
export const extractTextFromCsv = async (file) => {
    return extractTextFromSpreadsheet(file);
};

// =============================================================================
// IMAGE EXTRACTION (OCR)
// =============================================================================

/**
 * Extract text from an image using OCR
 * Note: OCR is resource-intensive. For now, we provide image metadata.
 * Full OCR can be enabled by uncommenting Tesseract code.
 * @param {File} file - Image file to process
 * @returns {Promise<string>} - Extracted text or metadata
 */
export const extractTextFromImage = async (file) => {
    try {
        // Create image metadata
        const url = URL.createObjectURL(file);

        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                URL.revokeObjectURL(url);

                const description =
                    `[Image File: ${file.name}]\n` +
                    `Dimensions: ${img.width} x ${img.height} pixels\n` +
                    `Type: ${file.type}\n` +
                    `Size: ${formatFileSize(file.size)}\n\n` +
                    `Note: This image has been uploaded for visual reference. ` +
                    `For text extraction from images (OCR), enable Tesseract.js processing.`;

                resolve({
                    content: description,
                    metadata: {
                        width: img.width,
                        height: img.height,
                        aspectRatio: (img.width / img.height).toFixed(2)
                    }
                });
            };
            img.onerror = () => {
                URL.revokeObjectURL(url);
                resolve({
                    content: `[Error loading image: ${file.name}]`,
                    metadata: { error: 'Failed to load image' }
                });
            };
            img.src = url;
        });
    } catch (error) {
        return {
            content: `[Error processing image: ${error.message}]`,
            metadata: { error: error.message }
        };
    }
};

/**
 * Extract text from image using Tesseract.js OCR
 * This is an optional heavy operation - uncomment when needed
 */
export const extractTextWithOCR = async (file) => {
    try {
        // Dynamic import to avoid loading Tesseract unless needed
        const Tesseract = await import('tesseract.js');

        const result = await Tesseract.recognize(file, 'eng', {
            logger: m => console.log('OCR Progress:', m.progress)
        });

        return {
            content: result.data.text.trim() || '[No text detected in image]',
            metadata: {
                confidence: result.data.confidence,
                language: 'eng'
            }
        };
    } catch (error) {
        console.error('OCR error:', error);
        return {
            content: `[OCR failed: ${error.message}]`,
            metadata: { error: error.message }
        };
    }
};

// =============================================================================
// DOCX EXTRACTION
// =============================================================================


// ... (other imports)

// =============================================================================
// DOCX EXTRACTION
// =============================================================================

/**
 * Extract text from DOCX file using Mammoth
 * @param {File} file - DOCX file to process
 * @returns {Promise<string>} - Extracted text
 */
export const extractTextFromDocx = async (file) => {
    try {
        console.log('[DOCX Extractor] Starting extraction for:', file.name);
        const arrayBuffer = await file.arrayBuffer();

        // Use Mammoth to extract raw text
        const result = await mammoth.extractRawText({ arrayBuffer });

        const extractedText = result.value.trim();
        const warnings = result.messages;

        if (warnings.length > 0) {
            console.warn('[DOCX Extractor] Warnings:', warnings);
        }

        console.log('[DOCX Extractor] Extracted chars:', extractedText.length);

        return {
            content: extractedText || '[Document appears to be empty]',
            metadata: {
                type: 'docx',
                warningCount: warnings.length
            }
        };
    } catch (error) {
        console.error('[DOCX Extractor] Error:', error);
        return {
            content: `[Error extracting Word document: ${error.message}]`,
            metadata: { error: error.message }
        };
    }
};

// =============================================================================
// MAIN PROCESSOR
// =============================================================================

/**
 * Process a file and extract its content
 * @param {File} file - The file to process
 * @param {Object} options - Processing options
 * @returns {Promise<{success: boolean, content: string, metadata: object}>}
 */
export const processFile = async (file, options = {}) => {
    const startTime = Date.now();

    try {
        let result;
        const mimeType = file.type;

        // Route to appropriate extractor
        if (mimeType === 'application/pdf') {
            result = await extractTextFromPdf(file);
        } else if (mimeType === 'text/plain') {
            result = await extractTextFromTxt(file);
        } else if (mimeType === 'text/csv') {
            result = await extractTextFromCsv(file);
        } else if (
            mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
            mimeType === 'application/vnd.ms-excel'
        ) {
            result = await extractTextFromSpreadsheet(file);
        } else if (
            mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            mimeType === 'application/msword'
        ) {
            result = await extractTextFromDocx(file);
        } else if (mimeType.startsWith('image/')) {
            // Use OCR if enabled in options
            if (options.enableOCR) {
                result = await extractTextWithOCR(file);
            } else {
                result = await extractTextFromImage(file);
            }
        } else {
            result = {
                content: `[Unsupported file type: ${file.name} (${mimeType})]`,
                metadata: { unsupported: true }
            };
        }

        const processingTime = Date.now() - startTime;

        return {
            success: true,
            content: result.content,
            metadata: {
                fileName: file.name,
                fileType: mimeType,
                fileSize: file.size,
                processingTimeMs: processingTime,
                extractedAt: new Date().toISOString(),
                contentLength: result.content.length,
                ...result.metadata
            }
        };

    } catch (error) {
        console.error('Error processing file:', error);
        return {
            success: false,
            content: `[Error processing ${file.name}: ${error.message}]`,
            metadata: {
                fileName: file.name,
                fileType: file.type,
                error: error.message
            }
        };
    }
};

/**
 * Process multiple files and combine their content
 * @param {File[]} files - Array of files to process
 * @param {Object} options - Processing options
 * @returns {Promise<{content: string, files: object[]}>}
 */
export const processMultipleFiles = async (files, options = {}) => {
    const results = await Promise.all(files.map(f => processFile(f, options)));

    const successfulFiles = results.filter(r => r.success);
    const failedFiles = results.filter(r => !r.success);

    // Combine content with separators
    const combinedContent = successfulFiles
        .map((r, i) => `\n========== FILE ${i + 1}: ${r.metadata.fileName} ==========\n${r.content}`)
        .join('\n\n');

    return {
        content: combinedContent,
        summary: {
            total: files.length,
            successful: successfulFiles.length,
            failed: failedFiles.length,
            totalContentLength: combinedContent.length
        },
        files: results.map(r => r.metadata)
    };
};

/**
 * Build context string for AI prompt with source tracking
 * @param {Object[]} files - Array of processed file objects
 * @param {Object} options - Context options
 * @returns {string} - Formatted context string
 */
export const buildFileContext = (files, options = {}) => {
    if (!files || files.length === 0) return '';

    const { sourceOnlyMode = false, maxContentLength = 4000 } = options;

    let contextParts = [];

    files.forEach((file, index) => {
        let content = file.extractedContent || `[No content extracted from ${file.name}]`;

        // Truncate if too long
        if (content.length > maxContentLength) {
            content = content.substring(0, maxContentLength) +
                `\n\n... [Content truncated. Full document is ${content.length} characters]`;
        }

        contextParts.push({
            source: `[Source ${index + 1}]`,
            fileName: file.name,
            content: content
        });
    });

    const header = sourceOnlyMode
        ? `=== SOURCE-ONLY MODE ACTIVE ===
You MUST only use information from the uploaded files below.
Do NOT use any external knowledge. If the answer is not in the files, say so.

`
        : `=== FILE CONTEXT ===
The following files have been uploaded for reference.
Use this information to provide accurate, contextual responses.

`;

    const body = contextParts.map(part =>
        `${part.source} ${part.fileName}\n${'─'.repeat(50)}\n${part.content}`
    ).join('\n\n');

    const footer = `\n\n=== END OF FILE CONTEXT ===
${sourceOnlyMode ? 'Remember: Only answer using the sources above.' : ''}
`;

    return header + body + footer;
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Format file size in human-readable format
 */
const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Get file type category
 */
export const getFileCategory = (mimeType) => {
    if (mimeType === 'application/pdf') return 'pdf';
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.includes('word')) return 'document';
    if (mimeType.includes('sheet') || mimeType.includes('excel') || mimeType === 'text/csv') return 'spreadsheet';
    if (mimeType === 'text/plain') return 'text';
    return 'other';
};

/**
 * Check if file type is supported
 */
export const isFileTypeSupported = (mimeType) => {
    const supportedTypes = [
        'text/plain',
        'text/csv',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'image/png',
        'image/jpeg',
        'image/jpg'
    ];

    return supportedTypes.includes(mimeType) || mimeType.startsWith('image/');
};

/**
 * Extract source references from AI response
 * Looks for [Source X] patterns in text
 */
export const extractSourceReferences = (text) => {
    const pattern = /\[Source\s+(\d+)\]/gi;
    const matches = [...text.matchAll(pattern)];
    const sourceNumbers = [...new Set(matches.map(m => parseInt(m[1])))];
    return sourceNumbers.sort((a, b) => a - b);
};

export default {
    processFile,
    processMultipleFiles,
    buildFileContext,
    getFileCategory,
    isFileTypeSupported,
    extractSourceReferences,
    extractTextFromPdf,
    extractTextFromSpreadsheet,
    extractTextFromTxt,
    extractTextFromImage,
    extractTextWithOCR
};
