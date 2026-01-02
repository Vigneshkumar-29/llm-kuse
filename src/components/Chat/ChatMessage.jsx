/**
 * Chat Components - ChatMessage
 * =============================
 * 
 * Individual chat message component with support for user and AI messages,
 * markdown rendering, code blocks, and actions.
 * 
 * @version 1.0.0
 */

import React, { memo, useState } from 'react';
import { motion } from 'framer-motion';
import {
    User, Bot, Copy, Check, ThumbsUp, ThumbsDown,
    RefreshCw, MoreHorizontal, Sparkles
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// =============================================================================
// MESSAGE TYPES
// =============================================================================

export const MESSAGE_TYPES = {
    USER: 'user',
    ASSISTANT: 'assistant',
    SYSTEM: 'system',
    ERROR: 'error'
};

// =============================================================================
// CHAT MESSAGE COMPONENT
// =============================================================================

const ChatMessage = memo(({
    message,
    index = 0,
    onCopy,
    onRegenerate,
    onFeedback,
    showActions = true,
    isLatest = false,
    className = ''
}) => {
    const [isCopied, setIsCopied] = useState(false);
    const [feedback, setFeedback] = useState(null);

    const isUser = message.role === MESSAGE_TYPES.USER;
    const isError = message.role === MESSAGE_TYPES.ERROR;
    const isSystem = message.role === MESSAGE_TYPES.SYSTEM;

    // Handle copy
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(message.content);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
            onCopy?.(message);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    // Handle feedback
    const handleFeedback = (type) => {
        setFeedback(type);
        onFeedback?.(message, type);
    };

    // Message animation
    const messageVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.3,
                delay: index * 0.05
            }
        }
    };

    // System messages
    if (isSystem) {
        return (
            <motion.div
                variants={messageVariants}
                initial="hidden"
                animate="visible"
                className="flex justify-center py-2"
            >
                <div className="px-4 py-2 rounded-full bg-neutral-100 dark:bg-neutral-800 
                              text-xs text-neutral-500 dark:text-neutral-400">
                    {message.content}
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            variants={messageVariants}
            initial="hidden"
            animate="visible"
            className={`
                flex gap-4 px-4 py-6 group
                ${isUser
                    ? 'bg-white dark:bg-neutral-900'
                    : 'bg-neutral-50 dark:bg-neutral-800/50'}
                ${isError ? 'bg-red-50 dark:bg-red-900/20' : ''}
                ${className}
            `}
        >
            {/* Avatar */}
            <div className={`
                flex-shrink-0 w-8 h-8 rounded-lg
                flex items-center justify-center
                ${isUser
                    ? 'bg-gradient-to-br from-indigo-500 to-purple-600'
                    : 'bg-gradient-to-br from-emerald-500 to-teal-600'}
                ${isError ? 'bg-gradient-to-br from-red-500 to-rose-600' : ''}
            `}>
                {isUser ? (
                    <User size={16} className="text-white" />
                ) : (
                    <Sparkles size={16} className="text-white" />
                )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 space-y-2">
                {/* Role Label */}
                <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-neutral-900 dark:text-white">
                        {isUser ? 'You' : 'DevSavvy AI'}
                    </span>
                    {message.timestamp && (
                        <span className="text-xs text-neutral-400">
                            {new Date(message.timestamp).toLocaleTimeString()}
                        </span>
                    )}
                </div>

                {/* Message Content */}
                <div className={`
                    prose prose-sm dark:prose-invert max-w-none
                    prose-p:leading-relaxed
                    prose-pre:bg-neutral-900 prose-pre:text-neutral-100
                    prose-code:text-indigo-600 dark:prose-code:text-indigo-400
                    prose-headings:text-neutral-900 dark:prose-headings:text-white
                    ${isError ? 'text-red-600 dark:text-red-400' : ''}
                `}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.content}
                    </ReactMarkdown>
                </div>

                {/* Source References */}
                {message.sources && message.sources.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                        {message.sources.map((source, idx) => (
                            <span
                                key={idx}
                                className="inline-flex items-center gap-1 px-2 py-1 
                                          rounded-md bg-indigo-50 dark:bg-indigo-900/30
                                          text-xs text-indigo-600 dark:text-indigo-400"
                            >
                                📄 {source}
                            </span>
                        ))}
                    </div>
                )}

                {/* Actions */}
                {showActions && !isUser && !isError && (
                    <div className="flex items-center gap-2 pt-2 opacity-0 group-hover:opacity-100 
                                  transition-opacity">
                        {/* Copy */}
                        <button
                            onClick={handleCopy}
                            className="p-1.5 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700 
                                      transition-colors"
                            title="Copy message"
                        >
                            {isCopied ? (
                                <Check size={14} className="text-green-500" />
                            ) : (
                                <Copy size={14} className="text-neutral-500" />
                            )}
                        </button>

                        {/* Regenerate */}
                        {isLatest && onRegenerate && (
                            <button
                                onClick={() => onRegenerate(message)}
                                className="p-1.5 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700 
                                          transition-colors"
                                title="Regenerate response"
                            >
                                <RefreshCw size={14} className="text-neutral-500" />
                            </button>
                        )}

                        {/* Feedback */}
                        <div className="flex items-center gap-1 ml-2">
                            <button
                                onClick={() => handleFeedback('positive')}
                                className={`p-1.5 rounded-md transition-colors ${feedback === 'positive'
                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-600'
                                        : 'hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-500'
                                    }`}
                                title="Good response"
                            >
                                <ThumbsUp size={14} />
                            </button>
                            <button
                                onClick={() => handleFeedback('negative')}
                                className={`p-1.5 rounded-md transition-colors ${feedback === 'negative'
                                        ? 'bg-red-100 dark:bg-red-900/30 text-red-600'
                                        : 'hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-500'
                                    }`}
                                title="Bad response"
                            >
                                <ThumbsDown size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
});

ChatMessage.displayName = 'ChatMessage';

export default ChatMessage;
