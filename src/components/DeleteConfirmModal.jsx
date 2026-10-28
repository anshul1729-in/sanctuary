import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, X, AlertTriangle } from 'lucide-react'

export const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, title }) => {
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
          className="relative w-full max-w-sm p-5 rounded-2xl shadow-zen border 
            bg-[#1A1C20] text-[#E6E4DD] border-white/10
            light:bg-[#F3EFE6] light:text-[#2B2D42] light:border-black/10"
        >
          <div className="flex items-center justify-between pb-3 border-b border-white/10 light:border-black/10">
            <div className="flex items-center gap-2 text-terracotta-soft">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-serif text-lg font-semibold tracking-tight">Delete Reflection?</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-neutral-400 hover:text-neutral-200 light:text-neutral-500 light:hover:text-neutral-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="mt-3 text-sm text-[#8E9299] light:text-[#6C707E] leading-relaxed">
            Are you sure you want to delete <span className="text-white light:text-black font-medium">"{title || 'this reflection'}"</span>? This action cannot be undone.
          </p>

          <div className="mt-5 flex items-center justify-end gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 text-sm rounded-xl hover:bg-white/5 light:hover:bg-black/5 text-[#8E9299] light:text-[#6C707E] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onConfirm()
                onClose()
              }}
              className="px-3.5 py-1.5 text-sm rounded-xl font-medium bg-red-600/80 hover:bg-red-600 text-white shadow-sm transition-all flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
