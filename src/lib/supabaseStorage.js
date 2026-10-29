/**
 * ============================================================================
 * ARCHITECTURAL COMPARISON: Synchronous localStorage vs. Supabase PostgreSQL
 * ============================================================================
 *
 * 1. PERSISTENCE MODEL:
 *    - localStorage: Single synchronous JSON string serialization in browser memory.
 *      `localStorage.setItem('sanctuary_entries', JSON.stringify(entries))`
 *      Pros: Instant zero-latency access, works completely offline without network.
 *      Cons: Bound strictly to one specific browser on one machine; max 5MB quota;
 *            every update re-serializes the entire array (O(N) write cost).
 *
 *    - Supabase PostgreSQL: Multi-tenant, ACID-compliant relational cloud database.
 *      `supabase.from('entries').upsert(...)`
 *      Pros: Accessible from any phone, laptop, or browser; unlimited storage;
 *            atomic row-level operations (O(1) incremental writes); indexed search.
 *      Cons: Network latency, requires asynchronous Promises and error handling.
 *
 * 2. SECURITY & DATA PRIVACY:
 *    - localStorage: Any browser extension or script running on the origin can read/write.
 *    - Supabase: Protected by PostgreSQL Row Level Security (RLS). Even with the public
 *      `anon` key exposed in frontend bundles, PostgreSQL enforces:
 *      `WHERE auth.uid() = user_id`
 *      Users can only query, modify, or delete their own learning reflections.
 *
 * 3. TRANSLATION PATTERNS:
 *    - In localStorage: `entries.filter(e => e.id !== id)` followed by full rewrite.
 *    - In Supabase: `DELETE FROM entries WHERE id = :id AND user_id = auth.uid()`
 * ============================================================================
 */

import { supabase } from './supabaseClient'
import { INITIAL_SECTIONS, generateSeedEntries } from './seedData'
import { getSections as getLocalSections, getEntries as getLocalEntries } from './storage'

// -------------------------------------------------------------
// Mapping Helpers (PostgreSQL snake_case <-> React camelCase)
// -------------------------------------------------------------

export const rowToSection = (row) => ({
  id: row.id,
  title: row.title || row.name || 'Untitled Domain',
  name: row.name || row.title || 'Untitled Domain',
  subtitle: row.subtitle || '',
  description: row.description || '',
  icon: row.icon || 'Terminal',
  accentColor: row.accent_color || '#84A59D',
  is_primary: Boolean(row.is_primary),
  categories: Array.isArray(row.categories)
    ? row.categories
    : ['DSA', 'Systems', 'Networking', 'Operating Systems', 'Databases'],
  subTopicsMap: row.subtopics_map || {},
  tags: Array.isArray(row.tags) ? row.tags : [],
  createdAt: row.created_at,
})

export const sectionToRow = (section, userId) => ({
  id: section.id,
  user_id: userId,
  title: section.title || section.name,
  name: section.name || section.title,
  subtitle: section.subtitle || '',
  description: section.description || '',
  icon: section.icon || 'Terminal',
  accent_color: section.accentColor || '#84A59D',
  is_primary: Boolean(section.is_primary),
  categories: section.categories || ['DSA', 'Systems'],
  subtopics_map: section.subTopicsMap || {},
  tags: section.tags || [],
})

export const rowToEntry = (row) => ({
  id: row.id,
  sectionId: row.section_id || 'cs',
  title: row.title || 'Untitled Reflection',
  content: row.content || '',
  category: row.category || 'DSA',
  subTopic: row.subtopic || 'General',
  subtopics: Array.isArray(row.subtopics) ? row.subtopics : [],
  tags: Array.isArray(row.tags) ? row.tags : [],
  date: row.date || new Date().toISOString().split('T')[0],
  readingTime: row.reading_time || '2 min read',
  complexity: row.complexity || null,
  takeaway: row.takeaway || '',
  preview: row.preview || '',
  isFavorite: Boolean(row.is_favorite),
  createdAt: row.created_at,
  updatedAt: row.updated_at,
})

export const entryToRow = (entry, userId) => ({
  id: entry.id,
  user_id: userId,
  section_id: entry.sectionId || 'cs',
  title: entry.title || 'Untitled Reflection',
  content: entry.content || '',
  category: entry.category || 'DSA',
  subtopic: entry.subTopic || 'General',
  subtopics: entry.subtopics || [],
  tags: entry.tags || [],
  date: entry.date || new Date().toISOString().split('T')[0],
  reading_time: entry.readingTime || '2 min read',
  complexity: entry.complexity || null,
  takeaway: entry.takeaway || '',
  preview: entry.preview || '',
  is_favorite: Boolean(entry.isFavorite),
  updated_at: new Date().toISOString(),
})

