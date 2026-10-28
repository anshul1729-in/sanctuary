import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RotateCcw, Trash2, X, Sparkles } from 'lucide-react'

export const ResetConfirmModal = ({ isOpen, onClose, onResetSeed, onClearAll }) => {
  if (!isOpen) return null

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
              <Sparkles className="w-5 h-5 text-sage-400 light:text-sage-600" />
              <h3 className="font-serif text-xl font-semibold tracking-tight">Manage Sanctuary Data</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-neutral-400 hover:text-neutral-200 light:text-neutral-500 light:hover:text-neutral-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="mt-4 text-sm text-[#8E9299] light:text-[#6C707E] leading-relaxed">
            Choose whether to wipe your journal clean to begin your personal writing journey, or restore the curated CS & DSA sample reflections.
          </p>

          <div className="mt-6 flex flex-col gap-3">
            <button
              onClick={() => {
                onClearAll()
                onClose()
              }}
              className="flex items-center justify-between p-3.5 rounded-xl border border-terracotta-soft/30 
                bg-terracotta-soft/10 hover:bg-terracotta-soft/20 text-[#E6E4DD] light:text-[#2B2D42] 
                transition-all duration-200 group text-left"
            >
              <div>
                <div className="text-sm font-medium flex items-center gap-2">
                  <Trash2 className="w-4 h-4 text-terracotta-soft" />
                  <span>Start Fresh (Clear All Logs)</span>
                </div>
                <p className="text-xs text-[#8E9299] light:text-[#6C707E] mt-0.5">
                  Wipes all sample entries so you can start with a clean slate.
                </p>
              </div>
            </button>

            <button
              onClick={() => {
                onResetSeed()
                onClose()
              }}
              className="flex items-center justify-between p-3.5 rounded-xl border border-sage-400/30 
                bg-sage-400/10 hover:bg-sage-400/20 text-[#E6E4DD] light:text-[#2B2D42] 
                transition-all duration-200 group text-left"
            >
              <div>
                <div className="text-sm font-medium flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-sage-400 light:text-sage-600" />
                  <span>Restore Sample Reflections</span>
                </div>
                <p className="text-xs text-[#8E9299] light:text-[#6C707E] mt-0.5">
                  Loads 5 realistic CS & DSA entries with code, complexities, and insights.
                </p>
              </div>
            </button>
          </div>

          <div className="mt-6 pt-3 flex justify-end border-t border-white/10 light:border-black/10">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg hover:bg-white/5 light:hover:bg-black/5 text-[#8E9299] light:text-[#6C707E] transition-colors"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
