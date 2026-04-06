import React from 'react'

function Logo({width = '100px'}) {
  return (
    <div style={{width}} className="flex items-center">
      <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 tracking-tight">
        Post<span className="text-slate-400 font-bold">Nest</span>
      </span>
    </div>
  )
}

export default Logo