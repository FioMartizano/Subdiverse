// frontend/src/components/posts/Post.jsx
import { useState } from 'react';
import { Heart, MessageCircle, MoreVertical, Pin } from 'lucide-react';
import { formatDate, formatFullDate } from '../../utils/formatDate';
import CommentModal from './CommentModal';

const Post = ({ 
  post, 
  source = 'community',
  onLike, 
  onComment,
  onDelete,
  onCommentDelete,
  onCommentLike,
  currentUser,
  isAdmin = false,
  variant = 'default'
}) => {
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likesCount, setLikesCount] = useState(post.engagement?.likes || 0);
  const [isLiking, setIsLiking] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Check if user can delete
  const canDelete = isAdmin || 
    (source === 'community' && post.userId === currentUser?.uid) ||
    (source === 'office' && post.author?.postedBy === currentUser?.uid);

  const handleLike = async () => {
    if (!currentUser) {
      alert('Please log in to like posts');
      return;
    }

    if (isLiking) return;
    setIsLiking(true);

    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLikesCount(prev => newLikedState ? prev + 1 : prev - 1);

    try {
      if (onLike) {
        await onLike(post.id);
      }
    } catch (error) {
      setIsLiked(!newLikedState);
      setLikesCount(prev => !newLikedState ? prev + 1 : prev - 1);
      console.error('Error toggling like:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleComment = () => {
    setShowCommentModal(true);
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    setIsDeleting(true);
    try {
      if (onDelete) {
        await onDelete(post.id);
      }
      setShowMenu(false);
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCloseCommentModal = () => {
    setShowCommentModal(false);
  };

  const handleCommentCreated = () => {
    // The post will update automatically via real-time updates
  };

  const renderImages = () => {
    const images = post.content?.images || [];
    if (images.length === 0) return null;

    if (images.length === 1) {
      return (
        <div className="mt-3 rounded-lg overflow-hidden bg-gray-100">
          <img 
            src={images[0]} 
            alt="Post image" 
            className="w-full max-h-[500px] object-contain"
            loading="lazy"
          />
        </div>
      );
    }

    if (images.length === 2) {
      return (
        <div className="grid grid-cols-2 gap-2 mt-3">
          {images.map((image, index) => (
            <div key={index} className="rounded-lg overflow-hidden bg-gray-100 aspect-[4/3]">
              <img 
                src={image} 
                alt={`Post image ${index + 1}`} 
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      );
    }

    if (images.length === 3) {
      return (
        <div className="grid grid-cols-2 gap-2 mt-3">
          <div className="row-span-2 rounded-lg overflow-hidden bg-gray-100 aspect-[3/4]">
            <img 
              src={images[0]} 
              alt="Post image 1" 
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="grid grid-rows-2 gap-2">
            {[1, 2].map((index) => (
              <div key={index} className="rounded-lg overflow-hidden bg-gray-100 aspect-[4/3]">
                <img 
                  src={images[index]} 
                  alt={`Post image ${index + 1}`} 
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 gap-2 mt-3">
        {images.slice(0, 4).map((image, index) => (
          <div key={index} className="rounded-lg overflow-hidden bg-gray-100 aspect-square">
            <img 
              src={image} 
              alt={`Post image ${index + 1}`} 
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        ))}
        {images.length > 4 && (
          <div className="relative rounded-lg overflow-hidden bg-gray-100 aspect-square">
            <img 
              src={images[4]} 
              alt="More images" 
              className="w-full h-full object-cover blur-sm opacity-50"
              loading="lazy"
            />
            <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-xl bg-black/50">
              +{images.length - 4}
            </div>
          </div>
        )}
      </div>
    );
  };

  const isPinned = post.metadata?.isPinned || false;
  const postAuthor = post.author || {};

  return (
    <>
      <div 
        className={`
          bg-white rounded-xl shadow-sm border border-gray-100 p-5 
          transition-all duration-200
          ${isHovered ? 'shadow-md border-gray-200' : ''}
          ${isPinned ? 'border-l-4 border-l-[var(--color-secondary)]' : ''}
          ${isDeleting ? 'opacity-50 pointer-events-none' : ''}
          ${variant === 'compact' ? 'p-3' : ''}
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gray-200">
              <img 
                src={postAuthor.avatar || 'https://ui-avatars.com/api/?name=User&background=347433&color=fff&size=40'} 
                alt={postAuthor.name || 'User'} 
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Author Info */}
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-[var(--color-primary)] text-sm">
                  {postAuthor.name || 'Unknown User'}
                </h4>
                {isPinned && (
                  <Pin className="w-3.5 h-3.5 text-[var(--color-secondary)]" />
                )}
                {source === 'office' && (
                  <span className="text-xs bg-[var(--color-secondary)]/10 text-[var(--color-secondary)] px-2 py-0.5 rounded-full font-medium">
                    Official
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>{formatDate(post.createdAt?.toDate?.() || post.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Three Dots Menu */}
          {canDelete && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Post menu"
              >
                <MoreVertical className="w-5 h-5 text-gray-400" />
              </button>
              
              {showMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-20 py-1">
                    <button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                    >
                      {isDeleting ? (
                        <>
                          <span className="inline-block w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></span>
                          Deleting...
                        </>
                      ) : (
                        'Delete Post'
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="mt-3">
          <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
            {post.content?.text || ''}
          </p>
          {renderImages()}
        </div>

        {/* Actions */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-start gap-6">
          {/* Like Button */}
          <button 
            onClick={handleLike}
            disabled={isLiking}
            className={`flex items-center gap-2 text-sm transition-colors ${
              isLiked 
                ? 'text-red-500' 
                : 'text-gray-500 hover:text-red-500'
            } ${isLiking ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            <span>{likesCount > 0 ? likesCount : 'Like'}</span>
          </button>

          {/* Comment Button */}
          <button 
            onClick={handleComment}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-[var(--color-secondary)] transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            <span>{post.engagement?.comments > 0 ? post.engagement.comments : 'Comment'}</span>
          </button>
        </div>

        {/* Full timestamp at bottom */}
        <div className="mt-3 pt-2 border-t border-gray-50">
          <span className="text-xs text-gray-400">
            {formatFullDate(post.createdAt?.toDate?.() || post.createdAt)}
          </span>
        </div>
      </div>

      {/* Comment Modal */}
      {showCommentModal && (
        <CommentModal
          isOpen={showCommentModal}
          onClose={handleCloseCommentModal}
          post={post}
          onCommentCreated={handleCommentCreated}
          onCommentDelete={onCommentDelete}
          onCommentLike={onCommentLike}
          currentUser={currentUser}
          isAdmin={isAdmin}
        />
      )}
    </>
  );
};

export default Post;