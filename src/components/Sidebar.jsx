import React, { useState, useRef, useEffect } from 'react';
import {
    MessageSquare, FileText, BookOpen, Settings, User,
    Search, ChevronRight, RefreshCw, Upload, Plus,
    Moon, Sun, LogOut, Sparkles, Clock, Check
} from 'lucide-react';

import { useHistory, useStorageInfo } from '../hooks/useDatabase';

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
    const [showModelDropdown, setShowModelDropdown] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    
    // Database Hooks
    const { history: actionHistory } = useHistory();
    const storageInfo = useStorageInfo();

    // Map history to recent items
    const recentItems = actionHistory.map((item, idx) => ({
        id: `hist_${idx}`,
        title: item.action,
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

    // Handle model selection
    const handleModelSelect = (modelId) => {
        onModelChange(modelId);
        setShowModelDropdown(false);
    };

    // Prepare model list
    const modelList = availableModels.length > 0 
        ? availableModels.map(m => ({ 
            id: m, 
            name: m, 
            description: 'Ollama Model'
          }))
        : [
            { id: 'llama3.2', name: 'Llama 3.2', description: 'Fast & Efficient' },
            { id: 'mistral', name: 'Mistral', description: 'Advanced Reasoning' }
          ];

    const currentModelInfo = modelList.find(m => m.id === modelName) || { name: modelName || 'Select Model' };

    return (
        <aside className={`
            ${showSidebar ? 'w-72' : 'w-0'} 
            transition-all duration-300 ease-in-out
            bg-white border-r border-gray-200
            flex flex-col relative overflow-hidden
        `}>
            {/* Header */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100 min-w-[18rem]">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
                        <Sparkles size={20} className="text-white" />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg text-gray-900">AI Assistant</h1>
                        <div
                            className="flex items-center gap-1.5 cursor-pointer hover:bg-gray-50 px-2 py-0.5 rounded-md transition-colors group"
                            onClick={onRetryConnection}
                            title="Click to retry connection"
                        >
                            <div className={`w-2 h-2 rounded-full ${
                                connectionStatus === 'Connected' || connectionStatus === 'Ready' 
                                    ? 'bg-green-500' 
                                    : 'bg-amber-500'
                            }`} />
                            <span className="text-xs text-gray-500">{connectionStatus}</span>
                            <RefreshCw size={10} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </div>
                </div>

                {/* User Menu */}
                <div className="relative" ref={userMenuRef}>
                    <button
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                    >
                        <User size={18} className="text-gray-600" />
                    </button>

                    {showUserMenu && (
                        <div className="absolute right-0 top-12 w-56 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">
                            <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                                <div className="font-semibold text-gray-900">Guest User</div>
                                <div className="text-sm text-gray-500">guest@aiassistant.com</div>
                            </div>
                            <div className="p-2">
                                <button
                                    onClick={() => setIsDarkMode(!isDarkMode)}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                                    {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                                </button>
                                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors">
                                    <LogOut size={18} />
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Model Selector */}
            <div className="px-4 py-3 border-b border-gray-100 min-w-[18rem]">
                <div className="relative" ref={modelDropdownRef}>
                    <button
                        onClick={() => setShowModelDropdown(!showModelDropdown)}
                        className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-all group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                                <Sparkles size={16} className="text-blue-600" />
                            </div>
                            <div className="text-left">
                                <div className="text-sm font-semibold text-gray-900">{currentModelInfo.name}</div>
                                <div className="text-xs text-gray-500">{currentModelInfo.description || 'AI Model'}</div>
                            </div>
                        </div>
                        <ChevronRight size={16} className={`text-gray-400 transition-transform ${showModelDropdown ? 'rotate-90' : ''}`} />
                    </button>

                    {showModelDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50 max-h-64 overflow-y-auto">
                            {modelList.map((model) => (
                                <button
                                    key={model.id}
                                    onClick={() => handleModelSelect(model.id)}
                                    className={`w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors ${
                                        model.id === modelName ? 'bg-blue-50' : ''
                                    }`}
                                >
                                    <div className="text-left">
                                        <div className="text-sm font-medium text-gray-900">{model.name}</div>
                                        <div className="text-xs text-gray-500">{model.description}</div>
                                    </div>
                                    {model.id === modelName && (
                                        <Check size={16} className="text-blue-600" />
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Search */}
            <div className="px-4 py-3 border-b border-gray-100 min-w-[18rem]">
                <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm transition-all"
                    />
                </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto min-w-[18rem] px-4 py-4">
                <div className="space-y-1">
                    {[
                        { mode: 'chat', icon: MessageSquare, label: 'AI Chat', color: 'blue' },
                        { mode: 'documents', icon: FileText, label: 'Documents', color: 'green' },
                        { mode: 'library', icon: BookOpen, label: 'Library', color: 'purple' },
                    ].map((item) => (
                        <button
                            key={item.mode}
                            onClick={() => onModeChange(item.mode)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                                activeMode === item.mode
                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
                                    : 'text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            <item.icon size={20} />
                            {item.label}
                        </button>
                    ))}
                </div>

                {/* Recent Activity */}
                {recentItems.length > 0 && (
                    <div className="mt-6">
                        <h3 className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                            Recent Activity
                        </h3>
                        <div className="space-y-1">
                            {recentItems.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                                >
                                    <Clock size={14} className="text-gray-400" />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm text-gray-700 truncate">{item.title}</div>
                                        <div className="text-xs text-gray-400">{item.time}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Footer Actions */}
            <div className="border-t border-gray-100 p-4 min-w-[18rem] space-y-2">
                <button
                    onClick={onNewThread}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/30 transition-all"
                >
                    <Plus size={18} />
                    New Conversation
                </button>
                
                <button
                    onClick={onUploadClick}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-medium hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all relative"
                >
                    <Upload size={18} />
                    Upload Documents
                    {showUploadBadge && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    )}
                </button>

                {/* Storage Info */}
                {storageInfo && (
                    <div className="px-3 py-2 rounded-lg bg-gray-50 text-xs text-gray-500">
                        <div className="flex justify-between mb-1">
                            <span>Storage</span>
                            <span className="font-medium">{storageInfo.usagePercent}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all"
                                style={{ width: `${storageInfo.usagePercent}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;
