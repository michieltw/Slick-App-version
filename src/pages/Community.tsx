import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import type { Post, Comment } from '../types';
import { MessageSquare, Heart, Send } from 'lucide-react';

export default function Community() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [commentsByPost, setCommentsByPost] = useState<Record<string, Comment[]>>({});
  const [loading, setLoading] = useState(true);

  // Post Creation State
  const [newPostContent, setNewPostContent] = useState('');

  // Comment Creation State
  const [activeCommentPost, setActiveCommentPost] = useState<string | null>(null);
  const [newCommentContent, setNewCommentContent] = useState('');

  useEffect(() => {
    async function loadPosts() {
      try {
        const postsData = await api.getPosts();
        setPosts(postsData);

        const commentsRecord: Record<string, Comment[]> = {};
        await Promise.all(postsData.map(async (post) => {
          commentsRecord[post.id] = await api.getCommentsByPostId(post.id);
        }));
        setCommentsByPost(commentsRecord);
      } catch (error) {
        console.error('Failed to load posts', error);
      } finally {
        setLoading(false);
      }
    }

    loadPosts();
  }, []);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newPostContent.trim()) return;

    try {
      const post = await api.createPost({
        authorId: user.id,
        authorName: user.username,
        authorRole: user.role,
        authorTeamId: user.teamId,
        content: newPostContent.trim(),
        likes: 0
      });
      setPosts([post, ...posts]);
      setCommentsByPost({ ...commentsByPost, [post.id]: [] });
      setNewPostContent('');
    } catch (error) {
      console.error('Failed to create post', error);
    }
  };

  const handleLikePost = async (post: Post) => {
    try {
      const updatedPost = await api.updatePost({ ...post, likes: post.likes + 1 });
      setPosts(posts.map(p => p.id === post.id ? updatedPost : p));
    } catch (error) {
      console.error('Failed to like post', error);
    }
  };

  const handleCreateComment = async (e: React.FormEvent, postId: string) => {
    e.preventDefault();
    if (!user || !newCommentContent.trim()) return;

    try {
      const comment = await api.createComment({
        postId,
        authorId: user.id,
        authorName: user.username,
        content: newCommentContent.trim()
      });

      setCommentsByPost(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), comment]
      }));
      setNewCommentContent('');
      setActiveCommentPost(null);
    } catch (error) {
      console.error('Failed to create comment', error);
    }
  };

  if (loading) return <div className="text-center py-20 text-slate-500 font-medium">Loading community...</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black italic tracking-tighter uppercase text-slate-900">Community Feed</h1>
        <p className="text-slate-500 mt-2 font-medium">Connect with fans, players, and managers</p>
      </div>

      {user ? (
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <form onSubmit={handleCreatePost}>
            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none h-24"
              required
            />
            <div className="mt-3 flex justify-end">
              <button
                type="submit"
                disabled={!newPostContent.trim()}
                className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold py-2 px-6 rounded-lg transition-colors"
              >
                Post
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-slate-100 border border-slate-200 rounded-xl p-6 text-center text-slate-500 font-semibold text-sm">
          Log in to join the conversation.
        </div>
      )}

      <div className="space-y-6">
        {posts.map(post => {
          const comments = commentsByPost[post.id] || [];
          const date = new Date(post.createdAt || 0);

          return (
            <div key={post.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <div className="p-5">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold uppercase">
                    {post.authorName.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{post.authorName}</div>
                    <div className="text-xs font-semibold text-slate-500 uppercase flex items-center space-x-2">
                      <span className={
                        post.authorRole === 'admin' ? 'text-rose-600' :
                        post.authorRole === 'manager' ? 'text-emerald-600' :
                        'text-blue-600'
                      }>{post.authorRole}</span>
                      <span>•</span>
                      <span>{date.toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <p className="text-slate-800 text-[15px] leading-relaxed whitespace-pre-wrap">
                  {post.content}
                </p>
              </div>

              <div className="bg-slate-50 border-t border-slate-100 px-5 py-3 flex items-center space-x-6">
                <button
                  onClick={() => handleLikePost(post)}
                  className="flex items-center space-x-1.5 text-slate-500 hover:text-rose-600 transition-colors font-semibold text-sm group"
                >
                  <Heart className="w-4 h-4 group-hover:fill-current" />
                  <span>{post.likes}</span>
                </button>
                <button
                  onClick={() => setActiveCommentPost(activeCommentPost === post.id ? null : post.id)}
                  className="flex items-center space-x-1.5 text-slate-500 hover:text-slate-900 transition-colors font-semibold text-sm"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{comments.length}</span>
                </button>
              </div>

              {/* Comments Section */}
              {activeCommentPost === post.id && (
                <div className="bg-slate-50 px-5 pb-5 border-t border-slate-100">
                  <div className="space-y-4 pt-4">
                    {comments.map(comment => (
                      <div key={comment.id} className="flex space-x-3">
                        <div className="w-6 h-6 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-slate-500">
                          {comment.authorName.charAt(0)}
                        </div>
                        <div className="flex-1 bg-white border border-slate-200 rounded-lg p-3">
                          <span className="font-bold text-slate-900 text-xs block mb-1">{comment.authorName}</span>
                          <span className="text-slate-700 text-sm">{comment.content}</span>
                        </div>
                      </div>
                    ))}

                    {user && (
                      <form onSubmit={(e) => handleCreateComment(e, post.id)} className="flex items-end space-x-2 mt-4">
                        <input
                          type="text"
                          value={newCommentContent}
                          onChange={(e) => setNewCommentContent(e.target.value)}
                          placeholder="Write a comment..."
                          className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-slate-900"
                          required
                        />
                        <button
                          type="submit"
                          disabled={!newCommentContent.trim()}
                          className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white p-2 rounded-lg transition-colors"
                        >
                          <Send className="w-5 h-5" />
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
