import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Heart, MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import axios from "axios";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/contexts/ToastContext";

const Comment = ({ comment, onReply, onShowReplies, repliesCount = 0 }) => {
  const level = comment.level || 0;
  const [liked, setLiked] = useState(comment.isLiked || false);
  const [likeCount, setLikeCount] = useState(comment.likes || 0);
  const [loading, setLoading] = useState(false);
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const { success, error } = useToast();

  const handleLike = async () => {
    if (loading) return;
    
    try {
      setLoading(true);
      // Optimistic update
      const newLiked = !liked;
      const newLikeCount = newLiked ? likeCount + 1 : likeCount - 1;
      setLiked(newLiked);
      setLikeCount(newLikeCount);

      const res = await axios.post(`/comment/${comment._id}/like`, {});
      
      if (res.data.success) {
        // Real-time update will handle the final state
        success('toast.success.commentAdded');
      } else {
        // Revert on error
        setLiked(!newLiked);
        setLikeCount(likeCount);
      }
    } catch (error) {
      // Revert on error
      setLiked(!liked);
      setLikeCount(likeCount);
      error('toast.error.commentAdd');
    } finally {
      setLoading(false);
    }
  };

  const handleReply = () => {
    if (onReply) {
      onReply(comment);
    }
  };

  return (
    <div className={`flex gap-3 ${level === 1 ? 'ml-8' : level === 2 ? 'ml-16' : ''} relative`}>
      {/* Tree line for level 1 and 2 */}
      {level > 0 && (
        <div className="absolute left-0 top-0 bottom-0 w-6 flex items-start justify-center">
          <div className={`w-px h-8 ${isDark ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
        </div>
      )}
      
      {/* Tree connector for level 2 */}
      {level === 2 && (
        <div className={`absolute left-6 top-4 w-2 h-px ${isDark ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
      )}
      
      <Avatar className="w-8 h-8 relative z-10">
        <AvatarImage src={comment.author?.profilePicture} />
        <AvatarFallback>
          {comment.author?.username?.charAt(0) || "U"}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className={`${isDark ? 'bg-gray-800' : 'bg-gray-50'} rounded-lg p-3`}>
          <div className="flex items-center gap-2 mb-1">
            <span className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{comment.author?.username}</span>
            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {formatDistanceToNow(new Date(comment.createdAt), {
                addSuffix: true,
                locale: vi
              })}
            </span>
          </div>
          <p className={`text-sm mb-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{comment.text}</p>
          <div className={`flex items-center gap-4 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            <button 
              onClick={handleLike}
              disabled={loading}
              className={`flex items-center gap-1 transition-colors ${
                liked ? 'text-red-500' : isDark ? 'hover:text-gray-300' : 'hover:text-gray-700'
              }`}
            >
              <Heart className={`w-3 h-3 ${liked ? 'fill-current' : ''}`} />
              {likeCount > 0 && <span>{likeCount}</span>}
            </button>
            {level < 2 && (
              <button 
                onClick={handleReply}
                className={`flex items-center gap-1 transition-colors ${isDark ? 'hover:text-gray-300' : 'hover:text-gray-700'}`}
              >
                <MessageCircle className="w-3 h-3" />
{t('chat.reply')}
              </button>
            )}
            {repliesCount > 0 && onShowReplies && !comment.isExpanded && (
              <button 
                onClick={() => onShowReplies(comment)}
                className="flex items-center gap-1 hover:text-blue-600 transition-colors text-blue-500"
              >
{t('chat.viewReplies')} ({repliesCount})
              </button>
            )}
            {repliesCount > 0 && onShowReplies && comment.isExpanded && (
              <button 
                onClick={() => onShowReplies(comment)}
                className="flex items-center gap-1 hover:text-blue-600 transition-colors text-blue-500"
              >
{t('chat.hideReplies')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Comment;
