import React, {useEffect, useState} from 'react'
import appwriteService from "../appwrite/config";
import {Container, PostCard} from '../components'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom';

function Home() {
    const [posts, setPosts] = useState([])
    const authStatus = useSelector((state) => state.auth.status)
    const userData = useSelector((state) => state.auth.userData)

    useEffect(() => {
        if (!authStatus) return; // Wait until auth state is resolved
        const currentUserId = authStatus ? userData?.$id : null;
        if (currentUserId) {
            appwriteService.getFollowingFeedPosts(currentUserId).then((postsResponse) => {
                if (postsResponse) {
                    setPosts(postsResponse.documents);
                }
            });
        }
    }, [authStatus, userData?.$id]);
  
    if (posts.length === 0) {
        return (
            <div className="w-full py-20 text-center">
                <Container>
                    <div className="max-w-md mx-auto">
                        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-slate-100 flex items-center justify-center">
                            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-slate-800 mb-2">
                            {!authStatus ? "Welcome to PostNest" : "Your feed is empty"}
                        </h1>
                        <p className="text-slate-500 mb-6">
                            {!authStatus ? "Login to start reading and writing posts." : "Follow amazing authors to build your personalized feed."}
                        </p>
                        {authStatus && (
                            <Link to="/explore" className="inline-block px-6 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors shadow-sm">
                                Explore Public Posts
                            </Link>
                        )}
                    </div>
                </Container>
            </div>
        )
    }
    return (
        <div className='w-full py-10'>
            <Container>
                <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 mb-8 animate-fade-in-up">Recent Posts</h1>
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
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

export default Home