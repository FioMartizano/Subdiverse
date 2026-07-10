// frontend/src/components/posts/CreatePost.jsx
import { useState } from 'react';
import { X, Image, Send, Pin, Calendar, AlertCircle } from 'lucide-react';

const CreatePost = ({ isOpen, onClose, onPostCreated, officeName }) => {
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [category, setCategory] = useState('announcement');
  const [isPinned, setIsPinned] = useState(false);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const selectedFiles = files.slice(0, 3 - images.length);
    
    // Create preview URLs
    const newImageUrls = selectedFiles.map(file => URL.createObjectURL(file));
    setImageUrls(prev => [...prev, ...newImageUrls]);
    setImages(prev => [...prev, ...selectedFiles]);
  };

  const handleRemoveImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!content.trim()) return;
    
    setIsSubmitting(true);

    // Build post data
    const newPost = {
      id: `post_${Date.now()}`,
      author: {
        id: 'hoa-main-office',
        name: officeName || 'HOA Main Office',
        avatar: `https://ui-avatars.com/api/?name=HOA&background=F98300&color=fff&size=40`,
        role: 'officer'
      },
      content: {
        text: content,
        images: imageUrls, // These would be uploaded to Cloudinary later
        embedUrl: null
      },
      engagement: {
        likes: 0,
        comments: 0,
        views: Math.floor(Math.random() * 100) + 10,
        isLiked: false
      },
      metadata: {
        createdAt: new Date().toISOString(),
        isPinned: isPinned,
        category: category,
        source: 'office'
      }
    };

    // Simulate network delay
    setTimeout(() => {
      onPostCreated(newPost);
      onClose();
      // Reset form
      setContent('');
      setImages([]);
      setImageUrls([]);
      setCategory('announcement');
      setIsPinned(false);
      setIsSubmitting(false);
    }, 500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-4 border-b rounded-t-2xl">
          <h2 className="text-xl font-bold text-[var(--color-primary)]">
            Create Announcement
          </h2>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Post Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Posting As */}
          <div className="flex items-center gap-3 pb-3 border-b">
            <div className="w-10 h-10 rounded-full bg-[var(--color-secondary)] flex items-center justify-center text-white font-bold text-sm">
              HOA
            </div>
            <div>
              <p className="font-semibold text-sm text-[var(--color-primary)]">
                {officeName || 'HOA Main Office'}
              </p>
              <p className="text-xs text-gray-500">
                Posting as office • Your name won't appear
              </p>
            </div>
          </div>

          {/* Text Content */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What would you like to announce to the community?"
            className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)] min-h-[120px] text-sm"
            required
          />

          {/* Image Upload */}
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <Image className="w-4 h-4" />
              <span>Add Images (max 3)</span>
            </div>
            
            {/* Image Preview Grid */}
            {imageUrls.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-3">
                {imageUrls.map((url, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
                    <img src={url} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition text-xs"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {imageUrls.length < 3 && (
              <label className="inline-flex items-center px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[var(--color-secondary)] hover:bg-gray-50 transition">
                <span className="text-sm text-gray-600">Upload Images</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Category & Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)] text-sm"
              >
                <option value="announcement">📢 Announcement</option>
                <option value="event">🎉 Event</option>
                <option value="advisory">⚠️ Advisory</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Options
              </label>
              <div className="flex items-center gap-4 mt-1.5">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPinned}
                    onChange={(e) => setIsPinned(e.target.checked)}
                    className="w-4 h-4 rounded text-[var(--color-secondary)] focus:ring-[var(--color-secondary)]"
                  />
                  <Pin className="w-3.5 h-3.5" />
                  Pin Post
                </label>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3 pt-3 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !content.trim()}
              className="px-6 py-2 bg-[var(--color-secondary)] text-white rounded-lg font-medium hover:bg-[var(--color-primary)] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? 'Posting...' : 'Post Announcement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;