import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Terminal,
  Cpu,
  Plus,
  Flame,
  Calendar,
  BookOpen,
  ArrowRight,
  Sparkles,
  Layers,
  Clock,
  Compass,
} from 'lucide-react'
import { ThemeToggle } from '../components/ThemeToggle'
import { ModeSwitcher } from '../components/ModeSwitcher'
import { calculateStreak } from '../lib/storage'

export const SanctuaryHub = ({
  sections,
  entries,
  onSelectSection,
  onOpenNewDomain,
  onOpenResetModal,
  storageMode = 'cloud',
  user = null,
  onSwitchMode,
  onSignOut,
}) => {
  // Peaceful date formatting
  const today = new Date()
  const formattedDate = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  // Motivational serene prompts
  const peacefulPrompts = [
    'A tranquil mind absorbs deeply; a reflective mind retains forever.',
    'True mastery is not speed, but clarity of the underlying pattern.',
    'Write without noise. Every concept unraveled is a milestone achieved.',
    'In stillness, algorithms reveal their simple, elegant truths.',
  ]
  const [promptIndex] = useState(() => Math.floor(Math.random() * peacefulPrompts.length))

  // Global calculations
  const globalStreak = calculateStreak(entries)
  const totalEntries = entries.length

  // Stats helper for a section
  const getSectionStats = (sectionId) => {
    const sectionEntries = entries.filter((e) => e.sectionId === sectionId)
    const streak = calculateStreak(sectionEntries)

    // Current month logs count
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()
    const thisMonthLogs = sectionEntries.filter((e) => {
      const d = new Date(e.date || e.createdAt)
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear
    }).length

    // Last reflection label
    let lastReflectionLabel = 'No reflections yet'
    if (sectionEntries.length > 0) {
      const sorted = [...sectionEntries].sort(
        (a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt)
      )
      const lastDate = sorted[0].date
      const todayStr = today.toISOString().split('T')[0]
      if (lastDate === todayStr) {
        lastReflectionLabel = 'Today'
      } else {
        const diffDays = Math.round(
          (new Date(todayStr) - new Date(lastDate)) / (1000 * 60 * 60 * 24)
        )
        if (diffDays === 1) lastReflectionLabel = 'Yesterday'
        else if (diffDays > 1) lastReflectionLabel = `${diffDays} days ago`
        else lastReflectionLabel = 'Recently'
      }
    }

    return {
      count: sectionEntries.length,
      thisMonthLogs,
      lastReflectionLabel,
      streak: streak.currentStreak,
      activeDays: streak.activeDaysCount,
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto flex flex-col justify-between"
    >
      <div>
        {/* Top Serene Header */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-8 border-b border-white/5 light:border-black/5 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sage-400 light:bg-sage-600 animate-pulse" />
              <span className="text-xs font-mono uppercase tracking-widest text-[#8E9299] light:text-[#6C707E]">
                {formattedDate}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-medium tracking-tight text-[#E6E4DD] light:text-[#2B2D42]">
              Sanctuary
            </h1>
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-center">
            {/* Storage Mode Switcher */}
            <ModeSwitcher
              storageMode={storageMode}
              user={user}
              onSwitchMode={onSwitchMode}
              onSignOut={onSignOut}
            />

            {/* Global Streak Pill */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border
              bg-[#1A1C20] border-white/10 text-[#E6E4DD]
              light:bg-[#F3EFE6] light:border-black/10 light:text-[#2B2D42]">
              <Flame className="w-3.5 h-3.5 text-amber-warm fill-amber-warm/30" />
              <span>{globalStreak.currentStreak} day streak</span>
            </div>

            {/* Manage Sample Data Button */}
            <button
              onClick={onOpenResetModal}
              title="Reset or clear sample logs"
              className="px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors
                bg-[#1A1C20] border-white/10 hover:border-sage-400/40 text-[#8E9299] hover:text-[#E6E4DD]
                light:bg-[#F3EFE6] light:border-black/10 light:hover:border-sage-600/40 light:text-[#6C707E] light:hover:text-[#2B2D42]"
            >
              Data Settings
            </button>

            {/* Smooth Theme Toggle */}
            <ThemeToggle />
          </div>
        </header>

        {/* Motivational Prompt Card */}
        <div className="my-8 p-5 sm:p-6 rounded-2xl border transition-all duration-300
          bg-[#1A1C20]/40 border-white/5 backdrop-blur-xs
          light:bg-[#F3EFE6]/60 light:border-black/5">
          <div className="flex items-start gap-3">
            <Compass className="w-5 h-5 mt-0.5 text-sage-400 light:text-sage-600 flex-shrink-0" />
            <div>
              <p className="font-serif italic text-base sm:text-lg text-[#E6E4DD]/90 light:text-[#2B2D42]/90 leading-relaxed">
                "{peacefulPrompts[promptIndex]}"
              </p>
              <div className="mt-2 text-xs text-[#8E9299] light:text-[#6C707E] flex items-center gap-4">
                <span>{totalEntries} lifetime reflections logged</span>
                <span>•</span>
                <span>{globalStreak.activeDaysCount} active writing days</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section Cards Grid */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#8E9299] light:text-[#6C707E]">
              Knowledge Domains
            </h2>
            <span className="text-xs text-[#8E9299] light:text-[#6C707E]">
              {sections.length} {sections.length === 1 ? 'Space' : 'Spaces'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {sections.map((section) => {
              const stats = getSectionStats(section.id)
              const isCS = section.id === 'cs'

              return (
                <motion.div
                  key={section.id}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => onSelectSection(section.id)}
                  className={`group relative p-6 rounded-2xl border cursor-pointer transition-all duration-300 flex flex-col justify-between
                    ${
                      isCS
                        ? 'bg-[#1A1C20] border-sage-400/30 hover:border-sage-400/60 shadow-soft-dark light:bg-[#F3EFE6] light:border-sage-600/30 light:hover:border-sage-600/60 light:shadow-soft-light'
                        : 'bg-[#1A1C20] border-white/5 hover:border-white/20 light:bg-[#F3EFE6] light:border-black/5 light:hover:border-black/20'
                    }`}
                >
                  {/* Subtle top indicator */}
                  {isCS && (
                    <div className="absolute top-0 right-0 transform translate-x-0 -translate-y-0">
                      <span className="inline-flex items-center gap-1 text-[10px] uppercase font-mono tracking-wider font-semibold px-2.5 py-1 rounded-bl-xl rounded-tr-2xl bg-sage-400/15 text-sage-300 light:text-sage-700 border-b border-l border-sage-400/20">
                        Primary Sanctuary
                      </span>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-sage-400/10 text-sage-400 light:text-sage-600">
                        {isCS ? <Terminal className="w-5 h-5" /> : <Cpu className="w-5 h-5" />}
                      </div>
                      <div>
                        <h3 className="font-serif text-2xl font-medium text-[#E6E4DD] light:text-[#2B2D42] group-hover:text-sage-400 light:group-hover:text-sage-600 transition-colors">
                          {section.title}
                        </h3>
                        <p className="text-xs text-[#8E9299] light:text-[#6C707E] line-clamp-1">
                          {section.subtitle}
                        </p>
                      </div>
                    </div>

                    <p className="text-sm text-[#8E9299] light:text-[#6C707E] leading-relaxed mb-6 line-clamp-2">
                      {section.description}
                    </p>
                  </div>

                  {/* Tranquil Live Stats */}
                  <div className="pt-4 border-t border-white/5 light:border-black/5 space-y-2">
                    <div className="text-xs font-mono text-[#8E9299] light:text-[#6C707E]">
                      Last reflection:{' '}
                      <span className="text-[#E6E4DD] light:text-[#2B2D42] font-sans font-medium">
                        {stats.lastReflectionLabel}
                      </span>{' '}
                      •{' '}
                      <span className="text-[#E6E4DD] light:text-[#2B2D42] font-sans font-medium">
                        {stats.thisMonthLogs} logs
                      </span>{' '}
                      this month • Current streak:{' '}
                      <span className="text-amber-warm font-sans font-medium">
                        {stats.streak} {stats.streak === 1 ? 'day' : 'days'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex flex-wrap gap-1.5">
                        {(section.categories || []).slice(0, 3).map((cat) => (
                          <span
                            key={cat}
                            className="text-[11px] px-2 py-0.5 rounded-md bg-white/5 light:bg-black/5 text-[#8E9299] light:text-[#6C707E]"
                          >
                            {cat}
                          </span>
                        ))}
                        {(section.categories || []).length > 3 && (
                          <span className="text-[11px] px-1.5 py-0.5 text-[#8E9299] light:text-[#6C707E]">
                            +{(section.categories || []).length - 3}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 text-xs font-medium text-sage-400 light:text-sage-600 group-hover:translate-x-1 transition-transform">
                        <span>Enter Space</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}

            {/* + New Domain Card */}
            <motion.div
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              whileTap={{ scale: 0.99 }}
              onClick={onOpenNewDomain}
              className="p-6 rounded-2xl border border-dashed border-white/15 light:border-black/15 
                hover:border-sage-400/50 light:hover:border-sage-600/50 cursor-pointer 
                transition-all duration-300 flex flex-col items-center justify-center text-center min-h-[220px] 
                bg-[#1A1C20]/20 hover:bg-[#1A1C20]/50 light:bg-[#F3EFE6]/30 light:hover:bg-[#F3EFE6]/70 group"
            >
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-3 
                bg-white/5 light:bg-black/5 text-[#8E9299] light:text-[#6C707E] 
                group-hover:bg-sage-400/20 group-hover:text-sage-400 light:group-hover:text-sage-600 transition-all">
                <Plus className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg font-medium text-[#E6E4DD] light:text-[#2B2D42] mb-1">
                + New Domain
              </h3>
              <p className="text-xs text-[#8E9299] light:text-[#6C707E] max-w-xs">
                Expand Sanctuary to system design, mathematics, architecture, or creative studies.
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Serene Footer */}
      <footer className="mt-16 pt-6 border-t border-white/5 light:border-black/5 text-center text-xs text-[#8E9299] light:text-[#6C707E] flex flex-col sm:flex-row items-center justify-between gap-2">
        <p>Sanctuary — Distraction-free daily learning & conceptual synthesis</p>
        <p className="font-mono text-[11px] opacity-70">Press N anytime in a space to write</p>
      </footer>
    </motion.div>
  )
}
