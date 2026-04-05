import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import appwriteService from "../appwrite/config";
import { Button, Container, PostCard } from "../components";

function UserProfile() {
    const { userId } = useParams();
    const currentUser = useSelector((state) => state.auth.userData);

    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);

    const isOwnProfile = currentUser?.$id === userId;

    useEffect(() => {
        let isMounted = true;

        const loadProfile = async () => {
            setIsLoading(true);

            try {
                const [profileResponse, postsResponse] = await Promise.all([
                    appwriteService.getProfileByUserId(userId),
                    appwriteService.getPostsByUser(userId, isOwnProfile ? null : "active"),
                ]);

                if (!isMounted) {
                    return;
                }

                setProfile(profileResponse || null);
                setPosts(postsResponse?.documents || []);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        loadProfile();

        return () => {
            isMounted = false;
        };
    }, [userId, isOwnProfile]);

    useEffect(() => {
        if (!currentUser || !userId || isOwnProfile) {
            setIsFollowing(false);
            return;
        }

        appwriteService.getFollowStatus(currentUser.$id, userId).then((status) => {
            setIsFollowing(status);
        });
    }, [currentUser, userId, isOwnProfile]);

    const handleFollowToggle = async () => {
        if (!currentUser || isOwnProfile) {
            return;
        }

        const result = await appwriteService.toggleFollow(currentUser.$id, userId);

        if (result) {
            setIsFollowing(result.status === "followed");
        }
    };

    if (isLoading) {
        return (
            <div className="py-20">
                <Container>
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"></div>
                        <p className="text-sm font-medium text-slate-500">Loading profile...</p>
                    </div>
                </Container>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="py-16">
                <Container>
                    <div className="max-w-2xl mx-auto rounded-2xl border border-slate-100 bg-white p-8 text-center shadow-sm">
                        <h1 className="text-2xl font-bold text-slate-900">Profile not found</h1>
                        <p className="mt-2 text-slate-500">
                            This member profile could not be loaded.
                        </p>
                        <Link to="/search-users" className="inline-block mt-5 text-sm font-medium text-indigo-600 hover:text-indigo-700">
                            Back to user search
                        </Link>
                    </div>
                </Container>
            </div>
        );
    }

    return (
        <div className="py-10">
            <Container>
                <div className="max-w-6xl mx-auto">
                    <section className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
                        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-2xl font-bold text-indigo-700">
                                    {profile.name?.charAt(0)?.toUpperCase() || "U"}
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-slate-900">{profile.name}</h1>
                                    <p className="mt-1 text-sm text-slate-500">
                                        {posts.length} {posts.length === 1 ? "post" : "posts"} published
                                    </p>
                                </div>
                            </div>

                            {!isOwnProfile && currentUser && (
                                <Button
                                    onClick={handleFollowToggle}
                                    bgColor={isFollowing ? "bg-slate-200" : "bg-indigo-600"}
                                    textColor={isFollowing ? "text-slate-800" : "text-white"}
                                >
                                    {isFollowing ? "Following" : "Follow Author"}
                                </Button>
                            )}
                        </div>
                    </section>

                    <section className="mt-8">
                        <div className="flex items-center justify-between gap-4 mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900">Posts by {profile.name}</h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    Browse everything this member has published so far.
                                </p>
                            </div>
                            <Link to="/search-users" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                                Search more users
                            </Link>
                        </div>

                        {posts.length === 0 ? (
                            <div className="rounded-2xl border border-slate-100 bg-white p-8 text-center shadow-sm">
                                <h3 className="text-lg font-semibold text-slate-800">No posts yet</h3>
                                <p className="mt-2 text-sm text-slate-500">
                                    {isOwnProfile
                                        ? "You have not published any active posts yet."
                                        : `${profile.name} has not published any active posts yet.`}
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {posts.map((post, index) => (
                                    <div key={post.$id} className="animate-fade-in-up" style={{ animationDelay: `${index * 80}ms` }}>
                                        <PostCard {...post} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </Container>
        </div>
    );
}

export default UserProfile;
