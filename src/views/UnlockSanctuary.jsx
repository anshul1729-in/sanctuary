import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, Eye, EyeOff, KeyRound, ArrowRight, HardDrive, AlertCircle, ShieldCheck } from 'lucide-react'
import { signInWithEmail } from '../lib/supabaseClient'
import { ThemeToggle } from '../components/ThemeToggle'

const DEFAULT_OWNER_EMAIL = 'anshul6272@gmail.com'

export const UnlockSanctuary = ({ onLoginSuccess, onSwitchToLocalMode }) => {
  const [passcode, setPasscode] = useState('')
  const [email, setEmail] = useState(DEFAULT_OWNER_EMAIL)
  const [showPasscode, setShowPasscode] = useState(false)
  const [showEmailInput, setShowEmailInput] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    // Auto-focus passcode on mount
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!passcode) return

    setIsLoading(true)
    setErrorMsg('')

    try {
      const targetEmail = (email && email.trim()) ? email.trim() : DEFAULT_OWNER_EMAIL
      const { data, error } = await signInWithEmail(targetEmail, passcode)

      if (error) {
        if (
          error.message.includes('Invalid login credentials') ||
          error.message.includes('invalid_grant')
        ) {
          setErrorMsg('Incorrect passcode. Please try again.')
        } else {
          setErrorMsg(error.message || 'Authentication failed.')
        }
      } else if (data?.user) {
        onLoginSuccess(data.user)
      }
    } catch (err) {
      setErrorMsg('Network error connecting to personal vault')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-between py-8 px-4 sm:px-6 glass-ambient-bg">
      {/* Top Bar with theme toggle & branding */}
      <div className="max-w-md mx-auto w-full flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-sage-400 light:bg-sage-600 animate-pulse" />
          <span className="text-xs font-mono uppercase tracking-widest text-[#9CA3AF] light:text-[#6C707E]">
            Sanctuary Vault
          </span>
        </div>
        <ThemeToggle />
      </div>

      {/* Main Personal Lock Screen on Glass */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-md mx-auto my-auto p-7 sm:p-8 rounded-3xl shadow-glass glass-card text-[#F3F4F6] light:text-[#2B2D42]"
      >
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto rounded-2xl flex items-center justify-center mb-3
            bg-sage-400/10 text-sage-400 light:text-sage-600">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-3xl font-medium tracking-tight">
            Unlock Sanctuary
          </h2>
          <p className="mt-1.5 text-xs text-[#9CA3AF] light:text-[#6C707E] leading-relaxed">
            Personal knowledge vault • Distraction-free focus & conceptual synthesis
          </p>
        </div>

        {/* Error Alert */}
        <AnimatePresence>
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 light:text-red-700 text-xs flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Streamlined Passcode Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#9CA3AF] light:text-[#6C707E]">
                Enter Sanctuary Passcode
              </label>
              <span className="text-[11px] font-mono text-sage-400/80 light:text-sage-600/80">
                anshul6272
              </span>
            </div>

            <div className="relative">
              <input
                ref={inputRef}
                type={showPasscode ? 'text' : 'password'}
                required
                autoFocus
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter personal passcode..."
                className="w-full px-3.5 py-3 pr-11 rounded-xl text-sm font-mono border 
                  bg-black/50 border-white/10 text-[#F3F4F6] placeholder-neutral-500 focus:border-sage-400
                  light:bg-white/60 light:border-black/10 light:text-[#2B2D42] focus:outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPasscode(!showPasscode)}
                tabIndex={-1}
                aria-label={showPasscode ? 'Hide passcode' : 'Show passcode'}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#9CA3AF] hover:text-[#F3F4F6] light:text-[#6C707E] light:hover:text-[#2B2D42] transition-colors cursor-pointer"
              >
                {showPasscode ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Collapsible Admin Email Override */}
          <div className="pt-0.5">
            {!showEmailInput ? (
              <button
                type="button"
                onClick={() => setShowEmailInput(true)}
                className="text-[11px] text-[#9CA3AF] hover:text-[#F3F4F6] light:text-[#6C707E] light:hover:text-[#2B2D42] underline-offset-4 hover:underline transition-colors cursor-pointer"
              >
                Use different admin email
              </button>
            ) : (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-1.5 pt-1"
              >
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF] light:text-[#6C707E]">
                    Admin Email Address
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail(DEFAULT_OWNER_EMAIL)
                      setShowEmailInput(false)
                    }}
                    className="text-[10px] text-sage-400 hover:underline cursor-pointer"
                  >
                    Reset to default
                  </button>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@domain.com"
                  className="w-full px-3 py-2 rounded-xl text-xs border 
                    bg-black/50 border-white/10 text-[#F3F4F6] placeholder-neutral-500 focus:border-sage-400
                    light:bg-white/60 light:border-black/10 light:text-[#2B2D42] focus:outline-none transition-colors"
                />
              </motion.div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || !passcode}
            className="w-full mt-2 py-3 px-4 rounded-xl text-sm font-medium bg-sage-500 hover:bg-sage-600 disabled:opacity-50 text-white shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                <span>Unlock Sanctuary</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Separator / Switch to Local Offline Mode */}
        <div className="mt-6 pt-5 border-t border-white/10 light:border-black/10 text-center">
          <p className="text-xs text-[#9CA3AF] light:text-[#6C707E] mb-3">
            Want to write offline without cloud sync?
          </p>
          <button
            type="button"
            onClick={onSwitchToLocalMode}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-medium border border-white/15 light:border-black/15
              bg-white/5 hover:bg-white/10 light:bg-black/5 light:hover:bg-black/10 text-[#F3F4F6] light:text-[#2B2D42]
              transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <HardDrive className="w-3.5 h-3.5 text-amber-warm" />
            <span>Switch to Local Browser Mode (Offline)</span>
          </button>
        </div>
      </motion.div>

      {/* Footer */}
      <div className="text-center text-xs text-[#9CA3AF] light:text-[#6C707E] pt-4 flex items-center justify-center gap-2">
        <ShieldCheck className="w-3.5 h-3.5 text-sage-400" />
        <span>Personal Vault • Public Sign-Up Disabled • Supabase RLS Protected</span>
      </div>
    </div>
  )
}
