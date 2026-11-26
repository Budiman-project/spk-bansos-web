import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { PRINT_THEME_ID, THEMES, THEME_LIST, applyTheme, loadThemeId, saveThemeId } from './themes.js'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [themeId, setThemeIdState] = useState(loadThemeId)

  useLayoutEffect(() => applyTheme(themeId), [themeId])

  // Print in the light theme, then switch back to the user's own
  useEffect(() => {
    const toPrint = () => applyTheme(PRINT_THEME_ID)
    const back = () => applyTheme(themeId)
    window.addEventListener('beforeprint', toPrint)
    window.addEventListener('afterprint', back)
    return () => {
      window.removeEventListener('beforeprint', toPrint)
      window.removeEventListener('afterprint', back)
    }
  }, [themeId])

  const setThemeId = useCallback((id) => {
    if (!(id in THEMES)) return
    saveThemeId(id)
    setThemeIdState(id)
  }, [])

  const value = useMemo(
    () => ({ theme: THEMES[themeId], themes: THEME_LIST, setThemeId }),
    [themeId, setThemeId],
  )

  return <ThemeContext value={value}>{children}</ThemeContext>
}

// eslint-disable-next-line react/only-export-components
export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>')
  return ctx
}
