import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cloud, HardDrive, LogOut, ChevronDown, Check, ShieldCheck } from 'lucide-react'

export const ModeSwitcher = ({
  storageMode,
  user,
  onSwitchMode,
  onSignOut,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const isCloud = storageMode === 'cloud'

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono border transition-all duration-200
          bg-[#1A1C20] border-white/10 hover:border-sage-400/40 text-[#E6E4DD]
          light:bg-[#F3EFE6] light:border-black/10 light:hover:border-sage-600/40 light:text-[#2B2D42]"
      >
        <span
          className={`w-2 h-2 rounded-full ${
            isCloud ? 'bg-sage-400 animate-pulse' : 'bg-amber-warm'
          }`}
        />
        {isCloud ? (
          <Cloud className="w-3.5 h-3.5 text-sage-400 light:text-sage-600" />
        ) : (
          <HardDrive className="w-3.5 h-3.5 text-amber-warm" />
        )}
        <span className="font-sans font-medium hidden sm:inline">
          {isCloud ? 'Cloud' : 'Local'}
        </span>
        <ChevronDown className="w-3 h-3 text-[#8E9299] light:text-[#6C707E]" />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop to close */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -4 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-64 rounded-2xl p-3 shadow-zen border z-50
                bg-[#1A1C20] border-white/10 text-[#E6E4DD]
                light:bg-[#F3EFE6] light:border-black/10 light:text-[#2B2D42]"
            >
              <div className="pb-2.5 mb-2 border-b border-white/10 light:border-black/10">
                <span className="text-[10px] uppercase font-mono tracking-wider text-[#8E9299] light:text-[#6C707E]">
                  Storage Engine
                </span>
                <p className="text-xs font-medium mt-0.5 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-sage-400 light:text-sage-600" />
                  <span>
                    {isCloud
                      ? 'Supabase Cloud (ap-south-1)'
                      : 'Browser localStorage (Offline)'}
                  </span>
                </p>
                {user?.email && isCloud && (
                  <p className="text-[11px] text-[#8E9299] light:text-[#6C707E] font-mono mt-0.5 truncate">
                    {user.email}
                  </p>
                )}
              </div>

              {/* Toggle actions */}
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    onSwitchMode('cloud')
                    setIsOpen(false)
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition-colors ${
                    isCloud
                      ? 'bg-sage-400/20 text-sage-300 light:text-sage-800 font-medium'
                      : 'hover:bg-white/5 light:hover:bg-black/5 text-[#8E9299] light:text-[#6C707E]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Cloud className="w-3.5 h-3.5 text-sage-400" />
                    <span>Cloud Mode (Supabase)</span>
                  </div>
                  {isCloud && <Check className="w-3.5 h-3.5 text-sage-400" />}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onSwitchMode('local')
                    setIsOpen(false)
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition-colors ${
                    !isCloud
                      ? 'bg-amber-warm/20 text-amber-warm font-medium'
                      : 'hover:bg-white/5 light:hover:bg-black/5 text-[#8E9299] light:text-[#6C707E]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-3.5 h-3.5 text-amber-warm" />
                    <span>Local Mode (Offline)</span>
                  </div>
                  {!isCloud && <Check className="w-3.5 h-3.5 text-amber-warm" />}
                </button>
              </div>

              {/* Sign out if in Cloud mode */}
              {isCloud && user && onSignOut && (
                <div className="mt-2 pt-2 border-t border-white/10 light:border-black/10">
                  <button
                    type="button"
                    onClick={() => {
                      onSignOut()
                      setIsOpen(false)
                    }}
                    className="w-full flex items-center gap-2 p-2 rounded-xl text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out of Cloud</span>
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
