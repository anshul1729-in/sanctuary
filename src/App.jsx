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

export function App() {
  // Storage mode: 'cloud' | 'local'
  const [storageMode, setStorageMode] = useState(() => {
    return localStorage.getItem('sanctuary_storage_mode') || 'cloud'
  })

  // Auth state
  const [user, setUser] = useState(null)
  const [isAuthLoading, setIsAuthLoading] = useState(true)

  // Navigation & UI state
  const [view, setView] = useState('hub') // 'hub' | 'section' | 'editor'
  const [activeSectionId, setActiveSectionId] = useState('cs')
  const [activeEntryId, setActiveEntryId] = useState(null)

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
      setUser(session?.user || null)
      setIsAuthLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
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

  // Active section & entry
  const activeSection =
    sections.find((s) => s.id === activeSectionId) ||
    sections[0] || {
      id: 'cs',
      title: 'Computer Science',
      categories: ['DSA', 'Systems'],
    }

  const activeEntry = activeEntryId ? entries.find((e) => e.id === activeEntryId) : null

  // Navigation handlers
  const handleSelectSection = (sectionId) => {
    setActiveSectionId(sectionId)
    setView('section')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBackToHub = () => {
    setView('hub')
    setActiveEntryId(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleOpenEntry = (entryId) => {
    setActiveEntryId(entryId)
    setView('editor')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleNewEntry = () => {
    setActiveEntryId(null)
    setView('editor')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBackToSection = () => {
    setView('section')
    setActiveEntryId(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
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
      setActiveEntryId(null)
      setView('section')
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
        setActiveSectionId(saved.id)
        setView('section')
      } catch (err) {
        console.error('Failed to save cloud domain:', err)
      }
    } else {
      const updated = saveLocalSection(newDomain)
      setSections(updated)
      setActiveSectionId(newDomain.id)
      setView('section')
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
    await signOutUser()
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
