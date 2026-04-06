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
    const [comments, setComments] = useState([]);
    const [newCommentText, setNewCommentText] = useState("");
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const { slug } = useParams();
    const navigate = useNavigate();

    const userData = useSelector((state) => state.auth.userData);

    const isAuthor = post && userData ? post.userId === userData.$id : false;
    const authorName = post?.authorName || fetchedAuthorName || (isAuthor && userData ? userData.name : "Unknown Author");

    useEffect(() => {
        if (slug) {
            appwriteService.getPost(slug).then((post) => {
                if (post) {
                    setPost(post);
                    appwriteService.getComments(post.$id).then(res => setComments(res));
                }
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

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newCommentText.trim() || !userData) return;

        setIsSubmittingComment(true);
        try {
            const comment = await appwriteService.addComment({
                postId: post.$id,
                userId: userData.$id,
                userName: userData.name,
                content: newCommentText.trim()
            });

            if (comment) {
                setComments([comment, ...comments]);
                setNewCommentText("");
            }
        } finally {
            setIsSubmittingComment(false);
        }
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
                                <div className="mt-2 text-sm text-slate-500 flex items-center gap-2 flex-wrap">
                                    <span>
                                        Author:{" "}
                                        <Link to={`/users/${post.userId}`} className="font-medium text-indigo-600 hover:text-indigo-700 hover:underline">
                                            {authorName}
                                        </Link>
                                    </span>
                                    <span>&bull;</span>
                                    <span>
                                        Posted: <strong className="font-medium text-slate-700">{new Date(post.$createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric'})}</strong>
                                    </span>
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
                    <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed mb-12">
                        {parse(post.content)}
                    </div>

                    <div className="border-t border-slate-200 pt-10">
                        <h2 className="text-2xl font-bold text-slate-900 mb-6">Comments ({comments.length})</h2>
                        
                        {/* Comment Input Area */}
                        <div className="mb-10 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                            {(!userData) ? (
                                <p className="text-center text-slate-500 py-4">Login to jump into the conversation!</p>
                            ) : (!isFollowing && !isAuthor) ? (
                                <div className="text-center border border-indigo-100 bg-indigo-50/50 p-6 rounded-xl">
                                    <h3 className="text-indigo-900 font-semibold mb-2">Exclusive Community</h3>
                                    <p className="text-indigo-600 text-sm">Follow {" "} <strong className="font-semibold">{authorName}</strong> {" "} to unlock commenting on their posts!</p>
                                </div>
                            ) : (
                                <form onSubmit={handleAddComment}>
                                    <textarea
                                        value={newCommentText}
                                        onChange={(e) => setNewCommentText(e.target.value)}
                                        rows="3"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none resize-none duration-200"
                                        placeholder="Share your thoughts..."
                                        disabled={isSubmittingComment}
                                    />
                                    <div className="mt-3 flex justify-end">
                                        <Button type="submit" disabled={isSubmittingComment || !newCommentText.trim()}>
                                            {isSubmittingComment ? "Posting..." : "Post Comment"}
                                        </Button>
                                    </div>
                                </form>
                            )}
                        </div>

                        {/* Comments List */}
                        <div className="space-y-6">
                            {comments.length === 0 ? (
                                <p className="text-center text-slate-500 py-6 italic">No comments yet. Be the first!</p>
                            ) : (
                                comments.map((comment) => (
                                    <div key={comment.$id} className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm animate-fade-in-up">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm shrink-0">
                                                    {comment.userName?.charAt(0)?.toUpperCase()}
                                                </div>
                                                <h4 className="font-semibold text-slate-800">{comment.userName}</h4>
                                            </div>
                                            <span className="text-xs text-slate-400 font-medium">
                                                {new Date(comment.$createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(comment.$createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <p className="text-slate-600 pl-11 text-sm leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </article>
            </Container>
        </div>
    ) : null;
}
