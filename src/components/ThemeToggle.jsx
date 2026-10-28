import React from 'react'
import { Sun, Moon } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'

export const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme, isDark } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      type="button"
      title={`Switch to ${isDark ? 'Warm Paper (Light)' : 'Cozy Obsidian (Dark)'} mode`}
      aria-label="Toggle visual theme"
      className={`relative inline-flex items-center justify-center p-2 rounded-xl transition-all duration-300
        bg-obsidian-card/60 dark:bg-obsidian-card/60 light:bg-paper-card border border-obsidian-border/40 
        dark:border-white/10 light:border-paper-border hover:scale-105 active:scale-95 text-obsidian-muted 
        dark:text-obsidian-muted light:text-paper-muted hover:text-sage-400 dark:hover:text-sage-400 
        light:hover:text-sage-600 focus:outline-none ${className}`}
    >
      <motion.div
        key={theme}
        initial={{ rotate: -30, opacity: 0, scale: 0.8 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        exit={{ rotate: 30, opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="flex items-center justify-center"
      >
        {isDark ? (
          <Moon className="w-[18px] h-[18px] text-amber-warm" />
        ) : (
          <Sun className="w-[18px] h-[18px] text-amber-600" />
        )}
      </motion.div>
    </button>
  )
}
