import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cloud, Lock, Sparkles, ArrowRight, HardDrive, KeyRound, AlertCircle, CheckCircle2, UserPlus, LogIn } from 'lucide-react'
import { signInWithEmail, signUpWithEmail } from '../lib/supabaseClient'
import { ThemeToggle } from '../components/ThemeToggle'

export const UnlockSanctuary = ({ onLoginSuccess, onSwitchToLocalMode }) => {
  const [authMode, setAuthMode] = useState('login') // 'login' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim() || !password) return

    setIsLoading(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      if (authMode === 'login') {
        const { data, error } = await signInWithEmail(email.trim(), password)
        if (error) {
          setErrorMsg(error.message || 'Invalid email or password.')
        } else if (data?.user) {
          onLoginSuccess(data.user)
        }
      } else {
        // Sign up new user
        const { data, error } = await signUpWithEmail(email.trim(), password)
        if (error) {
          setErrorMsg(error.message || 'Failed to create account.')
        } else if (data?.user) {
          if (data?.session) {
            onLoginSuccess(data.user)
          } else {
            setSuccessMsg('Account created! Please check your email or proceed to sign in.')
            setAuthMode('login')
          }
        }
      }
    } catch (err) {
      setErrorMsg('Network error connecting to cloud sanctuary')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-between py-8 px-4 sm:px-6">
      {/* Top Bar with theme toggle & branding */}
      <div className="max-w-md mx-auto w-full flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-sage-400 light:bg-sage-600 animate-pulse" />
          <span className="text-xs font-mono uppercase tracking-widest text-[#8E9299] light:text-[#6C707E]">
            Sanctuary Cloud
          </span>
        </div>
        <ThemeToggle />
      </div>

      {/* Main Lock / Auth Card */}
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
            {authMode === 'login' ? 'Unlock Sanctuary' : 'Create Your Sanctuary'}
          </h2>
          <p className="mt-1.5 text-xs text-[#8E9299] light:text-[#6C707E] leading-relaxed">
            {authMode === 'login'
              ? 'Enter your credentials to access your private, synchronized learning journal.'
              : 'Sign up to create your own isolated, encrypted personal knowledge space.'}
          </p>
        </div>

        {/* Auth Mode Switcher Tabs */}
        <div className="flex items-center p-1 rounded-xl bg-white/5 light:bg-black/5 mb-5 text-xs">
          <button
            type="button"
            onClick={() => {
              setAuthMode('login')
              setErrorMsg('')
              setSuccessMsg('')
            }}
            className={`flex-1 py-1.5 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 ${
              authMode === 'login'
                ? 'bg-sage-400/20 text-sage-300 light:text-sage-700 font-semibold shadow-xs'
                : 'text-[#8E9299] hover:text-[#E6E4DD] light:text-[#6C707E] light:hover:text-[#2B2D42]'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('signup')
              setErrorMsg('')
              setSuccessMsg('')
            }}
            className={`flex-1 py-1.5 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 ${
              authMode === 'signup'
                ? 'bg-sage-400/20 text-sage-300 light:text-sage-700 font-semibold shadow-xs'
                : 'text-[#8E9299] hover:text-[#E6E4DD] light:text-[#6C707E] light:hover:text-[#2B2D42]'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create Account</span>
          </button>
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

        {/* Success Alert */}
        <AnimatePresence>
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-3 rounded-xl border border-sage-400/30 bg-sage-400/10 text-sage-300 light:text-sage-700 text-xs flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form with clean, non-prefilled fields */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#8E9299] light:text-[#6C707E] mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
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
              placeholder={authMode === 'login' ? '••••••••••••' : 'Minimum 6 characters'}
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
                <span>{authMode === 'login' ? 'Unlock Sanctuary' : 'Register & Enter'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Separator / Switch to Local Offline Mode */}
        <div className="mt-6 pt-5 border-t border-white/10 light:border-black/10 text-center">
          <p className="text-xs text-[#8E9299] light:text-[#6C707E] mb-3">
            Want to write offline without an account?
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
        <span>PostgreSQL Cloud Engine • Protected by Row Level Security (RLS)</span>
      </div>
    </div>
  )
}
