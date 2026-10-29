import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, FolderPlus } from 'lucide-react'

export const NewDomainModal = ({ isOpen, onClose, onAddDomain }) => {
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [categories, setCategories] = useState('')

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim()) return

    const categoryList = categories
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean)

    const newSection = {
      id: `domain-${Date.now()}`,
      title: title.trim(),
      subtitle: subtitle.trim() || 'Knowledge domain & personal learning journal',
      description: 'A dedicated sanctuary for recording structured progress and reflections.',
      icon: 'Folder',
      accentColor: '#84A59D',
      categories: categoryList.length > 0 ? categoryList : ['General'],
      subTopicsMap: {}
    }

    onAddDomain(newSection)
    setTitle('')
    setSubtitle('')
    onClose()
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md p-6 rounded-2xl shadow-zen border 
            bg-[#1A1C20] text-[#E6E4DD] border-white/10
            light:bg-[#F3EFE6] light:text-[#2B2D42] light:border-black/10"
        >
          <div className="flex items-center justify-between pb-3 border-b border-white/10 light:border-black/10">
            <div className="flex items-center gap-2">
              <FolderPlus className="w-5 h-5 text-sage-400 light:text-sage-600" />
              <h3 className="font-serif text-xl font-semibold tracking-tight">Create New Domain</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-neutral-400 hover:text-neutral-200 light:text-neutral-500 light:hover:text-neutral-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#8E9299] light:text-[#6C707E] mb-1.5">
                Domain Title *
              </label>
              <input
                type="text"
                required
                autoFocus
                placeholder="e.g. System Design, AI Research, Mathematics"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm border 
                  bg-[#121316] border-white/10 text-[#E6E4DD] placeholder-neutral-500 focus:border-sage-400
                  light:bg-[#FBF9F5] light:border-black/10 light:text-[#2B2D42] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#8E9299] light:text-[#6C707E] mb-1.5">
                Subtitle / Motto
              </label>
              <input
                type="text"
                placeholder="e.g. Distributed architectures and trade-off reflections"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm border 
                  bg-[#121316] border-white/10 text-[#E6E4DD] placeholder-neutral-500 focus:border-sage-400
                  light:bg-[#FBF9F5] light:border-black/10 light:text-[#2B2D42] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#8E9299] light:text-[#6C707E] mb-1.5">
                Initial Categories (comma separated, optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Organic, Kinetics, Spectroscopy"
                value={categories}
                onChange={(e) => setCategories(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm border 
                  bg-[#121316] border-white/10 text-[#E6E4DD] placeholder-neutral-500 focus:border-sage-400
                  light:bg-[#FBF9F5] light:border-black/10 light:text-[#2B2D42] focus:outline-none transition-colors"
              />
            </div>

            <div className="pt-3 flex items-center justify-end gap-2 border-t border-white/10 light:border-black/10">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm rounded-xl hover:bg-white/5 light:hover:bg-black/5 text-[#8E9299] light:text-[#6C707E] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm rounded-xl font-medium bg-sage-500 hover:bg-sage-600 text-white shadow-sm transition-all"
              >
                Create Domain
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
