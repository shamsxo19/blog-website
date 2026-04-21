import React from 'react'
import appwriteService from "../appwrite/config"
import {Link} from 'react-router-dom'

function PostCard({$id, title, featuredImage, visibility, authorName, showAuthor = true}) {

  return (
    <Link to={`/post/${$id}`} className="block group">
        <div className="bg-white rounded-2xl shadow-md border border-slate-100/80 overflow-hidden
                        transition-all duration-300 ease-out
                        hover:shadow-xl hover:shadow-indigo-100/40 hover:scale-[1.02] hover:-translate-y-1">

            {/* Image Section */}
            <div className="w-full aspect-[16/10] overflow-hidden relative">
                <img
                    src={appwriteService.getFilePreview(featuredImage)}
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                />

                {/* Gradient overlay at bottom for depth */}
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />

                {/* Visibility badge */}
                {visibility === 'private' && (
                    <div className="absolute top-3 left-3 bg-slate-900/75 backdrop-blur-lg text-white text-[11px] font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg border border-white/10">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Private
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className="p-5">
                <h2 className="text-lg font-bold text-slate-900 line-clamp-2 leading-snug tracking-tight group-hover:text-indigo-700 transition-colors duration-300">
                    {title}
                </h2>

                {showAuthor && authorName && (
                    <>
                        <div className="mt-3 border-t border-slate-100" />
                        <div className="mt-3 flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0">
                                {authorName.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm font-medium text-slate-500 truncate">{authorName}</span>
                        </div>
                    </>
                )}

                {/* Interaction hints row */}
                <div className="mt-4 flex items-center gap-4 text-slate-400">
                    <div className="flex items-center gap-1.5 text-xs font-medium">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        Like
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-medium">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        Comment
                    </div>
                </div>
            </div>
        </div>
    </Link>
  )
}

export default PostCard