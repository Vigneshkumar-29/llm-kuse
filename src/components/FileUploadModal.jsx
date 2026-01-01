import React from 'react';
import { X, Upload, Sparkles, FileText } from 'lucide-react';
import FileUpload from './FileUpload';

const FileUploadModal = ({ isOpen, onClose, uploadedFiles, onFilesChange }) => {
    if (!isOpen) return null;

    const hasFiles = uploadedFiles && uploadedFiles.length > 0;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-enter" />

            {/* Modal */}
            <div
                className="relative w-full max-w-2xl max-h-[85vh] bg-background rounded-2xl shadow-2xl overflow-hidden animate-scale"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-black/5 bg-surface/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-orange-500 flex items-center justify-center shadow-lg shadow-accent/20">
                            <Upload size={20} className="text-white" />
                        </div>
                        <div>
                            <h2 className="font-serif text-lg font-semibold text-primary">
                                Upload Files
                            </h2>
                            <p className="text-xs text-secondary">
                                Add documents to enhance AI responses
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-black/5 text-secondary hover:text-primary transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(85vh-140px)]">
                    {/* Info Banner */}
                    <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-accent/5 to-orange-50 border border-accent/10">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm flex-shrink-0">
                                <Sparkles size={16} className="text-accent" />
                            </div>
                            <div>
                                <h4 className="font-medium text-primary text-sm mb-1">
                                    Enhance Your AI Experience
                                </h4>
                                <p className="text-xs text-secondary leading-relaxed">
                                    Upload documents, images, or spreadsheets to provide context for your conversations.
                                    The AI will use this information to give you more accurate and relevant responses.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* File Upload Component */}
                    <FileUpload
                        onFilesChange={onFilesChange}
                        maxFiles={10}
                    />
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-black/5 bg-surface/30 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-secondary">
                        <FileText size={14} />
                        <span>
                            {hasFiles
                                ? `${uploadedFiles.length} file${uploadedFiles.length > 1 ? 's' : ''} ready`
                                : 'No files uploaded yet'
                            }
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg text-sm font-medium text-secondary hover:text-primary hover:bg-black/5 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onClose}
                            disabled={!hasFiles}
                            className={`
                px-5 py-2 rounded-xl text-sm font-medium transition-all
                ${hasFiles
                                    ? 'bg-primary text-white hover:bg-secondary shadow-md hover:shadow-lg'
                                    : 'bg-black/5 text-secondary cursor-not-allowed'
                                }
              `}
                        >
                            {hasFiles ? 'Done' : 'Upload files to continue'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FileUploadModal;
