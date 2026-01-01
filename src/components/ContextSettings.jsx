import React, { useState } from 'react';
import {
    FileText, Lock, Unlock, Settings, ChevronDown,
    ChevronUp, BookOpen, Zap, Info, CheckCircle,
    AlertTriangle, X, Eye
} from 'lucide-react';

/**
 * Context Settings Panel
 * Provides controls for Source Only Mode and displays file references
 */
const ContextSettings = ({
    uploadedFiles = [],
    sourceOnlyMode,
    onSourceOnlyModeChange,
    referencedSources = [],
    isExpanded,
    onToggleExpand
}) => {
    const [showFilePreview, setShowFilePreview] = useState(null);

    const hasFiles = uploadedFiles.length > 0;

    if (!hasFiles) return null;

    return (
        <div className="animate-enter">
            {/* Collapsed Bar */}
            <div
                onClick={onToggleExpand}
                className={`
          flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer
          transition-all duration-300 border
          ${sourceOnlyMode
                        ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200'
                        : 'bg-white border-black/5 hover:border-black/10'
                    }
        `}
            >
                <div className="flex items-center gap-3">
                    {/* Mode Icon */}
                    <div className={`
            w-9 h-9 rounded-xl flex items-center justify-center
            ${sourceOnlyMode
                            ? 'bg-amber-500 text-white shadow-md shadow-amber-200'
                            : 'bg-surface-highlight text-secondary'
                        }
          `}>
                        {sourceOnlyMode ? <Lock size={16} /> : <BookOpen size={16} />}
                    </div>

                    {/* Status Text */}
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-sm text-primary">
                                {sourceOnlyMode ? 'Source-Only Mode' : 'Context Mode'}
                            </span>
                            {sourceOnlyMode && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white uppercase">
                                    Active
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-secondary">
                            {uploadedFiles.length} file{uploadedFiles.length > 1 ? 's' : ''} as context
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Referenced Sources Badge */}
                    {referencedSources.length > 0 && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-emerald-50 border border-emerald-200 rounded-lg">
                            <CheckCircle size={12} className="text-emerald-500" />
                            <span className="text-xs font-medium text-emerald-600">
                                {referencedSources.length} source{referencedSources.length > 1 ? 's' : ''} cited
                            </span>
                        </div>
                    )}

                    {/* Expand/Collapse */}
                    <div className="p-1.5 rounded-lg hover:bg-black/5 text-secondary">
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                </div>
            </div>

            {/* Expanded Panel */}
            {isExpanded && (
                <div className="mt-3 p-4 bg-white rounded-xl border border-black/5 shadow-sm animate-enter space-y-4">

                    {/* Source Only Mode Toggle */}
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-surface-highlight/50 border border-black/5">
                        <div className={`
              w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
              ${sourceOnlyMode
                                ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-md'
                                : 'bg-white border border-black/10 text-secondary'
                            }
            `}>
                            {sourceOnlyMode ? <Lock size={18} /> : <Unlock size={18} />}
                        </div>

                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-medium text-primary text-sm">Source-Only Mode</h4>
                                    <p className="text-xs text-secondary mt-0.5">
                                        {sourceOnlyMode
                                            ? 'AI will ONLY use your uploaded files to answer'
                                            : 'AI uses files as additional context alongside its knowledge'
                                        }
                                    </p>
                                </div>

                                {/* Toggle Switch */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onSourceOnlyModeChange(!sourceOnlyMode);
                                    }}
                                    className={`
                    relative w-12 h-6 rounded-full transition-all duration-300
                    ${sourceOnlyMode
                                            ? 'bg-amber-500'
                                            : 'bg-black/10 hover:bg-black/15'
                                        }
                  `}
                                >
                                    <div className={`
                    absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm
                    transition-all duration-300
                    ${sourceOnlyMode ? 'left-6' : 'left-0.5'}
                  `} />
                                </button>
                            </div>

                            {sourceOnlyMode && (
                                <div className="mt-3 flex items-start gap-2 p-2 bg-amber-50 rounded-lg border border-amber-200">
                                    <AlertTriangle size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
                                    <p className="text-xs text-amber-700">
                                        The AI will refuse to answer questions not covered in your uploaded files.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* File List */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-medium text-secondary uppercase tracking-wider">
                                Context Sources
                            </h4>
                            <span className="text-[10px] text-secondary/60">
                                Click to preview content
                            </span>
                        </div>

                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {uploadedFiles.map((file, index) => {
                                const isReferenced = referencedSources.includes(index + 1);
                                const sourceNum = index + 1;

                                return (
                                    <div
                                        key={file.id || index}
                                        onClick={() => setShowFilePreview(showFilePreview === index ? null : index)}
                                        className={`
                      flex items-center gap-3 p-3 rounded-xl cursor-pointer
                      transition-all duration-200 border
                      ${isReferenced
                                                ? 'bg-emerald-50 border-emerald-200'
                                                : 'bg-surface-highlight/50 border-transparent hover:border-black/5'
                                            }
                      ${showFilePreview === index ? 'ring-2 ring-accent/20' : ''}
                    `}
                                    >
                                        {/* Source Badge */}
                                        <div className={`
                      w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold
                      ${isReferenced
                                                ? 'bg-emerald-500 text-white'
                                                : 'bg-white border border-black/10 text-secondary'
                                            }
                    `}>
                                            {sourceNum}
                                        </div>

                                        {/* File Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <FileText size={14} className="text-secondary flex-shrink-0" />
                                                <span className="font-medium text-sm text-primary truncate">
                                                    {file.name}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[10px] text-secondary">
                                                    {(file.size / 1024).toFixed(1)} KB
                                                </span>
                                                {file.contentMetadata?.pageCount && (
                                                    <span className="text-[10px] text-secondary">
                                                        • {file.contentMetadata.pageCount} pages
                                                    </span>
                                                )}
                                                {isReferenced && (
                                                    <span className="text-[10px] text-emerald-600 font-medium">
                                                        • Cited in response
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Preview Indicator */}
                                        <Eye size={14} className={`
                      transition-colors
                      ${showFilePreview === index ? 'text-accent' : 'text-secondary/40'}
                    `} />
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* File Content Preview */}
                    {showFilePreview !== null && uploadedFiles[showFilePreview] && (
                        <div className="animate-enter">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="text-xs font-medium text-secondary">
                                    Content Preview: {uploadedFiles[showFilePreview].name}
                                </h4>
                                <button
                                    onClick={() => setShowFilePreview(null)}
                                    className="p-1 hover:bg-black/5 rounded text-secondary"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                            <div className="p-3 bg-[#1e1e1e] rounded-xl text-xs text-gray-300 font-mono max-h-40 overflow-y-auto whitespace-pre-wrap">
                                {uploadedFiles[showFilePreview].extractedContent?.substring(0, 1000) ||
                                    '[No content extracted]'}
                                {(uploadedFiles[showFilePreview].extractedContent?.length || 0) > 1000 && (
                                    <span className="text-gray-500">
                                        {'\n\n... [truncated for preview]'}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Tips */}
                    <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-xl border border-blue-100">
                        <Info size={14} className="text-blue-500 flex-shrink-0 mt-0.5" />
                        <div className="text-xs text-blue-700">
                            <strong>Tip:</strong> The AI will reference sources as [Source 1], [Source 2], etc.
                            These correspond to the numbered files above.
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

/**
 * Source Reference Display
 * Shows which sources were used in the AI response
 */
export const SourceReferenceDisplay = ({
    referencedSources = [],
    uploadedFiles = [],
    className = ''
}) => {
    if (referencedSources.length === 0 || uploadedFiles.length === 0) return null;

    return (
        <div className={`flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-black/5 ${className}`}>
            <span className="text-[10px] text-secondary uppercase tracking-wider font-medium">
                Sources:
            </span>
            {referencedSources.map(sourceNum => {
                const file = uploadedFiles[sourceNum - 1];
                if (!file) return null;

                return (
                    <div
                        key={sourceNum}
                        className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 border border-emerald-200 rounded-lg"
                    >
                        <div className="w-4 h-4 rounded bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center">
                            {sourceNum}
                        </div>
                        <span className="text-[11px] text-emerald-700 font-medium truncate max-w-[120px]">
                            {file.name}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};

export default ContextSettings;
