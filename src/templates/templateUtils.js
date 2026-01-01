/**
 * Template Utilities
 * ====================
 * 
 * Utility functions for template rendering, variable parsing,
 * AI prompt generation, and data validation.
 * 
 * @version 1.0.0
 */

// =============================================================================
// TEMPLATE RENDERING
// =============================================================================

/**
 * Simple Mustache-like template renderer
 * Supports: {{variable}}, {{#array}}...{{/array}}, {{#conditional}}...{{/conditional}}
 * 
 * @param {string} template - Template string with placeholders
 * @param {Object} data - Data to fill the template
 * @returns {string} - Rendered template
 */
export function renderTemplate(template, data) {
    if (!template || !data) return template || '';

    let result = template;

    // Handle array/section blocks: {{#items}}...{{/items}}
    result = result.replace(/\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g, (match, key, content) => {
        const value = getNestedValue(data, key);

        if (Array.isArray(value)) {
            // Array iteration
            return value.map((item, index) => {
                if (typeof item === 'object') {
                    // Object in array
                    return renderTemplate(content, { ...item, index, number: index + 1 });
                } else {
                    // Primitive in array
                    return renderTemplate(content.replace(/\{\{\.\}\}/g, item), { value: item });
                }
            }).join('');
        } else if (value) {
            // Truthy conditional
            return renderTemplate(content, typeof value === 'object' ? value : data);
        }
        return '';
    });

    // Handle inverted sections (false/empty): {{^key}}...{{/key}}
    result = result.replace(/\{\{\^(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g, (match, key, content) => {
        const value = getNestedValue(data, key);
        if (!value || (Array.isArray(value) && value.length === 0)) {
            return renderTemplate(content, data);
        }
        return '';
    });

    // Handle simple variables: {{variable}}
    result = result.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (match, key) => {
        const value = getNestedValue(data, key);
        return value !== undefined ? String(value) : '';
    });

    return result;
}

/**
 * Get nested value from object using dot notation
 * 
 * @param {Object} obj - Source object
 * @param {string} path - Dot-notation path (e.g., "user.name")
 * @returns {*} - Value at path or undefined
 */
function getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) =>
        current && current[key] !== undefined ? current[key] : undefined, obj);
}

// =============================================================================
// AI PROMPT GENERATION
// =============================================================================

/**
 * Generate AI prompt for content creation
 * 
 * @param {Object} template - Template definition
 * @param {string} variant - Template variant
 * @param {Object} context - Context data for the prompt
 * @returns {string} - Generated prompt for AI
 */
export function generateAIPrompt(template, variant, context = {}) {
    if (!template || !template.aiPrompts) {
        return generateGenericPrompt(template, context);
    }

    const promptTemplate = template.aiPrompts[variant] || template.aiPrompts.default;

    if (!promptTemplate) {
        return generateGenericPrompt(template, context);
    }

    return renderTemplate(promptTemplate, context);
}

/**
 * Generate a generic prompt when no specific prompt exists
 */
function generateGenericPrompt(template, context) {
    const templateName = template?.name || 'document';
    const fields = template?.fields || [];
    const requiredFields = fields.filter(f => f.required).map(f => f.label);

    return `Generate professional content for a ${templateName} with the following requirements:

Topic/Subject: ${context.topic || context.title || 'Not specified'}
Audience: ${context.audience || 'General'}
Tone: ${context.tone || 'Professional'}

Please include content for these sections:
${requiredFields.map((f, i) => `${i + 1}. ${f}`).join('\n')}

Additional context: ${context.additionalContext || 'None provided'}

Make the content clear, professional, and well-structured.`;
}

/**
 * Generate prompt for specific section
 */
