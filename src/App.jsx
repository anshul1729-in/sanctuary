import React, { useState, useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { SanctuaryHub } from './views/SanctuaryHub'
import { SectionSpace } from './views/SectionSpace'
import { FreeMindCanvas } from './views/FreeMindCanvas'
import { UnlockSanctuary } from './views/UnlockSanctuary'
import { ResetConfirmModal } from './components/ResetConfirmModal'
import { NewDomainModal } from './components/NewDomainModal'

// Local storage layer (kept completely intact)
import {
  getSections as getLocalSections,
  saveSection as saveLocalSection,
  getEntries as getLocalEntries,
  saveEntry as saveLocalEntry,
  deleteEntry as deleteLocalEntry,
  toggleFavorite as toggleLocalFavorite,
  resetToSeedData as resetLocalSeedData,
  clearAllEntries as clearLocalAllEntries,
} from './lib/storage'

// Cloud storage layer (Supabase PostgreSQL in Mumbai)
import { supabase, signOutUser } from './lib/supabaseClient'
import {
  getCloudSections,
  saveCloudSection,
  getCloudEntries,
  saveCloudEntry,
  deleteCloudEntry,
  toggleCloudFavorite,
  checkAndSeedCloudData,
  syncLocalToCloud,
} from './lib/supabaseStorage'

// Helper to parse route from window.location.hash
const parseRouteFromHash = () => {
  if (typeof window === 'undefined') {
    return { view: 'hub', sectionId: 'cs', entryId: null }
  }
  const clean = window.location.hash.replace(/^#\/?/, '')
  const parts = clean.split('/').filter(Boolean)
  if (parts.length === 0) {
    return { view: 'hub', sectionId: 'cs', entryId: null }
  }
  if (parts[0] === 'section') {
    return {
      view: 'section',
      sectionId: decodeURIComponent(parts[1] || 'cs'),
      entryId: null,
    }
  }
  if (parts[0] === 'editor') {
    const sId = decodeURIComponent(parts[1] || 'cs')
    const eId = parts[2] && parts[2] !== 'new' ? decodeURIComponent(parts[2]) : null
    return {
      view: 'editor',
      sectionId: sId,
      entryId: eId,
    }
  }
  return { view: 'hub', sectionId: 'cs', entryId: null }
}

const buildRouteHash = (targetView, targetSectionId = 'cs', targetEntryId = null) => {
  if (targetView === 'hub') return '#/'
  if (targetView === 'section') return `#/section/${encodeURIComponent(targetSectionId || 'cs')}`
  if (targetView === 'editor') {
    return `#/editor/${encodeURIComponent(targetSectionId || 'cs')}/${encodeURIComponent(targetEntryId || 'new')}`
  }
  return '#/'
}

export function App() {
  // Storage mode: 'cloud' | 'local'
  const [storageMode, setStorageMode] = useState(() => {
    return localStorage.getItem('sanctuary_storage_mode') || 'cloud'
  })

  // Auth state - initialized from localStorage cache for instant access without re-login flash
  const [user, setUser] = useState(() => {
    try {
      const cached = localStorage.getItem('sanctuary_cached_user')
      return cached ? JSON.parse(cached) : null
    } catch {
      return null
    }
  })
  const [isAuthLoading, setIsAuthLoading] = useState(() => {
    try {
      const cached = localStorage.getItem('sanctuary_cached_user')
      return !cached
    } catch {
      return true
    }
  })

  // Navigation & UI state synchronized with browser history and URL hash
  const [view, setView] = useState(() => parseRouteFromHash().view)
  const [activeSectionId, setActiveSectionId] = useState(() => parseRouteFromHash().sectionId)
  const [activeEntryId, setActiveEntryId] = useState(() => parseRouteFromHash().entryId)

  // Data state
  const [sections, setSections] = useState([])
  const [entries, setEntries] = useState([])
  const [isLoadingData, setIsLoadingData] = useState(false)

  // Modals
  const [isResetModalOpen, setIsResetModalOpen] = useState(false)
  const [isNewDomainModalOpen, setIsNewDomainModalOpen] = useState(false)

  // Persist storage mode preference
  const handleSwitchMode = (newMode) => {
    setStorageMode(newMode)
    localStorage.setItem('sanctuary_storage_mode', newMode)
  }

  // 1. Supabase Auth Lifecycle
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user || null
      setUser(currentUser)
      if (currentUser) {
        localStorage.setItem('sanctuary_cached_user', JSON.stringify(currentUser))
      } else {
        localStorage.removeItem('sanctuary_cached_user')
      }
      setIsAuthLoading(false)
    }).catch((err) => {
      console.warn('Error fetching Supabase session:', err)
      setIsAuthLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user || null
      setUser(currentUser)
      if (currentUser) {
        localStorage.setItem('sanctuary_cached_user', JSON.stringify(currentUser))
      } else {
        localStorage.removeItem('sanctuary_cached_user')
      }
      setIsAuthLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  // 2. Load Data whenever storageMode or user changes
  const loadData = useCallback(async () => {
    setIsLoadingData(true)
    try {
      if (storageMode === 'cloud') {
        if (!user) {
          setSections([])
          setEntries([])
          setIsLoadingData(false)
          return
        }

        // Auto-seed if cloud database is empty
        await checkAndSeedCloudData(user.id)

        const [cloudSecs, cloudEnts] = await Promise.all([
          getCloudSections(),
          getCloudEntries(),
        ])

        setSections(cloudSecs)
        setEntries(cloudEnts)
      } else {
        // Local Mode
        setSections(getLocalSections())
        setEntries(getLocalEntries())
      }
    } catch (err) {
      console.error('Error loading Sanctuary data:', err)
      // Fallback to local if cloud fails
      setSections(getLocalSections())
      setEntries(getLocalEntries())
    } finally {
      setIsLoadingData(false)
    }
  }, [storageMode, user])

  useEffect(() => {
    if (!isAuthLoading) {
      loadData()
    }
  }, [loadData, isAuthLoading])

  // 3. Browser Back/Forward navigation listener (popstate and hashchange)
  useEffect(() => {
    // If opened with no hash, set initial replaceState so Back button has a stable anchor
    if (!window.location.hash || window.location.hash === '#') {
      const initialHash = buildRouteHash(view, activeSectionId, activeEntryId)
      window.history.replaceState(
        { view, sectionId: activeSectionId, entryId: activeEntryId },
        '',
        initialHash
      )
    }

    const handleLocationChange = () => {
      const route = parseRouteFromHash()
      setView(route.view)
      setActiveSectionId(route.sectionId)
      setActiveEntryId(route.entryId)
    }

    window.addEventListener('popstate', handleLocationChange)
    window.addEventListener('hashchange', handleLocationChange)

    return () => {
      window.removeEventListener('popstate', handleLocationChange)
      window.removeEventListener('hashchange', handleLocationChange)
    }
  }, [view, activeSectionId, activeEntryId])

  // Centralized navigation function that updates React state and browser history
  const navigateTo = useCallback(
    (newView, newSectionId = activeSectionId, newEntryId = null, replace = false) => {
      const targetHash = buildRouteHash(newView, newSectionId, newEntryId)
      const stateObj = { view: newView, sectionId: newSectionId, entryId: newEntryId }

      if (replace) {
        window.history.replaceState(stateObj, '', targetHash)
      } else {
        if (window.location.hash !== targetHash) {
          window.history.pushState(stateObj, '', targetHash)
        }
      }

      setView(newView)
      setActiveSectionId(newSectionId)
      setActiveEntryId(newEntryId)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    [activeSectionId]
  )

  // Active section & entry
  const activeSection =
    sections.find((s) => s.id === activeSectionId) ||
    sections[0] || {
      id: 'cs',
      title: 'Computer Science',
      categories: ['DSA', 'Systems'],
    }

  const activeEntry = activeEntryId ? entries.find((e) => e.id === activeEntryId) : null

  // Navigation handlers with seamless browser history integration
  const handleSelectSection = (sectionId) => {
    navigateTo('section', sectionId, null)
  }

  const handleBackToHub = () => {
    if (window.history.length > 1 && window.location.hash.startsWith('#/section')) {
      window.history.back()
    } else {
      navigateTo('hub', activeSectionId, null)
    }
  }

  const handleOpenEntry = (entryId) => {
    navigateTo('editor', activeSectionId, entryId)
  }

  const handleNewEntry = () => {
    navigateTo('editor', activeSectionId, null)
  }

  const handleBackToSection = () => {
    if (window.history.length > 1 && window.location.hash.startsWith('#/editor')) {
      window.history.back()
    } else {
      navigateTo('section', activeSectionId, null)
    }
  }

  // Unified Save Handler (asynchronous PostgreSQL in cloud mode, synchronous in local mode)
  const handleSaveEntry = useCallback(
    async (entryData) => {
      const entryToSave = {
        ...entryData,
        sectionId: activeSectionId,
      }

      if (storageMode === 'cloud' && user) {
        try {
          const saved = await saveCloudEntry(entryToSave, user.id)
          setEntries((prev) => {
            const idx = prev.findIndex((e) => e.id === saved.id)
            if (idx >= 0) {
              const next = [...prev]
              next[idx] = saved
              return next
            } else {
              return [saved, ...prev]
            }
          })
          if (!activeEntryId) {
            setActiveEntryId(saved.id)
            // Update URL hash with replaceState so browser Back still takes user to section
            window.history.replaceState(
              { view: 'editor', sectionId: activeSectionId, entryId: saved.id },
              '',
              buildRouteHash('editor', activeSectionId, saved.id)
            )
          }
        } catch (err) {
          console.error('Failed to save to Supabase:', err)
        }
      } else {
        // Local Mode
        const saved = saveLocalEntry(entryToSave)
        setEntries((prev) => {
          const idx = prev.findIndex((e) => e.id === saved.id)
          if (idx >= 0) {
            const next = [...prev]
            next[idx] = saved
            return next
          } else {
            return [saved, ...prev]
          }
        })
        if (!activeEntryId) {
          setActiveEntryId(saved.id)
          window.history.replaceState(
            { view: 'editor', sectionId: activeSectionId, entryId: saved.id },
            '',
            buildRouteHash('editor', activeSectionId, saved.id)
          )
        }
      }
    },
    [activeSectionId, activeEntryId, storageMode, user]
  )

  // Unified Delete Handler
  const handleDeleteEntry = async (entryId) => {
    if (storageMode === 'cloud' && user) {
      try {
        await deleteCloudEntry(entryId)
        setEntries((prev) => prev.filter((e) => e.id !== entryId))
      } catch (err) {
        console.error('Failed to delete cloud entry:', err)
      }
    } else {
      const updated = deleteLocalEntry(entryId)
      setEntries(updated)
    }

    if (activeEntryId === entryId) {
      navigateTo('section', activeSectionId, null, true)
    }
  }

  // Unified Favorite Toggle
  const handleToggleFavorite = async (entryId) => {
    const target = entries.find((e) => e.id === entryId)
    if (!target) return

    if (storageMode === 'cloud' && user) {
      try {
        const updated = await toggleCloudFavorite(entryId, target.isFavorite)
        setEntries((prev) =>
          prev.map((e) => (e.id === entryId ? updated : e))
        )
      } catch (err) {
        console.error('Failed to toggle cloud favorite:', err)
      }
    } else {
      const updated = toggleLocalFavorite(entryId)
      setEntries(updated)
    }
  }

  // Unified Add Domain
  const handleAddDomain = async (newDomain) => {
    if (storageMode === 'cloud' && user) {
      try {
        const saved = await saveCloudSection(newDomain, user.id)
        setSections((prev) => [...prev, saved])
        navigateTo('section', saved.id, null)
      } catch (err) {
        console.error('Failed to save cloud domain:', err)
      }
    } else {
      const updated = saveLocalSection(newDomain)
      setSections(updated)
      navigateTo('section', newDomain.id, null)
    }
  }

  // Unified Update Section (domain tags / categories / metadata)
  const handleUpdateSection = async (updatedSection) => {
    setSections((prev) =>
      prev.map((s) => (s.id === updatedSection.id ? updatedSection : s))
    )

    if (storageMode === 'cloud' && user) {
      try {
        await saveCloudSection(updatedSection, user.id)
      } catch (err) {
        console.error('Failed to update cloud section:', err)
      }
    } else {
      const updatedList = saveLocalSection(updatedSection)
      setSections(updatedList)
    }
  }

  // Reset / Clear Data
  const handleResetSeedData = async () => {
    if (storageMode === 'cloud' && user) {
      await checkAndSeedCloudData(user.id)
      await loadData()
    } else {
      const restored = resetLocalSeedData()
      setEntries(restored)
      setSections(getLocalSections())
    }
  }

  const handleClearAllData = async () => {
    if (storageMode === 'cloud' && user) {
      // Clear entries
      for (const e of entries) {
        await deleteCloudEntry(e.id)
      }
      setEntries([])
    } else {
      const empty = clearLocalAllEntries()
      setEntries(empty)
    }
  }

  // 1-Click Sync Local notes to Cloud
  const handleSyncLocalToCloud = async () => {
    if (!user) return
    const res = await syncLocalToCloud(user.id)
    await loadData()
    return res
  }

  const handleSignOut = async () => {
    try {
      await signOutUser()
    } catch (err) {
      console.warn('Sign out error:', err)
    }
    localStorage.removeItem('sanctuary_cached_user')
    setUser(null)
  }

  // If loading auth initial state
  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#121316] text-[#E6E4DD]">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-sage-400 animate-pulse" />
          <span className="font-serif text-lg text-sage-300">Sanctuary</span>
        </div>
      </div>
    )
  }

  // If in Cloud Mode and not logged in, display the tranquil Lock Screen!
  if (storageMode === 'cloud' && !user) {
    return (
      <UnlockSanctuary
        onLoginSuccess={(authUser) => {
          if (authUser) {
            localStorage.setItem('sanctuary_cached_user', JSON.stringify(authUser))
          }
          setUser(authUser)
        }}
        onSwitchToLocalMode={() => handleSwitchMode('local')}
      />
    )
  }

  return (
    <div className="min-h-screen selection:bg-sage-400/25 selection:text-sage-300">
      <AnimatePresence mode="wait">
        {view === 'hub' && (
          <SanctuaryHub
            key="hub"
            sections={sections}
            entries={entries}
            onSelectSection={handleSelectSection}
            onOpenNewDomain={() => setIsNewDomainModalOpen(true)}
            onOpenResetModal={() => setIsResetModalOpen(true)}
            storageMode={storageMode}
            user={user}
            onSwitchMode={handleSwitchMode}
            onSignOut={handleSignOut}
          />
        )}

        {view === 'section' && (
          <SectionSpace
            key={`section-${activeSection.id}`}
            section={activeSection}
            entries={entries}
            onBackToHub={handleBackToHub}
            onOpenEntry={handleOpenEntry}
            onNewEntry={handleNewEntry}
            onDeleteEntry={handleDeleteEntry}
            onToggleFavorite={handleToggleFavorite}
            storageMode={storageMode}
            user={user}
            onSwitchMode={handleSwitchMode}
            onSignOut={handleSignOut}
          />
        )}

        {view === 'editor' && (
          <FreeMindCanvas
            key={`editor-${activeEntryId || 'new'}`}
            entry={activeEntry}
            section={activeSection}
            onSaveEntry={handleSaveEntry}
            onUpdateSection={handleUpdateSection}
            onBack={handleBackToSection}
            onDeleteEntry={handleDeleteEntry}
            onToggleFavorite={handleToggleFavorite}
            storageMode={storageMode}
          />
        )}
      </AnimatePresence>

      {/* Reusable Modals */}
      <ResetConfirmModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onResetSeed={handleResetSeedData}
        onClearAll={handleClearAllData}
        onSyncLocalToCloud={storageMode === 'cloud' && user ? handleSyncLocalToCloud : null}
        storageMode={storageMode}
        isAuthenticated={Boolean(user)}
      />

      <NewDomainModal
        isOpen={isNewDomainModalOpen}
        onClose={() => setIsNewDomainModalOpen(false)}
        onAddDomain={handleAddDomain}
      />
    </div>
  )
}
