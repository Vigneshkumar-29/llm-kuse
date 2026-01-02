/**
 * Chat Components - ChatInput
 * ===========================
 * 
 * Chat input component with auto-resize, file attachment support,
 * and keyboard shortcuts.
 * 
 * @version 1.0.0
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Send, Paperclip, Mic, MicOff, Image, X,
    Sparkles, StopCircle, ArrowUp, Loader2
} from 'lucide-react';

// =============================================================================
// CHAT INPUT COMPONENT
// =============================================================================

const ChatInput = ({
    onSubmit,
    onFileAttach,
    onVoiceInput,
    isLoading = false,
    isStreaming = false,
    onStopStreaming,
    placeholder = 'Type a message...',
    maxLength = 10000,
    disabled = false,
    showFileAttach = true,
    showVoiceInput = true,
    attachedFiles = [],
    onRemoveFile,
    suggestions = [],
    className = ''
}) => {
    const [message, setMessage] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const textareaRef = useRef(null);
    const fileInputRef = useRef(null);

    // Auto-resize textarea
    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
        }
    }, [message]);

    // Handle submit
    const handleSubmit = useCallback(() => {
        if (message.trim() && !isLoading && !disabled) {
            onSubmit?.(message.trim(), attachedFiles);
            setMessage('');
            // Reset textarea height
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }
        }
    }, [message, isLoading, disabled, attachedFiles, onSubmit]);

    // Handle key down
    const handleKeyDown = (e) => {
        // Submit on Enter (without shift)
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    // Handle file selection
    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            onFileAttach?.(files);
        }
        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Handle voice input
    const toggleVoiceInput = () => {
        if (isRecording) {
            setIsRecording(false);
            onVoiceInput?.('stop');
        } else {
            setIsRecording(true);
            onVoiceInput?.('start', (transcript) => {
                setMessage(prev => prev + transcript);
            });
        }
    };

    // Handle suggestion click
    const handleSuggestionClick = (suggestion) => {
        setMessage(suggestion);
        textareaRef.current?.focus();
    };

    return (
        <div className={`relative ${className}`}>
            {/* Suggestions */}
            <AnimatePresence>
                {suggestions.length > 0 && !message && isFocused && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute bottom-full left-0 right-0 mb-2"
                    >
                        <div className="flex flex-wrap gap-2 p-2">
                            {suggestions.map((suggestion, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSuggestionClick(suggestion)}
                                    className="px-3 py-1.5 rounded-full text-sm
                                              bg-white dark:bg-neutral-800
                                              border border-neutral-200 dark:border-neutral-700
                                              hover:border-indigo-500 hover:text-indigo-600
                                              transition-colors"
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Attached Files */}
            <AnimatePresence>
                {attachedFiles.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-2"
                    >
                        <div className="flex flex-wrap gap-2 p-2 rounded-lg 
                                       bg-neutral-50 dark:bg-neutral-800/50">
                            {attachedFiles.map((file, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg
                                              bg-white dark:bg-neutral-800
                                              border border-neutral-200 dark:border-neutral-700"
                                >
                                    <span className="text-sm text-neutral-600 dark:text-neutral-400 
                                                   max-w-[150px] truncate">
                                        {file.name}
                                    </span>
                                    <button
                                        onClick={() => onRemoveFile?.(idx)}
                                        className="p-0.5 rounded hover:bg-neutral-100 
                                                  dark:hover:bg-neutral-700"
                                    >
                                        <X size={14} className="text-neutral-400" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Input Container */}
            <div className={`
                relative flex items-end gap-2 p-3 rounded-2xl
                bg-white dark:bg-neutral-800
                border-2 transition-colors
                ${isFocused
                    ? 'border-indigo-500 shadow-lg shadow-indigo-500/10'
                    : 'border-neutral-200 dark:border-neutral-700'}
                ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
            `}>
                {/* File Attach */}
                {showFileAttach && (
                    <>
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            onChange={handleFileSelect}
                            className="hidden"
                            accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,.png,.jpg,.jpeg"
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={disabled || isLoading}
                            className="flex-shrink-0 p-2 rounded-lg
                                      hover:bg-neutral-100 dark:hover:bg-neutral-700
                                      transition-colors disabled:opacity-50"
                            title="Attach file"
                        >
                            <Paperclip size={20} className="text-neutral-500" />
                        </button>
                    </>
                )}

                {/* Textarea */}
                <div className="flex-1 min-w-0">
                    <textarea
                        ref={textareaRef}
                        value={message}
                        onChange={(e) => setMessage(e.target.value.slice(0, maxLength))}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        placeholder={placeholder}
                        disabled={disabled || isLoading}
                        rows={1}
                        className="w-full resize-none bg-transparent
                                  text-neutral-900 dark:text-white
                                  placeholder:text-neutral-400
                                  focus:outline-none
                                  disabled:cursor-not-allowed
                                  text-sm leading-relaxed"
                        style={{ maxHeight: '200px' }}
                    />
                </div>

                {/* Voice Input */}
                {showVoiceInput && (
                    <button
                        onClick={toggleVoiceInput}
                        disabled={disabled || isLoading}
                        className={`flex-shrink-0 p-2 rounded-lg transition-colors 
                                  disabled:opacity-50 ${isRecording
                                ? 'bg-red-100 dark:bg-red-900/30 text-red-500'
                                : 'hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-500'
                            }`}
                        title={isRecording ? 'Stop recording' : 'Voice input'}
                    >
                        {isRecording ? (
                            <MicOff size={20} />
                        ) : (
                            <Mic size={20} />
                        )}
                    </button>
                )}

                {/* Submit / Stop Button */}
                {isStreaming ? (
                    <button
                        onClick={onStopStreaming}
                        className="flex-shrink-0 p-2 rounded-lg
                                  bg-red-500 hover:bg-red-600
                                  text-white transition-colors"
                        title="Stop generating"
                    >
                        <StopCircle size={20} />
                    </button>
                ) : (
                    <button
                        onClick={handleSubmit}
                        disabled={!message.trim() || disabled || isLoading}
                        className={`flex-shrink-0 p-2 rounded-lg transition-all
                                  disabled:opacity-50 disabled:cursor-not-allowed
                                  ${message.trim()
                                ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-400'}`}
                        title="Send message"
                    >
                        {isLoading ? (
                            <Loader2 size={20} className="animate-spin" />
                        ) : (
                            <ArrowUp size={20} />
                        )}
                    </button>
                )}
            </div>

            {/* Character Count */}
            {message.length > maxLength * 0.8 && (
                <div className="absolute right-4 -bottom-6 text-xs text-neutral-400">
                    {message.length}/{maxLength}
                </div>
            )}
        </div>
    );
};

export default ChatInput;
