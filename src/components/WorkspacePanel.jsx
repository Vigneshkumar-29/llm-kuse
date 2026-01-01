import React from 'react';
import { Code2, ExternalLink, Download, X, LayoutGrid } from 'lucide-react';

const WorkspacePanel = ({ showWorkspace, onClose }) => {
    return (
        <div className={`
       border-l border-black/5 bg-surface/30 backdrop-blur-xl relative
       transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)]
       ${showWorkspace ? 'w-[50%] translate-x-0 opacity-100' : 'w-0 translate-x-20 opacity-0 overflow-hidden'}
    `}>
            <div className="h-full flex flex-col min-w-[400px]">
                {/* Workspace Header */}
                <div className="h-16 flex items-center justify-between px-6 border-b border-black/5 bg-white/50 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <Code2 size={18} className="text-accent" />
                        <span className="font-semibold text-primary">Workspace</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-black/5 rounded-lg text-secondary" title="Open in new tab"><ExternalLink size={18} /></button>
                        <button className="p-2 hover:bg-black/5 rounded-lg text-secondary" title="Download Artifact"><Download size={18} /></button>
                        <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-lg text-secondary" title="Close Workspace">
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Workspace Canvas */}
                <div className="flex-1 p-6 overflow-y-auto bg-surface-highlight/30">
                    {/* Placeholder for workspace content */}
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-black/5 rounded-2xl">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4">
                            <LayoutGrid size={32} className="text-secondary/50" />
                        </div>
                        <h3 className="font-serif text-xl font-medium text-primary mb-2">No active artifact</h3>
                        <p className="text-secondary max-w-xs">
                            When you generate code or long documents, they will appear here for focused viewing.
                        </p>
                        <button
                            onClick={onClose}
                            className="mt-6 px-4 py-2 bg-white border border-black/5 rounded-lg text-sm font-medium hover:shadow-sm transition-all"
                        >
                            Close Workspace
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkspacePanel;
