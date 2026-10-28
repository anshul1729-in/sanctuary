import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Clock,
  Calendar,
  Tag,
  Maximize2,
  Minimize2,
  Flame,
  Star,
  Trash2,
  Plus,
  HelpCircle,
  Hash,
  ChevronDown,
} from 'lucide-react'
import { TipTapEditor } from '../components/TipTapEditor'
import { ThemeToggle } from '../components/ThemeToggle'
import { DeleteConfirmModal } from '../components/DeleteConfirmModal'

export const FreeMindCanvas = ({
  entry,
  section,
  onSaveEntry,
  onBack,
  onDeleteEntry,
  onToggleFavorite,
}) => {
  const [title, setTitle] = useState(entry?.title || '')
  const [content, setContent] = useState(entry?.content || '')
  const [category, setCategory] = useState(entry?.category || 'DSA')
  const [subTopic, setSubTopic] = useState(entry?.subTopic || 'Graphs')
  const [tags, setTags] = useState(entry?.tags || [])
  const [newTagInput, setNewTagInput] = useState('')
  const [showTagInput, setShowTagInput] = useState(false)

  // Complexity notes
  const [timeComplexity, setTimeComplexity] = useState(entry?.complexity?.time || '')
  const [spaceComplexity, setSpaceComplexity] = useState(entry?.complexity?.space || '')
  const [takeaway, setTakeaway] = useState(entry?.takeaway || '')

  // Date stamping
  const [dateStr, setDateStr] = useState(() => {
    if (entry?.date) return entry.date
    return new Date().toISOString().split('T')[0]
  })

  // Zen Mode & Auto-dimming state
  const [isZenMode, setIsZenMode] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [isHeaderHovered, setIsHeaderHovered] = useState(false)
  const typingTimeoutRef = useRef(null)

  // Auto-save feedback state
  const [saveStatus, setSaveStatus] = useState('Saved in sanctuary')
  const saveTimeoutRef = useRef(null)

  // Delete modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  // Suggested sub-topics based on current category
  const availableSubTopics =
    section?.subTopicsMap?.[category] || [
      'Graphs',
      'Dynamic Programming',
      'Trees',
      'Sliding Window',
      'Two Pointers',
      'Recursion',
      'Binary Search',
      'Heaps',
    ]

  // Compute reading time
  const readingTime = (() => {
    if (!content) return '1 min read'
    const tmp = document.createElement('div')
    tmp.innerHTML = content
    const text = tmp.textContent || tmp.innerText || ''
    const words = text.trim().split(/\s+/).filter(Boolean).length
    const minutes = Math.max(1, Math.round(words / 180))
    return `${minutes} min read`
  })()

  // Handle typing state for Auto-Dimming Zen Mode
  const handleTypingActivity = useCallback(() => {
    setIsTyping(true)
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
    }, 2800)
  }, [])

  // Auto-save logic
  const performSave = useCallback(
    (overrides = {}) => {
      setSaveStatus('Saving...')

      const dataToSave = {
        id: entry?.id,
        sectionId: section.id,
        title: overrides.title !== undefined ? overrides.title : title,
        content: overrides.content !== undefined ? overrides.content : content,
        category: overrides.category !== undefined ? overrides.category : category,
        subTopic: overrides.subTopic !== undefined ? overrides.subTopic : subTopic,
        tags: overrides.tags !== undefined ? overrides.tags : tags,
        date: dateStr,
        takeaway: overrides.takeaway !== undefined ? overrides.takeaway : takeaway,
        complexity: {
          time: overrides.timeComplexity !== undefined ? overrides.timeComplexity : timeComplexity,
          space:
            overrides.spaceComplexity !== undefined ? overrides.spaceComplexity : spaceComplexity,
        },
      }

      onSaveEntry(dataToSave)

      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
      saveTimeoutRef.current = setTimeout(() => {
        setSaveStatus('Saved in sanctuary')
      }, 600)
    },
    [
      entry,
      section,
      title,
      content,
      category,
      subTopic,
      tags,
      dateStr,
      takeaway,
      timeComplexity,
      spaceComplexity,
      onSaveEntry,
    ]
  )

  // Debounced auto-save on change
  useEffect(() => {
    const handler = setTimeout(() => {
      performSave()
    }, 800)
    return () => clearTimeout(handler)
  }, [
    title,
    content,
    category,
    subTopic,
    tags,
    dateStr,
    takeaway,
    timeComplexity,
    spaceComplexity,
    performSave,
  ])

  // Add custom tag
  const handleAddTag = (e) => {
    e.preventDefault()
    const trimmed = newTagInput.trim().replace(/^#/, '')
    if (trimmed && !tags.includes(trimmed)) {
      const nextTags = [...tags, trimmed]
      setTags(nextTags)
      performSave({ tags: nextTags })
      setNewTagInput('')
      setShowTagInput(false)
    }
  }

  const removeTag = (tagToRemove) => {
    const nextTags = tags.filter((t) => t !== tagToRemove)
    setTags(nextTags)
    performSave({ tags: nextTags })
  }

  // Calculate UI opacity for Zen Mode & Auto-dimming
  // Dim to opacity-10 if isZenMode OR (isTyping and not hovered near top)
  const shouldDimControls = (isZenMode || isTyping) && !isHeaderHovered

  return (
    <div
      onMouseMove={() => {
        // If mouse moves, momentarily soften dimming
        if (isTyping) {
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
          typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false)
          }, 3200)
        }
      }}
      className="min-h-screen relative flex flex-col justify-between"
    >
      {/* Dimming Top Navigation & Toolbar */}
      <motion.div
        onMouseEnter={() => setIsHeaderHovered(true)}
        onMouseLeave={() => setIsHeaderHovered(false)}
        animate={{
          opacity: shouldDimControls ? 0.08 : 1,
        }}
        transition={{ duration: 0.45, ease: 'easeInOut' }}
        className={`sticky top-0 z-30 backdrop-blur-md border-b transition-all duration-300
          ${
            shouldDimControls
              ? 'pointer-events-none'
              : 'pointer-events-auto bg-[#121316]/80 border-white/5 light:bg-[#FBF9F5]/90 light:border-black/5'
          }`}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          {/* Back button */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                performSave()
                onBack()
              }}
              className="inline-flex items-center gap-1.5 text-xs font-mono text-[#8E9299] hover:text-[#E6E4DD] light:text-[#6C707E] light:hover:text-[#2B2D42] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to {section.title}</span>
            </button>

            <span className="text-xs text-[#8E9299]/30">•</span>

            {/* Auto-save status */}
            <div className="flex items-center gap-1.5 text-xs font-mono text-sage-400 light:text-sage-600">
              <span className="w-1.5 h-1.5 rounded-full bg-sage-400 light:bg-sage-600 animate-pulse" />
              <span>{saveStatus}</span>
            </div>
          </div>

          {/* Right utility buttons */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#8E9299] light:text-[#6C707E] font-mono mr-1">
              {readingTime}
            </span>

            {/* Favorite toggle */}
            {entry?.id && (
              <button
                type="button"
                onClick={() => onToggleFavorite(entry.id)}
                title={entry.isFavorite ? 'Unstar reflection' : 'Star reflection'}
                className="p-1.5 rounded-lg text-[#8E9299] hover:text-amber-warm transition-colors"
              >
                <Star
                  className={`w-4 h-4 ${
                    entry.isFavorite ? 'fill-amber-warm text-amber-warm' : ''
                  }`}
                />
              </button>
            )}

            {/* Delete button */}
            {entry?.id && (
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(true)}
                title="Delete reflection"
                className="p-1.5 rounded-lg text-[#8E9299] hover:text-terracotta-soft transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            {/* Manual Zen Mode Toggle */}
            <button
              onClick={() => setIsZenMode(!isZenMode)}
              title={isZenMode ? 'Exit Zen Mode' : 'Enter Zen Mode'}
              className={`p-1.5 rounded-lg transition-colors ${
                isZenMode
                  ? 'bg-sage-400/20 text-sage-300 light:text-sage-700'
                  : 'text-[#8E9299] hover:text-[#E6E4DD] light:text-[#6C707E] light:hover:text-[#2B2D42]'
              }`}
            >
              {isZenMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <ThemeToggle />
          </div>
        </div>
      </motion.div>

      {/* Main Free-Mind Writing Column */}
      <main className="flex-1 w-full max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {/* Dimming Metadata Controls (Category, Sub-Topic, Date, Complexity) */}
        <motion.div
          onMouseEnter={() => setIsHeaderHovered(true)}
          onMouseLeave={() => setIsHeaderHovered(false)}
          animate={{
            opacity: shouldDimControls ? 0.08 : 1,
          }}
          transition={{ duration: 0.45, ease: 'easeInOut' }}
          className={`space-y-4 mb-8 pb-6 border-b border-white/5 light:border-black/5 ${
            shouldDimControls ? 'pointer-events-none' : 'pointer-events-auto'
          }`}
        >
          {/* Date stamp & Category Pill Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Auto-filled Date */}
            <div className="flex items-center gap-1.5 text-[#8E9299] light:text-[#6C707E] font-mono">
              <Calendar className="w-3.5 h-3.5 text-sage-400 light:text-sage-600" />
              <input
                type="date"
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                className="bg-transparent border-none text-[#E6E4DD] light:text-[#2B2D42] focus:outline-none cursor-pointer"
              />
            </div>

            {/* Primary Category Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-[#8E9299] light:text-[#6C707E]">Category:</span>
              <div className="flex items-center gap-1">
                {(section?.categories || ['DSA', 'Systems']).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setCategory(cat)
                      const firstSub = section?.subTopicsMap?.[cat]?.[0] || 'General'
                      setSubTopic(firstSub)
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      category === cat
                        ? 'bg-sage-400/20 text-sage-300 light:text-sage-700 border border-sage-400/30 font-semibold'
                        : 'bg-white/5 light:bg-black/5 text-[#8E9299] light:text-[#6C707E] hover:text-[#E6E4DD] light:hover:text-[#2B2D42]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sub-Topic Tag Pills */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-[#8E9299] light:text-[#6C707E]">
              <span>Sub-Topic Tag:</span>
              <button
                onClick={() => setShowTagInput(!showTagInput)}
                className="text-[11px] text-sage-400 light:text-sage-600 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Custom Tag
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {availableSubTopics.map((st) => (
                <button
                  key={st}
                  onClick={() => setSubTopic(st)}
                  className={`px-2.5 py-1 rounded-lg text-xs transition-all ${
                    subTopic === st
                      ? 'bg-sage-400 text-[#121316] font-semibold shadow-xs'
                      : 'bg-white/5 light:bg-black/5 text-[#8E9299] light:text-[#6C707E] hover:text-[#E6E4DD] light:hover:text-[#2B2D42]'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Custom Tag Input drawer */}
            {showTagInput && (
              <form onSubmit={handleAddTag} className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Add custom topic (e.g. Disjoint Set Union)"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  className="px-2.5 py-1 text-xs rounded-lg border bg-[#1A1C20] border-white/10 text-[#E6E4DD] focus:outline-none focus:border-sage-400 light:bg-[#F3EFE6] light:border-black/10 light:text-[#2B2D42]"
                />
                <button
                  type="submit"
                  className="px-2.5 py-1 text-xs rounded-lg bg-sage-500 text-white hover:bg-sage-600 transition-colors"
                >
                  Add
                </button>
              </form>
            )}
          </div>

          {/* Optional Complexity and Takeaway Drawer (Collapsible) */}
          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 font-mono">
              <span className="text-[#8E9299] light:text-[#6C707E]">Time:</span>
              <input
                type="text"
                placeholder="O(N log N)"
                value={timeComplexity}
                onChange={(e) => {
                  setTimeComplexity(e.target.value)
                  handleTypingActivity()
                }}
                className="w-24 px-2 py-0.5 rounded bg-white/5 light:bg-black/5 border border-white/10 light:border-black/10 text-[#E6E4DD] light:text-[#2B2D42] text-xs font-mono focus:outline-none focus:border-sage-400"
              />
            </div>

            <div className="flex items-center gap-1.5 font-mono">
              <span className="text-[#8E9299] light:text-[#6C707E]">Space:</span>
              <input
                type="text"
                placeholder="O(1)"
                value={spaceComplexity}
                onChange={(e) => {
                  setSpaceComplexity(e.target.value)
                  handleTypingActivity()
                }}
                className="w-20 px-2 py-0.5 rounded bg-white/5 light:bg-black/5 border border-white/10 light:border-black/10 text-[#E6E4DD] light:text-[#2B2D42] text-xs font-mono focus:outline-none focus:border-sage-400"
              />
            </div>

            <div className="flex-1 min-w-[200px] flex items-center gap-1.5">
              <span className="text-[#8E9299] light:text-[#6C707E] font-serif italic whitespace-nowrap">
                Aha! Takeaway:
              </span>
              <input
                type="text"
                placeholder="Key insight or core invariant..."
                value={takeaway}
                onChange={(e) => {
                  setTakeaway(e.target.value)
                  handleTypingActivity()
                }}
                className="w-full px-2 py-0.5 rounded bg-white/5 light:bg-black/5 border border-white/10 light:border-black/10 text-[#E6E4DD] light:text-[#2B2D42] text-xs italic font-serif focus:outline-none focus:border-sage-400"
              />
            </div>
          </div>
        </motion.div>

        {/* Expressive Editorial Title Input */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Title of today's breakthrough..."
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              handleTypingActivity()
            }}
            className="w-full font-serif text-3xl sm:text-4xl font-medium tracking-tight bg-transparent border-none 
              text-[#E6E4DD] light:text-[#2B2D42] placeholder-[#8E9299]/40 focus:outline-none"
          />
        </div>

        {/* Live Rich-Text Canvas (TipTap with live markdown support) */}
        <div className="relative">
          <TipTapEditor
            content={content}
            onChange={(newHtml) => {
              setContent(newHtml)
              handleTypingActivity()
            }}
            onTypingStateChange={handleTypingActivity}
          />
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        title={title}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => {
          if (entry?.id) {
            onDeleteEntry(entry.id)
            onBack()
          }
        }}
      />

      {/* Subtle Zen bottom indicator */}
      {isZenMode && (
        <div className="fixed bottom-4 right-4 z-40">
          <button
            onClick={() => setIsZenMode(false)}
            className="px-3 py-1.5 rounded-xl text-xs font-mono bg-sage-500/80 text-white backdrop-blur-sm shadow-md hover:bg-sage-600 transition-all"
          >
            Exit Zen Mode
          </button>
        </div>
      )}
    </div>
  )
}
