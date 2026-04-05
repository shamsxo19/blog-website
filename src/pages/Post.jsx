import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import appwriteService from "../appwrite/config";
import { Button, Container } from "../components";
import parse from "html-react-parser";
import { useSelector } from "react-redux";

export default function Post() {
    const [post, setPost] = useState(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [fetchedAuthorName, setFetchedAuthorName] = useState("");
    const { slug } = useParams();
    const navigate = useNavigate();

    const userData = useSelector((state) => state.auth.userData);

    const isAuthor = post && userData ? post.userId === userData.$id : false;
    const authorName = post?.authorName || fetchedAuthorName || (isAuthor && userData ? userData.name : "Unknown Author");

    useEffect(() => {
        if (slug) {
            appwriteService.getPost(slug).then((post) => {
                if (post) setPost(post);
                else navigate("/");
            });
        } else navigate("/");
    }, [slug, navigate]);

    useEffect(() => {
        if (post && userData && post.userId !== userData.$id) {
            appwriteService.getFollowStatus(userData.$id, post.userId).then((status) => {
                setIsFollowing(status);
            });
        }

        // Fetch missing author name if not available
        if (post && !post.authorName && !isAuthor) {
            appwriteService.getUserProfile(post.userId).then((profile) => {
                if (profile && profile.name) {
                    setFetchedAuthorName(profile.name);
                }
            });
        }
    }, [post, userData, isAuthor]);

    const deletePost = () => {
        appwriteService.deletePost(post.$id).then((status) => {
            if (status) {
                appwriteService.deleteFile(post.featuredImage);
                navigate("/");
            }
        });
    };

    return post ? (
        <div className="py-10">
            <Container>
                <article className="max-w-4xl mx-auto">
                    <div className="w-full relative rounded-2xl overflow-hidden mb-8 bg-white border border-slate-100 shadow-sm">
                        <img
                            src={appwriteService.getFilePreview(post.featuredImage)}
                            alt={post.title}
                            className="w-full max-h-[500px] object-cover"
                        />

                        {isAuthor && (
                            <div className="absolute right-4 top-4 flex gap-2">
                                <Link to={`/edit-post/${post.$id}`}>
                                    <Button bgColor="bg-emerald-600" className="shadow-lg hover:bg-emerald-700">
                                        Edit
                                    </Button>
                                </Link>
                                <Button bgColor="bg-red-600" className="shadow-lg hover:bg-red-700" onClick={deletePost}>
                                    Delete
                                </Button>
                            </div>
                        )}
                    </div>
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">{post.title}</h1>
                            {post.userId && (
                                <div className="mt-2 text-sm text-slate-500">
                                    Author:{" "}
                                    <Link to={`/users/${post.userId}`} className="font-medium text-indigo-600 hover:text-indigo-700 hover:underline">
                                        {authorName}
                                    </Link>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={async () => {
                                    if (!userData) return;
                                    const newPost = await appwriteService.toggleLike(post.$id, userData.$id, post.likes || []);
                                    if (newPost) setPost(newPost);
                                }}
                                className="flex items-center gap-2 p-2 rounded-full hover:bg-slate-100 transition-colors"
                                title={userData ? "Like Post" : "Login to like"}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill={post?.likes?.includes(userData?.$id) ? "currentColor" : "none"}
                                    stroke="currentColor"
                                    className={`w-6 h-6 ${post?.likes?.includes(userData?.$id) ? "text-red-500" : "text-slate-400"}`}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                                <span className="font-medium text-slate-600">{post?.likes?.length || 0}</span>
                            </button>

                            {userData && post.userId !== userData.$id && (
                                <button
                                    onClick={async () => {
                                        const res = await appwriteService.toggleFollow(userData.$id, post.userId);
                                        if (res) {
                                            setIsFollowing(res.status === "followed");
                                        }
                                    }}
                                    className={`px-4 py-2 border rounded-full text-sm font-semibold transition-colors ${isFollowing
                                            ? "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200"
                                            : "bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-100"
                                        }`}
                                >
                                    {isFollowing ? "Following" : "Follow Author"}
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed">
                        {parse(post.content)}
                    </div>
                </article>
            </Container>
        </div>
    ) : null;
}
