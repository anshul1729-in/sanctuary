import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Calendar,
  Clock,
  Sparkles,
  Star,
  Trash2,
  Tag,
  ArrowRight,
  Filter,
  Flame,
} from 'lucide-react'

export const JournalStream = ({
  entries,
  section,
  onOpenEntry,
  onNewEntry,
  onDeleteEntry,
  onToggleFavorite,
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedSubTopic, setSelectedSubTopic] = useState('All')

  // Get all unique categories and subtopics from section & entries
  const categories = useMemo(() => {
    const set = new Set(['All'])
    ;(section.categories || []).forEach((c) => set.add(c))
    entries.forEach((e) => {
      if (e.category) set.add(e.category)
    })
    return Array.from(set)
  }, [section, entries])

  const subTopics = useMemo(() => {
    const set = new Set(['All'])
    entries.forEach((e) => {
      if (selectedCategory === 'All' || e.category === selectedCategory) {
        if (e.subTopic) set.add(e.subTopic)
      }
    })
    return Array.from(set)
  }, [entries, selectedCategory])

  // Filter entries
  const filteredEntries = useMemo(() => {
    return entries.filter((e) => {
      // Category filter
      if (selectedCategory !== 'All' && e.category !== selectedCategory) {
        return false
      }
      // SubTopic filter
      if (selectedSubTopic !== 'All' && e.subTopic !== selectedSubTopic) {
        return false
      }
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const inTitle = (e.title || '').toLowerCase().includes(q)
        const inPreview = (e.preview || '').toLowerCase().includes(q)
        const inSubTopic = (e.subTopic || '').toLowerCase().includes(q)
        const inTags = (e.tags || []).some((t) => t.toLowerCase().includes(q))
        return inTitle || inPreview || inSubTopic || inTags
      }
      return true
    })
  }, [entries, selectedCategory, selectedSubTopic, searchQuery])

  // Peaceful date formatter
  const formatCardDate = (dateStr) => {
    if (!dateStr) return 'Past reflection'
    const d = new Date(dateStr)
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

    const baseFormat = d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })

    if (dateStr === today) return `${baseFormat} • Today`
    if (dateStr === yesterday) return `${baseFormat} • Yesterday`
    return baseFormat
  }

  return (
    <div className="space-y-6">
      {/* Search and Category Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-2 rounded-2xl border
        bg-[#1A1C20]/60 border-white/5 backdrop-blur-sm
        light:bg-[#F3EFE6]/70 light:border-black/5">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8E9299] light:text-[#6C707E]" />
          <input
            type="text"
            placeholder="Search reflections, algorithms, complexity..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border-none bg-transparent 
              text-[#E6E4DD] placeholder-[#8E9299]/60 focus:outline-none focus:ring-1 focus:ring-sage-400
              light:text-[#2B2D42] light:placeholder-[#6C707E]/60"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 px-2 sm:px-0">
          {categories.slice(0, 5).map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat)
                setSelectedSubTopic('All')
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-sage-400/20 text-sage-300 light:text-sage-700 border border-sage-400/30'
                  : 'text-[#8E9299] hover:text-[#E6E4DD] light:text-[#6C707E] light:hover:text-[#2B2D42] hover:bg-white/5 light:hover:bg-black/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Sub-Topic Quick Filter Chips (if available) */}
      {subTopics.length > 2 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[#8E9299] light:text-[#6C707E] px-1 flex items-center gap-1">
            <Tag className="w-3 h-3" /> Sub-topics:
          </span>
          {subTopics.map((st) => (
            <button
              key={st}
              onClick={() => setSelectedSubTopic(st)}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                selectedSubTopic === st
                  ? 'bg-[#121316] text-[#E6E4DD] border border-white/20 light:bg-[#FBF9F5] light:text-[#2B2D42] light:border-black/20 font-medium'
                  : 'text-[#8E9299] light:text-[#6C707E] hover:text-[#E6E4DD] light:hover:text-[#2B2D42]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      )}

      {/* Chronological List of Entries */}
      {filteredEntries.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-white/10 light:border-black/10 bg-[#1A1C20]/20 light:bg-[#F3EFE6]/30">
          <Sparkles className="w-8 h-8 mx-auto text-sage-400 light:text-sage-600 mb-3 opacity-80" />
          <h3 className="font-serif text-xl font-medium text-[#E6E4DD] light:text-[#2B2D42]">
            {searchQuery || selectedCategory !== 'All'
              ? 'No matching reflections found'
              : 'Your canvas is tranquil and waiting'}
          </h3>
          <p className="mt-1 text-sm text-[#8E9299] light:text-[#6C707E] max-w-sm mx-auto">
            {searchQuery || selectedCategory !== 'All'
              ? 'Try adjusting your search query or topic filter.'
              : 'Record today’s algorithmic breakthrough or conceptual insight.'}
          </p>
          <button
            onClick={onNewEntry}
            className="mt-5 px-4 py-2 rounded-xl text-sm font-medium bg-sage-500 hover:bg-sage-600 text-white shadow-sm transition-all"
          >
            + Write Today's Learning
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {filteredEntries.map((entry, index) => (
              <motion.article
                key={entry.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
                onClick={() => onOpenEntry(entry.id)}
                className="group relative p-5 sm:p-6 rounded-2xl border cursor-pointer transition-all duration-300
                  bg-[#1A1C20] border-white/5 hover:border-sage-400/40 shadow-sm hover:shadow-soft-dark
                  light:bg-[#F3EFE6] light:border-black/5 light:hover:border-sage-600/40 light:hover:shadow-soft-light"
              >
                {/* Header row: Date, Category Pills, Reading Time */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-sage-400 light:text-sage-600 font-medium">
                      {formatCardDate(entry.date)}
                    </span>
                    <span className="text-[#8E9299]/40 light:text-[#6C707E]/40">•</span>
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-white/5 light:bg-black/5 text-[#8E9299] light:text-[#6C707E]">
                        {entry.category}
                      </span>
                      {entry.subTopic && (
                        <>
                          <span className="text-[10px] text-[#8E9299]/50">→</span>
                          <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-sage-400/10 text-sage-300 light:text-sage-700">
                            {entry.subTopic}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Complexity Tag Badge if present */}
                    {entry.complexity?.time && (
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-warm/10 text-amber-warm border border-amber-warm/20">
                        {entry.complexity.time}
                      </span>
                    )}

                    <div className="flex items-center gap-1 text-xs text-[#8E9299] light:text-[#6C707E]">
                      <Clock className="w-3 h-3" />
                      <span>{entry.readingTime || '2 min read'}</span>
                    </div>

                    {/* Quick Card Action Buttons */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        onToggleFavorite(entry.id)
                      }}
                      title={entry.isFavorite ? 'Unstar' : 'Star reflection'}
                      className="p-1 rounded-lg text-[#8E9299] hover:text-amber-warm transition-colors"
                    >
                      <Star
                        className={`w-3.5 h-3.5 ${
                          entry.isFavorite ? 'fill-amber-warm text-amber-warm' : ''
                        }`}
                      />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteEntry(entry)
                      }}
                      title="Delete entry"
                      className="p-1 rounded-lg text-[#8E9299] hover:text-terracotta-soft transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Entry Title */}
                <h3 className="font-serif text-xl sm:text-2xl font-medium tracking-tight text-[#E6E4DD] light:text-[#2B2D42] group-hover:text-sage-400 light:group-hover:text-sage-600 transition-colors">
                  {entry.title || 'Untitled Learning Reflection'}
                </h3>

                {/* Calm 2-line Content Preview */}
                <p className="mt-2 text-sm text-[#8E9299] light:text-[#6C707E] line-clamp-2 leading-relaxed">
                  {entry.preview ||
                    'Click to inspect this reflection and unpack the detailed technical notes.'}
                </p>

                {/* Optional Key Takeaway Quote snippet */}
                {entry.takeaway && (
                  <div className="mt-3 pl-3 py-1 border-l-2 border-sage-400/50 light:border-sage-600/50 text-xs italic font-serif text-[#A4C1B8] light:text-[#3D5C54] line-clamp-1">
                    "{entry.takeaway}"
                  </div>
                )}

                {/* Bottom Read More affordance */}
                <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-white/5 light:border-black/5 opacity-80 group-hover:opacity-100 transition-opacity">
                  <div className="flex flex-wrap gap-1">
                    {(entry.tags || []).slice(0, 3).map((t) => (
                      <span key={t} className="text-[10px] text-[#8E9299] light:text-[#6C707E]">
                        #{t}
                      </span>
                    ))}
                  </div>

                  <span className="flex items-center gap-1 font-medium text-sage-400 light:text-sage-600 group-hover:translate-x-1 transition-transform">
                    <span>Open in canvas</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
