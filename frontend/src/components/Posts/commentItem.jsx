// frontend/src/components/posts/CommentItem.jsx
import { useState } from 'react';
import { Heart, HeartOff } from 'lucide-react';
import { formatDate } from '../../utils/formatDate';

const CommentItem = ({ comment, onLike }) => {
  const [isLiked, setIsLiked] = useState(comment.isLiked || false);
  const [likesCount, setLikesCount] = useState(comment.likes || 0);

  const handleLike = () => {
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLikesCount(prev => newLikedState ? prev + 1 : prev - 1);
    if (onLike) onLike(comment.id, newLikedState);
  };

  return (
    <div className="flex gap-3 py-3 border-b border-gray-100 last:border-0">
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-gray-200">
        <img 
          src={comment.author.avatar} 
          alt={comment.author.name} 
          className="w-full h-full object-cover"
        />
      </div>

      {/* Comment Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-sm text-[var(--color-primary)]">
            {comment.author.name}
          </span>
          <span className="text-xs text-gray-400">
            {formatDate(comment.createdAt)}
          </span>
        </div>
        <p className="text-sm text-gray-700 mt-0.5 break-words">
          {comment.content}
        </p>
        
        {/* Like Button for Comment */}
        <button 
          onClick={handleLike}
          className={`flex items-center gap-1 mt-1 text-xs transition-colors ${
            isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
          }`}
        >
          {isLiked ? <Heart className="w-3 h-3 fill-current" /> : <Heart className="w-3 h-3" />}
          {likesCount > 0 && <span>{likesCount}</span>}
        </button>
      </div>
    </div>
  );
};

export default CommentItem;