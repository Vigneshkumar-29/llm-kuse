/**
 * Canvas Toolbar Component - Enhanced Professional Toolbar
 * =========================================================
 * 
 * A comprehensive floating toolbar providing access to all canvas operations
 * including node creation, view controls, editing tools, and export options.
 * 
 * Features:
 * - Quick node addition for all 6 element types
 * - View controls (zoom, fit, grid toggle)
 * - Edit controls (undo, redo, lock)
 * - Actions (save, export, clear)
 * - Collapsible sections for cleaner UI
 * 
 * @version 2.0.0
 */

import React, { useState, useCallback } from 'react';
import {
    Plus, Type, Code, MessageSquare, Image, FileText,
    StickyNote, ZoomIn, ZoomOut, Maximize, Grid, Save,
    Undo, Redo, Lock, Unlock, Download, Trash2, ChevronDown,
    ChevronUp, Sparkles, Link2, Palette, Settings, Layers,
    Copy, MousePointer
} from 'lucide-react';

// =============================================================================
// TOOL BUTTON COMPONENT
// =============================================================================

const ToolButton = ({
    icon: Icon,
    label,
    onClick,
    active,
    disabled,
    danger,
    badge,
    color
}) => (
    <div className="relative group">
        <button
            onClick={onClick}
            disabled={disabled}
            title={label}
            className={`
                relative p-2.5 rounded-xl transition-all duration-200
                ${active ? 'bg-indigo-100 text-indigo-600 shadow-sm' : 'text-gray-600 hover:bg-gray-100'}
                ${danger ? 'hover:bg-red-50 hover:text-red-500' : ''}
                ${disabled ? 'opacity-40 cursor-not-allowed' : 'hover:scale-105'}
                ${color ? `hover:bg-${color}-50 hover:text-${color}-600` : ''}
            `}
        >
            <Icon size={18} />
            {badge && (
                <span className="absolute -top-1 -right-1 w-4 h-4 text-[9px] font-bold text-white bg-indigo-500 rounded-full flex items-center justify-center">
                    {badge}
                </span>
            )}
        </button>

        {/* Tooltip */}
        <div className="
            absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 
            text-xs font-medium text-white bg-gray-900 rounded-lg 
            opacity-0 group-hover:opacity-100 transition-opacity duration-200
            pointer-events-none whitespace-nowrap z-50
        ">
            {label}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
        </div>
    </div>
);

// =============================================================================
// TOOLBAR SECTION
// =============================================================================

const ToolbarSection = ({ children, title, collapsible = false }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className="flex items-center gap-1">
            {collapsible ? (
                <>
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"
                        title={isCollapsed ? `Show ${title}` : `Hide ${title}`}
                    >
                        {isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                    </button>
                    {!isCollapsed && children}
                </>
            ) : (
                children
            )}
        </div>
    );
};

// =============================================================================
// DIVIDER
// =============================================================================

const Divider = () => <div className="w-px h-6 bg-gray-200 mx-1" />;

// =============================================================================
// NODE TYPE PICKER
// =============================================================================

