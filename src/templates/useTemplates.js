/**
 * useTemplates Hook
 * ==================
 * 
 * React hook for template management providing access to all templates,
 * rendering capabilities, and AI integration.
 * 
 * @version 1.0.0
 */

import { useState, useCallback, useMemo } from 'react';
import {
    renderTemplate,
    generateAIPrompt,
    validateTemplateData,
    getTemplateDefaults,
    mergeWithDefaults,
    formatForExport
} from './templateUtils';

// Import all templates
import ReportTemplate from './ReportTemplate';
import CVTemplate from './CVTemplate';
import InvoiceTemplate from './InvoiceTemplate';
import PresentationTemplate from './PresentationTemplate';
import MeetingNotesTemplate from './MeetingNotesTemplate';

// =============================================================================
// TEMPLATE CATEGORIES
// =============================================================================

export const TEMPLATE_CATEGORIES = {
    DOCUMENTS: 'documents',
    BUSINESS: 'business',
    PERSONAL: 'personal',
    CREATIVE: 'creative'
};

// =============================================================================
// TEMPLATE REGISTRY
// =============================================================================

const TEMPLATE_REGISTRY = {
    report: ReportTemplate,
    cv: CVTemplate,
    invoice: InvoiceTemplate,
    presentation: PresentationTemplate,
    meeting: MeetingNotesTemplate
};

// =============================================================================
// HOOK IMPLEMENTATION
// =============================================================================