export function generateSectionPrompt(sectionName, context) {
    const prompts = {
        summary: `Write a professional summary/abstract for:
Topic: ${context.topic}
Audience: ${context.audience}
Keep it concise (2-3 paragraphs) and highlight key points.`,

        introduction: `Write an engaging introduction for:
Topic: ${context.topic}
Purpose: ${context.purpose}
Set the stage and provide context for the reader.`,

        conclusion: `Write a compelling conclusion for:
Topic: ${context.topic}
Key Points Covered: ${context.keyPoints?.join(', ')}
Summarize main insights and provide a clear takeaway.`,

        actionItems: `Based on this discussion, generate clear action items:
Context: ${context.discussion}
Participants: ${context.participants?.join(', ')}
Format each with: Task, Owner, Due Date, Priority`,

        recommendations: `Provide professional recommendations for:
Topic: ${context.topic}
Analysis: ${context.analysis}
Make them specific, actionable, and prioritized.`
    };

    return prompts[sectionName] || `Generate content for ${sectionName} section.`;
}

// =============================================================================
// VARIABLE PARSING
// =============================================================================

/**
 * Parse template variables from a template string
 * 
 * @param {string} template - Template string
 * @returns {Array<Object>} - Array of variable definitions
 */
export function parseTemplateVariables(template) {
    if (!template) return [];

    const variables = [];
    const seen = new Set();

    // Match {{variable}} patterns
    const simpleMatches = template.matchAll(/\{\{(\w+(?:\.\w+)*)\}\}/g);
    for (const match of simpleMatches) {
        const varName = match[1];
        if (!seen.has(varName) && !varName.startsWith('#') && !varName.startsWith('/') && varName !== '.') {
            seen.add(varName);
            variables.push({
                name: varName,
                type: inferVariableType(varName),
                required: true
            });
        }
    }

    // Match section/array patterns: {{#items}}
    const sectionMatches = template.matchAll(/\{\{#(\w+)\}\}/g);
    for (const match of sectionMatches) {
        const varName = match[1];
        if (!seen.has(varName)) {
            seen.add(varName);
            variables.push({
                name: varName,
                type: 'array',
                required: false
            });
        }
    }

    return variables;
}

/**
 * Infer variable type from name
 */
function inferVariableType(varName) {
    const lowerName = varName.toLowerCase();

    if (lowerName.includes('date')) return 'date';
    if (lowerName.includes('email')) return 'email';
    if (lowerName.includes('phone')) return 'text';
    if (lowerName.includes('url') || lowerName.includes('link') || lowerName.includes('website')) return 'url';
    if (lowerName.includes('amount') || lowerName.includes('price') || lowerName.includes('total')) return 'number';
    if (lowerName.includes('description') || lowerName.includes('content') || lowerName.includes('summary') || lowerName.includes('notes')) return 'textarea';
    if (lowerName.includes('items') || lowerName.includes('list')) return 'array';

    return 'text';
}

// =============================================================================
// DATA VALIDATION
// =============================================================================

/**
 * Validate template data against field definitions
 * 
 * @param {Object} data - Data to validate
 * @param {Array<Object>} fields - Field definitions from template
 * @returns {Object} - Validation result { valid, errors }
 */
export function validateTemplateData(data, fields) {
    const errors = [];

    if (!data || !fields) {
        return { valid: false, errors: ['Invalid data or field definitions'] };
    }

    for (const field of fields) {
        const value = data[field.id];

        // Required field check
        if (field.required) {
            if (value === undefined || value === null || value === '') {
                errors.push({
                    field: field.id,
                    message: `${field.label || field.id} is required`
                });
                continue;
            }

            // Array required check
            if (field.type === 'array' && (!Array.isArray(value) || value.length === 0)) {
                errors.push({
                    field: field.id,
                    message: `${field.label || field.id} must have at least one item`
                });
                continue;
            }
        }

        // Skip further validation if empty and not required
        if (value === undefined || value === null || value === '') {
            continue;
        }

        // Type-specific validation
        switch (field.type) {
            case 'email':
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    errors.push({
                        field: field.id,
                        message: `${field.label || field.id} must be a valid email address`
                    });
                }
                break;

            case 'url':
                try {
                    new URL(value.startsWith('http') ? value : `https://${value}`);
                } catch {
                    errors.push({
                        field: field.id,
                        message: `${field.label || field.id} must be a valid URL`
                    });
                }
                break;

            case 'number':
                if (isNaN(Number(value))) {
                    errors.push({
                        field: field.id,
                        message: `${field.label || field.id} must be a number`
                    });
                }
                break;

            case 'date':
                if (isNaN(Date.parse(value))) {
                    errors.push({
                        field: field.id,
                        message: `${field.label || field.id} must be a valid date`
                    });
                }
                break;

            case 'array':
                if (!Array.isArray(value)) {
                    errors.push({
                        field: field.id,
                        message: `${field.label || field.id} must be an array`
                    });
                }
                break;
        }

        // Min/Max length validation
        if (field.minLength && typeof value === 'string' && value.length < field.minLength) {
            errors.push({
                field: field.id,
                message: `${field.label || field.id} must be at least ${field.minLength} characters`
            });
        }

        if (field.maxLength && typeof value === 'string' && value.length > field.maxLength) {
            errors.push({
                field: field.id,
                message: `${field.label || field.id} must be at most ${field.maxLength} characters`
            });
        }
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

// =============================================================================
// TEMPLATE HELPERS
// =============================================================================

/**
 * Get default values for a template
 */
export function getTemplateDefaults(template, variant = null) {
    if (!template) return {};

    const defaults = { ...template.defaults };

    if (variant) {
        defaults.variant = variant;
    }

    // Add field defaults
    if (template.fields) {
        for (const field of template.fields) {
            if (field.defaultValue !== undefined && defaults[field.id] === undefined) {
                defaults[field.id] = field.defaultValue;
            }
        }
    }

    return defaults;
}

/**
 * Merge user data with template defaults
 */
export function mergeWithDefaults(data, template, variant = null) {
    const defaults = getTemplateDefaults(template, variant);
    return { ...defaults, ...data };
}

/**
 * Format rendered template for export
 */
export function formatForExport(content, format = 'markdown') {
    switch (format) {
        case 'html':
            return convertMarkdownToHtml(content);
        case 'plaintext':
            return stripMarkdown(content);
        default:
            return content;
    }
}

/**
 * Simple Markdown to HTML conversion
 */
function convertMarkdownToHtml(markdown) {
    if (!markdown) return '';

    let html = markdown
        // Headers
        .replace(/^### (.*$)/gm, '<h3>$1</h3>')
        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
        .replace(/^# (.*$)/gm, '<h1>$1</h1>')
        // Bold
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // Italic
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        // Links
        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
        // Line breaks
        .replace(/\n\n/g, '</p><p>')
        // Horizontal rules
        .replace(/^---$/gm, '<hr>')
        // Lists
        .replace(/^- (.*$)/gm, '<li>$1</li>')
        .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

    // Wrap in paragraph tags
    html = `<p>${html}</p>`;

    return html;
}

/**
 * Strip Markdown formatting
 */
function stripMarkdown(markdown) {
    if (!markdown) return '';

    return markdown
        .replace(/^#{1,6}\s/gm, '')
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/\[(.*?)\]\(.*?\)/g, '$1')
        .replace(/^---$/gm, '')
        .replace(/^- /gm, '• ')
        .trim();
}

/**
 * Calculate reading time for content
 */
export function calculateReadingTime(content, wordsPerMinute = 200) {
    if (!content) return 0;
    const wordCount = content.split(/\s+/).filter(Boolean).length;
    return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * Word count utility
 */
export function countWords(content) {
    if (!content) return 0;
    return content.split(/\s+/).filter(Boolean).length;
}

export default {
    renderTemplate,
    generateAIPrompt,
    generateSectionPrompt,
    parseTemplateVariables,
    validateTemplateData,
    getTemplateDefaults,
    mergeWithDefaults,
    formatForExport,
    calculateReadingTime,
    countWords
};
