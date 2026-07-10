// frontend/src/components/posts/Post.jsx
import { useState } from 'react';
import { Heart, Pin, MoreVertical } from 'lucide-react';
import { formatDate, formatFullDate } from '../../utils/formatDate';
import { toggleLike, deletePost } from '../../services/postService';
import { useAuth } from '../../hooks/useAuth';

const Post = ({ post, onLikeUpdate, onPostDelete }) => {
  const { user, isAdmin } = useAuth();
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likesCount, setLikesCount] = useState(post.engagement?.likes || 0);
  const [isLiking, setIsLiking] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleLike = async () => {
    if (!user) {
      alert('Please log in to like posts');
      return;
    }

    if (isLiking) return;
    setIsLiking(true);

    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLikesCount(prev => newLikedState ? prev + 1 : prev - 1);

    try {
      const result = await toggleLike(post.id, user.uid);
      if (result.success) {
        if (onLikeUpdate) {
          onLikeUpdate(post.id, result.isLiked);
        }
      } else {
        setIsLiked(!newLikedState);
        setLikesCount(prev => !newLikedState ? prev + 1 : prev - 1);
        console.error('Failed to toggle like:', result.error);
      }
    } catch (error) {
      setIsLiked(!newLikedState);
      setLikesCount(prev => !newLikedState ? prev + 1 : prev - 1);
      console.error('Error toggling like:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const result = await deletePost(post.id);
      if (result.success) {
        if (onPostDelete) {
          onPostDelete(post.id);
        }
        setShowMenu(false);
      } else {
        console.error('Failed to delete post:', result.error);
        alert('Failed to delete post. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const renderImages = () => {
    const images = post.content?.images || [];
    if (images.length === 0) return null;

    // Facebook-style layouts
    if (images.length === 1) {
      return (
        <div className="mt-3 rounded-lg overflow-hidden bg-gray-100">
          <img 
            src={images[0]} 
            alt="Post image" 
            className="w-full max-h-[600px] object-contain"
            loading="lazy"
          />
        </div>
      );
    }

    if (images.length === 2) {
      return (
        <div className="grid grid-cols-2 gap-1 mt-3">
          {images.map((image, index) => (
            <div key={index} className="overflow-hidden bg-gray-100">
              <img 
                src={image} 
                alt={`Post image ${index + 1}`} 
                className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      );
    }

    if (images.length === 3) {
      return (
        <div className="grid grid-cols-2 gap-1 mt-3">
          {/* First image takes full left column */}
          <div className="row-span-2 overflow-hidden bg-gray-100">
            <img 
              src={images[0]} 
              alt="Post image 1" 
              className="w-full h-[400px] object-cover hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </div>
          {/* Right column - 2 images stacked */}
          <div className="grid grid-rows-2 gap-1">
            {[1, 2].map((index) => (
              <div key={index} className="overflow-hidden bg-gray-100">
                <img 
                  src={images[index]} 
                  alt={`Post image ${index + 1}`} 
                  className="w-full h-[198px] object-cover hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      );
    }

    // 4 images - 2x2 grid
    if (images.length === 4) {
      return (
        <div className="grid grid-cols-2 gap-1 mt-3">
          {images.map((image, index) => (
            <div key={index} className="overflow-hidden bg-gray-100">
              <img 
                src={image} 
                alt={`Post image ${index + 1}`} 
                className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      );
    }

    // 5+ images - 2x2 grid with +N overlay
    return (
      <div className="grid grid-cols-2 gap-1 mt-3">
        {images.slice(0, 4).map((image, index) => (
          <div key={index} className="overflow-hidden bg-gray-100">
            <img 
              src={image} 
              alt={`Post image ${index + 1}`} 
              className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </div>
        ))}
        {images.length > 4 && (
          <div className="relative overflow-hidden bg-gray-100">
            <img 
              src={images[4]} 
              alt="More images" 
              className="w-full h-64 object-cover blur-sm opacity-50"
              loading="lazy"
            />
            <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-3xl bg-black/50">
              +{images.length - 4}
            </div>
          </div>
        )}
      </div>
    );
  };

  const isPinned = post.metadata?.isPinned || false;
  const canDelete = isAdmin || post.userId === user?.uid;

  return (
    <div 
      className={`
        bg-white rounded-xl shadow-sm border border-gray-100 p-5 
        transition-all duration-200
        ${isHovered ? 'shadow-md border-gray-200' : ''}
        ${isPinned ? 'border-l-4 border-l-[var(--color-secondary)]' : ''}
        ${isDeleting ? 'opacity-50 pointer-events-none' : ''}
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
              src={post.author?.avatar || 'https://ui-avatars.com/api/?name=HOA&background=F98300&color=fff&size=40'} 
              alt={post.author?.name || 'HOA'} 
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Author Info */}
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-[var(--color-primary)] text-sm">
                {post.author?.name || 'HOA Main Office'}
              </h4>
              {isPinned && (
                <Pin className="w-3.5 h-3.5 text-[var(--color-secondary)]" />
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

      {/* Actions - Like on the LEFT */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-start">
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
      </div>

      {/* Full timestamp at bottom */}
      <div className="mt-3 pt-2 border-t border-gray-50">
        <span className="text-xs text-gray-400">
          {formatFullDate(post.createdAt?.toDate?.() || post.createdAt)}
        </span>
      </div>
    </div>
  );
};

export default Post;