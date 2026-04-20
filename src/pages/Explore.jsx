import React, { useEffect, useState, useCallback } from 'react';
import appwriteService from '../appwrite/config';
import { Container, PostCard } from '../components';

function Explore() {
    const [posts, setPosts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('latest'); // 'latest' or 'search'

    // Load public posts on mount
    useEffect(() => {
        setIsLoading(true);
        appwriteService.getPublicPosts(30).then((res) => {
            if (res) setPosts(res.documents);
            setIsLoading(false);
        });
    }, []);

    // Debounced search
    useEffect(() => {
        if (!searchQuery.trim()) {
            if (activeTab === 'search') {
                setActiveTab('latest');
                setIsLoading(true);
                appwriteService.getPublicPosts(30).then((res) => {
                    if (res) setPosts(res.documents);
                    setIsLoading(false);
                });
            }
            return;
        }

        setActiveTab('search');
        setIsSearching(true);

        const timer = setTimeout(() => {
            appwriteService.searchPostsByTitle(searchQuery).then((res) => {
                if (res) setPosts(res.documents);
                setIsSearching(false);
            });
        }, 400);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleClearSearch = () => {
        setSearchQuery('');
    };

    return (
        <div className="w-full py-10">
            <Container>
                {/* Hero Section */}
                <div className="text-center mb-10 animate-fade-in-up">
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 mb-3">
                        Explore PostNest
                    </h1>
                    <p className="text-slate-500 text-lg max-w-xl mx-auto">
                        Discover amazing posts from creators across the community
                    </p>
                </div>

                {/* Search Bar */}
                <div className="max-w-2xl mx-auto mb-10 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur-sm -z-10 scale-[1.02]"></div>
                        <div className="relative flex items-center bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-300 group-focus-within:border-transparent group-focus-within:shadow-lg">
                            {/* Search Icon */}
                            <div className="pl-5 pr-2 text-slate-400">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search posts by title..."
                                className="w-full py-4 px-2 text-slate-800 placeholder:text-slate-400 outline-none bg-transparent text-base"
                                id="explore-search-input"
                            />
                            {searchQuery && (
                                <button
                                    onClick={handleClearSearch}
                                    className="pr-4 pl-2 text-slate-400 hover:text-slate-600 transition-colors"
                                    title="Clear search"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                            {isSearching && (
                                <div className="pr-4">
                                    <div className="w-5 h-5 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tab Indicator */}
                <div className="flex items-center gap-3 mb-8 animate-fade-in-up" style={{ animationDelay: '150ms' }}>
                    {activeTab === 'search' ? (
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-50 text-violet-700 text-sm font-medium border border-violet-100">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                Results for "{searchQuery}"
                            </span>
                            <span className="text-sm text-slate-400">{posts.length} {posts.length === 1 ? 'post' : 'posts'} found</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium border border-indigo-100">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                                Latest Public Posts
                            </span>
                        </div>
                    )}
                </div>

                {/* Loading State */}
                {isLoading ? (
                    <div className="flex flex-col items-center gap-3 py-20">
                        <div className="w-10 h-10 border-3 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
                        <p className="text-sm font-medium text-slate-500">Loading posts...</p>
                    </div>
                ) : posts.length === 0 ? (
                    /* Empty State */
                    <div className="text-center py-16 animate-fade-in-up">
                        <div className="max-w-sm mx-auto">
                            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center">
                                {activeTab === 'search' ? (
                                    <svg className="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                ) : (
                                    <svg className="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                    </svg>
                                )}
                            </div>
                            <h2 className="text-xl font-bold text-slate-800 mb-2">
                                {activeTab === 'search' ? 'No posts found' : 'No public posts yet'}
                            </h2>
                            <p className="text-slate-500">
                                {activeTab === 'search'
                                    ? `We couldn't find any posts matching "${searchQuery}". Try a different search term.`
                                    : 'Be the first to create a public post for the community!'}
                            </p>
                        </div>
                    </div>
                ) : (
                    /* Posts Grid */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {posts.map((post, index) => (
                            <div key={post.$id} className="animate-fade-in-up" style={{ animationDelay: `${index * 80}ms` }}>
                                <PostCard {...post} />
                            </div>
                        ))}
                    </div>
                )}
            </Container>
        </div>
    );
}

export default Explore;
