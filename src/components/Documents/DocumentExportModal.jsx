import React, { useState } from 'react';
import {
    X, FileText, FileCode, FileType, File, Download, Loader2
} from 'lucide-react';
import DocumentExport from '../../services/DocumentExport';

const EXPORT_FORMATS = [
    { id: 'markdown', label: 'Markdown', ext: '.md', icon: FileCode, description: 'Raw source file, best for editors' },
    { id: 'pdf', label: 'PDF Document', ext: '.pdf', icon: FileType, description: 'Standard portable document format' },
    { id: 'html', label: 'HTML File', ext: '.html', icon: FileCode, description: 'Web page format' },
    { id: 'docx', label: 'Word Document', ext: '.docx', icon: FileText, description: 'Microsoft Word compatible' },
    { id: 'txt', label: 'Plain Text', ext: '.txt', icon: File, description: 'Simple text without formatting' }
];

const DocumentExportModal = ({ isOpen, onClose, markdownContent, previewElementId, defaultFilename = 'document' }) => {
    const [selectedFormat, setSelectedFormat] = useState('pdf');
    const [filename, setFilename] = useState(defaultFilename);
    const [isExporting, setIsExporting] = useState(false);
    const [error, setError] = useState(null);

    if (!isOpen) return null;

    const handleExport = async () => {
        setIsExporting(true);
        setError(null);

        try {
            switch (selectedFormat) {
                case 'markdown':
                    DocumentExport.toMarkdown(markdownContent, filename);
                    break;
                case 'txt':
                    DocumentExport.toPlainText(markdownContent, filename);
                    break;
                case 'html':
                    // We need a rendered HTML version. Since we have markdownContent, 
                    // we'll rely on the service to wrap it or convert it if it has a parser.
                    // For now, let's assume we want to export the raw rendered HTML if possible, 
                    // OR simply wrap the markdown (as done in the service currently).
                    // Robust solution: If we had a markdown parser here, we'd use it.
                    // But the service does a simple wrap. Ideally, pass rendered HTML string if available.
                    // For now, we only pass content.
                    DocumentExport.toHTML(markdownContent, filename);
                    break;
                case 'pdf':
                    if (previewElementId) {
                        await DocumentExport.toPDF(previewElementId, filename);
                    } else {
                        throw new Error("Preview element not found for PDF generation.");
                    }
                    break;
                case 'docx':
                    await DocumentExport.toDOCX(markdownContent, filename);
                    break;
                default:
                    break;
            }
            onClose();
        } catch (err) {
            console.error(err);
            setError("Export failed. Please try again.");
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md border border-gray-100 overflow-hidden scale-100 animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Download size={18} className="text-indigo-600" />
                        Export Document
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">

                    {/* Filename Input */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Filename
                        </label>
                        <div className="flex items-center">
                            <input
                                type="text"
                                value={filename}
                                onChange={(e) => setFilename(e.target.value)}
                                className="flex-1 p-2.5 bg-gray-50 border border-gray-200 rounded-l-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm"
                                placeholder="my-document"
                            />
                            <div className="px-3 py-2.5 bg-gray-100 border border-l-0 border-gray-200 rounded-r-lg text-sm text-gray-500 font-medium">
                                {EXPORT_FORMATS.find(f => f.id === selectedFormat)?.ext}
                            </div>
                        </div>
                    </div>

                    {/* Format Selection */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Format
                        </label>
                        <div className="grid grid-cols-1 gap-2">
                            {EXPORT_FORMATS.map(format => {
                                const Icon = format.icon;
                                const isSelected = selectedFormat === format.id;
                                return (
                                    <button
                                        key={format.id}
                                        onClick={() => setSelectedFormat(format.id)}
                                        className={`flex items-center gap-4 p-3 rounded-lg border text-left transition-all ${isSelected
                                                ? 'border-indigo-500 bg-indigo-50/50 ring-1 ring-indigo-500'
                                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className={`p-2 rounded-lg ${isSelected ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'}`}>
                                            <Icon size={20} />
                                        </div>
                                        <div>
                                            <div className={`text-sm font-medium ${isSelected ? 'text-indigo-900' : 'text-gray-900'}`}>
                                                {format.label}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {format.description}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                            <div className="w-1 h-4 bg-red-500 rounded-full" />
                            {error}
                        </div>
                    )}

                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleExport}
                        disabled={isExporting || !filename.trim()}
                        className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isExporting ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Exporting...
                            </>
                        ) : (
                            <>
                                <Download size={16} />
                                Export Now
                            </>
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default DocumentExportModal;
