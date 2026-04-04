import React from 'react'
import appwriteService from "../appwrite/config"
import {Link} from 'react-router-dom'

function PostCard({$id, title, featuredImage}) {
    
  return (
    <Link to={`/post/${$id}`}>
        <div className='bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5'>
            <div className='w-full aspect-video overflow-hidden'>
                <img src={appwriteService.getFilePreview(featuredImage)} alt={title}
                className='w-full h-full object-cover' />
            </div>
            <div className='p-4'>
                <h2 className='text-base font-semibold text-slate-800 line-clamp-2'>{title}</h2>
            </div>
        </div>
    </Link>
  )
}

export default PostCard