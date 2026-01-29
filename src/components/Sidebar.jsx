import React, { useState, useRef, useEffect } from 'react';
import {
    PlusCircle, MessageSquare, LayoutGrid, FileText, Youtube, Link2,
    Search, ChevronDown, ChevronRight, Settings, User, Star, Clock,
    Hash, Activity, X, Check, Sparkles, TrendingUp, Layers, BookOpen,
    Moon, Sun, Bell, LogOut, RefreshCw, HardDrive, Upload
} from 'lucide-react';

import { useSetting, useHistory, useStorageInfo, useDatabase } from '../hooks/useDatabase';

// Default fallback projects
const DEFAULT_PROJECTS = [
    { id: 1, name: 'Web Development', count: 12, color: '#6366f1', starred: true },
    { id: 2, name: 'AI Research', count: 8, color: '#10b981', starred: true },
    { id: 3, name: 'Mobile App', count: 5, color: '#f59e0b', starred: false },
];

const Sidebar = ({
    showSidebar,
    connectionStatus,
    modelName,
    availableModels = [],
    onNewThread,
    onUploadClick,
    showUploadBadge,
    activeMode,
    onModeChange,
    onModelChange,
    onRetryConnection
}) => {
    // State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchFocused, setSearchFocused] = useState(false);
    const [expandedSections, setExpandedSections] = useState({
        projects: true,
        recent: true,
        workspace: true
    });
    const [showModelDropdown, setShowModelDropdown] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    
    // Database Hooks
    // savedProjects will be the projects array. setSavedProjects updates it.
    const [savedProjects, setSavedProjects, projectsLoading] = useSetting('sidebar_projects', DEFAULT_PROJECTS);
    const { history: actionHistory } = useHistory();
    const storageInfo = useStorageInfo();
    const { info: dbInfo } = useDatabase();

    // Use saved projects or defaults if loading/null
    const projects = savedProjects || DEFAULT_PROJECTS;

    // Map history to recent items display
    const recentItems = actionHistory.map((item, idx) => ({
        id: `hist_${idx}`,
        title: item.action,
        type: 'history',
        time: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        icon: Clock
    })).slice(0, 5); 

    // Refs
    const modelDropdownRef = useRef(null);
    const userMenuRef = useRef(null);

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (modelDropdownRef.current && !modelDropdownRef.current.contains(e.target)) {
                setShowModelDropdown(false);
            }
            if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
                setShowUserMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Toggle section expansion
    const toggleSection = (section) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    // Handle model selection
    const handleModelSelect = (modelId) => {
        onModelChange(modelId);
        setShowModelDropdown(false);
    };

    // Toggle project star
    const toggleProjectStar = (projectId) => {
        const newProjects = projects.map(p =>
            p.id === projectId ? { ...p, starred: !p.starred } : p
        );
        setSavedProjects(newProjects);
    };

    // Create new project
    const handleNewProject = () => {
        const name = prompt("Enter project name:");
        if (name) {
            const newProject = {
                id: Date.now(),
                name,
                count: 0,
                color: '#' + Math.floor(Math.random()*16777215).toString(16),
                starred: false
            };
            const newProjects = [...projects, newProject];
            setSavedProjects(newProjects);
        }
    };

    // Filter items based on search
    const filteredRecent = recentItems.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredProjects = projects.filter(project =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Prepare model list
    const modelList = availableModels.length > 0 
        ? availableModels.map(m => ({ 
            id: m, 
            name: m, 
            description: 'Ollama Model', 
            tokens: 'unknown', 
            speed: 'unknown' 
          }))
        : [
            { id: 'llama3.2', name: 'Llama 3.2', description: 'Fast standard', tokens: '128K' },
            { id: 'mistral', name: 'Mistral', description: 'Reasoning', tokens: '32K' }
          ];

    const currentModelInfo = modelList.find(m => m.id === modelName) || { name: modelName || 'Select Model' };

    return (
        <aside className={`
            ${showSidebar ? 'w-72' : 'w-0'} 
            transition-all duration-500 ease-in-out
            bg-gradient-to-b from-slate-50 to-white
            border-r border-slate-200/80 flex flex-col relative
            overflow-hidden whitespace-nowrap shadow-sm
        `}>
            {/* Header */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 min-w-[18rem] bg-white/80 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25">
                        <span className="font-serif font-bold text-xl italic">D</span>
                    </div>
                    <div>
                        <span className="font-serif font-semibold text-lg tracking-tight text-slate-800">DevSavvy</span>
                        <div
                            className="flex items-center gap-1.5 cursor-pointer hover:bg-slate-100 px-1.5 py-0.5 rounded transition-colors group"
                            onClick={onRetryConnection}
                            title="Click to retry connection to Ollama"
                        >
                            <div className={`w-1.5 h-1.5 rounded-full ${connectionStatus === 'Connected' || connectionStatus === 'Ready' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500 group-hover:bg-amber-600'}`} />
                            <span className="text-[10px] text-slate-400 font-medium group-hover:text-slate-600">{connectionStatus}</span>
                            <RefreshCw size={10} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </div>
                </div>

                {/* User Avatar Button */}
                <div className="relative" ref={userMenuRef}>
                    <button
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 border-2 border-white shadow-sm flex items-center justify-center hover:shadow-md transition-all"
                    >
                        <User size={14} className="text-indigo-600" />
                    </button>

                    {showUserMenu && (
                        <div className="absolute right-0 top-10 w-56 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-scale-in">
                            <div className="p-3 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-purple-50">
                                <div className="font-medium text-slate-800">Guest User</div>
                                <div className="text-xs text-slate-500">guest@devsavvy.ai</div>
                            </div>
                            <div className="p-2">
                                <button
                                    onClick={() => {
                                        setIsDarkMode(!isDarkMode);
                                        // Ideally toggle theme context here
                                    }}
                                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                                >
                                    {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
                                    {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                                </button>
                                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors">
                                    <LogOut size={16} />
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Search Bar */}
            <div className="p-3 min-w-[18rem]">
                <div className={`
                    flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white border transition-all
                    ${searchFocused ? 'border-indigo-400 shadow-md shadow-indigo-500/10 ring-2 ring-indigo-500/10' : 'border-slate-200 hover:border-slate-300'}
                `}>
                    <Search size={16} className={searchFocused ? 'text-indigo-500' : 'text-slate-400'} />
                    <input
                        type="text"
                        placeholder="Search everything..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setSearchFocused(true)}
                        onBlur={() => setSearchFocused(false)}
                        className="flex-1 bg-transparent border-none outline-none text-sm text-slate-700 placeholder-slate-400"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="p-0.5 rounded hover:bg-slate-100 transition-colors"
                        >
                            <X size={14} className="text-slate-400" />
                        </button>
                    )}
                </div>
            </div>

            {/* Model Selector */}
            <div className="px-3 pb-3 min-w-[18rem]" ref={modelDropdownRef}>
                <button
                    onClick={() => setShowModelDropdown(!showModelDropdown)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 hover:border-indigo-200 transition-all group"
                >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-sm">
                        <Sparkles size={14} className="text-white" />
                    </div>
                    <div className="flex-1 text-left">
                        <div className="text-sm font-medium text-slate-700">{currentModelInfo.name}</div>
                        <div className="text-[10px] text-slate-500">
                             {availableModels.length > 0 ? `${availableModels.length} models available` : 'Demo Mode'}
                        </div>
                    </div>
                    <ChevronDown size={16} className={`text-slate-400 transition-transform ${showModelDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showModelDropdown && (
                    <div className="mt-2 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-scale-in absolute w-[90%] left-[5%]">
                         <div className="p-2 border-b border-slate-100 bg-slate-50">
                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider px-2">Select Model</span>
                        </div>
                        <div className="p-2 max-h-64 overflow-y-auto">
                            {modelList.map((model) => (
                                <button
                                    key={model.id}
                                    onClick={() => handleModelSelect(model.id)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${modelName === model.id
                                        ? 'bg-indigo-50 border border-indigo-200'
                                        : 'hover:bg-slate-50 border border-transparent'
                                        }`}
                                >
                                    <div className="flex-1 text-left">
                                        <div className="text-sm font-medium text-slate-700">{model.name}</div>
                                        {model.description && <div className="text-[10px] text-slate-500">{model.description}</div>}
                                    </div>
                                    {modelName === model.id && (
                                        <Check size={16} className="text-indigo-500" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation & Projects */}
            <div className="flex-1 overflow-y-auto min-w-[18rem] px-3 space-y-1">
                 {/* Workspace Section */}
                 <div className="mb-4">
                    <button
                        onClick={() => toggleSection('workspace')}
                        className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hover:text-slate-800 transition-colors"
                    >
                        <span>Workspace</span>
                        <ChevronRight size={14} className={`transition-transform ${expandedSections.workspace ? 'rotate-90' : ''}`} />
                    </button>

                    {expandedSections.workspace && (
                        <div className="mt-1 space-y-1">
                            {[
                                { mode: 'chat', icon: MessageSquare, label: 'AI Chat' },
                                { mode: 'canvas', icon: LayoutGrid, label: 'Canvas' },
                                { mode: 'documents', icon: FileText, label: 'Documents' },
                                { mode: 'youtube', icon: Youtube, label: 'YouTube' },
                                { mode: 'url', icon: Link2, label: 'URL Extract' },
                            ].map((item) => (
                                <button
                                    key={item.mode}
                                    onClick={() => onModeChange(item.mode)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${activeMode === item.mode
                                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25'
                                        : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
                                        }`}
                                >
                                    <item.icon size={18} />
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2 mb-4">
                    <button
                        onClick={onNewThread}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium bg-white border border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600 hover:shadow-sm transition-all group"
                    >
                        <PlusCircle size={16} className="group-hover:rotate-90 transition-transform" />
                        New
                    </button>
                    <button
                        onClick={onUploadClick}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium bg-white border border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600 hover:shadow-sm transition-all relative group"
                    >
                        <Upload size={16} className="group-hover:-translate-y-0.5 transition-transform" />
                        Upload
                        {showUploadBadge && (
                            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
                        )}
                    </button>
                </div>

                {/* Projects Section */}
                <div className="mb-4">
                    <button
                        onClick={() => toggleSection('projects')}
                        className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hover:text-slate-800 transition-colors"
                    >
                        <span className="flex items-center gap-2">
                             <Layers size={12} /> Projects
                        </span>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-normal text-slate-400">{filteredProjects.length}</span>
                            <ChevronRight size={14} className={`transition-transform ${expandedSections.projects ? 'rotate-90' : ''}`} />
                        </div>
                    </button>

                    {expandedSections.projects && (
                        <div className="mt-1 space-y-0.5">
                            {filteredProjects.map((project) => (
                                <div
                                    key={project.id}
                                    className="group flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-100 transition-all cursor-pointer"
                                >
                                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: project.color }} />
                                    <span className="flex-1 text-sm text-slate-700 truncate">{project.name}</span>
                                    <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">
                                        {project.count}
                                    </span>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleProjectStar(project.id);
                                        }}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Star size={14} className={project.starred ? 'text-amber-500 fill-amber-500' : 'text-slate-400'} />
                                    </button>
                                </div>
                            ))}
                            <button 
                                onClick={handleNewProject}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                            >
                                <PlusCircle size={14} /> New Project
                            </button>
                        </div>
                    )}
                </div>

                 {/* Recent Items Section */}
                 <div className="mb-4">
                    <button
                        onClick={() => toggleSection('recent')}
                        className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hover:text-slate-800 transition-colors"
                    >
                        <span className="flex items-center gap-2"><Clock size={12} /> Recent</span>
                        <ChevronRight size={14} className={`transition-transform ${expandedSections.recent ? 'rotate-90' : ''}`} />
                    </button>

                    {expandedSections.recent && (
                        <div className="mt-1 space-y-0.5">
                            {filteredRecent.length > 0 ? filteredRecent.map((item) => (
                                <div key={item.id} className="group flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-100 transition-all cursor-pointer">
                                    <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                                        <item.icon size={14} className="text-slate-500 group-hover:text-indigo-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm text-slate-700 truncate">{item.title}</div>
                                        <div className="text-[10px] text-slate-400">{item.time}</div>
                                    </div>
                                </div>
                            )) : (
                                <div className="px-3 py-2 text-xs text-slate-400 italic">No recent activity</div>
                            )}
                        </div>
                    )}
                </div>

                 {/* Library Button */}
                 <button
                    onClick={() => onModeChange('library')}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-all mb-4"
                >
                    <BookOpen size={18} /> Knowledge Library
                    <span className="ml-auto text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">
                        {dbInfo ? dbInfo.storage.documents.count : 0}
                    </span>
                </button>
            </div>

             {/* Usage Statistics Footer */}
             <div className="p-3 bg-white border-t border-slate-100 min-w-[18rem]">
                <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="text-center p-2 rounded-lg bg-slate-50">
                        <div className="text-lg font-bold text-slate-800">{storageInfo.documentsCount}</div>
                        <div className="text-[9px] text-slate-500 uppercase">Docs</div>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-slate-50">
                        <div className="text-lg font-bold text-slate-800">{storageInfo.blobsCount}</div>
                        <div className="text-[9px] text-slate-500 uppercase">Files</div>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-slate-50">
                        <div className="text-lg font-bold text-emerald-600"><Activity size={16} className="mx-auto" /></div>
                        <div className="text-[9px] text-slate-500 uppercase">Active</div>
                    </div>
                </div>
                <div className="mb-3">
                    <div className="flex items-center justify-between text-[10px] mb-1">
                        <span className="text-slate-500 flex items-center gap-1"><HardDrive size={10} /> Storage</span>
                        <span className="text-slate-600 font-medium">{storageInfo.usageFormatted} / {storageInfo.quotaFormatted}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${storageInfo.usagePercent > 80 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${storageInfo.usagePercent}%` }} />
                    </div>
                </div>
                <button className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 shadow-lg shadow-indigo-500/25 transition-all">
                    <TrendingUp size={14} /> Upgrade to Pro
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
