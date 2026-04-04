import React, { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import './App.css'
import authService from "./appwrite/auth"
import {login, logout} from "./store/authSlice"
import { Footer, Header } from './components'
import { Outlet } from 'react-router-dom'

function App() {
  const [loading, setLoading] = useState(true)
  const dispatch = useDispatch()

  useEffect(() => {
    authService.getCurrentUser()
    .then((userData) => {
      if (userData) {
        dispatch(login({userData}))
      } else {
        dispatch(logout())
      }
    })
    .finally(() => setLoading(false))
  }, [])
  
  return !loading ? (
    <div className='min-h-screen flex flex-col bg-slate-50 relative selection:bg-indigo-100 selection:text-indigo-900'>
      {/* Decorative ambient background */}
      <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-indigo-50 to-transparent pointer-events-none" />
      
      <Header />
      <main className='flex-grow'>
        <Outlet />
      </main>
      <Footer />
    </div>
  ) : (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"></div>
        <p className="text-slate-500 text-sm font-medium">Loading...</p>
      </div>
    </div>
  )
}

export default App
