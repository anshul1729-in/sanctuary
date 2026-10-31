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
  X,
  EyeOff,
} from 'lucide-react'
import { TipTapEditor } from '../components/TipTapEditor'
import { ThemeToggle } from '../components/ThemeToggle'
import { DeleteConfirmModal } from '../components/DeleteConfirmModal'

export const FreeMindCanvas = ({
  entry,
  section,
  onSaveEntry,
  onUpdateSection,
  onBack,
  onDeleteEntry,
  onToggleFavorite,
  storageMode = 'cloud',
}) => {
  // Domain detection
  const isCSDomain =
    section?.id === 'cs' ||
    Boolean(section?.title?.toLowerCase().includes('computer science'))

  // Domain categories
  const domainCategories =
    Array.isArray(section?.categories) && section.categories.length > 0
      ? section.categories
      : isCSDomain
      ? ['DSA', 'Systems', 'Networking', 'Operating Systems', 'Databases']
      : ['General']

  const [title, setTitle] = useState(entry?.title || '')
  const [content, setContent] = useState(entry?.content || '')

  // References for auto-expanding multiline title and body editor focus
  const titleTextareaRef = useRef(null)
  const editorInstanceRef = useRef(null)

  // Dynamically auto-expand the title textarea so long headings wrap and never clip on the right
  const adjustTitleHeight = useCallback(() => {
    const el = titleTextareaRef.current
    if (el) {
      el.style.height = 'auto'
      el.style.height = `${el.scrollHeight}px`
    }
  }, [])

  useEffect(() => {
    adjustTitleHeight()
  }, [title, adjustTitleHeight])

  useEffect(() => {
    window.addEventListener('resize', adjustTitleHeight)
    return () => window.removeEventListener('resize', adjustTitleHeight)
  }, [adjustTitleHeight])

  // Active Category state
  const [category, setCategory] = useState(() => {
    if (entry?.category && domainCategories.includes(entry.category)) {
      return entry.category
    }
    return domainCategories[0] || (isCSDomain ? 'DSA' : 'General')
  })

  // Domain subtopics map & available subtopics for active category
  const domainSubTopicsMap = section?.subTopicsMap || {}
  const availableSubTopics =
    domainSubTopicsMap[category] ||
    (isCSDomain && category === 'DSA'
      ? [
          'Graphs',
          'Dynamic Programming',
          'Trees',
          'Sliding Window',
          'Two Pointers',
          'Recursion',
          'Binary Search',
          'Heaps',
        ]
      : [])

  // Active Sub-Topic state
  const [subTopic, setSubTopic] = useState(() => {
    if (entry?.subTopic) return entry.subTopic
    return availableSubTopics[0] || ''
  })

  // Inline custom category & tag inputs
  const [showCategoryInput, setShowCategoryInput] = useState(false)
  const [newCategoryInput, setNewCategoryInput] = useState('')
  const [showSubTopicInput, setShowSubTopicInput] = useState(false)
  const [newSubTopicInput, setNewSubTopicInput] = useState('')

  // Session Time & Takeaway fields visibility
  const [startTime, setStartTime] = useState(
    entry?.complexity?.startTime || entry?.complexity?.start || ''
  )
  const [endTime, setEndTime] = useState(
    entry?.complexity?.endTime || entry?.complexity?.end || ''
  )

  const [showSessionTime, setShowSessionTime] = useState(() => {
    return Boolean(
      entry?.complexity?.startTime ||
      entry?.complexity?.endTime ||
      entry?.complexity?.start ||
      entry?.complexity?.end
    )
  })
  const [showTakeaway, setShowTakeaway] = useState(true)

  const [takeaway, setTakeaway] = useState(entry?.takeaway || '')

  // Helper to calculate focus duration
  const calculateDuration = (start, end) => {
    if (!start || !end) return ''
    const [sH, sM] = start.split(':').map(Number)
    const [eH, eM] = end.split(':').map(Number)
    if (isNaN(sH) || isNaN(sM) || isNaN(eH) || isNaN(eM)) return ''
    let diffMinutes = eH * 60 + eM - (sH * 60 + sM)
    if (diffMinutes < 0) diffMinutes += 24 * 60 // crossed midnight
    const hours = Math.floor(diffMinutes / 60)
    const mins = diffMinutes % 60
    if (hours > 0 && mins > 0) return `${hours}h ${mins}m`
    if (hours > 0) return `${hours}h`
    return `${mins}m`
  }

  // Quick helper to stamp current time
  const setCurrentTime = (field) => {
    const now = new Date()
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    const timeStr = `${hours}:${minutes}`
    if (field === 'start') {
      setStartTime(timeStr)
      performSave({ startTime: timeStr })
    } else {
      setEndTime(timeStr)
      performSave({ endTime: timeStr })
    }
  }

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
  const isCloud = storageMode === 'cloud'
  const defaultSavedText = isCloud ? 'Saved in cloud' : 'Saved in sanctuary'
  const [saveStatus, setSaveStatus] = useState(defaultSavedText)
  const saveTimeoutRef = useRef(null)

  // Delete modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

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

      const currentStart =
        overrides.startTime !== undefined ? overrides.startTime : startTime
      const currentEnd =
        overrides.endTime !== undefined ? overrides.endTime : endTime
      const duration = calculateDuration(currentStart, currentEnd)
      const timeFormatted =
        currentStart && currentEnd
          ? `${currentStart} - ${currentEnd}`
          : currentStart
          ? `Started ${currentStart}`
          : ''

      const dataToSave = {
        id: entry?.id,
        sectionId: section.id,
        title: overrides.title !== undefined ? overrides.title : title,
        content: overrides.content !== undefined ? overrides.content : content,
        category: overrides.category !== undefined ? overrides.category : category,
        subTopic: overrides.subTopic !== undefined ? overrides.subTopic : subTopic,
        tags: overrides.tags !== undefined ? overrides.tags : [subTopic].filter(Boolean),
        date: dateStr,
        takeaway: overrides.takeaway !== undefined ? overrides.takeaway : takeaway,
        complexity: {
          startTime: currentStart,
          endTime: currentEnd,
          duration,
          time: timeFormatted,
        },
      }

      onSaveEntry(dataToSave)

      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
      saveTimeoutRef.current = setTimeout(() => {
        setSaveStatus(defaultSavedText)
      }, 600)
    },
    [
      entry,
      section,
      title,
      content,
      category,
      subTopic,
      dateStr,
      takeaway,
      startTime,
      endTime,
      onSaveEntry,
      defaultSavedText,
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
    dateStr,
    takeaway,
    startTime,
    endTime,
    performSave,
  ])

  // Guaranteed auto-save on component unmount (e.g. browser back button)
  const performSaveRef = useRef(performSave)
  performSaveRef.current = performSave
  useEffect(() => {
    return () => {
      performSaveRef.current()
    }
  }, [])

  // Category addition & removal
  const handleAddCategory = (e) => {
    e.preventDefault()
    const trimmed = newCategoryInput.trim()
    if (!trimmed) return

    if (!domainCategories.includes(trimmed)) {
      const nextCategories = [...domainCategories, trimmed]
      const updatedSection = {
        ...section,
        categories: nextCategories,
      }
      if (onUpdateSection) {
        onUpdateSection(updatedSection)
      }
      setCategory(trimmed)
      setSubTopic('')
      performSave({ category: trimmed, subTopic: '' })
    }
    setNewCategoryInput('')
    setShowCategoryInput(false)
  }

  const handleRemoveCategory = (catToRemove, e) => {
    e.stopPropagation()
    const nextCategories = domainCategories.filter((c) => c !== catToRemove)
    const finalCategories = nextCategories.length > 0 ? nextCategories : ['General']

    const nextSubTopicsMap = { ...(section?.subTopicsMap || {}) }
    delete nextSubTopicsMap[catToRemove]

    const updatedSection = {
      ...section,
      categories: finalCategories,
      subTopicsMap: nextSubTopicsMap,
    }
    if (onUpdateSection) {
      onUpdateSection(updatedSection)
    }

    if (category === catToRemove) {
      const fallbackCat = finalCategories[0]
      setCategory(fallbackCat)
      const fallbackSubs = nextSubTopicsMap[fallbackCat] || []
      const fallbackSub = fallbackSubs[0] || ''
      setSubTopic(fallbackSub)
      performSave({ category: fallbackCat, subTopic: fallbackSub })
    }
  }

  // Sub-Topic addition & removal
  const handleAddSubTopic = (e) => {
    e.preventDefault()
    const trimmed = newSubTopicInput.trim().replace(/^#/, '')
    if (!trimmed) return

    if (!availableSubTopics.includes(trimmed)) {
      const nextSubs = [...availableSubTopics, trimmed]
      const nextSubTopicsMap = {
        ...(section?.subTopicsMap || {}),
        [category]: nextSubs,
      }
      const updatedSection = {
        ...section,
        subTopicsMap: nextSubTopicsMap,
      }
      if (onUpdateSection) {
        onUpdateSection(updatedSection)
      }
      setSubTopic(trimmed)
      performSave({ subTopic: trimmed })
    }
    setNewSubTopicInput('')
    setShowSubTopicInput(false)
  }

  const handleRemoveSubTopic = (stToRemove, e) => {
    e.stopPropagation()
    const nextSubs = availableSubTopics.filter((s) => s !== stToRemove)
    const nextSubTopicsMap = {
      ...(section?.subTopicsMap || {}),
      [category]: nextSubs,
    }
    const updatedSection = {
      ...section,
      subTopicsMap: nextSubTopicsMap,
    }
    if (onUpdateSection) {
      onUpdateSection(updatedSection)
    }

    if (subTopic === stToRemove) {
      const fallbackSub = nextSubs[0] || ''
      setSubTopic(fallbackSub)
      performSave({ subTopic: fallbackSub })
    }
  }

  // Calculate UI opacity for Zen Mode & Auto-dimming
  const shouldDimControls = (isZenMode || isTyping) && !isHeaderHovered

  return (
    <div
      onMouseMove={() => {
        if (isTyping) {
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
          typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false)
          }, 3200)
        }
      }}
      className="min-h-screen relative flex flex-col justify-between"
    >
      {/* Dimming Top Navigation & Toolbar - Frosted Floating Glass Bar */}
      <motion.div
        onMouseEnter={() => setIsHeaderHovered(true)}
        onMouseLeave={() => setIsHeaderHovered(false)}
        animate={{
          opacity: shouldDimControls ? 0.08 : 1,
        }}
        transition={{ duration: 0.45, ease: 'easeInOut' }}
        className={`sticky top-0 z-30 transition-all duration-300
          ${
            shouldDimControls
              ? 'pointer-events-none'
              : 'pointer-events-auto glass-header'
          }`}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          {/* Back button */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                performSave()
                onBack()
              }}
              className="inline-flex items-center gap-1.5 text-xs font-mono text-[#9CA3AF] hover:text-[#F3F4F6] light:text-[#6C707E] light:hover:text-[#2B2D42] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to {section.title}</span>
            </button>

            <span className="text-xs text-[#9CA3AF]/30">•</span>

            {/* Auto-save status */}
            <div className="flex items-center gap-1.5 text-xs font-mono text-sage-400 light:text-sage-600">
              <span className="w-1.5 h-1.5 rounded-full bg-sage-400 light:bg-sage-600 animate-pulse" />
              <span>{saveStatus}</span>
            </div>
          </div>

          {/* Right utility buttons */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#9CA3AF] light:text-[#6C707E] font-mono mr-1">
              {readingTime}
            </span>

            {/* Favorite toggle */}
            {entry?.id && (
              <button
                type="button"
                onClick={() => onToggleFavorite(entry.id)}
                title={entry.isFavorite ? 'Unstar reflection' : 'Star reflection'}
                className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-amber-warm transition-colors cursor-pointer"
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
                className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-terracotta-soft transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            {/* Manual Zen Mode Toggle */}
            <button
              onClick={() => setIsZenMode(!isZenMode)}
              title={isZenMode ? 'Exit Zen Mode' : 'Enter Zen Mode'}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isZenMode
                  ? 'bg-sage-400/20 text-sage-300 light:text-sage-700'
                  : 'text-[#9CA3AF] hover:text-[#F3F4F6] light:text-[#6C707E] light:hover:text-[#2B2D42]'
              }`}
            >
              {isZenMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <ThemeToggle />
          </div>
        </div>
      </motion.div>

      {/* Main Free-Mind Writing Column */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Dimming Metadata Controls (Category, Sub-Topic, Date, Complexity) */}
        <motion.div
          onMouseEnter={() => setIsHeaderHovered(true)}
          onMouseLeave={() => setIsHeaderHovered(false)}
          animate={{
            opacity: shouldDimControls ? 0.08 : 1,
          }}
          transition={{ duration: 0.45, ease: 'easeInOut' }}
          className={`space-y-4 mb-6 pb-4 border-b border-white/5 light:border-black/5 ${
            shouldDimControls ? 'pointer-events-none' : 'pointer-events-auto'
          }`}
        >
          {/* Date stamp & Category Pill Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Auto-filled Date */}
            <div className="flex items-center gap-1.5 text-[#9CA3AF] light:text-[#6C707E] font-mono">
              <Calendar className="w-3.5 h-3.5 text-sage-400 light:text-sage-600" />
              <input
                type="date"
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                className="bg-transparent border-none text-[#F3F4F6] light:text-[#2B2D42] focus:outline-none cursor-pointer"
              />
            </div>

            {/* Primary Category Selector with Double-Click to Remove */}
            <div className="flex items-center flex-wrap gap-1.5">
              <span className="text-[#9CA3AF] light:text-[#6C707E]">Category:</span>
              <div className="flex items-center flex-wrap gap-1">
                <AnimatePresence>
                  {domainCategories.map((cat) => {
                    const isSelected = category === cat
                    return (
                      <motion.button
                        key={cat}
                        layout
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.7, transition: { duration: 0.15 } }}
                        onClick={() => {
                          setCategory(cat)
                          const nextSubs = (section?.subTopicsMap?.[cat]) || []
                          setSubTopic(nextSubs[0] || '')
                        }}
                        onDoubleClick={(e) => handleRemoveCategory(cat, e)}
                        title="Click to select • Double-click to remove from domain"
                        className={`group relative px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-sage-400/20 text-sage-300 light:text-sage-700 border border-sage-400/30 font-semibold shadow-xs'
                            : 'bg-white/5 light:bg-black/5 text-[#9CA3AF] light:text-[#6C707E] hover:text-[#F3F4F6] light:hover:text-[#2B2D42]'
                        }`}
                      >
                        <span>{cat}</span>
                      </motion.button>
                    )
                  })}
                </AnimatePresence>

                {/* Inline + Category Toggle */}
                {!showCategoryInput ? (
                  <button
                    type="button"
                    onClick={() => setShowCategoryInput(true)}
                    title="Add custom category to this domain"
                    className="px-2 py-0.5 rounded-md text-[11px] text-sage-400 light:text-sage-600 hover:bg-sage-400/10 transition-colors flex items-center gap-0.5 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Category</span>
                  </button>
                ) : (
                  <form onSubmit={handleAddCategory} className="inline-flex items-center gap-1">
                    <input
                      type="text"
                      autoFocus
                      placeholder="New category..."
                      value={newCategoryInput}
                      onChange={(e) => setNewCategoryInput(e.target.value)}
                      className="w-28 px-2 py-0.5 text-xs rounded bg-[#090A0C] border border-sage-400/50 text-[#F3F4F6] focus:outline-none light:bg-[#FBF9F5] light:text-[#2B2D42]"
                    />
                    <button
                      type="submit"
                      className="px-1.5 py-0.5 text-[11px] rounded bg-sage-500 text-white hover:bg-sage-600 cursor-pointer"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCategoryInput(false)}
                      className="p-0.5 text-[#9CA3AF] hover:text-[#F3F4F6] cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Sub-Topic Tag Pills with Double-Click to Remove */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-[#9CA3AF] light:text-[#6C707E]">
              <span>Sub-Topic Tag:</span>
              {!showSubTopicInput && (
                <button
                  type="button"
                  onClick={() => setShowSubTopicInput(true)}
                  className="text-[11px] text-sage-400 light:text-sage-600 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> Custom Tag
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <AnimatePresence>
                {availableSubTopics.map((st) => {
                  const isSelected = subTopic === st
                  return (
                    <motion.button
                      key={st}
                      layout
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.7, transition: { duration: 0.15 } }}
                      onClick={() => setSubTopic(st)}
                      onDoubleClick={(e) => handleRemoveSubTopic(st, e)}
                      title="Click to select • Double-click to remove from domain"
                      className={`px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-sage-400 text-[#000000] font-semibold shadow-xs'
                          : 'bg-white/5 light:bg-black/5 text-[#9CA3AF] light:text-[#6C707E] hover:text-[#F3F4F6] light:hover:text-[#2B2D42]'
                      }`}
                    >
                      <span>{st}</span>
                    </motion.button>
                  )
                })}
              </AnimatePresence>

              {availableSubTopics.length === 0 && !showSubTopicInput && (
                <span className="text-[11px] text-[#9CA3AF]/70 italic">
                  No sub-topics yet for {category}. Click "+ Custom Tag" to add one.
                </span>
              )}

              {/* Inline Custom Sub-Topic Tag Input */}
              {showSubTopicInput && (
                <form onSubmit={handleAddSubTopic} className="inline-flex items-center gap-1.5">
                  <input
                    type="text"
                    autoFocus
                    placeholder="e.g. Synthesis, Kinetics"
                    value={newSubTopicInput}
                    onChange={(e) => setNewSubTopicInput(e.target.value)}
                    className="px-2.5 py-1 text-xs rounded-lg border bg-[#0B0C0F] border-sage-400/50 text-[#F3F4F6] focus:outline-none light:bg-[#F3EFE6] light:border-black/10 light:text-[#2B2D42]"
                  />
                  <button
                    type="submit"
                    className="px-2 py-1 text-xs rounded-lg bg-sage-500 text-white hover:bg-sage-600 transition-colors cursor-pointer"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSubTopicInput(false)}
                    className="p-1 text-[#9CA3AF] hover:text-[#F3F4F6] cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Session Time & Takeaway Row */}
          <div className="pt-1 flex flex-wrap items-center gap-3 text-xs">
            {/* Session Time (Start Time & End Time, Collapsible / Double-click to hide) */}
            <AnimatePresence>
              {showSessionTime ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
                  className="flex items-center flex-wrap gap-2.5 p-1.5 px-2.5 rounded-xl border border-white/5 bg-white/5 light:border-black/5 light:bg-black/5 backdrop-blur-sm"
                >
                  <div className="flex items-center gap-1.5 text-xs">
                    <Clock className="w-3.5 h-3.5 text-amber-warm" />
                    <span
                      onDoubleClick={() => setShowSessionTime(false)}
                      title="Double-click label to hide Session Time"
                      className="text-[#9CA3AF] light:text-[#6C707E] cursor-pointer hover:text-amber-warm transition-colors select-none font-medium"
                    >
                      Session:
                    </span>
                  </div>

                  {/* Start Time */}
                  <div className="flex items-center gap-1 text-xs font-mono">
                    <span className="text-[#9CA3AF] light:text-[#6C707E] text-[11px]">Start:</span>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => {
                        setStartTime(e.target.value)
                        handleTypingActivity()
                      }}
                      className="px-1.5 py-0.5 rounded bg-black/40 light:bg-white/60 border border-white/10 light:border-black/10 text-[#F3F4F6] light:text-[#2B2D42] text-xs font-mono focus:outline-none focus:border-sage-400"
                    />
                    {!startTime && (
                      <button
                        type="button"
                        onClick={() => setCurrentTime('start')}
                        className="text-[10px] text-sage-400 hover:text-sage-300 underline cursor-pointer"
                        title="Set to current time"
                      >
                        Now
                      </button>
                    )}
                  </div>

                  {/* End Time */}
                  <div className="flex items-center gap-1 text-xs font-mono">
                    <span className="text-[#9CA3AF] light:text-[#6C707E] text-[11px]">End:</span>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => {
                        setEndTime(e.target.value)
                        handleTypingActivity()
                      }}
                      className="px-1.5 py-0.5 rounded bg-black/40 light:bg-white/60 border border-white/10 light:border-black/10 text-[#F3F4F6] light:text-[#2B2D42] text-xs font-mono focus:outline-none focus:border-sage-400"
                    />
                    {!endTime && (
                      <button
                        type="button"
                        onClick={() => setCurrentTime('end')}
                        className="text-[10px] text-sage-400 hover:text-sage-300 underline cursor-pointer"
                        title="Set to current time"
                      >
                        Now
                      </button>
                    )}
                  </div>

                  {/* Focus duration badge */}
                  {calculateDuration(startTime, endTime) && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sage-400/20 text-sage-300 light:text-sage-700 font-semibold">
                      {calculateDuration(startTime, endTime)} focus
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowSessionTime(false)}
                    title="Hide Session Time (Double-click label to hide)"
                    className="p-0.5 text-[#9CA3AF] hover:text-[#F3F4F6] rounded transition-colors cursor-pointer"
                  >
                    <EyeOff className="w-3 h-3" />
                  </button>
                </motion.div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowSessionTime(true)}
                  title="Show Session Time (Start & End Time)"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono text-[#9CA3AF] hover:text-sage-400 bg-white/5 hover:bg-white/10 transition-colors border border-white/5 cursor-pointer backdrop-blur-sm"
                >
                  <Clock className="w-3 h-3 text-amber-warm" />
                  <span>+ Session Time</span>
                </button>
              )}
            </AnimatePresence>

            {/* Aha! Takeaway Input */}
            <AnimatePresence>
              {showTakeaway ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
                  className="flex-1 min-w-[220px] flex items-center gap-1.5"
                >
                  <span
                    onDoubleClick={() => setShowTakeaway(false)}
                    title="Double-click label to hide Takeaway field"
                    className="text-[#9CA3AF] light:text-[#6C707E] font-serif italic whitespace-nowrap cursor-pointer hover:text-sage-400 transition-colors select-none"
                  >
                    Aha! Takeaway:
                  </span>
                  <input
                    type="text"
                    placeholder="Key insight or core invariant..."
                    value={takeaway}
                    title={takeaway ? `Aha! Takeaway: ${takeaway}` : undefined}
                    onChange={(e) => {
                      setTakeaway(e.target.value)
                      handleTypingActivity()
                    }}
                    className="w-full px-2.5 py-1 rounded-lg bg-black/40 light:bg-black/5 border border-white/10 light:border-black/10 text-[#F3F4F6] light:text-[#2B2D42] text-xs italic font-serif focus:outline-none focus:border-sage-400 backdrop-blur-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowTakeaway(false)}
                    title="Hide Takeaway field"
                    className="p-0.5 text-[#9CA3AF] hover:text-[#F3F4F6] rounded transition-colors cursor-pointer"
                  >
                    <EyeOff className="w-3 h-3" />
                  </button>
                </motion.div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowTakeaway(true)}
                  title="Show Aha! Takeaway field"
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-serif italic text-[#9CA3AF] hover:text-sage-400 bg-white/5 hover:bg-white/10 transition-colors border border-white/5 cursor-pointer backdrop-blur-sm"
                >
                  <Plus className="w-3 h-3" />
                  <span>Takeaway</span>
                </button>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* The 3rd Surface: Floating Glass Slate for Notes */}
        <div className="glass-slate rounded-3xl p-6 sm:p-10 transition-all duration-300 relative shadow-2xl">
          {/* Subtle Specular Top Sheen Highlight */}
          <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/25 to-transparent rounded-t-3xl pointer-events-none" />

          {/* Expressive Editorial Title Input - Auto-expanding textarea on the glass sheet */}
          <div className="mb-6">
            <textarea
              ref={titleTextareaRef}
              rows={1}
              placeholder="Title of today's breakthrough..."
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                handleTypingActivity()
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  // Smoothly focus the TipTap editor canvas below
                  if (editorInstanceRef.current) {
                    editorInstanceRef.current.commands.focus('start')
                  }
                }
              }}
              className="w-full font-serif text-3xl sm:text-4xl font-medium tracking-tight bg-transparent border-none 
                text-[#F9F9FB] light:text-[#2B2D42] placeholder-[#9CA3AF]/40 focus:outline-none resize-none overflow-hidden leading-tight break-words drop-shadow-sm"
            />
          </div>

          {/* Live Rich-Text Canvas on the Glass Surface */}
          <div className="relative">
            <TipTapEditor
              editorRef={editorInstanceRef}
              content={content}
              onChange={(newHtml) => {
                setContent(newHtml)
                handleTypingActivity()
              }}
              onTypingStateChange={handleTypingActivity}
            />
          </div>
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
            className="px-3 py-1.5 rounded-xl text-xs font-mono bg-sage-500/80 text-white backdrop-blur-md shadow-lg hover:bg-sage-600 transition-all cursor-pointer"
          >
            Exit Zen Mode
          </button>
        </div>
      )}
    </div>
  )
}