export function useTemplates(options = {}) {
    const {
        onError,
        onRender,
        autoValidate = true
    } = options;

    // State
    const [activeTemplate, setActiveTemplate] = useState(null);
    const [activeVariant, setActiveVariant] = useState(null);
    const [templateData, setTemplateData] = useState({});
    const [renderedContent, setRenderedContent] = useState('');
    const [validationErrors, setValidationErrors] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // =========================================================================
    // TEMPLATE ACCESS
    // =========================================================================

    /**
     * Get all available templates
     */
    const getAllTemplates = useCallback(() => {
        return Object.entries(TEMPLATE_REGISTRY).map(([id, template]) => ({
            id,
            name: template.name,
            description: template.description,
            icon: template.icon,
            category: template.category,
            variantCount: template.variants?.length || 0
        }));
    }, []);

    /**
     * Get templates by category
     */
    const getTemplatesByCategory = useCallback((category) => {
        return getAllTemplates().filter(t => t.category === category);
    }, [getAllTemplates]);

    /**
     * Get a specific template by ID
     */
    const getTemplate = useCallback((templateId) => {
        return TEMPLATE_REGISTRY[templateId] || null;
    }, []);

    /**
     * Get template variants
     */
    const getTemplateVariants = useCallback((templateId) => {
        const template = getTemplate(templateId);
        return template?.variants || [];
    }, [getTemplate]);

    /**
     * Get template fields
     */
    const getTemplateFields = useCallback((templateId) => {
        const template = getTemplate(templateId);
        return template?.fields || [];
    }, [getTemplate]);

    // =========================================================================
    // TEMPLATE SELECTION
    // =========================================================================

    /**
     * Select a template for use
     */
    const selectTemplate = useCallback((templateId, variantId = null) => {
        const template = getTemplate(templateId);
        if (!template) {
            onError?.(`Template "${templateId}" not found`);
            return false;
        }

        const variant = variantId || template.defaults?.variant || template.variants?.[0]?.id;

        setActiveTemplate(template);
        setActiveVariant(variant);
        setTemplateData(getTemplateDefaults(template, variant));
        setRenderedContent('');
        setValidationErrors([]);

        return true;
    }, [getTemplate, onError]);

    /**
     * Change variant of current template
     */
    const changeVariant = useCallback((variantId) => {
        if (!activeTemplate) return false;

        const variant = activeTemplate.variants?.find(v => v.id === variantId);
        if (!variant) {
            onError?.(`Variant "${variantId}" not found`);
            return false;
        }

        setActiveVariant(variantId);
        return true;
    }, [activeTemplate, onError]);

    /**
     * Reset template selection
     */
    const resetTemplate = useCallback(() => {
        setActiveTemplate(null);
        setActiveVariant(null);
        setTemplateData({});
        setRenderedContent('');
        setValidationErrors([]);
    }, []);

    // =========================================================================
    // DATA MANAGEMENT
    // =========================================================================

    /**
     * Update template data
     */
    const updateData = useCallback((updates) => {
        setTemplateData(prev => {
            const newData = { ...prev, ...updates };

            // Auto-validate if enabled
            if (autoValidate && activeTemplate) {
                const result = validateTemplateData(newData, activeTemplate.fields);
                setValidationErrors(result.errors);
            }

            return newData;
        });
    }, [activeTemplate, autoValidate]);

    /**
     * Update a specific field
     */
    const updateField = useCallback((fieldId, value) => {
        updateData({ [fieldId]: value });
    }, [updateData]);

    /**
     * Add item to array field
     */
    const addArrayItem = useCallback((fieldId, item = {}) => {
        setTemplateData(prev => {
            const currentArray = prev[fieldId] || [];
            return {
                ...prev,
                [fieldId]: [...currentArray, item]
            };
        });
    }, []);

    /**
     * Remove item from array field
     */
    const removeArrayItem = useCallback((fieldId, index) => {
        setTemplateData(prev => {
            const currentArray = prev[fieldId] || [];
            return {
                ...prev,
                [fieldId]: currentArray.filter((_, i) => i !== index)
            };
        });
    }, []);

    /**
     * Update item in array field
     */
    const updateArrayItem = useCallback((fieldId, index, updates) => {
        setTemplateData(prev => {
            const currentArray = [...(prev[fieldId] || [])];
            currentArray[index] = { ...currentArray[index], ...updates };
            return {
                ...prev,
                [fieldId]: currentArray
            };
        });
    }, []);

    /**
     * Reset data to defaults
     */
    const resetData = useCallback(() => {
        if (activeTemplate) {
            setTemplateData(getTemplateDefaults(activeTemplate, activeVariant));
            setValidationErrors([]);
        }
    }, [activeTemplate, activeVariant]);

    // =========================================================================
    // RENDERING
    // =========================================================================

    /**
     * Render the current template with data
     */
    const render = useCallback(() => {
        if (!activeTemplate || !activeVariant) {
            onError?.('No template selected');
            return null;
        }

        const templateStructure = activeTemplate.structure?.[activeVariant];
        if (!templateStructure) {
            onError?.(`No structure found for variant "${activeVariant}"`);
            return null;
        }

        // Merge data with defaults
        const mergedData = mergeWithDefaults(templateData, activeTemplate, activeVariant);

        // Validate before rendering
        const validation = validateTemplateData(mergedData, activeTemplate.fields);
        setValidationErrors(validation.errors);

        if (!validation.valid) {
            onError?.('Validation failed', validation.errors);
        }

        // Render template
        const rendered = renderTemplate(templateStructure, mergedData);
        setRenderedContent(rendered);
        onRender?.(rendered);

        return rendered;
    }, [activeTemplate, activeVariant, templateData, onError, onRender]);

    /**
     * Render for specific export format
     */
    const renderForExport = useCallback((format = 'markdown') => {
        const content = render();
        if (!content) return null;

        return formatForExport(content, format);
    }, [render]);

    // =========================================================================
    // AI INTEGRATION
    // =========================================================================

    /**
     * Generate AI prompt for content creation
     */
    const getAIPrompt = useCallback((context = {}) => {
        if (!activeTemplate || !activeVariant) {
            return null;
        }

        const mergedContext = { ...templateData, ...context };
        return generateAIPrompt(activeTemplate, activeVariant, mergedContext);
    }, [activeTemplate, activeVariant, templateData]);

    /**
     * Request AI to fill a specific field
     */
    const requestAIContent = useCallback(async (fieldId, context = {}, aiHandler) => {
        if (!aiHandler) {
            onError?.('No AI handler provided');
            return null;
        }

        setIsLoading(true);
        try {
            const field = activeTemplate?.fields?.find(f => f.id === fieldId);
            const prompt = `Generate content for "${field?.label || fieldId}" in a ${activeTemplate?.name || 'document'}.

Context:
${Object.entries({ ...templateData, ...context })
                    .filter(([key, value]) => value && typeof value === 'string')
                    .map(([key, value]) => `${key}: ${value}`)
                    .join('\n')}

Requirements:
- Be professional and well-structured
- Keep it concise but comprehensive
- Match the tone of a ${activeVariant || 'professional'} document`;

            const content = await aiHandler(prompt);

            if (content) {
                updateField(fieldId, content);
            }

            return content;
        } catch (error) {
            onError?.(`AI content generation failed: ${error.message}`);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [activeTemplate, activeVariant, templateData, updateField, onError]);

    // =========================================================================
    // EXPORT
    // =========================================================================

    /**
     * Get export formats for current template
     */
    const getExportFormats = useCallback(() => {
        return activeTemplate?.exportFormats || ['markdown', 'html'];
    }, [activeTemplate]);

    /**
     * Export template data as JSON
     */
    const exportAsJson = useCallback(() => {
        return {
            template: activeTemplate?.id,
            variant: activeVariant,
            data: templateData,
            rendered: renderedContent,
            exportedAt: new Date().toISOString()
        };
    }, [activeTemplate, activeVariant, templateData, renderedContent]);

    /**
     * Import template data from JSON
     */
    const importFromJson = useCallback((json) => {
        try {
            const data = typeof json === 'string' ? JSON.parse(json) : json;

            if (data.template) {
                selectTemplate(data.template, data.variant);
            }

            if (data.data) {
                setTemplateData(data.data);
            }

            return true;
        } catch (error) {
            onError?.(`Import failed: ${error.message}`);
            return false;
        }
    }, [selectTemplate, onError]);

    // =========================================================================
    // COMPUTED VALUES
    // =========================================================================

    const templateList = useMemo(() => getAllTemplates(), [getAllTemplates]);

    const categorizedTemplates = useMemo(() => {
        const categories = {};
        for (const template of templateList) {
            if (!categories[template.category]) {
                categories[template.category] = [];
            }
            categories[template.category].push(template);
        }
        return categories;
    }, [templateList]);

    const currentFields = useMemo(() => {
        return activeTemplate?.fields || [];
    }, [activeTemplate]);

    const isValid = useMemo(() => {
        return validationErrors.length === 0;
    }, [validationErrors]);

    const hasData = useMemo(() => {
        return Object.keys(templateData).some(key => {
            const value = templateData[key];
            return value !== undefined && value !== null && value !== '';
        });
    }, [templateData]);

    // =========================================================================
    // RETURN
    // =========================================================================

    return {
        // Templates
        templates: templateList,
        categorizedTemplates,
        getAllTemplates,
        getTemplatesByCategory,
        getTemplate,
        getTemplateVariants,
        getTemplateFields,

        // Current template
        activeTemplate,
        activeVariant,
        currentFields,

        // Selection
        selectTemplate,
        changeVariant,
        resetTemplate,

        // Data
        templateData,
        updateData,
        updateField,
        addArrayItem,
        removeArrayItem,
        updateArrayItem,
        resetData,

        // Rendering
        render,
        renderForExport,
        renderedContent,

        // Validation
        validationErrors,
        isValid,

        // AI
        getAIPrompt,
        requestAIContent,
        isLoading,

        // Export/Import
        getExportFormats,
        exportAsJson,
        importFromJson,

        // Computed
        hasData
    };
}

export default useTemplates;
