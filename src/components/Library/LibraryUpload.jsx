/**
 * Library Components - LibraryUpload
 * ===================================
 * 
 * Drag-and-drop file upload component for adding documents to the library.
 * 
 * @version 1.0.0
 */

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Upload, X, File, FileText, Image, FileSpreadsheet,
    CheckCircle, AlertCircle, Loader2, HardDrive, Cloud
} from 'lucide-react';

// =============================================================================
// FILE TYPE CONFIG
// =============================================================================

const FILE_TYPES = {
    'application/pdf': { icon: FileText, color: 'text-red-500', label: 'PDF' },
    'text/plain': { icon: FileText, color: 'text-blue-500', label: 'TXT' },
    'text/csv': { icon: FileSpreadsheet, color: 'text-green-500', label: 'CSV' },
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
        icon: FileText, color: 'text-blue-600', label: 'DOCX'
    },
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
        icon: FileSpreadsheet, color: 'text-green-600', label: 'XLSX'
    },
    'image/png': { icon: Image, color: 'text-purple-500', label: 'PNG' },
    'image/jpeg': { icon: Image, color: 'text-orange-500', label: 'JPEG' }
};

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

// =============================================================================
// LIBRARY UPLOAD COMPONENT
// =============================================================================

const LibraryUpload = ({
    onUpload,
    onClose,
    maxFiles = 10,
    isOpen = true,
    className = ''
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({});
    const fileInputRef = useRef(null);

    // Validate file
    const validateFile = (file) => {
        if (!FILE_TYPES[file.type]) {
            return { valid: false, error: 'Unsupported file type' };
        }
        if (file.size > MAX_FILE_SIZE) {
            return { valid: false, error: 'File too large (max 25MB)' };
        }
        return { valid: true };
    };

    // Add files
    const addFiles = useCallback((newFiles) => {
        const filesToAdd = [];

        for (const file of newFiles) {
            if (files.length + filesToAdd.length >= maxFiles) {
                break;
            }

            const validation = validateFile(file);
            const fileConfig = FILE_TYPES[file.type] || { icon: File, color: 'text-neutral-500', label: 'FILE' };

            filesToAdd.push({
                id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                file,
                name: file.name,
                size: file.size,
                type: file.type,
                status: validation.valid ? 'ready' : 'error',
                error: validation.error,
                ...fileConfig
            });
        }

        setFiles(prev => [...prev, ...filesToAdd]);
    }, [files.length, maxFiles]);

    // Handle drag events
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFiles = Array.from(e.dataTransfer.files);
        addFiles(droppedFiles);
    };

    // Handle file input
    const handleFileInput = (e) => {
        const selectedFiles = Array.from(e.target.files || []);
        addFiles(selectedFiles);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Remove file
    const removeFile = (id) => {
        setFiles(prev => prev.filter(f => f.id !== id));
    };

    // Upload all files
    const handleUpload = async () => {
        const validFiles = files.filter(f => f.status === 'ready');
        if (validFiles.length === 0) return;

        setUploading(true);

        for (const fileData of validFiles) {
            // Update status to uploading
            setFiles(prev => prev.map(f =>
                f.id === fileData.id ? { ...f, status: 'uploading' } : f
            ));

            try {
                // Simulate progress
                for (let i = 0; i <= 100; i += 20) {
                    setUploadProgress(prev => ({ ...prev, [fileData.id]: i }));
                    await new Promise(resolve => setTimeout(resolve, 100));
                }

                // Call onUpload callback
                await onUpload?.(fileData.file);

                // Update status to success
                setFiles(prev => prev.map(f =>
                    f.id === fileData.id ? { ...f, status: 'success' } : f
                ));
            } catch (error) {
                // Update status to error
                setFiles(prev => prev.map(f =>
                    f.id === fileData.id ? { ...f, status: 'error', error: error.message } : f
                ));
            }
        }

        setUploading(false);

        // Close after successful upload (with delay)
        const allSuccess = files.every(f => f.status === 'success');
        if (allSuccess) {
            setTimeout(() => {
                setFiles([]);
                onClose?.();
            }, 1500);
        }
    };

    // Format file size
    const formatSize = (bytes) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    if (!isOpen) return null;

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${className}`}>
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full max-w-xl bg-white dark:bg-neutral-900 
                          rounded-2xl shadow-2xl overflow-hidden"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 
                              border-b border-neutral-200 dark:border-neutral-800">
                    <div>
                        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                            Upload to Library
                        </h2>
                        <p className="text-sm text-neutral-500 mt-0.5">
                            Add documents, images, and spreadsheets to your knowledge base
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 
                                  transition-colors"
                    >
                        <X size={20} className="text-neutral-500" />
                    </button>
                </div>

                {/* Drop Zone */}
                <div className="p-6">
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`
                            relative border-2 border-dashed rounded-xl p-8 text-center 
                            cursor-pointer transition-all
                            ${isDragging
                                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                                : 'border-neutral-200 dark:border-neutral-700 hover:border-indigo-500/50'
                            }
                        `}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            onChange={handleFileInput}
                            accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,.png,.jpg,.jpeg"
                            className="hidden"
                        />

                        <div className={`
                            w-12 h-12 rounded-full mx-auto mb-4
                            flex items-center justify-center
                            ${isDragging
                                ? 'bg-indigo-100 dark:bg-indigo-900/50'
                                : 'bg-neutral-100 dark:bg-neutral-800'
                            }
                        `}>
                            <Upload size={24} className={
                                isDragging
                                    ? 'text-indigo-600'
                                    : 'text-neutral-500'
                            } />
                        </div>

                        <p className="font-medium text-neutral-900 dark:text-white">
                            {isDragging ? 'Drop files here' : 'Drag and drop files here'}
                        </p>
                        <p className="text-sm text-neutral-500 mt-1">
                            or click to browse
                        </p>
                        <p className="text-xs text-neutral-400 mt-3">
                            Supports: PDF, DOCX, TXT, CSV, XLSX, PNG, JPEG (max 25MB)
                        </p>
                    </div>

                    {/* File List */}
                    <AnimatePresence>
                        {files.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-4 space-y-2 max-h-64 overflow-y-auto"
                            >
                                {files.map((fileData) => {
                                    const Icon = fileData.icon;
                                    const progress = uploadProgress[fileData.id] || 0;

                                    return (
                                        <motion.div
                                            key={fileData.id}
                                            layout
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            className={`
                                                flex items-center gap-3 p-3 rounded-lg
                                                ${fileData.status === 'error'
                                                    ? 'bg-red-50 dark:bg-red-900/20'
                                                    : fileData.status === 'success'
                                                        ? 'bg-green-50 dark:bg-green-900/20'
                                                        : 'bg-neutral-50 dark:bg-neutral-800'
                                                }
                                            `}
                                        >
                                            <div className={`
                                                w-10 h-10 rounded-lg flex items-center justify-center
                                                bg-white dark:bg-neutral-900
                                            `}>
                                                <Icon size={20} className={fileData.color} />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                                                    {fileData.name}
                                                </p>
                                                <p className="text-xs text-neutral-500">
                                                    {formatSize(fileData.size)}
                                                    {fileData.error && (
                                                        <span className="text-red-500 ml-2">
                                                            {fileData.error}
                                                        </span>
                                                    )}
                                                </p>

                                                {/* Progress bar */}
                                                {fileData.status === 'uploading' && (
                                                    <div className="mt-2 h-1 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${progress}%` }}
                                                            className="h-full bg-indigo-600"
                                                        />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Status Icon */}
                                            {fileData.status === 'uploading' ? (
                                                <Loader2 size={20} className="text-indigo-600 animate-spin" />
                                            ) : fileData.status === 'success' ? (
                                                <CheckCircle size={20} className="text-green-600" />
                                            ) : fileData.status === 'error' ? (
                                                <AlertCircle size={20} className="text-red-500" />
                                            ) : (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); removeFile(fileData.id); }}
                                                    className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700"
                                                >
                                                    <X size={16} className="text-neutral-400" />
                                                </button>
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-800
                              bg-neutral-50 dark:bg-neutral-800/50 flex justify-between items-center">
                    <p className="text-sm text-neutral-500">
                        {files.length} / {maxFiles} files selected
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700
                                      text-neutral-700 dark:text-neutral-300 text-sm font-medium
                                      hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleUpload}
                            disabled={uploading || files.filter(f => f.status === 'ready').length === 0}
                            className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium
                                      hover:bg-indigo-700 transition-colors
                                      disabled:opacity-50 disabled:cursor-not-allowed
                                      flex items-center gap-2"
                        >
                            {uploading ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Upload size={16} />
                                    Upload to Library
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default LibraryUpload;