// -------------------------------------------------------------
// Cloud Sections: Asynchronous PostgreSQL queries
// -------------------------------------------------------------

/**
 * Replaces `localStorage.getItem(STORAGE_KEYS.SECTIONS)`
 * Executes: SELECT * FROM sections ORDER BY created_at ASC
 */
export const getCloudSections = async () => {
  const { data, error } = await supabase
    .from('sections')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching sections from Supabase:', error)
    throw error
  }

  return (data || []).map(rowToSection)
}

/**
 * Replaces `localStorage.setItem` for sections
 * Executes: INSERT INTO sections ... ON CONFLICT (id) DO UPDATE ...
 */
export const saveCloudSection = async (section, userId) => {
  const row = sectionToRow(section, userId)
  const { data, error } = await supabase
    .from('sections')
    .upsert(row, { onConflict: 'id' })
    .select()
    .single()

  if (error) {
    console.error('Error saving section to Supabase:', error)
    throw error
  }

  return rowToSection(data)
}

// -------------------------------------------------------------
// Cloud Entries: Asynchronous PostgreSQL queries
// -------------------------------------------------------------

/**
 * Replaces `localStorage.getItem(STORAGE_KEYS.ENTRIES)`
 * Executes: SELECT * FROM entries [WHERE section_id = :id] ORDER BY date DESC, created_at DESC
 */
export const getCloudEntries = async (sectionId = null) => {
  let query = supabase
    .from('entries')
    .select('*')
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })

  if (sectionId) {
    query = query.eq('section_id', sectionId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching entries from Supabase:', error)
    throw error
  }

  return (data || []).map(rowToEntry)
}

export const getCloudEntry = async (id) => {
  const { data, error } = await supabase
    .from('entries')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching entry from Supabase:', error)
    return null
  }

  return data ? rowToEntry(data) : null
}

/**
 * Replaces linear array findIndex and array rewrite
 * Executes: INSERT INTO entries ... ON CONFLICT (id) DO UPDATE ...
 */
export const saveCloudEntry = async (entry, userId) => {
  const row = entryToRow(entry, userId)
  const { data, error } = await supabase
    .from('entries')
    .upsert(row, { onConflict: 'id' })
    .select()
    .single()

  if (error) {
    console.error('Error saving entry to Supabase:', error)
    throw error
  }

  return rowToEntry(data)
}

/**
 * Replaces array filter and complete array re-save
 * Executes: DELETE FROM entries WHERE id = :id (enforced by RLS user_id = auth.uid())
 */
export const deleteCloudEntry = async (id) => {
  const { error } = await supabase
    .from('entries')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting entry from Supabase:', error)
    throw error
  }

  return true
}

export const toggleCloudFavorite = async (id, currentIsFavorite) => {
  const { data, error } = await supabase
    .from('entries')
    .update({ is_favorite: !currentIsFavorite })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error toggling favorite in Supabase:', error)
    throw error
  }

  return rowToEntry(data)
}

// -------------------------------------------------------------
// Auto-Seed & Local-to-Cloud Sync Operations
// -------------------------------------------------------------

/**
 * Automatically populates the user's empty cloud account with the
 * default CS section and initial 5 thoughtful DSA seed reflections.
 */
export const checkAndSeedCloudData = async (userId) => {
  try {
    const existingSections = await getCloudSections()
    if (existingSections.length > 0) {
      return false // Already has data, no seeding needed
    }

    console.log('Seeding initial CS section and DSA entries into Supabase Cloud...')

    // 1. Seed Section
    const csSection = INITIAL_SECTIONS[0]
    await saveCloudSection(csSection, userId)

    // 2. Seed Entries
    const seedEntries = generateSeedEntries()
    for (const entry of seedEntries) {
      await saveCloudEntry(entry, userId)
    }

    console.log('Successfully seeded cloud PostgreSQL database!')
    return true
  } catch (err) {
    console.error('Failed to auto-seed cloud database:', err)
    return false
  }
}

/**
 * 1-Click Sync: Migrates all reflections and domains stored in the
 * browser's localStorage up into the authenticated user's PostgreSQL database.
 */
export const syncLocalToCloud = async (userId) => {
  const localSections = getLocalSections()
  const localEntries = getLocalEntries()

  let sectionsMigrated = 0
  let entriesMigrated = 0

  for (const s of localSections) {
    await saveCloudSection(s, userId)
    sectionsMigrated++
  }

  for (const e of localEntries) {
    await saveCloudEntry(e, userId)
    entriesMigrated++
  }

  return { sectionsMigrated, entriesMigrated }
}
