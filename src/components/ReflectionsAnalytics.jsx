import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar,
  Sparkles,
  Flame,
  Award,
  BookOpen,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Tag,
  Quote,
  ChevronRight,
  ChevronDown,
} from 'lucide-react'
import { calculateStreak, getHeatmapData } from '../lib/storage'

export const ReflectionsAnalytics = ({ entries, section, onOpenEntry }) => {
  const [selectedTopicFilter, setSelectedTopicFilter] = useState('All')
  const [expandedCategory, setExpandedCategory] = useState(
    section.categories && section.categories.length > 0 ? section.categories[0] : 'DSA'
  )

  const streak = calculateStreak(entries)
  const heatmapCells = useMemo(() => getHeatmapData(entries, 16), [entries])

  // Category counts and sub-topic breakdown
  const categoryBreakdown = useMemo(() => {
    const counts = {}
    const subCounts = {}

    entries.forEach((e) => {
      const cat = e.category || 'General'
      counts[cat] = (counts[cat] || 0) + 1

      if (!subCounts[cat]) subCounts[cat] = {}
      const sub = e.subTopic || 'Uncategorized'
      subCounts[cat][sub] = (subCounts[cat][sub] || 0) + 1
    })

    return { counts, subCounts }
  }, [entries])

  // All topics available for the Milestone River filter
  const allRiverFilterTopics = useMemo(() => {
    const list = new Set(['All'])
    entries.forEach((e) => {
      if (e.category) list.add(e.category)
      if (e.subTopic) list.add(e.subTopic)
    })
    return Array.from(list)
  }, [entries])

  // Filtered milestone entries
  const milestoneEntries = useMemo(() => {
    if (selectedTopicFilter === 'All') return entries
    return entries.filter(
      (e) => e.category === selectedTopicFilter || e.subTopic === selectedTopicFilter
    )
  }, [entries, selectedTopicFilter])

  // Total words & read time calculation
  const totalStats = useMemo(() => {
    let totalMinutes = 0
    entries.forEach((e) => {
      const mins = parseInt(e.readingTime, 10) || 3
      totalMinutes += mins
    })
    return {
      totalHours: (totalMinutes / 60).toFixed(1),
      totalReflections: entries.length,
    }
  }, [entries])

  return (
    <div className="space-y-10">
      {/* 1. Tranquil Consistency Trophy Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 rounded-2xl border bg-[#1A1C20] border-white/5 light:bg-[#F3EFE6] light:border-black/5 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-mono text-[#8E9299] light:text-[#6C707E] mb-1">
            <Flame className="w-3.5 h-3.5 text-amber-warm" />
            <span>Current Streak</span>
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-medium text-[#E6E4DD] light:text-[#2B2D42]">
            {streak.currentStreak}{' '}
            <span className="text-xs font-sans font-normal text-[#8E9299] light:text-[#6C707E]">
              days
            </span>
          </div>
          <p className="text-[11px] text-[#8E9299] light:text-[#6C707E] mt-1">
            Best streak: {streak.longestStreak} days
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl border bg-[#1A1C20] border-white/5 light:bg-[#F3EFE6] light:border-black/5 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-mono text-[#8E9299] light:text-[#6C707E] mb-1">
            <Award className="w-3.5 h-3.5 text-sage-400 light:text-sage-600" />
            <span>Reflections</span>
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-medium text-[#E6E4DD] light:text-[#2B2D42]">
            {totalStats.totalReflections}{' '}
            <span className="text-xs font-sans font-normal text-[#8E9299] light:text-[#6C707E]">
              entries
            </span>
          </div>
          <p className="text-[11px] text-[#8E9299] light:text-[#6C707E] mt-1">
            {streak.activeDaysCount} active writing days
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl border bg-[#1A1C20] border-white/5 light:bg-[#F3EFE6] light:border-black/5 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-mono text-[#8E9299] light:text-[#6C707E] mb-1">
            <Clock className="w-3.5 h-3.5 text-terracotta-soft" />
            <span>Deep Time</span>
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-medium text-[#E6E4DD] light:text-[#2B2D42]">
            ~{totalStats.totalHours}{' '}
            <span className="text-xs font-sans font-normal text-[#8E9299] light:text-[#6C707E]">
              hours
            </span>
          </div>
          <p className="text-[11px] text-[#8E9299] light:text-[#6C707E] mt-1">
            Unbroken focus time
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl border bg-[#1A1C20] border-white/5 light:bg-[#F3EFE6] light:border-black/5 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-mono text-[#8E9299] light:text-[#6C707E] mb-1">
            <Sparkles className="w-3.5 h-3.5 text-sage-400 light:text-sage-600" />
            <span>Mastery Rhythm</span>
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-medium text-[#E6E4DD] light:text-[#2B2D42]">
            {Object.keys(categoryBreakdown.subCounts['DSA'] || {}).length}{' '}
            <span className="text-xs font-sans font-normal text-[#8E9299] light:text-[#6C707E]">
              sub-topics
            </span>
          </div>
          <p className="text-[11px] text-[#8E9299] light:text-[#6C707E] mt-1">
            Explored & synthesized
          </p>
        </div>
      </div>

      {/* 2. Consistency Rhythm (Activity Heatmap) */}
      <div className="p-6 rounded-2xl border bg-[#1A1C20] border-white/5 light:bg-[#F3EFE6] light:border-black/5 shadow-soft-dark light:shadow-soft-light">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="font-serif text-xl font-medium text-[#E6E4DD] light:text-[#2B2D42]">
              Consistency Rhythm
            </h3>
            <p className="text-xs text-[#8E9299] light:text-[#6C707E]">
              16-week tranquil habit trail. Every colored stone marks a day of active conceptual reflection.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-[#8E9299] light:text-[#6C707E]">
            <span>Less</span>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm bg-white/5 light:bg-black/5" />
              <span className="w-3 h-3 rounded-sm bg-sage-400/30" />
              <span className="w-3 h-3 rounded-sm bg-sage-400/60" />
              <span className="w-3 h-3 rounded-sm bg-sage-400" />
            </div>
            <span>More</span>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="overflow-x-auto pb-2">
          <div className="inline-grid grid-flow-col grid-rows-7 gap-1.5 min-w-[500px]">
            {heatmapCells.map((day, idx) => {
              let bgStyle = 'bg-white/5 light:bg-black/5 border-white/5 light:border-black/5'
              let glowStyle = ''

              if (day.count === 1) {
                bgStyle = 'bg-sage-400/40 text-white border-sage-400/30'
              } else if (day.count === 2) {
                bgStyle = 'bg-sage-400/70 text-white border-sage-400/50'
                glowStyle = 'shadow-[0_0_8px_rgba(132,165,157,0.3)]'
              } else if (day.count >= 3) {
                bgStyle = 'bg-sage-400 text-[#121316] font-semibold border-sage-300'
                glowStyle = 'shadow-[0_0_12px_rgba(132,165,157,0.5)]'
              }

              return (
                <div
                  key={day.date + '-' + idx}
                  title={`${day.date}: ${day.count} reflection${day.count === 1 ? '' : 's'}`}
                  className={`w-3.5 h-3.5 rounded-[4px] border transition-all duration-200 cursor-pointer hover:scale-125 ${bgStyle} ${glowStyle}`}
                />
              )
            })}
          </div>
        </div>
      </div>

      {/* 3. Topic Footprint (Hierarchical Breakdown) */}
      <div className="p-6 rounded-2xl border bg-[#1A1C20] border-white/5 light:bg-[#F3EFE6] light:border-black/5 shadow-soft-dark light:shadow-soft-light">
        <div className="mb-6">
          <h3 className="font-serif text-xl font-medium text-[#E6E4DD] light:text-[#2B2D42]">
            Topic Footprint
          </h3>
          <p className="text-xs text-[#8E9299] light:text-[#6C707E]">
            Hierarchical distribution of learning energy. Click any core category to inspect the exact sub-topics mastered.
          </p>
        </div>

        {/* Category Cards with progress bars */}
        <div className="space-y-4">
          {Object.entries(categoryBreakdown.counts).map(([category, count]) => {
            const isExpanded = expandedCategory === category
            const subtopics = categoryBreakdown.subCounts[category] || {}
            const percentage = Math.round((count / Math.max(1, entries.length)) * 100)

            return (
              <div
                key={category}
                className="p-4 rounded-xl border border-white/5 light:border-black/5 bg-[#121316]/50 light:bg-[#FBF9F5]/70 transition-all"
              >
                {/* Header Row */}
                <div
                  onClick={() => setExpandedCategory(isExpanded ? null : category)}
                  className="flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <button className="text-[#8E9299] group-hover:text-sage-400 transition-colors">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                    <div>
                      <span className="font-serif text-lg font-medium text-[#E6E4DD] light:text-[#2B2D42] group-hover:text-sage-400 light:group-hover:text-sage-600 transition-colors">
                        {category}
                      </span>
                      <span className="ml-2 text-xs text-[#8E9299] light:text-[#6C707E]">
                        ({count} {count === 1 ? 'log' : 'logs'})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-[#8E9299] light:text-[#6C707E]">
                      {percentage}% of focus
                    </span>
                  </div>
                </div>

                {/* Sub-Topics Accordion */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mt-4 pt-4 border-t border-white/5 light:border-black/5 space-y-3"
                    >
                      {Object.keys(subtopics).length === 0 ? (
                        <p className="text-xs text-[#8E9299] light:text-[#6C707E] italic">
                          No sub-topics logged yet under {category}.
                        </p>
                      ) : (
                        Object.entries(subtopics).map(([sub, subCount]) => {
                          const subPercentage = Math.round((subCount / count) * 100)
                          return (
                            <div key={sub} className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-medium text-[#E6E4DD] light:text-[#2B2D42]">
                                  {sub}
                                </span>
                                <span className="font-mono text-[#8E9299] light:text-[#6C707E]">
                                  {subCount} {subCount === 1 ? 'day' : 'days'} ({subPercentage}%)
                                </span>
                              </div>
                              <div className="w-full h-1.5 rounded-full bg-white/5 light:bg-black/5 overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${subPercentage}%` }}
                                  transition={{ duration: 0.5, ease: 'easeOut' }}
                                  className="h-full bg-sage-400 light:bg-sage-600 rounded-full"
                                />
                              </div>
                            </div>
                          )
                        })
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </div>

      {/* 4. The Milestone River (Topic Filter Timeline) */}
      <div className="p-6 rounded-2xl border bg-[#1A1C20] border-white/5 light:bg-[#F3EFE6] light:border-black/5 shadow-soft-dark light:shadow-soft-light">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="font-serif text-xl font-medium text-[#E6E4DD] light:text-[#2B2D42]">
              The Milestone River
            </h3>
            <p className="text-xs text-[#8E9299] light:text-[#6C707E]">
              Key aha moments and takeaways distilled chronologically. Filter by topic to review your progression.
            </p>
          </div>

          {/* Interactive Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1">
            {allRiverFilterTopics.map((topic) => (
              <button
                key={topic}
                onClick={() => setSelectedTopicFilter(topic)}
                className={`px-2.5 py-1 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  selectedTopicFilter === topic
                    ? 'bg-sage-400 text-[#121316] font-semibold'
                    : 'bg-white/5 light:bg-black/5 text-[#8E9299] light:text-[#6C707E] hover:text-[#E6E4DD] light:hover:text-[#2B2D42]'
                }`}
              >
                {topic}
              </button>
            ))}
          </div>
        </div>

        {/* Vertical Timeline River */}
        <div className="relative pl-6 sm:pl-8 border-l border-white/10 light:border-black/10 space-y-8 my-4">
          {milestoneEntries.length === 0 ? (
            <p className="text-xs text-[#8E9299] light:text-[#6C707E] italic">
              No milestones found for topic "{selectedTopicFilter}".
            </p>
          ) : (
            milestoneEntries.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, delay: index * 0.04 }}
                className="relative group cursor-pointer"
                onClick={() => onOpenEntry(entry.id)}
              >
                {/* Timeline Node Dot */}
                <span className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-3.5 h-3.5 rounded-full bg-[#121316] light:bg-[#FBF9F5] border-2 border-sage-400 light:border-sage-600 group-hover:scale-125 group-hover:bg-sage-400 transition-all duration-200" />

                {/* Date & Tags */}
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-sage-400 light:text-sage-600">
                    {entry.date}
                  </span>
                  <span className="text-xs text-[#8E9299]/40">•</span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-white/5 light:bg-black/5 text-[#8E9299] light:text-[#6C707E]">
                    {entry.category} → {entry.subTopic}
                  </span>
                  {(entry.complexity?.startTime || entry.complexity?.time) && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-warm/10 text-amber-warm flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5 text-amber-warm" />
                      <span>
                        {entry.complexity?.startTime && entry.complexity?.endTime
                          ? `${entry.complexity.startTime} - ${entry.complexity.endTime}`
                          : entry.complexity?.startTime || entry.complexity?.time}
                      </span>
                    </span>
                  )}
                </div>

                {/* Title */}
                <h4 className="font-serif text-lg font-medium text-[#E6E4DD] light:text-[#2B2D42] group-hover:text-sage-400 light:group-hover:text-sage-600 transition-colors">
                  {entry.title}
                </h4>

                {/* Takeaway / Quote Callout */}
                {entry.takeaway ? (
                  <blockquote className="mt-2 text-sm italic font-serif text-[#A4C1B8] light:text-[#3D5C54] pl-3 border-l-2 border-sage-400/50 light:border-sage-600/50 leading-relaxed">
                    "{entry.takeaway}"
                  </blockquote>
                ) : (
                  <p className="mt-1 text-xs text-[#8E9299] light:text-[#6C707E] line-clamp-2">
                    {entry.preview}
                  </p>
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
