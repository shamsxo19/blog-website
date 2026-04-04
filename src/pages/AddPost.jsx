import React from 'react'
import { Container, PostForm } from '../components'

function AddPost() {
  return (
    <div className='py-10'>
        <Container>
            <h1 className="text-2xl font-bold text-slate-800 mb-8">Create New Post</h1>
            <PostForm />
        </Container>
    </div>
  )
}

export default AddPost