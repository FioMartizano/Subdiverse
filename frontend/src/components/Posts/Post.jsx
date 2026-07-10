// frontend/src/components/posts/Post.jsx
import { useState } from 'react';
import { Heart, MessageCircle, Pin, Eye } from 'lucide-react';
import { formatDate, formatFullDate } from '../../utils/formatDate';

const Post = ({ post, onLike, onComment, variant = 'default' }) => {
  const [isLiked, setIsLiked] = useState(post.engagement?.isLiked || false);
  const [likesCount, setLikesCount] = useState(post.engagement?.likes || 0);
  const [isHovered, setIsHovered] = useState(false);

  const handleLike = () => {
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLikesCount(prev => newLikedState ? prev + 1 : prev - 1);
    if (onLike) onLike(post.id, newLikedState);
  };

  const handleComment = () => {
    if (onComment) onComment(post.id);
  };

  const renderImages = () => {
    const images = post.content.images || [];
    if (images.length === 0) return null;

    const gridClass = 
      images.length === 1 ? 'grid-cols-1' :
      images.length === 2 ? 'grid-cols-2' :
      'grid-cols-2';

    return (
      <div className={`grid ${gridClass} gap-2 mt-3`}>
        {images.map((image, index) => (
          <div 
            key={index} 
            className={`overflow-hidden rounded-lg bg-gray-100 ${
              images.length === 3 && index === 0 ? 'col-span-2' : ''
            }`}
          >
            <img 
              src={image} 
              alt={`Post image ${index + 1}`} 
              className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    );
  };

  // Check if post has a poll
  const hasPoll = post.poll && post.poll.options && post.poll.options.length > 0;

  return (
    <div 
      className={`
        bg-white rounded-xl shadow-sm border border-gray-100 p-5 
        transition-all duration-200
        ${isHovered ? 'shadow-md border-gray-200' : ''}
        ${post.metadata?.isPinned ? 'border-l-4 border-l-[var(--color-secondary)]' : ''}
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
              src={post.author.avatar} 
              alt={post.author.name} 
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Author Info */}
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-[var(--color-primary)] text-sm">
                {post.author.name}
              </h4>
              {post.metadata?.isPinned && (
                <Pin className="w-3.5 h-3.5 text-[var(--color-secondary)]" />
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>{formatDate(post.metadata.createdAt)}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {post.engagement?.views || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Category Badge */}
        {post.metadata?.category && (
          <span className={`
            text-xs px-2 py-1 rounded-full font-medium
            ${post.metadata.category === 'announcement' ? 'bg-blue-100 text-blue-700' : ''}
            ${post.metadata.category === 'event' ? 'bg-purple-100 text-purple-700' : ''}
            ${post.metadata.category === 'advisory' ? 'bg-orange-100 text-orange-700' : ''}
            ${post.metadata.category === 'discussion' ? 'bg-green-100 text-green-700' : ''}
          `}>
            {post.metadata.category.charAt(0).toUpperCase() + post.metadata.category.slice(1)}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="mt-3">
        <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
          {post.content.text}
        </p>
        {renderImages()}
        
        {/* Poll Section */}
        {hasPoll && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="font-semibold text-[var(--color-primary)] text-sm mb-3">
              📊 {post.poll.question}
            </h4>
            <div className="space-y-2">
              {post.poll.options.map((option, index) => {
                const percentage = post.poll.totalVotes > 0 
                  ? Math.round((post.poll.votes[index] / post.poll.totalVotes) * 100) 
                  : 0;
                const isSelected = post.poll.selectedOption === index;
                const hasVoted = post.poll.hasVoted || false;

                return (
                  <div key={index} className="relative">
                    <div 
                      className={`
                        flex items-center justify-between p-2 rounded-lg border-2 transition-all cursor-pointer
                        ${isSelected 
                          ? 'border-[var(--color-secondary)] bg-orange-50' 
                          : 'border-gray-200 hover:border-gray-300'
                        }
                        ${hasVoted ? 'cursor-default' : 'hover:bg-gray-50'}
                      `}
                      onClick={() => {
                        if (!hasVoted && post.onPollVote) {
                          post.onPollVote(post.id, index);
                        }
                      }}
                    >
                      <span className={`text-sm ${isSelected ? 'font-semibold' : ''}`}>
                        {option}
                      </span>
                      {hasVoted && (
                        <span className="text-sm font-medium text-[var(--color-secondary)]">
                          {percentage}%
                        </span>
                      )}
                    </div>
                    {hasVoted && (
                      <div 
                        className="absolute inset-0 rounded-lg pointer-events-none"
                        style={{
                          background: `linear-gradient(to right, #FED7AA ${percentage}%, transparent ${percentage}%)`,
                          opacity: 0.3
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
            {hasVoted && (
              <p className="text-xs text-gray-400 mt-2">
                {post.poll.totalVotes} vote{post.poll.totalVotes !== 1 ? 's' : ''} • Results visible
              </p>
            )}
            {!hasVoted && (
              <p className="text-xs text-gray-400 mt-2">
                Click an option to vote
              </p>
            )}
          </div>
        )}
      </div>

      {/* Actions - Like and Comment only */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-around">
        {/* Like Button */}
        <button 
          onClick={handleLike}
          className={`flex items-center gap-2 text-sm transition-colors ${
            isLiked 
              ? 'text-red-500' 
              : 'text-gray-500 hover:text-red-500'
          }`}
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
          {formatFullDate(post.metadata.createdAt)}
        </span>
      </div>
    </div>
  );
};

export default Post;