import React, { useState, useEffect } from 'react';
import {
    FileText, Download, Wand2, ChevronLeft, Layout,
    Settings, Save, FileCheck, AlertCircle, RefreshCw, X, PlusCircle
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useTemplates, TEMPLATE_CATEGORIES } from '../../templates';
import DocumentExportModal from './DocumentExportModal';

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

const TemplateCard = ({ template, onClick }) => (
    <button
        onClick={() => onClick(template)}
        className="flex flex-col items-start p-4 bg-white border border-gray-200 rounded-xl hover:border-indigo-500 hover:shadow-md transition-all text-left group w-full"
    >
        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg mb-3 group-hover:bg-indigo-100 transition-colors">
            <FileText size={20} />
        </div>
        <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
        <p className="text-sm text-gray-500 line-clamp-2">{template.description}</p>
        <div className="mt-3 text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded">
            {template.variants?.length || 0} Variants
        </div>
    </button>
);

const FormField = ({ field, value, onChange, onRequestAI, isAILoading }) => {
    const commonClasses = "w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm";

    const renderInput = () => {
        switch (field.type) {
            case 'textarea':
                return (
                    <div className="relative">
                        <textarea
                            value={value || ''}
                            onChange={(e) => onChange(e.target.value)}
                            className={`${commonClasses} min-h-[100px] resize-y`}
                            placeholder={field.placeholder}
                        />
                        {onRequestAI && (
                            <button
                                onClick={() => onRequestAI(field.id)}
                                disabled={isAILoading}
                                className="absolute top-2 right-2 p-1.5 text-indigo-500 hover:bg-indigo-50 rounded-md transition-colors disabled:opacity-50"
                                title="Generate with AI"
                            >
                                <Wand2 size={14} className={isAILoading ? 'animate-spin' : ''} />
                            </button>
                        )}
                    </div>
                );
            case 'select':
                return (
                    <select
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        className={commonClasses}
                    >
                        <option value="">Select...</option>
                        {field.options?.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                );
            case 'date':
                return (
                    <input
                        type="date"
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        className={commonClasses}
                    />
                );
            case 'array':
                return (
                    <div className="space-y-2">
                        {(value || []).map((item, idx) => (
                            <div key={idx} className="flex gap-2">
                                <input
                                    type="text"
                                    value={typeof item === 'string' ? item : JSON.stringify(item)}
                                    // Complex array editing would need more logic
                                    readOnly
                                    className={`${commonClasses} bg-gray-100 text-gray-500`}
                                />
                                <button className="text-red-500 hover:bg-red-50 p-2 rounded-lg">
                                    <X size={16} />
                                </button>
                            </div>
                        ))}
                        <button className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                            <PlusCircle size={12} /> Add Item
                        </button>
                    </div>
                );
            default:
                return (
                    <input
                        type={field.type || 'text'}
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        className={commonClasses}
                        placeholder={field.placeholder}
                    />
                );
        }
    };

    return (
        <div className="space-y-1.5">
            <label className="block text-xs font-medium text-gray-700">
                {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            {renderInput()}
        </div>
    );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const DocumentEditor = ({ onBack }) => {
    // Template Hook
    const {
        templates,
        categorizedTemplates,
        activeTemplate,
        activeVariant,
        templateData,
        selectTemplate,
        changeVariant,
        updateField,
        render,
        requestAIContent,
        isLoading: isAILoading,
        resetTemplate,
        validationErrors
    } = useTemplates({
        onError: (msg) => console.error(msg)
    });

    const [viewMode, setViewMode] = useState('split'); // split, edit, preview
    const [showExportModal, setShowExportModal] = useState(false);

    // AI Content Generation Handler
    const handleAIRequest = async (fieldId) => {
        await requestAIContent(fieldId, {}, async (prompt) => {
            try {
                const { default: aiService } = await import('../../services/AIService');

                if (!aiService.isAvailable()) {
                    await aiService.checkConnection();
                }

                if (aiService.isAvailable()) {
                    const result = await aiService.chat(
                        [{ role: 'user', content: prompt }],
                        { systemPrompt: 'You are a professional document writer. Generate concise, professional content based on the request.' }
                    );

                    if (result.success) {
                        return result.content;
                    }
                }

                // Demo fallback
                return `[Demo Mode] Generated content for "${fieldId}". Connect Ollama for real AI generation.`;
            } catch (error) {
                console.error('AI generation error:', error);
                return `[Error] ${error.message}. Please ensure Ollama is running.`;
            }
        });
    };

    if (!activeTemplate) {
        return (
            <div className="h-full flex flex-col bg-gray-50 overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-200 bg-white">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Create New Document</h1>
                    <p className="text-gray-500">Select a template to get started with your document.</p>
                </div>

                <div className="flex-1 overflow-y-auto p-8">
                    {Object.entries(categorizedTemplates).map(([category, items]) => (
                        <div key={category} className="mb-10">
                            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">
                                {category}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {items.map(template => (
                                    <TemplateCard
                                        key={template.id}
                                        template={template}
                                        onClick={(t) => selectTemplate(t.id)}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-white overflow-hidden">
            {/* Toolbar */}
            <div className="h-16 border-b border-gray-200 flex items-center justify-between px-4 bg-white z-10">
                <div className="flex items-center gap-4">
                    <button
                        onClick={resetTemplate}
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
                        title="Back to Templates"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div>
                        <h2 className="font-semibold text-gray-900">{activeTemplate.name}</h2>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{activeVariant?.name || 'Default Variant'}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Variant Selector */}
                    <div className="relative group">
                        <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-medium text-gray-700 transition-colors">
                            <Layout size={16} />
                            Layouts
                        </button>
                        <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 hidden group-hover:block z-50">
                            {activeTemplate.variants?.map(v => (
                                <button
                                    key={v.id}
                                    onClick={() => changeVariant(v.id)}
                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${activeVariant === v.id ? 'text-indigo-600 font-medium' : 'text-gray-600'}`}
                                >
                                    {v.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="h-6 w-px bg-gray-200 mx-2" />

                    <button
                        onClick={() => setShowExportModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                    >
                        <Download size={16} />
                        Export
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Editor Panel */}
                <div className={`
                    flex-1 bg-gray-50 overflow-y-auto border-r border-gray-200 p-6
                    ${viewMode === 'preview' ? 'hidden' : 'block'}
                `}>
                    <div className="max-w-2xl mx-auto space-y-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                                <Settings size={18} />
                                Document Details
                            </h3>
                            {validationErrors.length > 0 && (
                                <div className="text-xs text-red-500 flex items-center gap-1">
                                    <AlertCircle size={14} />
                                    {validationErrors.length} issues
                                </div>
                            )}
                        </div>

                        <div className="space-y-5 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            {activeTemplate.fields?.map(field => (
                                <FormField
                                    key={field.id}
                                    field={field}
                                    value={templateData[field.id]}
                                    onChange={(val) => updateField(field.id, val)}
                                    onRequestAI={field.type === 'textarea' ? handleAIRequest : null}
                                    isAILoading={isAILoading}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Preview Panel */}
                <div className={`
                    flex-1 bg-white overflow-y-auto p-8
                    ${viewMode === 'edit' ? 'hidden' : 'block'}
                `}>
                    <div id="document-preview-container" className="max-w-[21cm] mx-auto min-h-[29.7cm] bg-white shadow-lg border border-gray-100 p-[2.5cm]">
                        <div className="prose prose-slate max-w-none">
                            <ReactMarkdown>
                                {render()}
                            </ReactMarkdown>
                        </div>
                    </div>
                </div>
            </div>


            <DocumentExportModal
                isOpen={showExportModal}
                onClose={() => setShowExportModal(false)}
                markdownContent={render()}
                previewElementId="document-preview-container"
                defaultFilename={activeTemplate?.name?.toLowerCase().replace(/\s+/g, '-') || 'document'}
            />
        </div >
    );
};

export default DocumentEditor;
