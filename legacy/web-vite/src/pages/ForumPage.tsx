import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { ArrowLeft, MessageSquare, ThumbsUp, User } from "lucide-react";

type Comment = {
    _id: string; // MongoDB Id
    author: string;
    text: string;
    timestamp: string;
};

type Post = {
    _id: string; // MongoDB Id
    author: string;
    title: string;
    content: string;
    likes: number;
    comments: Comment[];
    createdAt: string;
    tag: string;
};

export default function ForumPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [newPostTitle, setNewPostTitle] = useState("");
    const [newPostContent, setNewPostContent] = useState("");
    const [showNewPost, setShowNewPost] = useState(false);
    const [language, setLanguage] = useState<"en" | "gu">("en");

    // Fetch posts from backend
    const fetchPosts = async () => {
        try {
            const rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const API_URL = rawUrl.replace(/\/$/, '');
            const res = await fetch(`${API_URL}/api/forum`);
            const data = await res.json();
            setPosts(data);
        } catch (error) {
            console.error("Failed to fetch posts:", error);
            // Fallback Mock Data
            setPosts([
                {
                    _id: "demo1",
                    author: "Demo User",
                    title: "Best time to sow Wheat? (Demo)",
                    content: "Can anyone suggest the best week in November for sowing wheat in Punjab?",
                    tag: "Farming",
                    likes: 12,
                    comments: [],
                    createdAt: new Date().toISOString()
                }
            ]);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const handleLike = async (id: string) => {
        try {
            const rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const API_URL = rawUrl.replace(/\/$/, '');
            await fetch(`${API_URL}/api/forum/${id}/like`, { method: "POST" });
            fetchPosts(); // Refresh
        } catch (error) {
            console.error("Failed to like post:", error);
        }
    };

    const handleCreatePost = async () => {
        if (!newPostTitle.trim() || !newPostContent.trim()) return;

        try {
            const rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const API_URL = rawUrl.replace(/\/$/, '');
            await fetch(`${API_URL}/api/forum`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    author: "Kisan User", // Mock user name
                    title: newPostTitle,
                    content: newPostContent,
                    tag: "General"
                }),
            });
            setNewPostTitle("");
            setNewPostContent("");
            setShowNewPost(false);
            fetchPosts();
        } catch (error) {
            console.error("Failed to create post:", error);
        }
    };

    return (
        <div className="min-h-screen bg-green-50 p-4 font-sans pb-24">
            <div className="max-w-md mx-auto space-y-4">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Link to="/">
                            <Button variant="ghost" size="icon" className="hover:bg-green-100">
                                <ArrowLeft className="w-5 h-5 text-green-700" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-green-800">
                                {language === 'en' ? 'Kisan Forum' : 'કિસાન ફોરમ'}
                            </h1>
                            <p className="text-xs text-green-600">
                                {language === 'en' ? 'Community for Farmers' : 'ખેડૂતોનો સમુદાય'}
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setLanguage(language === "en" ? "gu" : "en")}
                        className="bg-white text-green-700 border-green-200"
                    >
                        {language === "en" ? "ગુજરાતી" : "English"}
                    </Button>
                </div>

                {/* Create Post Button */}
                {!showNewPost ? (
                    <Card
                        className="border-green-200 bg-white cursor-pointer hover:shadow-md transition-all"
                        onClick={() => setShowNewPost(true)}
                    >
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                <User className="w-6 h-6" />
                            </div>
                            <div className="flex-1 bg-gray-100 rounded-full h-10 flex items-center px-4 text-gray-500 text-sm">
                                {language === 'en' ? 'Ask a question or share a tip...' : 'કોઈ પ્રશ્ન પૂછો અથવા ટીપ શેર કરો...'}
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="border-green-200 shadow-md animate-in slide-in-from-top-2">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base text-green-800">New Post</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Input
                                placeholder="Title (e.g., Best crop for June?)"
                                value={newPostTitle}
                                onChange={(e) => setNewPostTitle(e.target.value)}
                            />
                            <Textarea
                                placeholder="Describe your question..."
                                value={newPostContent}
                                onChange={(e) => setNewPostContent(e.target.value)}
                            />
                            <div className="flex justify-end gap-2">
                                <Button variant="ghost" onClick={() => setShowNewPost(false)}>Cancel</Button>
                                <Button className="bg-green-600 hover:bg-green-700" onClick={handleCreatePost}>Post</Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Posts Feed */}
                <div className="space-y-4">
                    {posts.length === 0 && (
                        <div className="text-center text-gray-500 py-10">
                            No posts yet. Be the first to ask!
                        </div>
                    )}
                    {posts.map((post) => (
                        <Card key={post._id} className="border-green-100 shadow-sm">
                            <CardContent className="p-4">
                                {/* Post Header */}
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs">
                                            {post.author[0]}
                                        </div>
                                        <div>
                                            <div className="text-sm font-semibold text-gray-800">{post.author}</div>
                                            <div className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                    <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-100">
                                        {post.tag}
                                    </Badge>
                                </div>

                                {/* Post Content */}
                                <h3 className="font-bold text-gray-900 mb-1">{post.title}</h3>
                                <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                                    {post.content}
                                </p>

                                {/* Actions */}
                                <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
                                    <button
                                        onClick={() => handleLike(post._id)}
                                        className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-green-600 transition-colors"
                                    >
                                        <ThumbsUp className={`w-4 h-4 ${post.likes > 0 ? 'fill-green-100 text-green-600' : ''}`} />
                                        <span>{post.likes}</span>
                                    </button>
                                    <button className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-green-600 transition-colors">
                                        <MessageSquare className="w-4 h-4" />
                                        <span>{post.comments.length}</span>
                                    </button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

            </div>
        </div>
    );
}