const NodeTypePicker = ({ onAddNode }) => {
    const [isOpen, setIsOpen] = useState(false);

    const nodeOptions = [
        { type: 'text', icon: Type, label: 'Text Note', color: 'blue', description: 'Add an editable text block' },
        { type: 'code', icon: Code, label: 'Code Snippet', color: 'amber', description: 'Add syntax-highlighted code' },
        { type: 'aiResponse', icon: Sparkles, label: 'AI Response', color: 'purple', description: 'Add an AI response card' },
        { type: 'image', icon: Image, label: 'Image', color: 'pink', description: 'Add an image from URL or upload' },
        { type: 'document', icon: FileText, label: 'Document', color: 'emerald', description: 'Add a document reference' },
        { type: 'sticky', icon: StickyNote, label: 'Sticky Note', color: 'yellow', description: 'Add a quick sticky note' }
    ];

    const handleAddNode = useCallback((type) => {
        onAddNode(type);
        setIsOpen(false);
    }, [onAddNode]);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all duration-200
                    ${isOpen ? 'bg-indigo-100 text-indigo-600' : 'bg-indigo-500 text-white hover:bg-indigo-600'}
                `}
            >
                <Plus size={16} />
                <span className="text-sm font-medium">Add</span>
                <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Dropdown */}
                    <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-scale-in">
                        <div className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            Add Element
                        </div>
                        {nodeOptions.map((option) => (
                            <button
                                key={option.type}
                                onClick={() => handleAddNode(option.type)}
                                className="w-full flex items-start gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors"
                            >
                                <div className={`
                                    p-2 rounded-lg bg-${option.color}-100 text-${option.color}-600
                                `}>
                                    <option.icon size={16} />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-medium text-gray-900">{option.label}</p>
                                    <p className="text-xs text-gray-500">{option.description}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

// =============================================================================
// MAIN TOOLBAR COMPONENT
// =============================================================================

const CanvasToolbar = ({
    onAddNode,
    onZoomIn,
    onZoomOut,
    onFitView,
    onClear,
    onSave,
    onExport,
    onUndo,
    onRedo,
    canUndo,
    canRedo,
    isLocked,
    onToggleLock,
    showGrid,
    onToggleGrid,
    nodeCount = 0,
    edgeCount = 0
}) => {
    return (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-10">
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-2xl bg-white/95 backdrop-blur-xl border border-gray-200 shadow-xl">

                {/* Add Node Dropdown */}
                <NodeTypePicker onAddNode={onAddNode} />

                <Divider />

                {/* Quick Add Buttons */}
                <ToolbarSection title="Elements">
                    <ToolButton
                        icon={Type}
                        label="Add Text Note"
                        onClick={() => onAddNode('text')}
                        color="blue"
                    />
                    <ToolButton
                        icon={Code}
                        label="Add Code Snippet"
                        onClick={() => onAddNode('code')}
                        color="amber"
                    />
                    <ToolButton
                        icon={Sparkles}
                        label="Add AI Response Card"
                        onClick={() => onAddNode('aiResponse')}
                        color="purple"
                    />
                    <ToolButton
                        icon={Image}
                        label="Add Image Element"
                        onClick={() => onAddNode('image')}
                        color="pink"
                    />
                    <ToolButton
                        icon={FileText}
                        label="Add Document Reference"
                        onClick={() => onAddNode('document')}
                        color="emerald"
                    />
                    <ToolButton
                        icon={StickyNote}
                        label="Add Sticky Note"
                        onClick={() => onAddNode('sticky')}
                        color="yellow"
                    />
                </ToolbarSection>

                <Divider />

                {/* View Controls */}
                <ToolbarSection title="View">
                    <ToolButton icon={ZoomOut} label="Zoom Out" onClick={onZoomOut} />
                    <ToolButton icon={ZoomIn} label="Zoom In" onClick={onZoomIn} />
                    <ToolButton icon={Maximize} label="Fit View" onClick={onFitView} />
                    <ToolButton
                        icon={Grid}
                        label={showGrid ? "Hide Grid" : "Show Grid"}
                        onClick={onToggleGrid}
                        active={showGrid}
                    />
                </ToolbarSection>

                <Divider />

                {/* Edit Controls */}
                <ToolbarSection title="Edit">
                    <ToolButton
                        icon={Undo}
                        label="Undo"
                        onClick={onUndo}
                        disabled={!canUndo}
                    />
                    <ToolButton
                        icon={Redo}
                        label="Redo"
                        onClick={onRedo}
                        disabled={!canRedo}
                    />
                    <ToolButton
                        icon={isLocked ? Lock : Unlock}
                        label={isLocked ? 'Unlock Canvas' : 'Lock Canvas'}
                        onClick={onToggleLock}
                        active={isLocked}
                    />
                </ToolbarSection>

                <Divider />

                {/* Actions */}
                <ToolbarSection title="Actions">
                    <ToolButton icon={Save} label="Save Canvas" onClick={onSave} />
                    <ToolButton icon={Download} label="Export as Image" onClick={onExport} />
                    <ToolButton icon={Trash2} label="Clear Canvas" onClick={onClear} danger />
                </ToolbarSection>

                {/* Stats Badge */}
                {(nodeCount > 0 || edgeCount > 0) && (
                    <>
                        <Divider />
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-gray-100 text-xs text-gray-500">
                            <Layers size={12} />
                            <span>{nodeCount} nodes</span>
                            {edgeCount > 0 && (
                                <>
                                    <span className="text-gray-300">•</span>
                                    <Link2 size={12} />
                                    <span>{edgeCount}</span>
                                </>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Keyboard Shortcuts Hint */}
            <div className="mt-2 text-center">
                <p className="text-[10px] text-gray-400">
                    <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-500 font-mono">Del</kbd> to delete •
                    Drag to connect •
                    <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-500 font-mono">Scroll</kbd> to zoom
                </p>
            </div>
        </div>
    );
};

export default CanvasToolbar;
