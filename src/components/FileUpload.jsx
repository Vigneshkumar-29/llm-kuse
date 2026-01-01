import React, { useState, useRef, useCallback } from 'react';
import {
    Upload, File, X, CheckCircle, AlertCircle,
    FileText, Image, FileSpreadsheet, FileCode,
    Trash2, Eye, Download, Loader2
} from 'lucide-react';
import { processFile } from '../services/FileProcessor';

// =============================================================================
// CONFIGURATION
// =============================================================================

const MAX_FILE_SIZE_MB = 25; // Maximum file size in MB
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const ACCEPTED_FILE_TYPES = {
    'application/pdf': {
        extension: 'PDF',
        icon: FileText,
        color: 'text-red-500',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200'
    },
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
        extension: 'DOCX',
        icon: FileText,
        color: 'text-blue-500',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200'
    },
    'application/msword': {
        extension: 'DOC',
        icon: FileText,
        color: 'text-blue-500',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200'
    },
    'text/plain': {
        extension: 'TXT',
        icon: FileCode,
        color: 'text-gray-500',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200'
    },
    'text/csv': {
        extension: 'CSV',
        icon: FileSpreadsheet,
        color: 'text-green-500',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
    },
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
        extension: 'XLSX',
        icon: FileSpreadsheet,
        color: 'text-emerald-500',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-200'
    },
    'application/vnd.ms-excel': {
        extension: 'XLS',
        icon: FileSpreadsheet,
        color: 'text-emerald-500',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-200'
    },
    'image/png': {
        extension: 'PNG',
        icon: Image,
        color: 'text-purple-500',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200'
    },
    'image/jpeg': {
        extension: 'JPEG',
        icon: Image,
        color: 'text-orange-500',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200'
    },
    'image/jpg': {
        extension: 'JPG',
        icon: Image,
        color: 'text-orange-500',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200'
    }
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getFileTypeConfig = (mimeType) => {
    return ACCEPTED_FILE_TYPES[mimeType] || {
        extension: 'FILE',
        icon: File,
        color: 'text-gray-500',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200'
    };
};

