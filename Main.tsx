import { useEffect } from 'react'

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

  useEffect(() => {
    if (!isMobile) {
      return
    }

    const clear = () => setPoints([])

    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') clear()
    }

    window.addEventListener('pagehide', clear)
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      window.removeEventListener('pagehide', clear)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [])

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