/**
 * DocumentPreview Component
 * =========================
 * Full document preview modal with content display
 */

import React from 'react';
import { X, Plus, Download, Tag, Clock, FileText, ExternalLink } from 'lucide-react';
import { TYPE_CONFIG, formatRelativeDate } from './LibraryItem';
import { DocumentType } from '../../services/Library';

const DocumentPreview = ({ document, onClose, onAddToChat, onDownload }) => {
    if (!document) return null;

    const config = TYPE_CONFIG[document.type] || TYPE_CONFIG[DocumentType.TEXT];
    const Icon = config.icon;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div
                className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col animate-scale-in overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center gap-4 p-6 border-b bg-gradient-to-r from-gray-50 to-white">
                    <div className={`w-14 h-14 rounded-2xl ${config.bg} flex items-center justify-center border-2 ${config.border} shadow-sm`}>
                        <Icon className={config.color} size={28} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-xl font-bold text-gray-900 truncate">{document.name}</h2>
                        <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                            <span className={`px-2 py-0.5 rounded-lg ${config.bg} ${config.color} font-medium text-xs`}>
                                {document.type?.toUpperCase()}
                            </span>
                            <span>{document.metadata?.fileSizeFormatted || '0 B'}</span>
                            {document.metadata?.wordCount && (
                                <>
                                    <span>•</span>
                                    <span>{document.metadata.wordCount.toLocaleString()} words</span>
                                </>
                            )}
                            <span>•</span>
                            <span className="flex items-center gap-1">
                                <Clock size={12} />
                                {formatRelativeDate(document.metadata?.uploadDate)}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-6 space-y-4">
                    {/* Tags */}
                    {document.tags?.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap">
                            <Tag size={14} className="text-gray-400" />
                            {document.tags.map(tag => (
                                <span
                                    key={tag}
                                    className="px-3 py-1 text-sm rounded-full bg-indigo-50 text-indigo-600 font-medium hover:bg-indigo-100 cursor-pointer transition-colors"
                                >
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* AI Summary */}
                    {document.summary && (
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200">
                            <h4 className="text-sm font-bold text-amber-800 mb-2 flex items-center gap-2">
                                <span className="w-5 h-5 rounded-lg bg-amber-200 flex items-center justify-center text-xs">✨</span>
                                AI Summary
                            </h4>
                            <p className="text-sm text-amber-900 leading-relaxed">{document.summary}</p>
                        </div>
                    )}

                    {/* Key Points */}
                    {document.keyPoints?.length > 0 && (
                        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                            <h4 className="text-sm font-bold text-emerald-800 mb-3">Key Points</h4>
                            <ul className="space-y-2">
                                {document.keyPoints.map((point, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-emerald-900">
                                        <span className="w-5 h-5 rounded-full bg-emerald-200 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                                            {i + 1}
                                        </span>
                                        {point}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Source URL */}
                    {document.metadata?.sourceUrl && (
                        <a
                            href={document.metadata.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 p-3 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-700 hover:bg-cyan-100 transition-colors"
                        >
                            <ExternalLink size={16} />
                            <span className="text-sm font-medium truncate">{document.metadata.sourceUrl}</span>
                        </a>
                    )}

                    {/* Content Preview */}
                    <div>
                        <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                            <FileText size={14} />
                            Document Content
                        </h4>
                        <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 max-h-96 overflow-auto">
                            <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono leading-relaxed">
                                {document.content || 'No content available'}
                            </pre>
                        </div>
                    </div>

                    {/* Metadata */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t">
                        <div className="p-3 rounded-xl bg-gray-50">
                            <p className="text-xs text-gray-500 mb-1">Created</p>
                            <p className="text-sm font-medium text-gray-700">
                                {new Date(document.metadata?.uploadDate).toLocaleDateString()}
                            </p>
                        </div>
                        <div className="p-3 rounded-xl bg-gray-50">
                            <p className="text-xs text-gray-500 mb-1">Last Accessed</p>
                            <p className="text-sm font-medium text-gray-700">
                                {formatRelativeDate(document.metadata?.lastAccessed)}
                            </p>
                        </div>
                        <div className="p-3 rounded-xl bg-gray-50">
                            <p className="text-xs text-gray-500 mb-1">Views</p>
                            <p className="text-sm font-medium text-gray-700">
                                {document.analytics?.viewCount || 0}
                            </p>
                        </div>
                        <div className="p-3 rounded-xl bg-gray-50">
                            <p className="text-xs text-gray-500 mb-1">Queries</p>
                            <p className="text-sm font-medium text-gray-700">
                                {document.analytics?.queryCount || 0}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between gap-4 p-6 border-t bg-gray-50">
                    <p className="text-xs text-gray-400">
                        Version {document.version || 1} • {document.metadata?.source || 'uploaded'}
                    </p>
                    <div className="flex items-center gap-3">
                        {onDownload && (
                            <button
                                onClick={() => onDownload(document)}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 
                                         text-gray-600 font-medium hover:bg-white transition-colors"
                            >
                                <Download size={16} />
                                Download
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="px-4 py-2.5 rounded-xl text-gray-600 hover:bg-gray-200 font-medium transition-colors"
                        >
                            Close
                        </button>
                        <button
                            onClick={() => { onAddToChat?.(document); onClose(); }}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500 
                                     text-white font-medium hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-200"
                        >
                            <Plus size={16} />
                            Add to Chat
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DocumentPreview;
