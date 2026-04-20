import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import appwriteService from "../appwrite/config";
import { Button, Container, PostCard, Input } from "../components";

function UserProfile() {
    const { userId } = useParams();
    const currentUser = useSelector((state) => state.auth.userData);

    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followerCount, setFollowerCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);

    const [modalType, setModalType] = useState(null); // 'followers' or 'following' or null
    const [modalUsersList, setModalUsersList] = useState([]);
    const [isModalLoading, setIsModalLoading] = useState(false);

    const [isEditing, setIsEditing] = useState(false);
    const [editAboutMe, setEditAboutMe] = useState("");
    const [editProfilePicFile, setEditProfilePicFile] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    const isOwnProfile = currentUser?.$id === userId;

    useEffect(() => {
        let isMounted = true;

        const loadProfile = async () => {
            setIsLoading(true);

            try {
                let currentIsFollowing = false;
                if (currentUser && !isOwnProfile) {
                    currentIsFollowing = await appwriteService.getFollowStatus(currentUser.$id, userId);
                    setIsFollowing(currentIsFollowing);
                }

                const [profileResponse, postsResponse, followerCountResponse, followingCountResp] = await Promise.all([
                    appwriteService.getProfileByUserId(userId),
                    appwriteService.getPostsByUser(userId, isOwnProfile ? null : "active", currentIsFollowing),
                    appwriteService.getFollowerCount(userId),
                    appwriteService.getFollowingCount(userId)
                ]);

                if (!isMounted) {
                    return;
                }

                setProfile(profileResponse || null);
                setPosts(postsResponse?.documents || []);
                setFollowerCount(followerCountResponse || 0);
                setFollowingCount(followingCountResp || 0);

                if (profileResponse) {
                    setEditAboutMe(profileResponse.aboutMe || "");
                }
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

    // isFollowing is now handled inside loadProfile

    const handleFollowToggle = async () => {
        if (!currentUser || isOwnProfile) {
            return;
        }

        const result = await appwriteService.toggleFollow(currentUser.$id, userId);

        if (result) {
            const nowFollowing = result.status === "followed";
            setIsFollowing(nowFollowing);
            setFollowerCount(prev => nowFollowing ? prev + 1 : prev - 1);
        }
    };

    const handleSaveProfile = async () => {
        setIsSaving(true);
        try {
            let fileId = profile.profilePic;

            if (editProfilePicFile) {
                const file = await appwriteService.uploadFile(editProfilePicFile);
                if (file) {
                    fileId = file.$id;
                }
            }

            const updatedProfile = await appwriteService.updateProfile(profile.$id, {
                aboutMe: editAboutMe,
                profilePic: fileId
            });

            if (updatedProfile) {
                setProfile(updatedProfile);
                setIsEditing(false);
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleOpenModal = async (type) => {
        setModalType(type);
        setIsModalLoading(true);
        setModalUsersList([]);

        try {
            let list = [];
            if (type === "followers") {
                list = await appwriteService.getFollowersList(userId);
            } else if (type === "following") {
                list = await appwriteService.getFollowingList(userId);
            }
            setModalUsersList(list);
        } finally {
            setIsModalLoading(false);
        }
    };

    const handleCloseModal = () => {
        setModalType(null);
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
                        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                                <div className="flex h-24 w-24 shrink-0 overflow-hidden rounded-full bg-indigo-100 text-4xl font-bold text-indigo-700 items-center justify-center border-4 border-white shadow-md">
                                    {profile.profilePic ? (
                                        <img 
                                            src={appwriteService.getFilePreview(profile.profilePic)} 
                                            alt={profile.name} 
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        profile.name?.charAt(0)?.toUpperCase() || "U"
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h1 className="text-3xl font-bold text-slate-900">{profile.name}</h1>
                                    <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-600 font-medium">
                                        <span><strong className="text-slate-900">{posts.length}</strong> {posts.length === 1 ? "post" : "posts"}</span>
                                        <span>&bull;</span>
                                        <button onClick={() => handleOpenModal('followers')} className="hover:text-indigo-600 transition-colors">
                                            <strong className="text-slate-900">{followerCount}</strong> {followerCount === 1 ? "follower" : "followers"}
                                        </button>
                                        <span>&bull;</span>
                                        <button onClick={() => handleOpenModal('following')} className="hover:text-indigo-600 transition-colors">
                                            <strong className="text-slate-900">{followingCount}</strong> following
                                        </button>
                                    </div>
                                    {!isEditing && profile.aboutMe && (
                                        <p className="mt-4 text-slate-600 max-w-lg leading-relaxed">{profile.aboutMe}</p>
                                    )}
                                </div>
                            </div>

                            <div className="shrink-0 flex gap-3">
                                {isOwnProfile && currentUser && !isEditing && (
                                    <Button onClick={() => setIsEditing(true)} bgColor="bg-slate-100 hover:bg-slate-200" textColor="text-slate-700">
                                        Edit Profile
                                    </Button>
                                )}
                                {!isOwnProfile && currentUser && (
                                    <Button
                                        onClick={handleFollowToggle}
                                        bgColor={isFollowing ? "bg-slate-200 hover:bg-slate-300" : "bg-indigo-600 hover:bg-indigo-700"}
                                        textColor={isFollowing ? "text-slate-800" : "text-white"}
                                    >
                                        {isFollowing ? "Following" : "Follow Author"}
                                    </Button>
                                )}
                            </div>
                        </div>

                        {isEditing && (
                            <div className="mt-8 border-t border-slate-100 pt-6 animate-fade-in-up">
                                <h3 className="text-lg font-bold text-slate-900 mb-4">Edit Profile</h3>
                                <div className="space-y-4 max-w-lg">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Profile Picture</label>
                                        <Input
                                            type="file"
                                            accept="image/png, image/jpg, image/jpeg, image/gif"
                                            onChange={(e) => setEditProfilePicFile(e.target.files[0])}
                                            className="w-full"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">About Me</label>
                                        <textarea
                                            value={editAboutMe}
                                            onChange={(e) => setEditAboutMe(e.target.value)}
                                            rows="4"
                                            className="w-full px-4 py-2 rounded-xl outline-none border focus:border-blue-500 duration-200 bg-white border-gray-200 text-black resize-none"
                                            placeholder="Tell us a little bit about yourself..."
                                        />
                                    </div>
                                    <div className="flex items-center gap-3 pt-2">
                                        <Button onClick={handleSaveProfile} disabled={isSaving}>
                                            {isSaving ? "Saving..." : "Save Changes"}
                                        </Button>
                                        <Button onClick={() => setIsEditing(false)} bgColor="bg-slate-100" textColor="text-slate-700" disabled={isSaving}>
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
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

            {/* Modal Overlay */}
            {modalType && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4" onClick={handleCloseModal}>
                    <div 
                        className="w-full max-w-md max-h-[80vh] flex flex-col bg-white rounded-3xl shadow-xl overflow-hidden animate-fade-in-up"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between p-5 border-b border-slate-100">
                            <h2 className="text-xl font-bold text-slate-900 capitalize">{modalType}</h2>
                            <button onClick={handleCloseModal} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>
                        
                        <div className="overflow-y-auto p-5 grow">
                            {isModalLoading ? (
                                <div className="py-10 text-center text-slate-500">Loading {modalType}...</div>
                            ) : modalUsersList.length === 0 ? (
                                <div className="py-10 text-center text-slate-500">No {modalType} yet.</div>
                            ) : (
                                <div className="space-y-3">
                                    {modalUsersList.map((usr) => (
                                        <Link 
                                            key={usr.$id} 
                                            to={`/users/${usr.userId}`} 
                                            onClick={handleCloseModal}
                                            className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors"
                                        >
                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-lg font-bold text-indigo-700 overflow-hidden">
                                                {usr.profilePic ? (
                                                    <img src={appwriteService.getFilePreview(usr.profilePic)} alt={usr.name} className="h-full w-full object-cover" />
                                                ) : usr.name?.charAt(0)?.toUpperCase()}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-slate-900">{usr.name}</h3>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default UserProfile;
