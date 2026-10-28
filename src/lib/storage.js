import { INITIAL_SECTIONS, generateSeedEntries } from './seedData'

const STORAGE_KEYS = {
  THEME: 'sanctuary_theme_preference',
  SECTIONS: 'sanctuary_sections_v1',
  ENTRIES: 'sanctuary_entries_v1',
  ACTIVE_SECTION: 'sanctuary_active_section_id',
}

// -------------------------------------------------------------
// Theme Helpers
// -------------------------------------------------------------
export const getStoredTheme = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME)
    return saved === 'light' ? 'light' : 'dark' // default is dark (Cozy Obsidian)
  } catch (e) {
    return 'dark'
  }
}

export const setStoredTheme = (theme) => {
  try {
    localStorage.setItem(STORAGE_KEYS.THEME, theme)
  } catch (e) {
    console.error('Failed to save theme', e)
  }
}

// -------------------------------------------------------------
// Sections Helpers
// -------------------------------------------------------------
export const getSections = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SECTIONS)
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SECTIONS, JSON.stringify(INITIAL_SECTIONS))
      return INITIAL_SECTIONS
    }
    const parsed = JSON.parse(raw)
    return parsed && parsed.length > 0 ? parsed : INITIAL_SECTIONS
  } catch (e) {
    return INITIAL_SECTIONS
  }
}

export const saveSection = (section) => {
  const sections = getSections()
  const index = sections.findIndex((s) => s.id === section.id)
  let updated
  if (index >= 0) {
    updated = [...sections]
    updated[index] = { ...updated[index], ...section }
  } else {
    updated = [...sections, section]
  }
  localStorage.setItem(STORAGE_KEYS.SECTIONS, JSON.stringify(updated))
  return updated
}

// -------------------------------------------------------------
// Entries Helpers
// -------------------------------------------------------------
export const getEntries = (sectionId = null) => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ENTRIES)
    let entries
    if (!raw) {
      entries = generateSeedEntries()
      localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(entries))
    } else {
      entries = JSON.parse(raw)
    }

    if (sectionId) {
      return entries.filter((e) => e.sectionId === sectionId)
    }
    return entries
  } catch (e) {
    const fallback = generateSeedEntries()
    return sectionId ? fallback.filter((e) => e.sectionId === sectionId) : fallback
  }
}

export const getEntry = (id) => {
  const entries = getEntries()
  return entries.find((e) => e.id === id) || null
}

const extractPreview = (html) => {
  if (!html) return ''
  const tmp = document.createElement('div')
  tmp.innerHTML = html
  const text = tmp.textContent || tmp.innerText || ''
  return text.trim().slice(0, 180) + (text.length > 180 ? '...' : '')
}

const estimateReadingTime = (html) => {
  if (!html) return '1 min read'
  const tmp = document.createElement('div')
  tmp.innerHTML = html
  const text = tmp.textContent || tmp.innerText || ''
  const words = text.trim().split(/\s+/).filter(Boolean).length
  const minutes = Math.max(1, Math.round(words / 180))
  return `${minutes} min read`
}

