import React from 'react'
import appwriteService from "../appwrite/config"
import {Link} from 'react-router-dom'

function PostCard({$id, title, featuredImage, visibility, authorName, showAuthor = true}) {
    
  return (
    <Link to={`/post/${$id}`}>
        <div className='bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5'>
            <div className='w-full aspect-video overflow-hidden relative'>
                <img src={appwriteService.getFilePreview(featuredImage)} alt={title}
                className='w-full h-full object-cover' />
                {visibility === 'private' && (
                    <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm border border-slate-700/50">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Private
                    </div>
                )}
            </div>
            <div className='p-4'>
                <h2 className='text-base font-semibold text-slate-800 line-clamp-2 leading-tight'>{title}</h2>
                {showAuthor && authorName && (
                    <p className="mt-2 text-xs font-medium text-slate-500 truncate">By {authorName}</p>
                )}
            </div>
        </div>
    </Link>
  )
}

export default PostCard