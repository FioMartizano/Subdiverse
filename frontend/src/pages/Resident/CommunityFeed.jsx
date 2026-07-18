// frontend/src/pages/Resident/CommunityFeed.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, MessageCircle, Plus, Heart, Send, Image as ImageIcon, MoreHorizontal, Clock, Share2, Bookmark } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCommunityFeed } from '../../hooks/useCommunityFeed';
import CommunityGroup from "../../assets/CommunityGroup.jpg";
import { subscribeToComments } from '../../services/communityFeedService';

// Date formatter helper
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);

  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const PostItem = ({ post, group, user, onLike, onComment, onDelete }) => {
  const [isPostLiked, setIsPostLiked] = useState(post.isLiked || false);
  const [postLikesCount, setPostLikesCount] = useState(post.engagement?.likes || 0);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const postAuthor = post.author || {};
  const commentsCount = post.engagement?.comments || 0;

  const canDelete = () => {
    if (!user) return false;
    return user.uid === post.userId || user.role === 'admin';
  };

  const handlePostLike = async () => {
    const newState = !isPostLiked;
    setIsPostLiked(newState);
    setPostLikesCount(prev => newState ? prev + 1 : prev - 1);
    await onLike(post.id);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || isCommenting) return;
    setIsCommenting(true);
    await onComment(post.id, commentText);
    setCommentText('');
    setIsCommenting(false);
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    setIsDeleting(true);
    await onDelete(post.id);
    setIsDeleting(false);
  };

  useEffect(() => {
    const unsubscribe = subscribeToComments(post.id, (fetchedComments) => {
      setComments(fetchedComments);
      setCommentsLoading(false);
    });

    return () => unsubscribe();
  }, [post.id]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Post Header */}
      <div className="p-4 pb-2">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-gray-200">
            <img 
              src={postAuthor.avatar || `https://ui-avatars.com/api/?name=${postAuthor.name || 'User'}&background=0a66c2&color=fff&size=48`}
              alt={postAuthor.name || 'User'}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold text-gray-900 hover:text-[#0a66c2] cursor-pointer text-sm">
                  {postAuthor.name || 'Unknown User'}
                </h4>
                <p className="text-xs text-gray-500">
                  {postAuthor.headline || 'Community Member'}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-gray-400">
                    {formatDate(post.createdAt?.toDate?.() || post.createdAt)}
                  </span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {group?.name || 'Community'}
                  </span>
                </div>
              </div>
              {canDelete() && (
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="text-gray-400 hover:text-red-500 transition-colors p-1"
                >
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Post Content */}
      <div className="px-4 pb-2">
        <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
          {post.text || ''}
        </p>

        {/* Images */}
        {post.images?.length > 0 && (
          <div className={`mt-3 grid gap-1 ${
            post.images.length === 1 ? 'grid-cols-1' :
            post.images.length === 2 ? 'grid-cols-2' :
            'grid-cols-2'
          }`}>
            {post.images.map((img, idx) => (
              <div
                key={idx}
                className={`rounded-lg overflow-hidden bg-gray-100 ${
                  post.images.length === 3 && idx === 0 ? 'col-span-2' : ''
                }`}
              >
                <img
                  src={img}
                  alt={`Post image ${idx + 1}`}
                  className="w-full max-h-[400px] object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Engagement Stats */}
      <div className="px-4 py-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <span className="flex items-center gap-1">
            <Heart className="w-4 h-4 text-[#0a66c2] fill-[#0a66c2]" />
            <span>{postLikesCount}</span>
          </span>
        </div>
        <button
          onClick={() => setShowComments(!showComments)}
          className="hover:text-[#0a66c2] transition-colors"
        >
          {commentsCount} comments
        </button>
      </div>

      {/* Action Buttons */}
      <div className="px-4 py-1 border-t border-gray-100 flex items-center justify-around">
        <button
          onClick={handlePostLike}
          className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded transition-colors ${
            isPostLiked 
              ? 'text-[#0a66c2]' 
              : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          <Heart className={`w-5 h-5 ${isPostLiked ? 'fill-[#0a66c2]' : ''}`} />
          <span className="hidden sm:inline">{isPostLiked ? 'Liked' : 'Like'}</span>
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:bg-gray-100 px-4 py-2 rounded transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="hidden sm:inline">Comment</span>
        </button>
        <button className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:bg-gray-100 px-4 py-2 rounded transition-colors">
          <Share2 className="w-5 h-5" />
          <span className="hidden sm:inline">Share</span>
        </button>
        <button className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:bg-gray-100 px-4 py-2 rounded transition-colors">
          <Bookmark className="w-5 h-5" />
          <span className="hidden sm:inline">Save</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="px-4 py-3 border-t border-gray-100 bg-[#f3f2ef]">
          {/* Comment Input */}
          <form onSubmit={handleCommentSubmit} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-gray-200">
              <img 
                src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.displayName || 'User'}&background=0a66c2&color=fff&size=32`}
                alt={user?.displayName || 'User'}
                className="w-full h-full object-cover"
              />
            </div>
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 px-4 py-2 bg-white rounded-full border border-gray-200 focus:outline-none focus:border-[#0a66c2] text-sm"
            />
            <button
              type="submit"
              disabled={!commentText.trim() || isCommenting}
              className="p-2 text-[#0a66c2] hover:bg-[#0a66c2]/10 rounded-full transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Existing Comments */}
          <div className="mt-4 space-y-3">
            {commentsLoading ? (
              <p className="text-sm text-gray-500">Loading comments...</p>
            ) : comments.length === 0 ? (
              <p className="text-sm text-gray-500">No comments yet.</p>
            ) : (
              comments.map((comment) => (
                <div
                  key={comment.id}
                  className="bg-white rounded-lg p-3 border border-gray-200"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <img
                      src={
                        comment.author?.avatar ||
                        `https://ui-avatars.com/api/?name=${comment.author?.name || 'User'}`
                      }
                      alt={comment.author?.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <p className="text-sm font-semibold">
                        {comment.author?.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(comment.createdAt?.toDate?.() || comment.createdAt)}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-800">
                    {comment.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const CommunityFeed = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    posts,
    loading,
    error,
    hasMore,
    isLoadingMore,
    loadMore,
    group,
    groupLoading,
    createPost,
    deletePost,
    toggleLike,
    createComment,
    deleteComment,
    toggleCommentLike
  } = useCommunityFeed(groupId);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    setIsSubmitting(true);
    try {
      const result = await createPost({
        text: newPostContent.trim(),
        images: []
      });
      if (result.success) {
        setNewPostContent('');
        setShowCreatePost(false);
      }
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLikeToggle = async (postId) => {
    await toggleLike(postId);
  };

  const handleCreateComment = async (postId, commentText) => {
    await createComment(postId, commentText);
  };

  const handleDeletePost = (postId) => {
    deletePost(postId);
  };

  if (groupLoading || loading) {
    return (
      <div className="min-h-screen bg-[#f3f2ef] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#0a66c2] border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading feed...</p>
        </div>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="min-h-screen bg-[#f3f2ef] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500">{error || 'Group not found'}</p>
          <button
            onClick={() => navigate('/community')}
            className="mt-4 text-[#0a66c2] hover:underline"
          >
            Back to Communities
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f2ef] pt-20">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex gap-8">
          {/* Left Sidebar */}
          <div className="hidden lg:block w-[280px] flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden sticky top-24">
              <div className="h-[80px] bg-gradient-to-r from-[#0a66c2] to-[#6c9bd2]"></div>
              <div className="relative px-4">
                <div className="absolute -top-10 left-4">
                  <div className="w-20 h-20 rounded-full border-4 border-white bg-white overflow-hidden shadow-md">
                    <img 
                      src={CommunityGroup} 
                      alt={group.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
              <div className="pt-12 pb-4 px-4">
                <h2 className="text-xl font-bold text-gray-900 hover:text-[#0a66c2] cursor-pointer">
                  {group.name}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {group.description || 'No description provided'}
                </p>
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {group.memberCount || 0} members
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    {posts.length} posts
                  </span>
                </div>
              </div>
              <button
                onClick={() => navigate('/community')}
                className="w-full text-left px-4 py-3 border-t border-gray-200 text-sm font-medium text-[#0a66c2] hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Communities
              </button>
            </div>
          </div>

          {/* Main Feed */}
          <div className="flex-1 min-w-0 max-w-2xl mx-auto lg:mx-0">
            {/* Create Post Box */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-gray-200">
                  <img 
                    src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.displayName || 'User'}&background=0a66c2&color=fff&size=48`}
                    alt={user?.displayName || 'User'}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={() => setShowCreatePost(true)}
                  className="flex-1 text-left px-4 py-3 bg-[#f3f2ef] hover:bg-[#e8e6e4] rounded-full text-sm text-gray-600 transition-colors"
                >
                  Start a post...
                </button>
              </div>
              <div className="flex items-center justify-around mt-3 pt-3 border-t border-gray-100">
                <button className="flex items-center gap-2 text-sm text-gray-500 hover:bg-gray-100 px-4 py-2 rounded-full transition-colors">
                  <ImageIcon className="w-5 h-5 text-[#378fe9]" />
                  <span className="hidden sm:inline">Photo</span>
                </button>
                <button className="flex items-center gap-2 text-sm text-gray-500 hover:bg-gray-100 px-4 py-2 rounded-full transition-colors">
                  <Users className="w-5 h-5 text-[#5e9b4c]" />
                  <span className="hidden sm:inline">Tag</span>
                </button>
                <button className="flex items-center gap-2 text-sm text-gray-500 hover:bg-gray-100 px-4 py-2 rounded-full transition-colors">
                  <Clock className="w-5 h-5 text-[#e7a33e]" />
                  <span className="hidden sm:inline">Celebrate</span>
                </button>
              </div>
            </div>

            {/* Posts Feed */}
            {posts.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No posts yet</p>
                <p className="text-gray-400 text-sm mt-1">
                  Be the first to start a discussion in this group!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <PostItem
                    key={post.id}
                    post={post}
                    group={group}
                    user={user}
                    onLike={handleLikeToggle}
                    onComment={handleCreateComment}
                    onDelete={handleDeletePost}
                  />
                ))}
              </div>
            )}

            {/* Load More */}
            {hasMore && posts.length > 0 && (
              <div className="text-center mt-6">
                <button
                  onClick={loadMore}
                  disabled={isLoadingMore}
                  className="px-6 py-2 text-[#0a66c2] hover:bg-[#0a66c2]/10 rounded-full transition font-medium text-sm disabled:opacity-50"
                >
                  {isLoadingMore ? 'Loading...' : 'Load more posts'}
                </button>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="hidden xl:block w-[280px] flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-24">
              <h3 className="font-semibold text-gray-700 text-sm mb-3">Keep in touch</h3>
              <div className="space-y-3">
                {posts.slice(0, 4).map((post, index) => {
                  const author = post.author || {};
                  return (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gray-200">
                        <img 
                          src={author.avatar || `https://ui-avatars.com/api/?name=${author.name || 'User'}&background=0a66c2&color=fff&size=40`}
                          alt={author.name || 'User'}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {author.name || 'Unknown'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          Community Member
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      {showCreatePost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Create a post</h2>
              <button
                onClick={() => setShowCreatePost(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                  <img 
                    src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.displayName || 'User'}&background=0a66c2&color=fff&size=48`}
                    alt={user?.displayName || 'User'}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">
                    {user?.displayName || 'Resident'}
                  </p>
                  <p className="text-xs text-gray-500">Posting in {group.name}</p>
                </div>
              </div>

              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="What do you want to talk about?"
                className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#0a66c2] min-h-[150px] text-sm"
                autoFocus
              />

              <div className="mt-4 p-3 border-2 border-dashed border-gray-200 rounded-lg text-center hover:border-[#0a66c2] transition-colors cursor-pointer">
                <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Add an image</p>
                <p className="text-xs text-gray-400">JPG, PNG, GIF (max 5MB)</p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t mt-4">
                <button
                  onClick={() => setShowCreatePost(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-full transition text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePost}
                  disabled={isSubmitting || !newPostContent.trim()}
                  className="px-6 py-2 bg-[#0a66c2] text-white rounded-full font-medium hover:bg-[#004182] transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {isSubmitting ? 'Posting...' : 'Post'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityFeed;