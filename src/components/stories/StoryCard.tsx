import { Heart, MessageCircle, Share2, Play, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface StoryProps {
  id: string;
  type: 'video' | 'quote' | 'verse' | 'image' | 'devotional';
  title: string;
  content: string;
  author: string;
  authorRole: string;
  authorImage?: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  verseReference?: string;
  createdAt: Date;
  likes: number;
}

interface StoryCardProps {
  story: StoryProps;
}

export const StoryCard = ({ story }: StoryCardProps) => {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(story.likes);
  const [isPlaying, setIsPlaying] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [videoError, setVideoError] = useState(false);
  
  const handleLike = () => {
    if (liked) {
      setLikes(likes - 1);
    } else {
      setLikes(likes + 1);
    }
    setLiked(!liked);
  };
  
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const handleVideoPlay = () => {
    setIsPlaying(true);
  };

  // Check if it's a video file
  const isVideoFile = (url: string) => {
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi'];
    const lowerUrl = url.toLowerCase();
    return videoExtensions.some(ext => lowerUrl.includes(ext));
  };
  
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden animate-slide-up">
      {/* Author Header */}
      <div className="flex items-center gap-3 p-4">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-primary font-semibold text-sm">
            {story.author.split(' ').map(n => n[0]).join('')}
          </span>
        </div>
        <div className="flex-1">
          <p className="font-medium text-sm">{story.author}</p>
          <p className="text-xs text-muted-foreground">{story.authorRole} • {formatTime(story.createdAt)}</p>
        </div>
      </div>
      
      {/* Content */}
      <div className="px-4 pb-3">
        <h3 className="font-semibold mb-2">{story.title}</h3>
        
        {(story.type === 'verse' || story.type === 'devotional') && (
          <div className="bg-muted/50 rounded-lg p-4 mb-3 border-l-4 border-primary">
            <p className="font-serif text-lg italic leading-relaxed">"{story.content}"</p>
            {story.verseReference && (
              <p className="text-sm text-primary font-medium mt-2 flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                {story.verseReference}
              </p>
            )}
          </div>
        )}
        
        {story.type === 'quote' && (
          <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg p-4 mb-3">
            <p className="text-lg font-medium leading-relaxed">"{story.content}"</p>
          </div>
        )}
        
        {story.type === 'video' && (
          <>
            <p className="text-muted-foreground text-sm mb-3">{story.content}</p>
            <div className="relative aspect-video rounded-lg overflow-hidden bg-muted mb-3">
              {isPlaying && story.mediaUrl && !videoError ? (
                <video 
                  src={story.mediaUrl}
                  controls 
                  autoPlay
                  className="w-full h-full object-cover"
                  onError={() => setVideoError(true)}
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <>
                  {(story.thumbnailUrl || story.mediaUrl) && !imageError && !videoError ? (
                    <>
                      {story.mediaUrl && isVideoFile(story.mediaUrl) ? (
                        <video 
                          src={story.mediaUrl}
                          className="w-full h-full object-cover"
                          muted
                          onError={() => setVideoError(true)}
                        />
                      ) : (
                        <img 
                          src={story.thumbnailUrl || story.mediaUrl} 
                          alt={story.title}
                          className="w-full h-full object-cover"
                          onError={() => setImageError(true)}
                        />
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                      <Play className="w-12 h-12 text-primary/50" />
                    </div>
                  )}
                  <button 
                    onClick={handleVideoPlay}
                    className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors"
                  >
                    <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center hover:scale-110 transition-transform">
                      <Play className="w-8 h-8 text-primary ml-1" fill="currentColor" />
                    </div>
                  </button>
                </>
              )}
            </div>
          </>
        )}
        
        {story.type === 'image' && (
          <>
            <p className="text-muted-foreground text-sm mb-3">{story.content}</p>
            <div className="aspect-video rounded-lg overflow-hidden bg-muted mb-3">
              {story.mediaUrl && !imageError ? (
                <img 
                  src={story.mediaUrl} 
                  alt={story.title}
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                  <span className="text-muted-foreground text-sm">Image not available</span>
                </div>
              )}
            </div>
          </>
        )}
      </div>
      
      {/* Actions */}
      <div className="flex items-center gap-4 px-4 py-3 border-t border-border">
        <button
          onClick={handleLike}
          className={cn(
            "flex items-center gap-1.5 text-sm transition-colors",
            liked ? "text-red-500" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Heart className="w-5 h-5" fill={liked ? "currentColor" : "none"} />
          {likes}
        </button>
        <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <MessageCircle className="w-5 h-5" />
          Comment
        </button>
        <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors ml-auto">
          <Share2 className="w-5 h-5" />
          Share
        </button>
      </div>
    </div>
  );
};
