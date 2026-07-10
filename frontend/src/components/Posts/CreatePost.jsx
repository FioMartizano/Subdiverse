// frontend/src/components/posts/CreatePost.jsx
import { useState } from 'react';
import { X, Image, Send, Pin } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { createPost } from '../../services/postService';
import { uploadImages, validateImage } from '../../utils/imageCompression';

const CreatePost = ({ isOpen, onClose, onPostCreated, officeName = 'HOA Main Office' }) => {
  const { user, isAdmin } = useAuth();
  const [content, setContent] = useState('');
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');

  // Check if user can post
  if (!user || !isAdmin) {
    return null;
  }

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = [];
    const previews = [];

    // Validate each file
    for (const file of files) {
      const validation = validateImage(file);
      if (validation.valid) {
        validFiles.push(file);
        previews.push(URL.createObjectURL(file));
      } else {
        setError(validation.error);
        setTimeout(() => setError(''), 3000);
      }
    }

    // Limit to max 3 images total
    const remainingSlots = 3 - imageFiles.length;
    const filesToAdd = validFiles.slice(0, remainingSlots);
    
    setImageFiles(prev => [...prev, ...filesToAdd]);
    setImagePreviewUrls(prev => [...prev, ...previews.slice(0, remainingSlots)]);
  };

  const handleRemoveImage = (index) => {
    // Revoke the object URL to free memory
    URL.revokeObjectURL(imagePreviewUrls[index]);
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!content.trim()) {
      setError('Please enter some content');
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      let uploadedImageUrls = [];

      // Upload images if any
      if (imageFiles.length > 0) {
        setUploadProgress(10);
        const uploadedUrls = await uploadImages(
          imageFiles,
          import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET_HOA || 'hoa-posts',
          (progress) => {
            setUploadProgress(10 + (progress * 80));
          }
        );
        uploadedImageUrls = uploadedUrls;
        setUploadProgress(90);
      }

      // Prepare post data
      const postData = {
        author: {
          name: officeName,
          avatar: 'https://ui-avatars.com/api/?name=HOA&background=F98300&color=fff&size=80',
          role: user.role,
          postedBy: user.uid
        },
        content: {
          text: content.trim(),
          images: uploadedImageUrls
        },
        engagement: {
          likes: 0,
          views: 0
        },
        metadata: {
          isPinned: isPinned,
          source: 'office',
          officeId: 'hoa'
        },
        // Store the user ID for reference
        userId: user.uid
      };

      const result = await createPost(postData);

      if (result.success) {
        setUploadProgress(100);
        
        // Add the new post to the feed with a temporary ID
        const newPost = {
          id: result.id,
          ...postData,
          createdAt: new Date().toISOString()
        };
        
        onPostCreated(newPost);
        onClose();
        
        // Reset form
        setContent('');
        setImageFiles([]);
        setImagePreviewUrls([]);
        setIsPinned(false);
        setUploadProgress(0);
      } else {
        setError(result.error || 'Failed to create post');
      }
    } catch (err) {
      console.error('Error creating post:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Upload Progress */}
          {isSubmitting && uploadProgress > 0 && uploadProgress < 100 && (
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-[var(--color-secondary)] h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}

          {/* Posting As */}
          <div className="flex items-center gap-3 pb-3 border-b">
            <div className="w-10 h-10 rounded-full bg-[var(--color-secondary)] flex items-center justify-center text-white font-bold text-sm">
              HOA
            </div>
            <div>
              <p className="font-semibold text-sm text-[var(--color-primary)]">
                {officeName}
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
            disabled={isSubmitting}
          />

          {/* Image Upload */}
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <Image className="w-4 h-4" />
              <span>Add Images (max 3)</span>
            </div>
            
            {/* Image Preview Grid */}
            {imagePreviewUrls.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-3">
                {imagePreviewUrls.map((url, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
                    <img src={url} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition text-xs"
                      disabled={isSubmitting}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {imagePreviewUrls.length < 3 && !isSubmitting && (
              <label className="inline-flex items-center px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[var(--color-secondary)] hover:bg-gray-50 transition">
                <span className="text-sm text-gray-600">Upload Images</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={isSubmitting}
                />
              </label>
            )}
          </div>

          {/* Options */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="w-4 h-4 rounded text-[var(--color-secondary)] focus:ring-[var(--color-secondary)]"
                disabled={isSubmitting}
              />
              <Pin className="w-3.5 h-3.5" />
              Pin Post (stays at top)
            </label>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3 pt-3 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition text-sm"
              disabled={isSubmitting}
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