import React, { createContext, useContext, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setProfile } from "@/redux/authSlice";

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

// Translation object
const translations = {
  en: {
    // Common
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.loading": "Loading...",
    "common.error": "Error",
    "common.success": "Success",

    // Settings
    "settings.title": "Settings",
    "settings.editProfile": "Edit Profile",
    "settings.privacy": "Privacy",
    "settings.security": "Security",
    "settings.appearance": "Appearance",
    "settings.account": "Account",
    "settings.help": "Help",
    "settings.logout": "Log Out",

    // Appearance
    "appearance.theme": "Theme",
    "appearance.language": "Language",
    "appearance.light": "Light",
    "appearance.dark": "Dark",
    "appearance.system": "System",

    // Security
    "security.changePassword": "Change Password",
    "security.currentPassword": "Current Password",
    "security.newPassword": "New Password",
    "security.confirmPassword": "Confirm New Password",
    "security.twoFactor": "Two-Factor Authentication",

    // Account
    "account.downloadData": "Download Your Data",
    "account.deleteAccount": "Delete Account",
    "account.deleteConfirm": 'Type "DELETE" to confirm',

    // Privacy
    "privacy.title": "Privacy Settings",
    "privacy.accountPrivacy": "Account Privacy",
    "privacy.public": "Public",
    "privacy.private": "Private",
    "privacy.publicDesc": "Anyone can see your posts and follow you",
    "privacy.privateDesc": "Only approved followers can see your posts",

    // Sidebar
    "sidebar.home": "Home",
    "sidebar.search": "Search",
    "sidebar.explore": "Explore",
    "sidebar.message": "Message",
    "sidebar.notifications": "Notifications",
    "sidebar.create": "Create",
    "sidebar.profile": "Profile",
    "sidebar.more": "More",
    "sidebar.settings": "Settings",
    "sidebar.activity": "Activity",
    "sidebar.logout": "Logout",

    // Chat
    "chat.selectConversation": "Select a conversation to start",
    "chat.yourMessages": "Your Messages",
    "chat.online": "Online",
    "chat.active": "active",
    "chat.members": "members",
    "chat.details": "Details",
    "chat.replyingTo": "Replying to",
    "chat.typeMessage": "Type a message...",
    "chat.send": "Send",
    "chat.retry": "Retry",
    "chat.loadingMessages": "Loading messages...",
    "chat.noMessages": "No messages yet",
    "chat.startConversation": "Start a conversation",
    "chat.loadMore": "Load More",
    "chat.sending": "Sending...",
    "chat.sent": "Sent",
    "chat.reply": "Reply",
    "chat.viewReplies": "View replies",
    "chat.hideReplies": "Hide",
    "chat.systemNotification": "System notification",
    "chat.groupCreated": "created the group",
    "chat.groupPictureUpdated": "updated the group picture",
    "chat.userAdded": "added {user} to the group",
    "chat.userRemoved": "removed {user} from the group",
    "chat.someone": "Someone",
    "chat.member": "member",
    "chat.you": "You",
    "chat.memberAdded": "Member added",
    "chat.memberRemoved": "Member removed",
    "chat.cannotAddMember": "Cannot add member",
    "chat.cannotRemoveMember": "Cannot remove member",
    "chat.userNotAuthenticated": "User not authenticated",
    "chat.failedLoadConversations": "Failed to load conversations",
    "chat.failedLoadMessages": "Failed to load messages",
    "chat.invalidMessageOrConversation": "Invalid message or conversation",
    "chat.group": "Group",
    "chat.unknown": "Unknown",
    "chat.system": "System",

    // Time display
    "time.justNow": "Just now",
    "time.minutesAgo": "{count} minutes ago",
    "time.hoursAgo": "{count} hours ago",
    "time.yesterday": "Yesterday",
    "time.daysAgo": "{count} days ago",
    "time.weeksAgo": "{count} weeks ago",
    "time.monthsAgo": "{count} months ago",
    "time.yearsAgo": "{count} years ago",
    "time.loadMore": "Load more",

    // Notifications
    "notification.title": "Notifications",
    "notification.markAllRead": "Mark all as read",
    "notification.noNotifications": "No notifications yet",
    "notification.loadMore": "Load more",
    "notification.likedPost": "{user} liked your post",
    "notification.commentedPost": "{user} commented on your post",
    "notification.followedYou": "{user} started following you",
    "notification.acceptedFollow": "{user} accepted your follow request",
    "notification.sentMessage": "{user} sent you a message",
    "notification.addedToGroup": "{user} added you to a group",
    "notification.removedFromGroup": "{user} removed you from a group",
    "notification.groupCreated": "{user} created a group",
    "notification.groupPictureUpdated": "{user} updated group picture",
    "notification.userAdded": "{user} added {target} to the group",
    "notification.userRemoved": "{user} removed {target} from the group",
    "notification.likedComment": "{user} liked your comment",
    "notification.sentFollowRequest": "{user} sent you a follow request",
    "notification.interacted": "{user} interacted",

    // Follow request actions
    "followRequest.accept": "Accept",
    "followRequest.decline": "Decline",
    "followRequest.accepting": "Accepting...",
    "followRequest.declining": "Declining...",
    "followRequest.accepted": "Follow request accepted",
    "followRequest.declined": "Follow request declined",
    "followRequest.acceptError": "Failed to accept follow request",
    "followRequest.declineError": "Failed to decline follow request",

    // Profile
    "profile.posts": "posts",
    "profile.followers": "followers",
    "profile.following": "following",
    "profile.yourProfile": "Your Profile",
    "profile.profile": "Profile",
    "profile.follow": "Follow",
    "profile.unfollow": "Unfollow",
    "profile.message": "Message",
    "profile.pendingAccept": "Pending",
    "profile.viewArchive": "View Archive",
    "profile.noFollowers": "No followers yet",
    "profile.notFollowingAnyone": "Not following anyone",
    "profile.loadingMore": "Loading more...",
    "profile.posts": "Posts",
    "profile.saved": "Saved",
    "profile.noPosts": "No posts yet",
    "profile.noBookmarks": "No saved posts yet",
    "profile.noPostsDesc": "Share your first post to get started",
    "profile.noPostsDescOther": "This user hasn't shared any posts yet",
    "profile.noBookmarksDesc": "Save posts to see them here",

    // Toast messages
    "toast.success.followed": "Successfully followed",
    "toast.success.unfollowed": "Successfully unfollowed",
    "toast.error.follow": "Failed to update follow status",
    "profile.followError": "Error changing follow status",
    "profile.removeFollowerError": "Error removing follower",

    // Auth
    "auth.login": "Log in",
    "auth.signup": "Sign Up",
    "auth.emailOrUsername": "Email or Username",
    "auth.password": "Password",
    "auth.username": "Username",
    "auth.name": "Name",
    "auth.email": "Email",
    "auth.gender": "Gender",
    "auth.selectGender": "Select gender",
    "auth.male": "Male",
    "auth.female": "Female",
    "auth.other": "Other",
    "auth.dontHaveAccount": "Don't have an account?",
    "auth.alreadyHaveAccount": "Already have an account?",
    "auth.loginToFlowfy": "Log in to Flowfy",
    "auth.signupToFlow": 'Sign Up to "flow" with your friends',

    // Feed
    "feed.followMore": "Follow more friends to see feed",
    "feed.suggestedForYou": "Suggested for you",
    "feed.seeAll": "See All",
    "feed.follow": "Follow",

    // Search
    "search.placeholder": "Search users...",
    "search.noResults": "No results found",
    "search.error": "Search error",
    "search.searching": "Searching...",
    "search.clear": "Clear",
  },
  vi: {
    // Common
    "common.save": "Lưu",
    "common.cancel": "Hủy",
    "common.delete": "Xóa",
    "common.edit": "Chỉnh sửa",
    "common.loading": "Đang tải...",
    "common.error": "Lỗi",
    "common.success": "Thành công",

    // Settings
    "settings.title": "Cài đặt",
    "settings.editProfile": "Chỉnh sửa hồ sơ",
    "settings.privacy": "Quyền riêng tư",
    "settings.security": "Bảo mật",
    "settings.appearance": "Giao diện",
    "settings.account": "Tài khoản",
    "settings.help": "Trợ giúp",
    "settings.logout": "Đăng xuất",

    // Appearance
    "appearance.theme": "Chủ đề",
    "appearance.language": "Ngôn ngữ",
    "appearance.light": "Sáng",
    "appearance.dark": "Tối",
    "appearance.system": "Hệ thống",

    // Security
    "security.changePassword": "Đổi mật khẩu",
    "security.currentPassword": "Mật khẩu hiện tại",
    "security.newPassword": "Mật khẩu mới",
    "security.confirmPassword": "Xác nhận mật khẩu mới",
    "security.twoFactor": "Xác thực hai yếu tố",

    // Account
    "account.downloadData": "Tải xuống dữ liệu",
    "account.deleteAccount": "Xóa tài khoản",
    "account.deleteConfirm": 'Nhập "DELETE" để xác nhận',

    // Privacy
    "privacy.title": "Cài đặt quyền riêng tư",
    "privacy.accountPrivacy": "Quyền riêng tư tài khoản",
    "privacy.public": "Công khai",
    "privacy.private": "Riêng tư",
    "privacy.publicDesc": "Mọi người có thể xem bài viết và theo dõi bạn",
    "privacy.privateDesc":
      "Chỉ những người theo dõi được phê duyệt mới có thể xem bài viết của bạn",

    // Sidebar
    "sidebar.home": "Trang chủ",
    "sidebar.search": "Tìm kiếm",
    "sidebar.explore": "Khám phá",
    "sidebar.message": "Tin nhắn",
    "sidebar.notifications": "Thông báo",
    "sidebar.create": "Tạo",
    "sidebar.profile": "Hồ sơ",
    "sidebar.more": "Thêm",
    "sidebar.settings": "Cài đặt",
    "sidebar.activity": "Hoạt động",
    "sidebar.logout": "Đăng xuất",

    // Chat
    "chat.selectConversation": "Chọn một cuộc trò chuyện để bắt đầu",
    "chat.yourMessages": "Tin nhắn của bạn",
    "chat.online": "Trực tuyến",
    "chat.active": "hoạt động",
    "chat.members": "thành viên",
    "chat.details": "Chi tiết",
    "chat.replyingTo": "Đang trả lời",
    "chat.typeMessage": "Nhập tin nhắn...",
    "chat.send": "Gửi",
    "chat.retry": "Thử lại",
    "chat.loadingMessages": "Đang tải tin nhắn...",
    "chat.noMessages": "Chưa có tin nhắn",
    "chat.startConversation": "Bắt đầu cuộc trò chuyện",
    "chat.loadMore": "Tải thêm",
    "chat.sending": "Đang gửi...",
    "chat.sent": "Đã gửi",
    "chat.reply": "Trả lời",
    "chat.viewReplies": "Xem phản hồi",
    "chat.hideReplies": "Ẩn bớt",
    "chat.systemNotification": "Thông báo hệ thống",
    "chat.groupCreated": "đã tạo nhóm",
    "chat.groupPictureUpdated": "đã cập nhật ảnh nhóm",
    "chat.userAdded": "đã thêm {user} vào nhóm",
    "chat.userRemoved": "đã xóa {user} khỏi nhóm",
    "chat.someone": "Ai đó",
    "chat.member": "thành viên",
    "chat.you": "Bạn",
    "chat.memberAdded": "Đã thêm thành viên",
    "chat.memberRemoved": "Đã xóa thành viên",
    "chat.cannotAddMember": "Không thể thêm thành viên",
    "chat.cannotRemoveMember": "Không thể xóa thành viên",
    "chat.userNotAuthenticated": "Người dùng chưa được xác thực",
    "chat.failedLoadConversations": "Không thể tải danh sách cuộc trò chuyện",
    "chat.failedLoadMessages": "Không thể tải tin nhắn",
    "chat.invalidMessageOrConversation":
      "Tin nhắn hoặc cuộc trò chuyện không hợp lệ",
    "chat.group": "Nhóm",
    "chat.unknown": "Không xác định",
    "chat.system": "Hệ thống",

    // Time display
    "time.justNow": "Vừa xong",
    "time.minutesAgo": "{count} phút trước",
    "time.hoursAgo": "{count} giờ trước",
    "time.yesterday": "Hôm qua",
    "time.daysAgo": "{count} ngày trước",
    "time.weeksAgo": "{count} tuần trước",
    "time.monthsAgo": "{count} tháng trước",
    "time.yearsAgo": "{count} năm trước",
    "time.loadMore": "Tải thêm",

    // Notifications
    "notification.title": "Thông báo",
    "notification.markAllRead": "Đánh dấu tất cả đã đọc",
    "notification.noNotifications": "Chưa có thông báo",
    "notification.loadMore": "Tải thêm",
    "notification.likedPost": "{user} đã thích bài viết của bạn",
    "notification.commentedPost": "{user} đã bình luận bài viết của bạn",
    "notification.followedYou": "{user} đã theo dõi bạn",
    "notification.acceptedFollow": "{user} đã chấp nhận yêu cầu theo dõi",
    "notification.sentMessage": "{user} đã gửi tin nhắn cho bạn",
    "notification.addedToGroup": "{user} đã thêm bạn vào nhóm",
    "notification.removedFromGroup": "{user} đã xóa bạn khỏi nhóm",
    "notification.groupCreated": "{user} đã tạo nhóm",
    "notification.groupPictureUpdated": "{user} đã cập nhật ảnh nhóm",
    "notification.userAdded": "{user} đã thêm {target} vào nhóm",
    "notification.userRemoved": "{user} đã xóa {target} khỏi nhóm",
    "notification.likedComment": "{user} đã thích bình luận của bạn",
    "notification.sentFollowRequest": "{user} đã gửi yêu cầu theo dõi",
    "notification.interacted": "{user} đã tương tác",

    // Follow request actions
    "followRequest.accept": "Chấp nhận",
    "followRequest.decline": "Từ chối",
    "followRequest.accepting": "Đang chấp nhận...",
    "followRequest.declining": "Đang từ chối...",
    "followRequest.accepted": "Đã chấp nhận yêu cầu theo dõi",
    "followRequest.declined": "Đã từ chối yêu cầu theo dõi",
    "followRequest.acceptError": "Không thể chấp nhận yêu cầu theo dõi",
    "followRequest.declineError": "Không thể từ chối yêu cầu theo dõi",

    // Profile
    "profile.posts": "bài viết",
    "profile.followers": "người theo dõi",
    "profile.following": "đang theo dõi",
    "profile.yourProfile": "Hồ sơ của bạn",
    "profile.profile": "Hồ sơ",
    "profile.follow": "Theo dõi",
    "profile.unfollow": "Bỏ theo dõi",
    "profile.message": "Nhắn tin",
    "profile.pendingAccept": "Đang chờ",
    "profile.viewArchive": "Xem kho lưu trữ",
    "profile.noFollowers": "Chưa có người theo dõi",
    "profile.notFollowingAnyone": "Chưa theo dõi ai",
    "profile.loadingMore": "Đang tải thêm...",
    "profile.posts": "Bài viết",
    "profile.saved": "Đã lưu",
    "profile.noPosts": "Chưa có bài viết nào",
    "profile.noBookmarks": "Chưa có bài viết nào được lưu",
    "profile.noPostsDesc": "Chia sẻ bài viết đầu tiên để bắt đầu",
    "profile.noPostsDescOther": "Người dùng này chưa chia sẻ bài viết nào",
    "profile.noBookmarksDesc": "Lưu bài viết để xem chúng ở đây",

    // Toast messages
    "toast.success.followed": "Đã theo dõi thành công",
    "toast.success.unfollowed": "Đã bỏ theo dõi thành công",
    "toast.error.follow": "Không thể cập nhật trạng thái theo dõi",
    "profile.followError": "Lỗi khi thay đổi trạng thái theo dõi",
    "profile.removeFollowerError": "Lỗi khi xóa người theo dõi",

    // Auth
    "auth.login": "Đăng nhập",
    "auth.signup": "Đăng ký",
    "auth.emailOrUsername": "Email hoặc Tên đăng nhập",
    "auth.password": "Mật khẩu",
    "auth.username": "Tên đăng nhập",
    "auth.name": "Tên",
    "auth.email": "Email",
    "auth.gender": "Giới tính",
    "auth.selectGender": "Chọn giới tính",
    "auth.male": "Nam",
    "auth.female": "Nữ",
    "auth.other": "Khác",
    "auth.dontHaveAccount": "Chưa có tài khoản?",
    "auth.alreadyHaveAccount": "Đã có tài khoản?",
    "auth.loginToFlowfy": "Đăng nhập vào Flowfy",
    "auth.signupToFlow": 'Đăng ký để "flow" với bạn bè',

    // Feed
    "feed.followMore": "Theo dõi thêm bạn bè để xem feed",
    "feed.suggestedForYou": "Gợi ý cho bạn",
    "feed.seeAll": "Xem tất cả",
    "feed.follow": "Theo dõi",

    // Search
    "search.placeholder": "Tìm kiếm người dùng...",
    "search.noResults": "Không tìm thấy kết quả",
    "search.error": "Lỗi tìm kiếm",
    "search.searching": "Đang tìm kiếm...",
    "search.clear": "Xóa",
  },
};

