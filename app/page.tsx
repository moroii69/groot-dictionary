"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { Search, Moon, Sun, Shuffle, ArrowUp } from "lucide-react"

interface Translation {
  id: number
  text: string
}

// Fallback alien translations for when JSON fails to load
const FALLBACK_TRANSLATIONS = [
  "Zephyrian consciousness seeks temporal equilibrium.",
  "The quantum squirrel has appropriated my sustenance cube.",
  "Your bio-electromagnetic field experiences processing delays.",
  "Caffeine synthesis required for optimal neural function.",
  "Cosmic forces conspire against data transmission protocols.",
  "My photosynthetic companion evaluates my existence parameters.",
  "Territorial attachment to this spatial coordinate intensifies.",
  "The void acknowledges my presence with courteous reciprocity.",
  "Peak procrastination algorithms have been successfully executed.",
  "My textile foot coverings harbor trust-related anomalies.",
]

export default function Component() {
  const [entries, setEntries] = useState<Translation[]>([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)

  const observerRef = useRef<HTMLDivElement>(null)
  const [translations, setTranslations] = useState<string[]>([])

  // Memoized filtered entries for performance with large datasets
  const filteredEntries = useMemo(() => {
    if (searchTerm.trim() === "") {
      return entries
    }
    return entries.filter((entry) => entry.text.toLowerCase().includes(searchTerm.toLowerCase()))
  }, [entries, searchTerm])

  // Load translations with better error handling
  useEffect(() => {
    const loadTranslations = async () => {
      try {
        // Try to load from JSON file first
        const response = await fetch("/data/translations.json")
        if (!response.ok) {
          throw new Error("Failed to fetch translations")
        }
        const text = await response.text()

        // Check if response is actually JSON
        if (text.trim().startsWith("<!DOCTYPE") || text.trim().startsWith("<html")) {
          throw new Error("Received HTML instead of JSON")
        }

        const data = JSON.parse(text)
        const loadedTranslations = data.grootTranslations || []

        if (loadedTranslations.length === 0) {
          throw new Error("No translations in JSON file")
        }

        setTranslations(loadedTranslations)
      } catch (error) {
        console.warn("Failed to load translations from JSON, using fallback:", error)
        // Use fallback translations
        setTranslations(FALLBACK_TRANSLATIONS)
      }
    }
    loadTranslations()
  }, [])

  // Dark mode persistence
  useEffect(() => {
    const saved = localStorage.getItem("groot-dark-mode")
    if (saved) {
      setDarkMode(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("groot-dark-mode", JSON.stringify(darkMode))
    document.documentElement.classList.toggle("dark", darkMode)
  }, [darkMode])

  // Scroll tracking
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Optimized loading for large datasets
  const loadMoreEntries = useCallback(() => {
    if (loading || !hasMore || translations.length === 0) return

    setLoading(true)

    // Use requestAnimationFrame for better performance
    requestAnimationFrame(() => {
      setTimeout(() => {
        const entriesPerPage = 10
        const startIndex = currentPage * entriesPerPage
        const newEntries: Translation[] = []

        for (let i = 0; i < entriesPerPage; i++) {
          const translationIndex = (startIndex + i) % translations.length
          const entryId = startIndex + i

          newEntries.push({
            id: entryId,
            text: translations[translationIndex],
          })
        }

        setEntries((prev) => [...prev, ...newEntries])
        setCurrentPage((prev) => prev + 1)
        setLoading(false)

        // For very large datasets, we can continue loading indefinitely
        // Stop only if we've loaded a reasonable amount for demo purposes
        if (entries.length + newEntries.length >= translations.length * 20) {
          setHasMore(false)
        }
      }, 150) // Reduced timeout for better UX
    })
  }, [currentPage, loading, hasMore, translations, entries.length])

  // Initial load
  useEffect(() => {
    if (translations.length > 0 && entries.length === 0) {
      loadMoreEntries()
    }
  }, [translations, entries.length, loadMoreEntries])

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMoreEntries()
        }
      },
      { threshold: 0.1, rootMargin: "100px" }, // Added rootMargin for earlier loading
    )

    const currentRef = observerRef.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [hasMore, loading, loadMoreEntries])

  const getRandomDefinition = useCallback(() => {
    if (filteredEntries.length === 0) return
    const randomIndex = Math.floor(Math.random() * filteredEntries.length)
    const element = document.getElementById(`entry-${filteredEntries[randomIndex].id}`)
    element?.scrollIntoView({ behavior: "smooth", block: "center" })
  }, [filteredEntries])

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

  const toggleDarkMode = useCallback(() => {
    setDarkMode((prev) => !prev)
  }, [])

  if (translations.length === 0 && entries.length === 0) {
    return (
      <div className="min-h-screen relative">
        {/* Background */}
        <div className="fixed inset-0 bg-vintage-light dark:bg-vintage-dark">
          <div className="ghibli-background"></div>
          <div className="grain-overlay"></div>
        </div>

        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md mx-auto px-6">
            <h1 className="text-2xl font-argent text-vintage-text-dark dark:text-vintage-text-light mb-4">
              The Groot Dictionary
            </h1>
            <p className="text-vintage-text-muted dark:text-vintage-text-muted-dark text-sm leading-relaxed">
              Loading translations...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen relative ${darkMode ? "dark" : ""}`}>
      {/* Background */}
      <div className="fixed inset-0 bg-vintage-light dark:bg-vintage-dark">
        <div className="ghibli-background"></div>
        <div className="grain-overlay"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-16">
        {/* Header */}
        <header className="text-center mb-16 border-b border-vintage-border dark:border-vintage-border-dark pb-8">
          <h1 className="text-5xl font-argent text-vintage-text-dark dark:text-vintage-text-light mb-4 tracking-tight">
            The Groot Dictionary
          </h1>
          <p className="text-vintage-text-muted dark:text-vintage-text-muted-dark text-lg font-light">
            A comprehensive lexicon of Groot translations
          </p>
          <div className="mt-6 text-sm text-vintage-text-muted dark:text-vintage-text-muted-dark">
            Est. 2014
          </div>
<div className="mt-2 text-sm text-vintage-text-muted dark:text-vintage-text-muted-dark sway">
  ⸙⸝ⴰⴶⴷ ⴱ⸝ⴼⵔⵙ ⴰⵏ ⴲⵎⴶⴷ
</div>

        </header>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-12 pb-6 border-b border-vintage-border-light dark:border-vintage-border-dark">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-vintage-text-muted dark:text-vintage-text-muted-dark" />
            <input
              type="text"
              placeholder="Search definitions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-vintage-paper dark:bg-vintage-paper-dark border border-vintage-border dark:border-vintage-border-dark text-vintage-text-dark dark:text-vintage-text-light placeholder-vintage-text-muted font-argent focus:outline-none focus:border-vintage-text-dark dark:focus:border-vintage-text-light transition-colors"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={getRandomDefinition}
              className="flex items-center gap-2 px-4 py-2 text-sm font-argent text-vintage-text-dark dark:text-vintage-text-light border border-vintage-border dark:border-vintage-border-dark bg-vintage-paper dark:bg-vintage-paper-dark hover:bg-vintage-paper-hover dark:hover:bg-vintage-paper-hover-dark transition-colors"
            >
              <Shuffle className="w-4 h-4" />
              Random
            </button>

            <button
              onClick={toggleDarkMode}
              className="p-2 text-vintage-text-dark dark:text-vintage-text-light border border-vintage-border dark:border-vintage-border-dark bg-vintage-paper dark:bg-vintage-paper-dark hover:bg-vintage-paper-hover dark:hover:bg-vintage-paper-hover-dark transition-colors"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Results Info */}
        {searchTerm && (
          <div className="mb-8 text-sm text-vintage-text-muted dark:text-vintage-text-muted-dark font-argent">
            {filteredEntries.length} result{filteredEntries.length !== 1 ? "s" : ""} for "{searchTerm}"
          </div>
        )}

        {/* Entries */}
        <div className="space-y-8">
          {filteredEntries.map((entry, index) => (
            <article
              key={entry.id}
              id={`entry-${entry.id}`}
              className="border-b border-vintage-border-light dark:border-vintage-border-dark pb-8 last:border-b-0"
            >
              <div className="mb-3">
                <h2 className="text-2xl font-argent text-vintage-text-dark dark:text-vintage-text-light font-bold">
                  I am Groot
                </h2>
              </div>

              <div className="text-sm text-vintage-text-muted dark:text-vintage-text-muted-dark mb-2 font-argent">
                /aɪ æm ɡruːt/ • <em>phrase</em> • <em>Galactic Standard</em>
              </div>

              <p className="text-vintage-text-dark dark:text-vintage-text-light leading-relaxed font-argent font-light">
                {entry.text}
              </p>
            </article>
          ))}
        </div>

        {/* Loading indicator */}
        {loading && (
          <div className="text-center mt-12">
            <div className="inline-flex items-center gap-2 text-vintage-text-muted dark:text-vintage-text-muted-dark">
              <div className="w-4 h-4 border border-vintage-border dark:border-vintage-border-dark border-t-vintage-text-dark dark:border-t-vintage-text-light rounded-full animate-spin"></div>
              <span className="text-sm font-argent">Loading more definitions...</span>
            </div>
          </div>
        )}

        {/* Intersection observer target */}
        <div ref={observerRef} className="h-4 mt-8" />

        {/* End message */}
        {!hasMore && entries.length > 0 && (
          <div className="text-center mt-12 pt-8 border-t border-vintage-border dark:border-vintage-border-dark">
            <p className="text-vintage-text-muted dark:text-vintage-text-muted-dark text-sm font-argent">
              End of dictionary
            </p>
          </div>
        )}
      </div>

      {/* Scroll to top button - Fixed positioning */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 p-3 bg-vintage-paper dark:bg-vintage-paper-dark border border-vintage-border dark:border-vintage-border-dark text-vintage-text-dark dark:text-vintage-text-light shadow-lg hover:shadow-xl transition-all"
          style={{ position: "fixed" }}
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  )
}
