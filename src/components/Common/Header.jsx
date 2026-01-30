/**
 * Common Components - Header
 * ==========================
 * 
 * A professional header component with search, actions, and navigation.
 * 
 * @version 1.0.0
 */

import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import {
    Search, Command, Menu, X, Settings, Bell, User,
    Moon, Sun, HelpCircle, Sparkles, ChevronDown
} from 'lucide-react';

// =============================================================================
// HEADER COMPONENT
// =============================================================================

const Header = ({
    title = 'DevSavvy AI',
    subtitle = '',
    showSearch = true,
    showActions = true,
    onMenuClick,
    onSearchClick,
    onSettingsClick,
    onProfileClick,
    isDarkMode = false,
    onThemeToggle,
    user = null,
    notifications = [],
    className = ''
}) => {
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfile, setShowProfile] = useState(false);

    return (
        <header className={`
            sticky top-0 z-40 
            backdrop-blur-xl bg-white/80 dark:bg-neutral-900/80
            border-b border-neutral-200/50 dark:border-neutral-800/50
            ${className}
        `}>
            <div className="px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
                {/* Left Section - Menu & Title */}
                <div className="flex items-center gap-3">
                    {onMenuClick && (
                        <button
                            onClick={onMenuClick}
                            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 
                                       transition-colors lg:hidden"
                            aria-label="Toggle menu"
                        >
                            <Menu size={20} className="text-neutral-600 dark:text-neutral-400" />
                        </button>
                    )}

                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 
                                       flex items-center justify-center shadow-lg shadow-indigo-500/25">
                            <Sparkles size={16} className="text-white" />
                        </div>
                        <div className="hidden sm:block">
                            <h1 className="font-semibold text-neutral-900 dark:text-white text-sm">
                                {title}
                            </h1>
                            {subtitle && (
                                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                    {subtitle}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Center Section - Search */}
                {showSearch && (
                    <div className="flex-1 max-w-xl mx-4 hidden md:block">
                        <button
                            onClick={onSearchClick}
                            className={`
                                w-full flex items-center gap-3 px-4 py-2.5 rounded-xl
                                border border-neutral-200 dark:border-neutral-700
                                bg-neutral-50 dark:bg-neutral-800/50
                                hover:bg-neutral-100 dark:hover:bg-neutral-800
                                transition-all text-left group
                                ${isSearchFocused ? 'ring-2 ring-indigo-500/50' : ''}
                            `}
                        >
                            <Search size={16} className="text-neutral-400" />
                            <span className="flex-1 text-sm text-neutral-400">
                                Search or type a command...
                            </span>
                            <kbd className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded 
                                          bg-neutral-200 dark:bg-neutral-700 text-xs text-neutral-500 
                                          font-mono">
                                <Command size={10} />
                                K
                            </kbd>
                        </button>
                    </div>
                )}

                {/* Right Section - Actions */}
                {showActions && (
                    <div className="flex items-center gap-1">
                        {/* Mobile Search */}
                        <button
                            onClick={onSearchClick}
                            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 
                                       transition-colors md:hidden"
                            aria-label="Search"
                        >
                            <Search size={20} className="text-neutral-600 dark:text-neutral-400" />
                        </button>

                        {/* Theme Toggle */}
                        {onThemeToggle && (
                            <button
                                onClick={onThemeToggle}
                                className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 
                                           transition-colors"
                                aria-label="Toggle theme"
                            >
                                {isDarkMode ? (
                                    <Sun size={20} className="text-neutral-600 dark:text-neutral-400" />
                                ) : (
                                    <Moon size={20} className="text-neutral-600 dark:text-neutral-400" />
                                )}
                            </button>
                        )}

                        {/* Help */}
                        <button
                            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 
                                       transition-colors hidden sm:block"
                            aria-label="Help"
                        >
                            <HelpCircle size={20} className="text-neutral-600 dark:text-neutral-400" />
                        </button>

                        {/* Notifications */}
                        <div className="relative">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 
                                           transition-colors relative"
                                aria-label="Notifications"
                            >
                                <Bell size={20} className="text-neutral-600 dark:text-neutral-400" />
                                {notifications.length > 0 && (
                                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full 
                                                   bg-red-500 ring-2 ring-white dark:ring-neutral-900" />
                                )}
                            </button>

                            <AnimatePresence>
                                {showNotifications && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute right-0 mt-2 w-80 rounded-xl shadow-xl 
                                                  bg-white dark:bg-neutral-800 border border-neutral-200 
                                                  dark:border-neutral-700 overflow-hidden z-50"
                                    >
                                        <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
                                            <h3 className="font-semibold text-neutral-900 dark:text-white">
                                                Notifications
                                            </h3>
                                        </div>
                                        <div className="max-h-80 overflow-y-auto">
                                            {notifications.length > 0 ? (
                                                notifications.map((notification, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="p-4 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 
                                                                  cursor-pointer transition-colors"
                                                    >
                                                        <p className="text-sm text-neutral-900 dark:text-white">
                                                            {notification.title}
                                                        </p>
                                                        <p className="text-xs text-neutral-500 mt-1">
                                                            {notification.time}
                                                        </p>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="p-8 text-center text-neutral-500">
                                                    <Bell size={24} className="mx-auto mb-2 opacity-40" />
                                                    <p className="text-sm">No notifications</p>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Settings */}
                        {onSettingsClick && (
                            <button
                                onClick={onSettingsClick}
                                className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 
                                           transition-colors"
                                aria-label="Settings"
                            >
                                <Settings size={20} className="text-neutral-600 dark:text-neutral-400" />
                            </button>
                        )}

                        {/* Divider */}
                        <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-700 mx-2" />

                        {/* Profile */}
                        <div className="relative">
                            <button
                                onClick={() => setShowProfile(!showProfile)}
                                className="flex items-center gap-2 p-1.5 rounded-lg 
                                           hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                            >
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 
                                              to-purple-500 flex items-center justify-center">
                                    {user?.avatar ? (
                                        <img
                                            src={user.avatar}
                                            alt={user.name}
                                            className="w-full h-full rounded-full object-cover"
                                        />
                                    ) : (
                                        <User size={16} className="text-white" />
                                    )}
                                </div>
                                <ChevronDown size={14} className="text-neutral-400 hidden sm:block" />
                            </button>

                            <AnimatePresence>
                                {showProfile && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute right-0 mt-2 w-56 rounded-xl shadow-xl 
                                                  bg-white dark:bg-neutral-800 border border-neutral-200 
                                                  dark:border-neutral-700 overflow-hidden z-50"
                                    >
                                        <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
                                            <p className="font-medium text-neutral-900 dark:text-white">
                                                {user?.name || 'Guest User'}
                                            </p>
                                            <p className="text-xs text-neutral-500 mt-0.5">
                                                {user?.email || 'Not signed in'}
                                            </p>
                                        </div>
                                        <div className="p-2">
                                            <button
                                                onClick={onProfileClick}
                                                className="w-full px-3 py-2 text-left text-sm rounded-lg 
                                                          hover:bg-neutral-100 dark:hover:bg-neutral-700 
                                                          transition-colors text-neutral-700 dark:text-neutral-300"
                                            >
                                                View Profile
                                            </button>
                                            <button
                                                onClick={onSettingsClick}
                                                className="w-full px-3 py-2 text-left text-sm rounded-lg 
                                                          hover:bg-neutral-100 dark:hover:bg-neutral-700 
                                                          transition-colors text-neutral-700 dark:text-neutral-300"
                                            >
                                                Settings
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
