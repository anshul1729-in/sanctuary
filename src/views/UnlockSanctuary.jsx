import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cloud, Lock, Sparkles, ArrowRight, HardDrive, KeyRound, AlertCircle, CheckCircle2 } from 'lucide-react'
import { signInWithEmail } from '../lib/supabaseClient'
import { ThemeToggle } from '../components/ThemeToggle'

export const UnlockSanctuary = ({ onLoginSuccess, onSwitchToLocalMode }) => {
  const [email, setEmail] = useState('anshul6272@gmail.com')
  const [password, setPassword] = useState('Sanctuary@2026!')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!email || !password) return

    setIsLoading(true)
    setErrorMsg('')

    try {
      const { data, error } = await signInWithEmail(email, password)
      if (error) {
        setErrorMsg(error.message || 'Failed to authenticate with Supabase Cloud')
      } else if (data?.user) {
        onLoginSuccess(data.user)
      }
    } catch (err) {
      setErrorMsg('Network error connecting to Mumbai cloud database')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-between py-8 px-4 sm:px-6">
      {/* Top Bar with theme toggle & mode switcher */}
      <div className="max-w-md mx-auto w-full flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-sage-400 light:bg-sage-600 animate-pulse" />
          <span className="text-xs font-mono uppercase tracking-widest text-[#8E9299] light:text-[#6C707E]">
            Sanctuary Cloud
          </span>
        </div>
        <ThemeToggle />
      </div>

      {/* Main Lock Screen Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-md mx-auto my-auto p-7 sm:p-8 rounded-3xl border shadow-zen
          bg-[#1A1C20] border-white/10 text-[#E6E4DD]
          light:bg-[#F3EFE6] light:border-black/10 light:text-[#2B2D42]"
      >
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto rounded-2xl flex items-center justify-center mb-3
            bg-sage-400/10 text-sage-400 light:text-sage-600">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-3xl font-medium tracking-tight">
            Unlock Sanctuary
          </h2>
          <p className="mt-1.5 text-xs text-[#8E9299] light:text-[#6C707E] leading-relaxed">
            Connected to your Mumbai database (<code className="font-mono text-[11px] text-sage-400">ap-south-1</code>).
            Enter your credentials to access your synchronized reflections.
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

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#8E9299] light:text-[#6C707E] mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="anshul6272@gmail.com"
              className="w-full px-3.5 py-2.5 rounded-xl text-sm border 
                bg-[#121316] border-white/10 text-[#E6E4DD] placeholder-neutral-500 focus:border-sage-400
                light:bg-[#FBF9F5] light:border-black/10 light:text-[#2B2D42] focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#8E9299] light:text-[#6C707E] mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl text-sm border 
                bg-[#121316] border-white/10 text-[#E6E4DD] placeholder-neutral-500 focus:border-sage-400
                light:bg-[#FBF9F5] light:border-black/10 light:text-[#2B2D42] focus:outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 px-4 rounded-xl text-sm font-medium bg-sage-500 hover:bg-sage-600 disabled:opacity-50 text-white shadow-sm transition-all flex items-center justify-center gap-2"
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
          <p className="text-xs text-[#8E9299] light:text-[#6C707E] mb-3">
            Want to write offline without network requests?
          </p>
          <button
            type="button"
            onClick={onSwitchToLocalMode}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-medium border border-white/15 light:border-black/15
              bg-white/5 hover:bg-white/10 light:bg-black/5 light:hover:bg-black/10 text-[#E6E4DD] light:text-[#2B2D42]
              transition-colors flex items-center justify-center gap-2"
          >
            <HardDrive className="w-3.5 h-3.5 text-amber-warm" />
            <span>Switch to Local Browser Mode (Offline)</span>
          </button>
        </div>
      </motion.div>

      {/* Footer */}
      <div className="text-center text-xs text-[#8E9299] light:text-[#6C707E] pt-4">
        <span>PostgreSQL Cloud Engine • Row Level Security Enabled</span>
      </div>
    </div>
  )
}
