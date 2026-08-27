import React, { useState, useEffect } from 'react';
import {
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  MoreVertical,
  Send,
  Trash2,
  Edit2,
  Flag,
  Image as ImageIcon,
  Sparkles,
  Filter,
  Users,
  Layers,
  Check,
  X
} from 'lucide-react';
import { Post } from '../types/index.js';
import { api } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.js';
import { Avatar } from '../components/common/Avatar.js';
import { StudentIdBadge, CategoryBadge } from '../components/common/Badge.js';
import { PostSkeleton } from '../components/common/Skeleton.js';
import { Modal } from '../components/common/Modal.js';
import { useToast } from '../components/common/Toast.js';

interface FeedPageProps {
  onNavigate: (tab: string, param?: string) => void;
  openCreateModalDirectly?: boolean;
}

const CATEGORIES = [
  'All',
  'Computer Science',
  'Mathematics',
  'Physics & Engineering',
  'Chemistry & Biology',
  'Literature & Humanities',
  'Study Tips & Guides',
  'Campus Life'
];

export const FeedPage: React.FC<FeedPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { success, error, info } = useToast();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState<'all' | 'friends' | 'saved'>('all');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // New Post Form State
  const [postContent, setPostContent] = useState('');
  const [postCategory, setPostCategory] = useState('Computer Science');
  const [postImageUrl, setPostImageUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active Comments Thread Open Map
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [submittingComment, setSubmittingComment] = useState<Record<string, boolean>>({});

  // Active Modals
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [reportingPost, setReportingPost] = useState<Post | null>(null);
  const [reportReason, setReportReason] = useState('INAPPROPRIATE_CONTENT');
  const [reportDetails, setReportDetails] = useState('');

  const loadFeed = async () => {
    setLoading(true);
    try {
      const data = await api.getFeed({
        filter: filterMode,
        category: selectedCategory !== 'All' ? selectedCategory : undefined
      });
      setPosts(data.posts || []);
    } catch (err: any) {
      console.error(err);
      error('Failed to load feed posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeed();
  }, [filterMode, selectedCategory]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim()) {
      error('Please enter content for your post');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.createPost({
        content: postContent.trim(),
        category: postCategory,
        imageUrl: postImageUrl.trim() || undefined
      });

      setPosts([res.post, ...posts]);
      setPostContent('');
      setPostImageUrl('');
      setShowImageInput(false);
      success('Post published to StudentHub feed!');
    } catch (err: any) {
      error(err.message || 'Failed to publish post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleLike = async (post: Post) => {
    if (!user) {
      info('Please sign in to like posts');
      onNavigate('signin');
      return;
    }

    // Optimistic UI update
    setPosts(prev =>
      prev.map(p => {
        if (p.id === post.id) {
          const isLiked = !p.isLiked;
          return {
            ...p,
            isLiked,
            likesCount: isLiked ? p.likesCount + 1 : Math.max(0, p.likesCount - 1)
          };
        }
        return p;
      })
    );

    try {
      await api.toggleLike(post.id);
    } catch (err: any) {
      error(err.message || 'Failed to update like');
      loadFeed();
    }
  };

  const handleToggleSave = async (post: Post) => {
    if (!user) {
      info('Please sign in to save posts');
      onNavigate('signin');
      return;
    }

    setPosts(prev =>
      prev.map(p => (p.id === post.id ? { ...p, isSaved: !p.isSaved } : p))
    );

    try {
      const res = await api.toggleSavePost(post.id);
      success(res.isSaved ? 'Post saved to your bookmarks' : 'Post removed from saved');
    } catch (err: any) {
      error(err.message || 'Failed to save post');
      loadFeed();
    }
  };

  const handleAddComment = async (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;

    setSubmittingComment(prev => ({ ...prev, [postId]: true }));
    try {
      const res = await api.addComment(postId, { content: text });
      setPosts(prev =>
        prev.map(p => {
          if (p.id === postId) {
            return {
              ...p,
              commentsCount: p.commentsCount + 1,
              comments: [...p.comments, res.comment]
            };
          }
          return p;
        })
      );
      setCommentInputs(prev => ({ ...prev, [postId]: '' }));
    } catch (err: any) {
      error(err.message || 'Failed to add comment');
    } finally {
      setSubmittingComment(prev => ({ ...prev, [postId]: false }));
    }
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    try {
      await api.deleteComment(postId, commentId);
      setPosts(prev =>
        prev.map(p => {
          if (p.id === postId) {
            return {
              ...p,
              commentsCount: Math.max(0, p.commentsCount - 1),
              comments: p.comments.filter(c => c.id !== commentId)
            };
          }
          return p;
        })
      );
      success('Comment removed');
    } catch (err: any) {
      error(err.message || 'Failed to remove comment');
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      await api.deletePost(postId);
      setPosts(prev => prev.filter(p => p.id !== postId));
      success('Post deleted successfully');
    } catch (err: any) {
      error(err.message || 'Failed to delete post');
    }
  };

  const handleSaveEditPost = async () => {
    if (!editingPost || !editContent.trim()) return;
    try {
      const res = await api.editPost(editingPost.id, {
        content: editContent.trim(),
        category: editCategory
      });
      setPosts(prev => prev.map(p => (p.id === editingPost.id ? res.post : p)));
      setEditingPost(null);
      success('Post updated successfully');
    } catch (err: any) {
      error(err.message || 'Failed to edit post');
    }
  };

  const handleReportPost = async () => {
    if (!reportingPost) return;
    try {
      await api.reportPost(reportingPost.id, {
        reason: reportReason,
        details: reportDetails.trim()
      });
      setReportingPost(null);
      setReportDetails('');
      success('Report submitted for admin review. Thank you for keeping StudentHub safe.');
    } catch (err: any) {
      error(err.message || 'Failed to submit report');
    }
  };

  const handleSharePost = (post: Post) => {
    navigator.clipboard.writeText(window.location.origin + `?post=${post.id}`);
    success('Post link copied to clipboard!');
  };

  const formatTimeAgo = (dateStr: string) => {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-16">
      
      {/* Create Post Widget */}
      {user && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs transition-all">
          <div className="flex gap-3">
            <Avatar src={user.avatarUrl} alt={user.fullName} size="md" />
            <div className="flex-1 min-w-0">
              <form onSubmit={handleCreatePost} className="space-y-3">
                <textarea
                  id="feed-create-post-textarea"
                  rows={3}
                  value={postContent}
                  onChange={e => setPostContent(e.target.value)}
                  placeholder="Share a study question, academic insight, notes summary, or discussion..."
                  className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder-slate-400 resize-none"
                />

                {showImageInput && (
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <ImageIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <input
                      id="feed-post-image-url-input"
                      type="url"
                      placeholder="Paste image URL (e.g. https://...)"
                      value={postImageUrl}
                      onChange={e => setPostImageUrl(e.target.value)}
                      className="w-full text-xs bg-transparent border-none focus:outline-none text-slate-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowImageInput(false)}
                      className="p-1 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <select
                      id="feed-post-category-select"
                      value={postCategory}
                      onChange={e => setPostCategory(e.target.value)}
                      className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                      {CATEGORIES.filter(c => c !== 'All').map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => setShowImageInput(!showImageInput)}
                      className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        showImageInput || postImageUrl
                          ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400'
                          : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <ImageIcon className="w-4 h-4" />
                      <span className="hidden sm:inline">Add Image</span>
                    </button>
                  </div>

                  <button
                    id="feed-publish-post-btn"
                    type="submit"
                    disabled={isSubmitting || !postContent.trim()}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs hover:shadow-indigo-500/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <span>{isSubmitting ? 'Posting...' : 'Post'}</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Feed Filters */}
      <div className="space-y-3">
        <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-1.5 shadow-xs">
          <div className="flex items-center gap-1">
            <button
              id="feed-filter-all"
              type="button"
              onClick={() => setFilterMode('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterMode === 'all'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              All Posts
            </button>

            {user && (
              <>
                <button
                  id="feed-filter-friends"
                  type="button"
                  onClick={() => setFilterMode('friends')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    filterMode === 'friends'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Friends Only</span>
                </button>

                <button
                  id="feed-filter-saved"
                  type="button"
                  onClick={() => setFilterMode('saved')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    filterMode === 'saved'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Saved</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Posts List */}
      {loading ? (
        <div className="space-y-4">
          <PostSkeleton />
          <PostSkeleton />
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto">
            <Layers className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              No posts found in this view
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              {filterMode === 'friends'
                ? 'Your friends haven\'t posted yet. Add more student peers using their Student ID!'
                : 'Be the first to share an academic question or study update!'}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {posts.map(post => (
            <article
              key={post.id}
              id={`post-${post.id}`}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs transition-all hover:border-slate-300 dark:hover:border-slate-700/80 space-y-4"
            >
              {/* Post Header */}
              <div className="flex items-start justify-between gap-3">
                <div
                  className="flex items-center gap-3 cursor-pointer group"
                  onClick={() => onNavigate('profile', post.author.studentId)}
                >
                  <Avatar src={post.author.avatarUrl} alt={post.author.fullName} size="md" />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                        {post.author.fullName}
                      </h4>
                      <StudentIdBadge idCode={post.author.studentId} size="sm" />
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span>{post.author.school || post.author.grade || `@${post.author.username}`}</span>
                      <span>•</span>
                      <span>{formatTimeAgo(post.createdAt)}</span>
                      {post.isEdited && <span className="italic">(edited)</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <CategoryBadge category={post.category} />
                  
                  {/* Dropdown Options */}
                  {user && (
                    <div className="relative group">
                      {post.isOwner ? (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingPost(post);
                              setEditContent(post.content);
                              setEditCategory(post.category);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Edit Post"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePost(post.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                            title="Delete Post"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setReportingPost(post)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          title="Report Post"
                        >
                          <Flag className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Post Content */}
              <div className="text-slate-800 dark:text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
                {post.content}
              </div>

              {/* Post Image */}
              {post.imageUrl && (
                <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 max-h-96">
                  <img
                    src={post.imageUrl}
                    alt="Post attachment"
                    className="w-full h-full object-cover max-h-96"
                    loading="lazy"
                  />
                </div>
              )}

              {/* Post Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-1 sm:gap-4">
                  {/* Like Button */}
                  <button
                    type="button"
                    onClick={() => handleToggleLike(post)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      post.isLiked
                        ? 'text-rose-600 bg-rose-50 dark:bg-rose-950/60'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-rose-600 stroke-rose-600' : ''}`} />
                    <span>{post.likesCount}</span>
                  </button>

                  {/* Comments Toggle */}
                  <button
                    type="button"
                    onClick={() =>
                      setOpenComments(prev => ({ ...prev, [post.id]: !prev[post.id] }))
                    }
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>{post.commentsCount}</span>
                  </button>
                </div>

                <div className="flex items-center gap-1 sm:gap-2">
                  {/* Save Bookmark */}
                  <button
                    type="button"
                    onClick={() => handleToggleSave(post)}
                    className={`p-2 rounded-xl text-xs transition-colors cursor-pointer ${
                      post.isSaved
                        ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60'
                        : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                    title="Bookmark Post"
                  >
                    <Bookmark className={`w-4 h-4 ${post.isSaved ? 'fill-indigo-600' : ''}`} />
                  </button>

                  {/* Share Link */}
                  <button
                    type="button"
                    onClick={() => handleSharePost(post)}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Copy Post Link"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Comment Thread (Collapsible or Open) */}
              {openComments[post.id] && (
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-3 animate-in fade-in duration-150">
                  {/* Add Comment Input */}
                  {user ? (
                    <div className="flex items-center gap-2">
                      <Avatar src={user.avatarUrl} alt={user.fullName} size="sm" />
                      <input
                        type="text"
                        placeholder="Write a constructive student comment..."
                        value={commentInputs[post.id] || ''}
                        onChange={e =>
                          setCommentInputs({ ...commentInputs, [post.id]: e.target.value })
                        }
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleAddComment(post.id);
                        }}
                        className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                      <button
                        type="button"
                        disabled={submittingComment[post.id] || !commentInputs[post.id]?.trim()}
                        onClick={() => handleAddComment(post.id)}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors disabled:opacity-40"
                      >
                        Reply
                      </button>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 text-center py-2">
                      <button
                        type="button"
                        onClick={() => onNavigate('signin')}
                        className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                      >
                        Sign in
                      </button>{' '}
                      to participate in this academic discussion
                    </div>
                  )}

                  {/* List Comments */}
                  <div className="space-y-2.5 pt-1">
                    {post.comments.length === 0 ? (
                      <p className="text-xs text-slate-400 italic text-center py-1">
                        No comments yet. Start the conversation!
                      </p>
                    ) : (
                      post.comments.map(c => (
                        <div
                          key={c.id}
                          className="flex items-start justify-between gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50"
                        >
                          <div className="flex items-start gap-2.5 min-w-0">
                            <Avatar src={c.author.avatarUrl} alt={c.author.fullName} size="xs" />
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-xs text-slate-900 dark:text-white">
                                  {c.author.fullName}
                                </span>
                                <StudentIdBadge idCode={c.author.studentId} size="sm" showCopy={false} />
                                <span className="text-[10px] text-slate-400">
                                  {formatTimeAgo(c.createdAt)}
                                </span>
                              </div>
                              <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5 whitespace-pre-wrap">
                                {c.content}
                              </p>
                            </div>
                          </div>

                          {(user?.id === c.author.id || user?.id === post.author.id) && (
                            <button
                              type="button"
                              onClick={() => handleDeleteComment(post.id, c.id)}
                              className="text-slate-400 hover:text-rose-600 p-1"
                              title="Delete comment"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      {/* Edit Post Modal */}
      <Modal
        isOpen={Boolean(editingPost)}
        onClose={() => setEditingPost(null)}
        title="Edit Post"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Category
            </label>
            <select
              value={editCategory}
              onChange={e => setEditCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs"
            >
              {CATEGORIES.filter(c => c !== 'All').map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Content
            </label>
            <textarea
              rows={4}
              value={editContent}
              onChange={e => setEditContent(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setEditingPost(null)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveEditPost}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700"
            >
              Save Changes
            </button>
          </div>
        </div>
      </Modal>

      {/* Report Post Modal */}
      <Modal
        isOpen={Boolean(reportingPost)}
        onClose={() => setReportingPost(null)}
        title="Report Post to Moderators"
        description="Help keep StudentHub a safe, productive academic community."
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Reason for Report
            </label>
            <select
              value={reportReason}
              onChange={e => setReportReason(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs"
            >
              <option value="INAPPROPRIATE_CONTENT">Inappropriate or offensive content</option>
              <option value="HARASSMENT_OR_BULLYING">Harassment or bullying</option>
              <option value="ACADEMIC_DISHONESTY">Plagiarism or test leaks</option>
              <option value="SPAM_OR_ADVERTISING">Spam or commercial advertising</option>
              <option value="OTHER">Other violation</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Additional Details (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Provide context for our review team..."
              value={reportDetails}
              onChange={e => setReportDetails(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setReportingPost(null)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleReportPost}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700"
            >
              Submit Report
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
};
