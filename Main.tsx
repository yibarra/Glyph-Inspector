import { useCallback, useEffect } from 'react'

import Form from '../components/Form'
import MenuContext from '../components/MenuContext'

import Footer from './Footer'
import Canvas from './Canvas'
import Header from './Header'
import { UseMainContext } from '../contexts/Main'
import { UseGridContext } from '../contexts/Grid'

const Main = () => {
  const { isMobile } = UseMainContext()
  const { setPoints } = UseGridContext()

  const clearPoints = useCallback(() => {
    setPoints([])
  }, [setPoints])

  // clear points
  useEffect(() => {
    if (!isMobile) {
      return
    }

    const handleVisibility = (event: Event) => {
      if (document.visibilityState === 'hidden' || event.type === 'freeze') {
        clearPoints()
      }
    }

    // attach listeners
    window.addEventListener('pagehide', clearPoints)
    document.addEventListener('visibilitychange', handleVisibility)
    document.addEventListener('freeze', handleVisibility)

    // detach listeners
    return () => {
      window.removeEventListener('pagehide', clearPoints)
      document.removeEventListener('visibilitychange', handleVisibility)
      document.removeEventListener('freeze', handleVisibility)
    }
  }, [isMobile, clearPoints])

  return (
    <>
      {isMobile ? (
        <Canvas />
      ) : (
        <MenuContext menuItems={<Form.Letter />}>
          <Canvas />
        </MenuContext>
      )}

      <Footer />
      <Header />
    </>
  )
}

Main.displayName = 'Layout.Main'
export default Main