export const saveEntry = (entryData) => {
  const entries = getEntries()
  const now = new Date().toISOString()
  const todayStr = now.split('T')[0]

  const existingIndex = entries.findIndex((e) => e.id === entryData.id)
  const preview = entryData.preview || extractPreview(entryData.content)
  const readingTime = estimateReadingTime(entryData.content)

  let updatedEntry
  let updatedList

  if (existingIndex >= 0) {
    updatedEntry = {
      ...entries[existingIndex],
      ...entryData,
      preview,
      readingTime,
      updatedAt: now,
    }
    updatedList = [...entries]
    updatedList[existingIndex] = updatedEntry
  } else {
    updatedEntry = {
      id: entryData.id || `entry-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      sectionId: entryData.sectionId || 'cs',
      title: entryData.title || 'Untitled Learning Reflection',
      date: entryData.date || todayStr,
      category: entryData.category || 'DSA',
      subTopic: entryData.subTopic || 'General',
      tags: entryData.tags || [],
      content: entryData.content || '',
      takeaway: entryData.takeaway || '',
      complexity: entryData.complexity || null,
      preview,
      readingTime,
      createdAt: now,
      updatedAt: now,
      isFavorite: Boolean(entryData.isFavorite),
    }
    updatedList = [updatedEntry, ...entries]
  }

  // Sort descending by date, then updatedAt
  updatedList.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))

  localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(updatedList))
  return updatedEntry
}

export const deleteEntry = (id) => {
  const entries = getEntries()
  const filtered = entries.filter((e) => e.id !== id)
  localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(filtered))
  return filtered
}

export const toggleFavorite = (id) => {
  const entries = getEntries()
  const updated = entries.map((e) => (e.id === id ? { ...e, isFavorite: !e.isFavorite } : e))
  localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(updated))
  return updated
}

export const resetToSeedData = () => {
  const seeds = generateSeedEntries()
  localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(seeds))
  localStorage.setItem(STORAGE_KEYS.SECTIONS, JSON.stringify(INITIAL_SECTIONS))
  return seeds
}

export const clearAllEntries = (sectionId = null) => {
  if (sectionId) {
    const entries = getEntries()
    const remaining = entries.filter((e) => e.sectionId !== sectionId)
    localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(remaining))
    return remaining
  } else {
    localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify([]))
    return []
  }
}

// -------------------------------------------------------------
// Analytics & Streak Calculation
// -------------------------------------------------------------
export const calculateStreak = (entries) => {
  if (!entries || entries.length === 0) {
    return { currentStreak: 0, longestStreak: 0, activeDaysCount: 0 }
  }

  const uniqueDates = Array.from(
    new Set(
      entries
        .map((e) => (e.date ? e.date.split('T')[0] : null))
        .filter(Boolean)
    )
  ).sort()

  if (uniqueDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0, activeDaysCount: 0 }
  }

  // Calculate current streak
  const today = new Date().toISOString().split('T')[0]
  const yesterdayDate = new Date()
  yesterdayDate.setDate(yesterdayDate.getDate() - 1)
  const yesterday = yesterdayDate.toISOString().split('T')[0]

  const dateSet = new Set(uniqueDates)

  let currentStreak = 0
  let checkDate = new Date()

  // If today has an entry, start from today. If not, check yesterday.
  if (dateSet.has(today)) {
    currentStreak = 1
    checkDate.setDate(checkDate.getDate() - 1)
  } else if (dateSet.has(yesterday)) {
    currentStreak = 1
    checkDate.setDate(checkDate.getDate() - 2)
  } else {
    currentStreak = 0
  }

  if (currentStreak > 0) {
    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0]
      if (dateSet.has(dateStr)) {
        currentStreak++
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        break
      }
    }
  }

  // Calculate longest streak
  let longestStreak = 0
  let tempStreak = 0
  let prevDate = null

  for (const dateStr of uniqueDates) {
    const curr = new Date(dateStr)
    if (!prevDate) {
      tempStreak = 1
    } else {
      const diffDays = Math.round((curr - prevDate) / (1000 * 60 * 60 * 24))
      if (diffDays === 1) {
        tempStreak++
      } else if (diffDays > 1) {
        tempStreak = 1
      }
    }
    if (tempStreak > longestStreak) longestStreak = tempStreak
    prevDate = curr
  }

  return {
    currentStreak,
    longestStreak: Math.max(longestStreak, currentStreak),
    activeDaysCount: uniqueDates.length,
  }
}

export const getHeatmapData = (entries, weeks = 14) => {
  const daysTotal = weeks * 7
  const entryCountByDate = {}

  entries.forEach((e) => {
    const dateStr = e.date ? e.date.split('T')[0] : null
    if (dateStr) {
      entryCountByDate[dateStr] = (entryCountByDate[dateStr] || 0) + 1
    }
  })

  const today = new Date()
  const dayOfWeek = today.getDay() // 0 = Sun, 1 = Mon...
  // Align grid to end on Saturday of current week or today
  const days = []
  
  for (let i = daysTotal - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateString = d.toISOString().split('T')[0]
    const count = entryCountByDate[dateString] || 0
    days.push({
      date: dateString,
      count,
      dayOfWeek: d.getDay(),
      month: d.toLocaleString('default', { month: 'short' }),
      dayOfMonth: d.getDate(),
    })
  }

  return days
}
