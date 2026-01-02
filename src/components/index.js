/**
 * Components Index
 * =================
 * 
 * Central export point for all React components.
 * Organized by feature/domain for clean imports.
 * 
 * @version 1.0.0
 */

// =============================================================================
// CANVAS COMPONENTS
// =============================================================================
export { default as Canvas } from './Canvas';
export { default as CanvasNodes } from './Canvas/CanvasNodes';
export { default as CanvasToolbar } from './Canvas/CanvasToolbar';
export { default as CanvasAIActions } from './Canvas/CanvasAIActions';

// =============================================================================
// CHAT COMPONENTS
// =============================================================================
export { ChatMessage, ChatInput, ChatHistory, MESSAGE_TYPES } from './Chat';

// =============================================================================
// LIBRARY COMPONENTS
// =============================================================================
export { Library, LibraryItem, LibraryUpload, DocumentPreview, TYPE_CONFIG, formatRelativeDate } from './Library';

// =============================================================================
// WORKSPACE COMPONENTS
// =============================================================================
export { CodePreview } from './Workspace';
export { default as WorkspacePanel } from './WorkspacePanel';

// =============================================================================
// DOCUMENT COMPONENTS
// =============================================================================
export { default as DocumentEditor } from './Documents/DocumentEditor';
export { default as DocumentExportModal } from './Documents/DocumentExportModal';

// =============================================================================
// URL & VIDEO COMPONENTS
// =============================================================================
export { default as YouTubeEmbed } from './YouTube';
export { default as URLExtractor } from './URLExtractor';

// =============================================================================
// COMMON/SHARED COMPONENTS
// =============================================================================
export { Header, Modal, ConfirmModal, AlertModal } from './Common';
export { default as Sidebar } from './Sidebar';
export { default as CommandPalette } from './CommandPalette';

// =============================================================================
// FORM & INPUT COMPONENTS
// =============================================================================
export { default as FileUpload } from './FileUpload';
export { default as FileUploadModal } from './FileUploadModal';
export { default as VoiceInputButton } from './VoiceInputButton';
export { default as CodeBlock } from './CodeBlock';

// =============================================================================
// SETTINGS & INFO COMPONENTS
// =============================================================================
export { default as ContextSettings } from './ContextSettings';
export { default as StorageInfo } from './StorageInfo';
