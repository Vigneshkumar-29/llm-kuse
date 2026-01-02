/**
 * Common Components - Modal
 * =========================
 * 
 * A versatile modal component with animations, sizes, and accessibility features.
 * 
 * @version 1.0.0
 */

import React, { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

// =============================================================================
// MODAL SIZES
// =============================================================================

const MODAL_SIZES = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-6xl',
    auto: 'max-w-fit'
};

// =============================================================================
// MODAL VARIANTS
// =============================================================================

const MODAL_VARIANTS = {
    default: {
        icon: null,
        iconBg: '',
        iconColor: ''
    },
    success: {
        icon: CheckCircle,
        iconBg: 'bg-green-100 dark:bg-green-900/30',
        iconColor: 'text-green-600 dark:text-green-400'
    },
    warning: {
        icon: AlertTriangle,
        iconBg: 'bg-amber-100 dark:bg-amber-900/30',
        iconColor: 'text-amber-600 dark:text-amber-400'
    },
    error: {
        icon: AlertCircle,
        iconBg: 'bg-red-100 dark:bg-red-900/30',
        iconColor: 'text-red-600 dark:text-red-400'
    },
    info: {
        icon: Info,
        iconBg: 'bg-blue-100 dark:bg-blue-900/30',
        iconColor: 'text-blue-600 dark:text-blue-400'
    }
};

// =============================================================================
// ANIMATION CONFIG
// =============================================================================

const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
};

const modalVariants = {
    hidden: {
        opacity: 0,
        scale: 0.95,
        y: 20
    },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            type: 'spring',
            damping: 25,
            stiffness: 400
        }
    },
    exit: {
        opacity: 0,
        scale: 0.95,
        y: 20,
        transition: {
            duration: 0.15
        }
    }
};

// =============================================================================
// MODAL COMPONENT
// =============================================================================

const Modal = ({
    isOpen = false,
    onClose,
    title,
    description,
    children,
    size = 'md',
    variant = 'default',
    showCloseButton = true,
    closeOnOverlayClick = true,
    closeOnEscape = true,
    footer,
    className = '',
    overlayClassName = '',
    contentClassName = '',
    preventScroll = true,
    centered = true
}) => {
    const variantConfig = MODAL_VARIANTS[variant] || MODAL_VARIANTS.default;
    const IconComponent = variantConfig.icon;

    // Handle escape key
    const handleEscape = useCallback((event) => {
        if (event.key === 'Escape' && closeOnEscape) {
            onClose?.();
        }
    }, [closeOnEscape, onClose]);

    // Handle overlay click
    const handleOverlayClick = (event) => {
        if (event.target === event.currentTarget && closeOnOverlayClick) {
            onClose?.();
        }
    };

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen && preventScroll) {
            const originalOverflow = document.body.style.overflow;
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = originalOverflow;
            };
        }
    }, [isOpen, preventScroll]);

    // Add escape key listener
    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            return () => document.removeEventListener('keydown', handleEscape);
        }
    }, [isOpen, handleEscape]);

    // Modal content
    const modalContent = (
        <AnimatePresence>
            {isOpen && (
                <div className={`fixed inset-0 z-[100] ${className}`}>
                    {/* Overlay */}
                    <motion.div
                        variants={overlayVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        onClick={handleOverlayClick}
                        className={`
                            absolute inset-0 bg-black/50 backdrop-blur-sm
                            ${centered ? 'flex items-center justify-center' : 'overflow-y-auto py-8'}
                            ${overlayClassName}
                        `}
                    >
                        {/* Modal Container */}
                        <motion.div
                            variants={modalVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby={title ? 'modal-title' : undefined}
                            aria-describedby={description ? 'modal-description' : undefined}
                            className={`
                                relative w-full ${MODAL_SIZES[size] || MODAL_SIZES.md}
                                ${centered ? 'mx-4' : 'mx-auto my-8'}
                            `}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className={`
                                bg-white dark:bg-neutral-900
                                rounded-2xl shadow-2xl
                                border border-neutral-200 dark:border-neutral-800
                                overflow-hidden
                                ${contentClassName}
                            `}>
                                {/* Header */}
                                {(title || showCloseButton) && (
                                    <div className="flex items-start gap-4 p-6 pb-0">
                                        {/* Variant Icon */}
                                        {IconComponent && (
                                            <div className={`
                                                flex-shrink-0 w-10 h-10 rounded-full
                                                flex items-center justify-center
                                                ${variantConfig.iconBg}
                                            `}>
                                                <IconComponent
                                                    size={20}
                                                    className={variantConfig.iconColor}
                                                />
                                            </div>
                                        )}

                                        {/* Title & Description */}
                                        {(title || description) && (
                                            <div className="flex-1 min-w-0">
                                                {title && (
                                                    <h2
                                                        id="modal-title"
                                                        className="text-lg font-semibold text-neutral-900 dark:text-white"
                                                    >
                                                        {title}
                                                    </h2>
                                                )}
                                                {description && (
                                                    <p
                                                        id="modal-description"
                                                        className="mt-1 text-sm text-neutral-500 dark:text-neutral-400"
                                                    >
                                                        {description}
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {/* Close Button */}
                                        {showCloseButton && (
                                            <button
                                                onClick={onClose}
                                                className="flex-shrink-0 p-2 rounded-lg
                                                          hover:bg-neutral-100 dark:hover:bg-neutral-800
                                                          transition-colors -mr-2 -mt-2"
                                                aria-label="Close modal"
                                            >
                                                <X size={20} className="text-neutral-500" />
                                            </button>
                                        )}
                                    </div>
                                )}

                                {/* Content */}
                                <div className="p-6">
                                    {children}
                                </div>

                                {/* Footer */}
                                {footer && (
                                    <div className="px-6 py-4 bg-neutral-50 dark:bg-neutral-800/50
                                                   border-t border-neutral-200 dark:border-neutral-800">
                                        {footer}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    // Render via portal
    if (typeof window !== 'undefined') {
        return createPortal(modalContent, document.body);
    }

    return null;
};

// =============================================================================
// CONFIRMATION MODAL
// =============================================================================

export const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Confirm Action',
    message = 'Are you sure you want to proceed?',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'warning',
    isLoading = false
}) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            description={message}
            variant={variant}
            size="sm"
            footer={
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-4 py-2 rounded-lg
                                  border border-neutral-200 dark:border-neutral-700
                                  text-neutral-700 dark:text-neutral-300
                                  hover:bg-neutral-100 dark:hover:bg-neutral-800
                                  transition-colors text-sm font-medium
                                  disabled:opacity-50"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`
                            px-4 py-2 rounded-lg text-white text-sm font-medium
                            transition-colors disabled:opacity-50
                            ${variant === 'error'
                                ? 'bg-red-600 hover:bg-red-700'
                                : 'bg-indigo-600 hover:bg-indigo-700'}
                        `}
                    >
                        {isLoading ? 'Processing...' : confirmText}
                    </button>
                </div>
            }
        />
    );
};

// =============================================================================
// ALERT MODAL
// =============================================================================

export const AlertModal = ({
    isOpen,
    onClose,
    title,
    message,
    buttonText = 'OK',
    variant = 'info'
}) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            description={message}
            variant={variant}
            size="sm"
            footer={
                <div className="flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg bg-indigo-600 text-white
                                  hover:bg-indigo-700 transition-colors text-sm font-medium"
                    >
                        {buttonText}
                    </button>
                </div>
            }
        />
    );
};

// =============================================================================
// DEFAULT EXPORT
// =============================================================================

export default Modal;
