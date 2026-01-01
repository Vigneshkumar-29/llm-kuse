import React from 'react';
import { PlusCircle, MessageSquare, Library, Upload, LayoutGrid, FileText, Youtube } from 'lucide-react';

const Sidebar = ({ showSidebar, connectionStatus, modelName, onNewThread, onUploadClick, showUploadBadge, activeMode, onModeChange }) => {
    return (
        <aside className={`
      ${showSidebar ? 'w-64' : 'w-0'} 
      transition-all duration-500 ease-in-out
      bg-surface/50 border-r border-black/5 flex flex-col relative
      overflow-hidden whitespace-nowrap
    `}>
            {/* Header */}
            <div className="h-16 flex items-center px-6 border-b border-black/5 min-w-[16rem]">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center shadow-md">
                        <span className="font-serif font-italic font-bold text-xl">D</span>
                    </div>
                    <span className="font-serif font-semibold text-lg tracking-tight">DevSavvy</span>
                </div>
            </div>

            {/* Navigation */}
            <div className="p-4 space-y-1 flex-1 min-w-[16rem]">
                <div className="text-xs font-medium text-secondary uppercase tracking-wider px-3 mb-2 mt-2">Workspace</div>

                <button
                    onClick={() => onModeChange('chat')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeMode === 'chat'
                        ? 'bg-primary text-white shadow-md'
                        : 'text-secondary hover:text-primary hover:bg-black/5'
                        }`}
                >
                    <MessageSquare size={18} />
                    AI Chat
                </button>

                <button
                    onClick={() => onModeChange('canvas')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeMode === 'canvas'
                        ? 'bg-primary text-white shadow-md'
                        : 'text-secondary hover:text-primary hover:bg-black/5'
                        }`}
                >
                    <LayoutGrid size={18} />
                    Canvas
                </button>

                <button
                    onClick={() => onModeChange('documents')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeMode === 'documents'
                        ? 'bg-primary text-white shadow-md'
                        : 'text-secondary hover:text-primary hover:bg-black/5'
                        }`}
                >
                    <FileText size={18} />
                    Documents
                </button>

                <button
                    onClick={() => onModeChange('youtube')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeMode === 'youtube'
                        ? 'bg-primary text-white shadow-md'
                        : 'text-secondary hover:text-primary hover:bg-black/5'
                        }`}
                >
                    <Youtube size={18} />
                    YouTube
                </button>

                <div className="my-4 border-t border-black/5" />

                <button
                    onClick={onNewThread}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-secondary hover:text-primary hover:bg-black/5 transition-colors group"
                >
                    <PlusCircle size={18} className="group-hover:text-accent transition-colors" />
                    New Thread
                </button>

                <button
                    onClick={onUploadClick}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-secondary hover:text-primary hover:bg-black/5 transition-colors group relative"
                >
                    <Upload size={18} className="group-hover:text-accent transition-colors" />
                    Upload Files
                    {showUploadBadge && (
                        <span className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold bg-accent text-white">
                            NEW
                        </span>
                    )}
                </button>

                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-secondary hover:text-primary hover:bg-black/5 transition-colors">
                    <Library size={18} />
                    Library
                </button>
            </div>

            {/* Status Footer */}
            <div className="p-4 bg-surface border-t border-black/5 min-w-[16rem]">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${connectionStatus === 'Connected' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        <span className="text-xs font-medium text-secondary">{connectionStatus}</span>
                    </div>
                    <span className="text-[10px] text-secondary/60 font-mono">{modelName}</span>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
