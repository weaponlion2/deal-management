import { useState } from 'react'
import { CssBaseline, ThemeProvider } from '@mui/material'
import { darkTheme, lightTheme } from './Theme' 
import "./global.css"
import Routes from './components/Routes'
import {  RouterProvider } from 'react-router-dom'

function App() {
  const [isDark, setIsDark] = useState<boolean>(false)
  return (
    <ThemeProvider theme={isDark ? darkTheme : lightTheme} >
      <CssBaseline />
      <RouterProvider future={{v7_startTransition: true,}} router={Routes({isDark, setIsDark() {
          setIsDark(!isDark)
      },})} />
    </ThemeProvider>
  )
}

export default App
