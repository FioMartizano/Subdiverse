// frontend/src/components/posts/CommentModal.jsx
import { useState } from 'react';
import { X, Send } from 'lucide-react';
import CommentItem from './CommentItem';

const CommentModal = ({ isOpen, onClose, post, onAddComment, onLikeComment }) => {
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock comments data (will be replaced with Firebase data later)
  const [comments, setComments] = useState([
    {
      id: 'comment1',
      author: {
        id: 'user1',
        name: 'Maria Santos',
        avatar: 'https://ui-avatars.com/api/?name=Maria+Santos&background=347433&color=fff&size=32'
      },
      content: 'Thank you for the update! This is very helpful.',
      createdAt: '2026-07-15T11:30:00Z',
      likes: 5,
      isLiked: false
    },
    {
      id: 'comment2',
      author: {
        id: 'user2',
        name: 'Juan Dela Cruz',
        avatar: 'https://ui-avatars.com/api/?name=Juan+Dela+Cruz&background=347433&color=fff&size=32'
      },
      content: 'Will there be any changes to the schedule?',
      createdAt: '2026-07-15T12:15:00Z',
      likes: 2,
      isLiked: false
    }
  ]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsSubmitting(true);

    // Create new comment
    const newComment = {
      id: `comment_${Date.now()}`,
      author: {
        id: 'current-user', // Will be replaced with actual user ID
        name: 'You', // Will be replaced with actual user name
        avatar: 'https://ui-avatars.com/api/?name=You&background=F98300&color=fff&size=32'
      },
      content: commentText,
      createdAt: new Date().toISOString(),
      likes: 0,
      isLiked: false
    };

    // Simulate network delay
    setTimeout(() => {
      setComments(prev => [...prev, newComment]);
      setCommentText('');
      setIsSubmitting(false);
      if (onAddComment) onAddComment(post.id, newComment);
    }, 300);
  };

  const handleLikeComment = (commentId, isLiked) => {
    setComments(prev => 
      prev.map(comment => 
        comment.id === commentId
          ? {
              ...comment,
              likes: isLiked ? comment.likes + 1 : comment.likes - 1,
              isLiked
            }
          : comment
      )
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b rounded-t-2xl">
          <h3 className="font-bold text-[var(--color-primary)]">
            Comments ({comments.length})
          </h3>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Post Preview */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200">
              <img 
                src={post.author.avatar} 
                alt={post.author.name} 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="font-semibold text-sm text-[var(--color-primary)]">
                {post.author.name}
              </p>
              <p className="text-xs text-gray-500 line-clamp-2">
                {post.content.text}
              </p>
            </div>
          </div>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {comments.length === 0 ? (
            <div className="text-center text-gray-400 text-sm py-8">
              No comments yet. Be the first to comment!
            </div>
          ) : (
            comments.map((comment) => (
              <CommentItem 
                key={comment.id} 
                comment={comment} 
                onLike={handleLikeComment}
              />
            ))
          )}
        </div>

        {/* Comment Input */}
        <div className="p-4 border-t">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)] text-sm"
              disabled={isSubmitting}
            />
            <button
              type="submit"
              disabled={!commentText.trim() || isSubmitting}
              className="px-4 py-2 bg-[var(--color-secondary)] text-white rounded-lg hover:bg-[var(--color-primary)] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? 'Sending...' : 'Send'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CommentModal;