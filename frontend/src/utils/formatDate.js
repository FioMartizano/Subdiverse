    // src/utils/formatDate.js
    export const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // If less than 24 hours, show relative time
    if (diffTime < 86400000) {
        const hours = Math.floor(diffTime / (1000 * 60 * 60));
        if (hours < 1) {
        const minutes = Math.floor(diffTime / (1000 * 60));
        return `${minutes}m ago`;
        }
        return `${hours}h ago`;
    }
    
    // If less than 7 days, show days ago
    if (diffDays < 7) {
        return `${diffDays}d ago`;
    }
    
    // Otherwise show full date
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
    };

    export const formatFullDate = (dateString) => {
    const date = new Date(dateString);
    const options = { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('en-US', options);
    };