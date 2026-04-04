import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import appwriteService from "../appwrite/config";
import { Button, Container } from "../components";
import parse from "html-react-parser";
import { useSelector } from "react-redux";

export default function Post() {
    const [post, setPost] = useState(null);
    const { slug } = useParams();
    const navigate = useNavigate();

    const userData = useSelector((state) => state.auth.userData);

    const isAuthor = post && userData ? post.userId === userData.$id : false;

    useEffect(() => {
        if (slug) {
            appwriteService.getPost(slug).then((post) => {
                if (post) setPost(post);
                else navigate("/");
            });
        } else navigate("/");
    }, [slug, navigate]);

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
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-slate-900">{post.title}</h1>
                    </div>
                    <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed">
                        {parse(post.content)}
                    </div>
                </article>
            </Container>
        </div>
    ) : null;
}