const generateFileId = () => {
    return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// =============================================================================
// FILE ITEM COMPONENT
// =============================================================================

const FileItem = ({ file, onRemove, onPreview }) => {
    const config = getFileTypeConfig(file.type);
    const IconComponent = config.icon;
    const isImage = file.type.startsWith('image/');

    return (
        <div
            className={`
        group relative flex items-center gap-4 p-4 rounded-xl
        border ${config.borderColor} ${config.bgColor}
        transition-all duration-300 ease-out
        hover:shadow-md hover:scale-[1.01]
        animate-enter
      `}
        >
            {/* File Icon / Thumbnail */}
            <div className={`
        relative w-14 h-14 rounded-xl flex items-center justify-center
        bg-white shadow-sm border ${config.borderColor}
        overflow-hidden flex-shrink-0
      `}>
                {isImage && file.preview ? (
                    <img
                        src={file.preview}
                        alt={file.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <IconComponent size={24} className={config.color} />
                )}

                {/* Status Indicator */}
                <div className={`
          absolute -bottom-1 -right-1 w-5 h-5 rounded-full
          flex items-center justify-center
          ${file.status === 'complete' ? 'bg-emerald-500' :
                        file.status === 'error' ? 'bg-red-500' : 'bg-amber-500'}
          shadow-sm
        `}>
                    {file.status === 'complete' ? (
                        <CheckCircle size={12} className="text-white" />
                    ) : file.status === 'error' ? (
                        <AlertCircle size={12} className="text-white" />
                    ) : (
                        <Loader2 size={12} className="text-white animate-spin" />
                    )}
                </div>
            </div>

            {/* File Details */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <h4 className="font-medium text-primary truncate text-sm">
                        {file.name}
                    </h4>
                    <span className={`
            px-2 py-0.5 rounded-full text-[10px] font-bold uppercase
            ${config.bgColor} ${config.color} border ${config.borderColor}
          `}>
                        {config.extension}
                    </span>
                </div>

                <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-secondary">
                        {formatFileSize(file.size)}
                    </span>
                    {file.status === 'uploading' && (
                        <span className="text-xs text-amber-600 font-medium">
                            Processing...
                        </span>
                    )}
                    {file.status === 'error' && (
                        <span className="text-xs text-red-500 font-medium">
                            {file.error || 'Upload failed'}
                        </span>
                    )}
                </div>

                {/* Progress Bar */}
                {file.status === 'uploading' && (
                    <div className="mt-2 h-1.5 bg-black/5 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-accent to-orange-500 rounded-full transition-all duration-300 ease-out"
                            style={{ width: `${file.progress || 0}%` }}
                        />
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {isImage && file.preview && (
                    <button
                        onClick={() => onPreview?.(file)}
                        className="p-2 rounded-lg hover:bg-white/80 text-secondary hover:text-primary transition-colors"
                        title="Preview"
                    >
                        <Eye size={16} />
                    </button>
                )}
                <button
                    onClick={() => onRemove?.(file.id)}
                    className="p-2 rounded-lg hover:bg-red-100 text-secondary hover:text-red-500 transition-colors"
                    title="Remove"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    );
};

// =============================================================================
// IMAGE PREVIEW MODAL
// =============================================================================

const ImagePreviewModal = ({ file, onClose }) => {
    if (!file) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-enter"
            onClick={onClose}
        >
            <div
                className="relative max-w-4xl max-h-[90vh] m-4 rounded-2xl overflow-hidden bg-white shadow-2xl animate-scale"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 bg-surface border-b border-black/5">
                    <div className="flex items-center gap-3">
                        <Image size={18} className="text-accent" />
                        <span className="font-medium text-primary text-sm truncate max-w-xs">
                            {file.name}
                        </span>
                        <span className="text-xs text-secondary">
                            {formatFileSize(file.size)}
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-black/5 text-secondary hover:text-primary transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Image */}
                <div className="p-4 bg-surface-highlight/50">
                    <img
                        src={file.preview}
                        alt={file.name}
                        className="max-w-full max-h-[70vh] mx-auto rounded-lg shadow-lg"
                    />
                </div>
            </div>
        </div>
    );
};

// =============================================================================
// MAIN FILE UPLOAD COMPONENT
// =============================================================================

const FileUpload = ({ onFilesChange, maxFiles = 10, className = '' }) => {
    const [files, setFiles] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [dragCounter, setDragCounter] = useState(0);
    const [previewFile, setPreviewFile] = useState(null);
    const inputRef = useRef(null);

    // ---------------------------------------------------------------------------
    // DRAG & DROP HANDLERS
    // ---------------------------------------------------------------------------

    const handleDragEnter = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragCounter((prev) => prev + 1);
        if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
            setIsDragging(true);
        }
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragCounter((prev) => {
            const newCount = prev - 1;
            if (newCount === 0) {
                setIsDragging(false);
            }
            return newCount;
        });
    }, []);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        setDragCounter(0);

        const droppedFiles = Array.from(e.dataTransfer.files);
        processFiles(droppedFiles);
    }, []);

    // ---------------------------------------------------------------------------
    // FILE PROCESSING
    // ---------------------------------------------------------------------------

    const validateFile = (file) => {
        // Check file type
        if (!ACCEPTED_FILE_TYPES[file.type]) {
            return { valid: false, error: 'File type not supported' };
        }

        // Check file size
        if (file.size > MAX_FILE_SIZE_BYTES) {
            return { valid: false, error: `File exceeds ${MAX_FILE_SIZE_MB}MB limit` };
        }

        return { valid: true };
    };

    const processFiles = async (fileList) => {
        const remainingSlots = maxFiles - files.length;
        const filesToProcess = fileList.slice(0, remainingSlots);

        const newFiles = await Promise.all(
            filesToProcess.map(async (file) => {
                const validation = validateFile(file);
                const fileId = generateFileId();

                // Create preview for images
                let preview = null;
                if (file.type.startsWith('image/') && validation.valid) {
                    preview = await createImagePreview(file);
                }

                return {
                    id: fileId,
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    file: file, // Keep reference to original File object
                    preview,
                    status: validation.valid ? 'uploading' : 'error',
                    error: validation.error || null,
                    progress: 0,
                    uploadedAt: new Date().toISOString()
                };
            })
        );

        // Add files to state
        setFiles((prev) => {
            const updated = [...prev, ...newFiles];
            return updated;
        });

        // Process valid files for content extraction
        newFiles
            .filter((f) => f.status === 'uploading')
            .forEach((fileData) => {
                processFileContent(fileData.id, fileData.file);
            });
    };

    const createImagePreview = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(file);
        });
    };

    const processFileContent = async (fileId, originalFile) => {
        try {
            // Show progress animation
            let progress = 0;
            const progressInterval = setInterval(() => {
                progress += Math.random() * 15 + 5;
                if (progress < 85) {
                    setFiles((prev) =>
                        prev.map((f) =>
                            f.id === fileId ? { ...f, progress: Math.min(progress, 85) } : f
                        )
                    );
                }
            }, 150);

            // Actually process the file
            const result = await processFile(originalFile);

            clearInterval(progressInterval);

            // Update file with extracted content
            setFiles((prev) => {
                const updated = prev.map((f) =>
                    f.id === fileId
                        ? {
                            ...f,
                            progress: 100,
                            status: result.success ? 'complete' : 'error',
                            extractedContent: result.content,
                            contentMetadata: result.metadata,
                            error: result.success ? null : 'Failed to extract content'
                        }
                        : f
                );

                // Notify parent with completed files
                setTimeout(() => {
                    onFilesChange?.(updated.filter((f) => f.status === 'complete'));
                }, 50);

                return updated;
            });

        } catch (error) {
            console.error('Error processing file:', error);
            setFiles((prev) =>
                prev.map((f) =>
                    f.id === fileId
                        ? { ...f, status: 'error', error: error.message }
                        : f
                )
            );
        }
    };

    // ---------------------------------------------------------------------------
    // FILE MANAGEMENT
    // ---------------------------------------------------------------------------

    const handleInputChange = (e) => {
        const selectedFiles = Array.from(e.target.files || []);
        processFiles(selectedFiles);
        // Reset input so same file can be selected again
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };

    const removeFile = (fileId) => {
        setFiles((prev) => {
            const updated = prev.filter((f) => f.id !== fileId);
            onFilesChange?.(updated.filter((f) => f.status === 'complete'));
            return updated;
        });
    };

    const clearAllFiles = () => {
        setFiles([]);
        onFilesChange?.([]);
    };

    // ---------------------------------------------------------------------------
    // COMPUTED VALUES
    // ---------------------------------------------------------------------------

    const acceptedTypesString = Object.keys(ACCEPTED_FILE_TYPES).join(',');
    const completedFiles = files.filter((f) => f.status === 'complete').length;
    const hasFiles = files.length > 0;
    const canAddMore = files.length < maxFiles;

    // ---------------------------------------------------------------------------
    // RENDER
    // ---------------------------------------------------------------------------

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Hidden File Input */}
            <input
                ref={inputRef}
                type="file"
                multiple
                accept={acceptedTypesString}
                onChange={handleInputChange}
                className="hidden"
            />

            {/* Drop Zone */}
            <div
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => canAddMore && inputRef.current?.click()}
                className={`
          relative overflow-hidden rounded-2xl border-2 border-dashed
          transition-all duration-300 ease-out cursor-pointer
          ${isDragging
                        ? 'border-accent bg-accent/5 scale-[1.01] shadow-lg shadow-accent/10'
                        : 'border-black/10 hover:border-black/20 hover:bg-surface-highlight/50'
                    }
          ${!canAddMore ? 'opacity-50 cursor-not-allowed' : ''}
        `}
            >
                {/* Decorative Background Pattern */}
                <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }} />
                </div>

                {/* Drop Zone Content */}
                <div className="relative p-8 md:p-12 text-center">
                    {/* Icon */}
                    <div className={`
            mx-auto w-16 h-16 rounded-2xl flex items-center justify-center
            transition-all duration-300 mb-5
            ${isDragging
                            ? 'bg-accent text-white scale-110 shadow-lg shadow-accent/30'
                            : 'bg-white shadow-sm border border-black/5'
                        }
          `}>
                        <Upload
                            size={28}
                            className={isDragging ? 'text-white animate-bounce' : 'text-secondary'}
                        />
                    </div>

                    {/* Text */}
                    <h3 className="font-serif text-xl font-medium text-primary mb-2">
                        {isDragging ? 'Drop files here' : 'Drag & drop files'}
                    </h3>
                    <p className="text-secondary text-sm mb-4">
                        or <span className="text-accent font-medium hover:underline">browse</span> to choose files
                    </p>

                    {/* Supported Formats */}
                    <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
                        {['PDF', 'DOCX', 'TXT', 'CSV', 'XLSX', 'PNG', 'JPEG'].map((format) => (
                            <span
                                key={format}
                                className="px-2.5 py-1 bg-white rounded-lg text-[11px] font-medium text-secondary border border-black/5 shadow-sm"
                            >
                                {format}
                            </span>
                        ))}
                    </div>

                    {/* Size Limit */}
                    <p className="text-xs text-secondary/70">
                        Maximum file size: <span className="font-medium">{MAX_FILE_SIZE_MB}MB</span>
                        {maxFiles && (
                            <span className="ml-2">
                                • Up to <span className="font-medium">{maxFiles} files</span>
                            </span>
                        )}
                    </p>
                </div>
            </div>

            {/* Files List */}
            {hasFiles && (
                <div className="space-y-3 animate-enter">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <h4 className="font-medium text-primary text-sm">
                                Uploaded Files
                            </h4>
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-surface-highlight text-secondary border border-black/5">
                                {completedFiles}/{files.length}
                            </span>
                        </div>
                        <button
                            onClick={clearAllFiles}
                            className="text-xs text-secondary hover:text-red-500 transition-colors flex items-center gap-1"
                        >
                            <Trash2 size={12} />
                            Clear all
                        </button>
                    </div>

                    {/* File Items */}
                    <div className="space-y-2">
                        {files.map((file) => (
                            <FileItem
                                key={file.id}
                                file={file}
                                onRemove={removeFile}
                                onPreview={setPreviewFile}
                            />
                        ))}
                    </div>

                    {/* Add More Button */}
                    {canAddMore && (
                        <button
                            onClick={() => inputRef.current?.click()}
                            className="w-full py-3 rounded-xl border border-dashed border-black/10 
                         text-sm text-secondary hover:text-primary hover:border-black/20 
                         hover:bg-surface-highlight/50 transition-all flex items-center justify-center gap-2"
                        >
                            <Upload size={16} />
                            Add more files ({files.length}/{maxFiles})
                        </button>
                    )}
                </div>
            )}

            {/* Image Preview Modal */}
            {previewFile && (
                <ImagePreviewModal
                    file={previewFile}
                    onClose={() => setPreviewFile(null)}
                />
            )}
        </div>
    );
};

export default FileUpload;
