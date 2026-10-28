import React, { useState, useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { SanctuaryHub } from './views/SanctuaryHub'
import { SectionSpace } from './views/SectionSpace'
import { FreeMindCanvas } from './views/FreeMindCanvas'
import { ResetConfirmModal } from './components/ResetConfirmModal'
import { NewDomainModal } from './components/NewDomainModal'
import {
  getSections,
  saveSection,
  getEntries,
  getEntry,
  saveEntry as saveEntryToStorage,
  deleteEntry as deleteEntryFromStorage,
  toggleFavorite as toggleFavoriteInStorage,
  resetToSeedData,
  clearAllEntries,
} from './lib/storage'

export function App() {
  const [view, setView] = useState('hub') // 'hub' | 'section' | 'editor'
  const [activeSectionId, setActiveSectionId] = useState('cs')
  const [activeEntryId, setActiveEntryId] = useState(null)

  const [sections, setSections] = useState(getSections)
  const [entries, setEntries] = useState(getEntries)

  const [isResetModalOpen, setIsResetModalOpen] = useState(false)
  const [isNewDomainModalOpen, setIsNewDomainModalOpen] = useState(false)

  // Active section and entry objects
  const activeSection =
    sections.find((s) => s.id === activeSectionId) || sections[0] || {
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

  // Data persistence handlers
  const handleSaveEntry = useCallback(
    (entryData) => {
      const saved = saveEntryToStorage({
        ...entryData,
        sectionId: activeSectionId,
      })
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
    },
    [activeSectionId, activeEntryId]
  )

  const handleDeleteEntry = (entryId) => {
    const updated = deleteEntryFromStorage(entryId)
    setEntries(updated)
    if (activeEntryId === entryId) {
      setActiveEntryId(null)
      setView('section')
    }
  }

  const handleToggleFavorite = (entryId) => {
    const updated = toggleFavoriteInStorage(entryId)
    setEntries(updated)
  }

  const handleAddDomain = (newDomain) => {
    const updatedSections = saveSection(newDomain)
    setSections(updatedSections)
    setActiveSectionId(newDomain.id)
    setView('section')
  }

  const handleResetSeedData = () => {
    const restored = resetToSeedData()
    setEntries(restored)
    setSections(getSections())
  }

  const handleClearAllData = () => {
    const empty = clearAllEntries()
    setEntries(empty)
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
          />
        )}
      </AnimatePresence>

      {/* Reusable Modals */}
      <ResetConfirmModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onResetSeed={handleResetSeedData}
        onClearAll={handleClearAllData}
      />

      <NewDomainModal
        isOpen={isNewDomainModalOpen}
        onClose={() => setIsNewDomainModalOpen(false)}
        onAddDomain={handleAddDomain}
      />
    </div>
  )
}
