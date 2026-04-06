import React, {useState, useEffect} from 'react'
import { Container, PostCard } from '../components'
import { Link } from 'react-router-dom';
import appwriteService from "../appwrite/config";
import { useSelector } from 'react-redux';

function AllPosts() {
    const [posts, setPosts] = useState([])
    const userData = useSelector((state) => state.auth.userData)

    useEffect(() => {
        if (userData) {
            appwriteService.getPosts([]).then((response) => {
                if (response) {
                    const myPosts = response.documents.filter(post => post.userId === userData.$id);
                    setPosts(myPosts);
                }
            })
        } else {
            setPosts([]);
        }
    }, [userData])

  return (
    <div className='w-full py-10'>
        <Container>
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 mb-8 animate-fade-in-up">My Posts</h1>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
                {posts.length === 0 && (
                    <div className="col-span-full text-center py-12 animate-fade-in-up">
                        <Link to="/add-post" className="block w-full max-w-sm mx-auto p-6 rounded-3xl border-2 border-dashed border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50 transition-colors cursor-pointer group">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-indigo-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                            </div>
                            <p className="text-xl font-medium text-slate-700 group-hover:text-indigo-700 transition-colors">You have no posts yet.</p>
                            <p className="text-sm text-slate-500 mt-2">Click here to create your first post!</p>
                        </Link>
                    </div>
                )}
                {posts.map((post, index) => (
                    <div key={post.$id} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                        <PostCard {...post} />
                    </div>
                ))}
            </div>
        </Container>
    </div>
  )
}

export default AllPosts