export const LanguageProvider = ({ children }) => {
  const { profile } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  const [language, setLanguage] = useState("en");

  // Initialize language from profile or localStorage
  useEffect(() => {
    const savedLanguage =
      profile?.language || localStorage.getItem("language") || "en";
    setLanguage(savedLanguage);
    applyLanguage(savedLanguage);
  }, [profile?.language]);

  const applyLanguage = (newLanguage) => {
    // Set document language
    document.documentElement.setAttribute("lang", newLanguage);

    // Save to localStorage
    localStorage.setItem("language", newLanguage);
  };

  const changeLanguage = async (newLanguage) => {
    try {
      // Optimistic update
      setLanguage(newLanguage);
      applyLanguage(newLanguage);

      // Update in database if user is logged in
      if (profile) {
        const response = await fetch(
          "http://localhost:5000/api/v1/user/appearance-settings",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ language: newLanguage }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            dispatch(setProfile(data.user));
          }
        }
      }
    } catch (error) {
      console.error("Failed to update language:", error);
      // Revert on error
      const fallbackLanguage = profile?.language || "en";
      setLanguage(fallbackLanguage);
      applyLanguage(fallbackLanguage);
    }
  };

  const t = (key) => {
    // Try current language first
    if (translations[language]?.[key]) {
      return translations[language][key];
    }
    // Fallback to English
    if (translations.en?.[key]) {
      return translations.en[key];
    }
    // If no translation found, return key
    return key;
  };

  const value = {
    language,
    changeLanguage,
    t,
    isVietnamese: language === "vi",
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
