import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RotateCcw, Trash2, X, Sparkles, CloudUpload, CheckCircle2, HardDrive, RefreshCw } from 'lucide-react'

export const ResetConfirmModal = ({
  isOpen,
  onClose,
  onResetSeed,
  onClearAll,
  onSyncLocalToCloud,
  storageMode = 'cloud',
  isAuthenticated = false,
}) => {
  const [syncStatus, setSyncStatus] = useState(null)
  const [isSyncing, setIsSyncing] = useState(false)

  if (!isOpen) return null

  const handleSync = async () => {
    if (!onSyncLocalToCloud) return
    setIsSyncing(true)
    setSyncStatus(null)
    try {
      const res = await onSyncLocalToCloud()
      setSyncStatus(`Successfully synced ${res.sectionsMigrated} domains and ${res.entriesMigrated} reflections to Cloud!`)
    } catch (err) {
      setSyncStatus('Failed to sync: ' + (err.message || 'Network error'))
    } finally {
      setIsSyncing(false)
    }
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
              <Sparkles className="w-5 h-5 text-sage-400 light:text-sage-600" />
              <h3 className="font-serif text-xl font-semibold tracking-tight">Sanctuary Data & Cloud Sync</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-neutral-400 hover:text-neutral-200 light:text-neutral-500 light:hover:text-neutral-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="mt-3 text-sm text-[#8E9299] light:text-[#6C707E] leading-relaxed">
            Manage your reflection archives or push notes saved in local browser storage up to your Mumbai Supabase PostgreSQL database.
          </p>

          {/* Sync Success Feedback */}
          {syncStatus && (
            <div className="mt-3 p-3 rounded-xl border border-sage-400/40 bg-sage-400/10 text-sage-300 light:text-sage-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-sage-400 flex-shrink-0" />
              <span>{syncStatus}</span>
            </div>
          )}

          <div className="mt-5 flex flex-col gap-2.5">
            {/* 1-Click Sync Local to Cloud */}
            {isAuthenticated && onSyncLocalToCloud && (
              <button
                onClick={handleSync}
                disabled={isSyncing}
                className="flex items-center justify-between p-3 rounded-xl border border-sage-400/30 
                  bg-sage-400/10 hover:bg-sage-400/20 text-[#E6E4DD] light:text-[#2B2D42] 
                  transition-all duration-200 group text-left"
              >
                <div>
                  <div className="text-sm font-medium flex items-center gap-2">
                    {isSyncing ? (
                      <RefreshCw className="w-4 h-4 text-sage-400 animate-spin" />
                    ) : (
                      <CloudUpload className="w-4 h-4 text-sage-400 light:text-sage-600" />
                    )}
                    <span>Sync Local Browser Notes to Cloud</span>
                  </div>
                  <p className="text-xs text-[#8E9299] light:text-[#6C707E] mt-0.5">
                    Transfers offline reflections from localStorage into your Supabase database.
                  </p>
                </div>
              </button>
            )}

            <button
              onClick={() => {
                onResetSeed()
                onClose()
              }}
              className="flex items-center justify-between p-3 rounded-xl border border-white/10 
                bg-white/5 hover:bg-white/10 text-[#E6E4DD] light:text-[#2B2D42] 
                transition-all duration-200 group text-left"
            >
              <div>
                <div className="text-sm font-medium flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-amber-warm" />
                  <span>Restore Sample Reflections</span>
                </div>
                <p className="text-xs text-[#8E9299] light:text-[#6C707E] mt-0.5">
                  Loads 5 realistic CS & DSA entries with code, complexities, and insights.
                </p>
              </div>
            </button>

            <button
              onClick={() => {
                onClearAll()
                onClose()
              }}
              className="flex items-center justify-between p-3 rounded-xl border border-terracotta-soft/30 
                bg-terracotta-soft/10 hover:bg-terracotta-soft/20 text-[#E6E4DD] light:text-[#2B2D42] 
                transition-all duration-200 group text-left"
            >
              <div>
                <div className="text-sm font-medium flex items-center gap-2">
                  <Trash2 className="w-4 h-4 text-terracotta-soft" />
                  <span>Clear All Active Logs</span>
                </div>
                <p className="text-xs text-[#8E9299] light:text-[#6C707E] mt-0.5">
                  Wipes reflections in current mode so you can start with a clean slate.
                </p>
              </div>
            </button>
          </div>

          <div className="mt-6 pt-3 flex justify-end border-t border-white/10 light:border-black/10">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg hover:bg-white/5 light:hover:bg-black/5 text-[#8E9299] light:text-[#6C707E] transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
