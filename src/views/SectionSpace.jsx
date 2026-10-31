import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  PenTool,
  BookOpen,
  LineChart,
  Plus,
  Terminal,
  Cpu,
  Layers,
  Sparkles,
} from 'lucide-react'
import { ThemeToggle } from '../components/ThemeToggle'
import { ModeSwitcher } from '../components/ModeSwitcher'
import { JournalStream } from '../components/JournalStream'
import { ReflectionsAnalytics } from '../components/ReflectionsAnalytics'
import { DeleteConfirmModal } from '../components/DeleteConfirmModal'

export const SectionSpace = ({
  section,
  entries,
  onBackToHub,
  onOpenEntry,
  onNewEntry,
  onDeleteEntry,
  onToggleFavorite,
  storageMode = 'cloud',
  user = null,
  onSwitchMode,
  onSignOut,
}) => {
  const [activeTab, setActiveTab] = useState('stream') // 'stream' | 'analytics'
  const [entryToDelete, setEntryToDelete] = useState(null)

  // Section entries
  const sectionEntries = entries.filter((e) => e.sectionId === section.id)

  // Keyboard shortcut: Press 'N' to create new entry when not in an input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        e.key.toLowerCase() === 'n' &&
        !['input', 'textarea'].includes(document.activeElement?.tagName.toLowerCase()) &&
        !document.activeElement?.isContentEditable
      ) {
        e.preventDefault()
        onNewEntry()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onNewEntry])

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto flex flex-col justify-between"
    >
      <div>
        {/* Navigation / Header */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-white/5 light:border-black/5 gap-4">
          <div className="space-y-1.5">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2">
              <button
                onClick={onBackToHub}
                className="group inline-flex items-center gap-1.5 text-xs font-mono text-[#9CA3AF] hover:text-[#F3F4F6] light:text-[#6C707E] light:hover:text-[#2B2D42] transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                <span>Sanctuary Hub</span>
              </button>
              <span className="text-xs text-[#9CA3AF]/40">•</span>
              <span className="text-xs font-mono text-sage-400 light:text-sage-600 font-medium">
                {section.title}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-serif font-medium tracking-tight text-[#F3F4F6] light:text-[#2B2D42]">
              {section.title}
            </h1>
            <p className="text-xs text-[#9CA3AF] light:text-[#6C707E]">
              {section.subtitle || section.description}
            </p>
          </div>

          {/* Top Actions */}
          <div className="flex items-center gap-2.5 self-end sm:self-center">
            {/* Storage Mode Switcher */}
            <ModeSwitcher
              storageMode={storageMode}
              user={user}
              onSwitchMode={onSwitchMode}
              onSignOut={onSignOut}
            />

            {/* + Write Today's Learning Primary Action */}
            <button
              onClick={onNewEntry}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium 
                bg-sage-500 hover:bg-sage-600 text-white shadow-sm transition-all duration-200
                hover:shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Write Today's Learning</span>
              <span className="hidden sm:inline-block text-[10px] font-mono opacity-70 px-1 py-0.2 rounded bg-black/20">
                N
              </span>
            </button>

            <ThemeToggle />
          </div>
        </header>

        {/* Segmented Pill Switcher on Glass Card */}
        <div className="my-6 flex items-center justify-between flex-wrap gap-4">
          <div className="inline-flex p-1 rounded-2xl glass-card">
            <button
              onClick={() => setActiveTab('stream')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'stream'
                  ? 'bg-sage-400/20 text-sage-300 light:text-sage-700 font-semibold shadow-xs'
                  : 'text-[#9CA3AF] hover:text-[#F3F4F6] light:text-[#6C707E] light:hover:text-[#2B2D42]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Journal Stream</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/5 light:bg-black/5">
                {sectionEntries.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'analytics'
                  ? 'bg-sage-400/20 text-sage-300 light:text-sage-700 font-semibold shadow-xs'
                  : 'text-[#9CA3AF] hover:text-[#F3F4F6] light:text-[#6C707E] light:hover:text-[#2B2D42]'
              }`}
            >
              <LineChart className="w-3.5 h-3.5" />
              <span>Reflections & Analytics</span>
            </button>
          </div>

          <div className="text-xs text-[#9CA3AF] light:text-[#6C707E] hidden md:block font-mono">
            Focus Mode • Press <kbd className="px-1.5 py-0.5 rounded bg-white/5 light:bg-black/5 font-bold">N</kbd> anytime
          </div>
        </div>

        {/* Tab Content Display */}
        <div className="mt-4">
          {activeTab === 'stream' ? (
            <JournalStream
              entries={sectionEntries}
              section={section}
              onOpenEntry={onOpenEntry}
              onNewEntry={onNewEntry}
              onDeleteEntry={(entry) => setEntryToDelete(entry)}
              onToggleFavorite={onToggleFavorite}
            />
          ) : (
            <ReflectionsAnalytics
              entries={sectionEntries}
              section={section}
              onOpenEntry={onOpenEntry}
            />
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(entryToDelete)}
        title={entryToDelete?.title}
        onClose={() => setEntryToDelete(null)}
        onConfirm={() => {
          if (entryToDelete) {
            onDeleteEntry(entryToDelete.id)
            setEntryToDelete(null)
          }
        }}
      />

      {/* Footer */}
      <footer className="mt-16 pt-6 border-t border-white/5 light:border-black/5 text-center text-xs text-[#9CA3AF] light:text-[#6C707E]">
        <p>Reflecting inside {section.title} • Sanctuary of Focused Thought</p>
      </footer>
    </motion.div>
  )
}
