/**
 * StorageInfo Component
 * ======================
 * 
 * Visual display of IndexedDB storage usage and management.
 * Shows quota, usage, and provides database management options.
 * 
 * @version 1.0.0
 */

import React, { useState } from 'react';
import {
    Database, HardDrive, Trash2, Download, Upload,
    RefreshCw, AlertTriangle, CheckCircle, Loader2,
    FileText, Image, Archive, Shield
} from 'lucide-react';
import { useStorageInfo, useDatabase } from '../hooks/useDatabase';

// =============================================================================
// PROGRESS BAR
// =============================================================================

const ProgressBar = ({ percent, color = 'indigo' }) => {
    const getColor = () => {
        if (percent >= 90) return 'bg-red-500';
        if (percent >= 70) return 'bg-amber-500';
        return `bg-${color}-500`;
    };

    return (
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
                className={`h-full transition-all duration-500 ${getColor()}`}
                style={{ width: `${Math.min(percent, 100)}%` }}
            />
        </div>
    );
};

// =============================================================================
// STAT ITEM
// =============================================================================

const StatItem = ({ icon: Icon, label, value, color = 'gray' }) => (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
        <div className={`w-10 h-10 rounded-xl bg-${color}-100 flex items-center justify-center`}>
            <Icon size={20} className={`text-${color}-600`} />
        </div>
        <div>
            <p className="text-lg font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
        </div>
    </div>
);

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const StorageInfo = ({
    showActions = true,
    compact = false,
    className = ''
}) => {
    const storage = useStorageInfo();
    const db = useDatabase();
    const [action, setAction] = useState(null);
    const [importFile, setImportFile] = useState(null);

    const handleExport = async () => {
        setAction('export');
        try {
            await db.exportData();
        } finally {
            setAction(null);
        }
    };

    const handleImport = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setAction('import');
        try {
            const result = await db.importData(file);
            alert(`Imported ${result.imported} items. Skipped: ${result.skipped}. Errors: ${result.errors}`);
        } catch (err) {
            alert('Import failed: ' + err.message);
        } finally {
            setAction(null);
            setImportFile(null);
        }
    };

    const handleClear = async () => {
        if (!confirm('Are you sure you want to clear ALL data? This cannot be undone.')) return;

        setAction('clear');
        try {
            await db.clearAll();
        } finally {
            setAction(null);
        }
    };

    const handleRequestPersistence = async () => {
        setAction('persist');
        try {
            const granted = await db.requestPersistence();
            alert(granted ? 'Persistent storage granted!' : 'Persistent storage denied by browser.');
        } finally {
            setAction(null);
        }
    };

    if (storage.loading) {
        return (
            <div className={`flex items-center justify-center p-8 ${className}`}>
                <Loader2 size={24} className="animate-spin text-gray-400" />
            </div>
        );
    }

    // Compact version
    if (compact) {
        return (
            <div className={`p-4 rounded-xl border border-gray-200 ${className}`}>
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <HardDrive size={16} className="text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Storage</span>
                    </div>
                    <span className="text-sm text-gray-500">
                        {storage.usageFormatted} / {storage.quotaFormatted}
                    </span>
                </div>
                <ProgressBar percent={storage.usagePercent} />
                {storage.isNearLimit && (
                    <p className="mt-2 text-xs text-amber-600 flex items-center gap-1">
                        <AlertTriangle size={12} />
                        Storage nearly full
                    </p>
                )}
            </div>
        );
    }

    // Full version
    return (
        <div className={`p-6 rounded-2xl border border-gray-200 bg-white ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                        <Database size={24} className="text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Storage Manager</h3>
                        <p className="text-sm text-gray-500">IndexedDB Storage</p>
                    </div>
                </div>
                <button
                    onClick={db.refresh}
                    className="p-2 rounded-xl hover:bg-gray-100 text-gray-500"
                    disabled={db.loading}
                >
                    <RefreshCw size={18} className={db.loading ? 'animate-spin' : ''} />
                </button>
            </div>

            {/* Usage bar */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                        {storage.usagePercent}% Used
                    </span>
                    <span className="text-sm text-gray-500">
                        {storage.usageFormatted} of {storage.quotaFormatted}
                    </span>
                </div>
                <ProgressBar percent={storage.usagePercent} />
                {storage.isNearLimit && (
                    <div className="mt-2 p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2">
                        <AlertTriangle size={16} className="text-amber-500" />
                        <p className="text-sm text-amber-700">
                            Storage is nearly full. Consider deleting unused files.
                        </p>
                    </div>
                )}
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-3 mb-6">
                <StatItem
                    icon={FileText}
                    label="Documents"
                    value={storage.documentsCount}
                    color="indigo"
                />
                <StatItem
                    icon={Image}
                    label="Files"
                    value={storage.blobsCount}
                    color="purple"
                />
                <StatItem
                    icon={Archive}
                    label="File Size"
                    value={storage.blobsSize}
                    color="emerald"
                />
            </div>

            {/* Actions */}
            {showActions && (
                <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Actions</h4>

                    <div className="grid grid-cols-2 gap-3">
                        {/* Export */}
                        <button
                            onClick={handleExport}
                            disabled={action === 'export'}
                            className="flex items-center justify-center gap-2 p-3 rounded-xl border border-gray-200 
                                     text-gray-700 hover:bg-gray-50 font-medium text-sm disabled:opacity-50"
                        >
                            {action === 'export' ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <Download size={16} />
                            )}
                            Export Backup
                        </button>

                        {/* Import */}
                        <label className="flex items-center justify-center gap-2 p-3 rounded-xl border border-gray-200 
                                        text-gray-700 hover:bg-gray-50 font-medium text-sm cursor-pointer">
                            {action === 'import' ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <Upload size={16} />
                            )}
                            Import Backup
                            <input
                                type="file"
                                accept=".json"
                                onChange={handleImport}
                                className="hidden"
                                disabled={action === 'import'}
                            />
                        </label>

                        {/* Request persistence */}
                        <button
                            onClick={handleRequestPersistence}
                            disabled={action === 'persist'}
                            className="flex items-center justify-center gap-2 p-3 rounded-xl border border-gray-200 
                                     text-gray-700 hover:bg-gray-50 font-medium text-sm disabled:opacity-50"
                        >
                            {action === 'persist' ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <Shield size={16} />
                            )}
                            Request Persistent
                        </button>

                        {/* Clear all */}
                        <button
                            onClick={handleClear}
                            disabled={action === 'clear'}
                            className="flex items-center justify-center gap-2 p-3 rounded-xl border border-red-200 
                                     text-red-600 hover:bg-red-50 font-medium text-sm disabled:opacity-50"
                        >
                            {action === 'clear' ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <Trash2 size={16} />
                            )}
                            Clear All Data
                        </button>
                    </div>
                </div>
            )}

            {/* Status indicator */}
            <div className="mt-4 pt-4 border-t flex items-center justify-between text-xs text-gray-500">
                <span>Database: {db.info?.name || 'devsavvy_knowledge_base'}</span>
                <span className="flex items-center gap-1">
                    <CheckCircle size={12} className="text-emerald-500" />
                    Healthy
                </span>
            </div>
        </div>
    );
};

export default StorageInfo;
