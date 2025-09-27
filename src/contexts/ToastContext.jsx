import React, { createContext, useContext, useCallback } from 'react';
import { toast } from 'sonner';
import { useTheme } from './ThemeContext';
import { useLanguage } from './LanguageContext';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Toast message translations
const toastTranslations = {
  en: {
    // Success messages
    'toast.success.login': 'Login successful!',
    'toast.success.logout': 'Logout successful!',
    'toast.success.signup': 'Account created successfully!',
    'toast.success.profileUpdated': 'Profile updated successfully!',
    'toast.success.passwordChanged': 'Password changed successfully!',
    'toast.success.postCreated': 'Post created successfully!',
    'toast.success.postDeleted': 'Post deleted successfully!',
    'toast.success.commentAdded': 'Comment added successfully!',
    'toast.success.commentDeleted': 'Comment deleted successfully!',
    'toast.success.followed': 'You are now following this user!',
    'toast.success.unfollowed': 'You have unfollowed this user!',
    'toast.success.messageSent': 'Message sent successfully!',
    'toast.success.groupCreated': 'Group created successfully!',
    'toast.success.userAdded': 'User added to group!',
    'toast.success.userRemoved': 'User removed from group!',
    'toast.success.avatarUpdated': 'Avatar updated successfully!',
    'toast.success.settingsSaved': 'Settings saved successfully!',
    
    // Error messages
    'toast.error.login': 'Login failed. Please check your credentials.',
    'toast.error.logout': 'Logout failed. Please try again.',
    'toast.error.signup': 'Signup failed. Please try again.',
    'toast.error.profileUpdate': 'Failed to update profile. Please try again.',
    'toast.error.passwordChange': 'Failed to change password. Please try again.',
    'toast.error.postCreate': 'Failed to create post. Please try again.',
    'toast.error.postDelete': 'Failed to delete post. Please try again.',
    'toast.error.commentAdd': 'Failed to add comment. Please try again.',
    'toast.error.commentDelete': 'Failed to delete comment. Please try again.',
    'toast.error.follow': 'Failed to follow user. Please try again.',
    'toast.error.unfollow': 'Failed to unfollow user. Please try again.',
    'toast.error.messageSend': 'Failed to send message. Please try again.',
    'toast.error.groupCreate': 'Failed to create group. Please try again.',
    'toast.error.userAdd': 'Failed to add user to group. Please try again.',
    'toast.error.userRemove': 'Failed to remove user from group. Please try again.',
    'toast.error.avatarUpdate': 'Failed to update avatar. Please try again.',
    'toast.error.settingsSave': 'Failed to save settings. Please try again.',
    'toast.error.network': 'Network error. Please check your connection.',
    'toast.error.unauthorized': 'You are not authorized to perform this action.',
    'toast.error.forbidden': 'Access denied. You do not have permission.',
    'toast.error.notFound': 'The requested resource was not found.',
    'toast.error.server': 'Server error. Please try again later.',
    'toast.error.validation': 'Please check your input and try again.',
    'toast.error.fileUpload': 'Failed to upload file. Please try again.',
    'toast.error.fileSize': 'File size is too large. Please choose a smaller file.',
    'toast.error.fileType': 'Invalid file type. Please choose a supported file.',
    
    // Warning messages
    'toast.warning.unsavedChanges': 'You have unsaved changes. Are you sure you want to leave?',
    'toast.warning.accountDeletion': 'Account deletion is permanent and cannot be undone.',
    'toast.warning.postDeletion': 'Post deletion is permanent and cannot be undone.',
    'toast.warning.commentDeletion': 'Comment deletion is permanent and cannot be undone.',
    'toast.warning.groupLeave': 'Are you sure you want to leave this group?',
    'toast.warning.dataLoss': 'This action may cause data loss. Please proceed with caution.',
    
    // Info messages
    'toast.info.loading': 'Loading...',
    'toast.info.saving': 'Saving...',
    'toast.info.uploading': 'Uploading...',
    'toast.info.processing': 'Processing...',
    'toast.info.connecting': 'Connecting...',
    'toast.info.disconnected': 'Connection lost. Attempting to reconnect...',
    'toast.info.reconnected': 'Connection restored!',
    'toast.info.newMessage': 'New message received',
    'toast.info.newNotification': 'New notification',
    'toast.info.updateAvailable': 'Update available. Please refresh the page.',
  },
  vi: {
    // Success messages
    'toast.success.login': 'Đăng nhập thành công!',
    'toast.success.logout': 'Đăng xuất thành công!',
    'toast.success.signup': 'Tạo tài khoản thành công!',
    'toast.success.profileUpdated': 'Cập nhật hồ sơ thành công!',
    'toast.success.passwordChanged': 'Đổi mật khẩu thành công!',
    'toast.success.postCreated': 'Tạo bài viết thành công!',
    'toast.success.postDeleted': 'Xóa bài viết thành công!',
    'toast.success.commentAdded': 'Thêm bình luận thành công!',
    'toast.success.commentDeleted': 'Xóa bình luận thành công!',
    'toast.success.followed': 'Bạn đã theo dõi người dùng này!',
    'toast.success.unfollowed': 'Bạn đã bỏ theo dõi người dùng này!',
    'toast.success.messageSent': 'Gửi tin nhắn thành công!',
    'toast.success.groupCreated': 'Tạo nhóm thành công!',
    'toast.success.userAdded': 'Đã thêm người dùng vào nhóm!',
    'toast.success.userRemoved': 'Đã xóa người dùng khỏi nhóm!',
    'toast.success.avatarUpdated': 'Cập nhật avatar thành công!',
    'toast.success.settingsSaved': 'Lưu cài đặt thành công!',
    
    // Error messages
    'toast.error.login': 'Đăng nhập thất bại. Vui lòng kiểm tra thông tin đăng nhập.',
    'toast.error.logout': 'Đăng xuất thất bại. Vui lòng thử lại.',
    'toast.error.signup': 'Đăng ký thất bại. Vui lòng thử lại.',
    'toast.error.profileUpdate': 'Cập nhật hồ sơ thất bại. Vui lòng thử lại.',
    'toast.error.passwordChange': 'Đổi mật khẩu thất bại. Vui lòng thử lại.',
    'toast.error.postCreate': 'Tạo bài viết thất bại. Vui lòng thử lại.',
    'toast.error.postDelete': 'Xóa bài viết thất bại. Vui lòng thử lại.',
    'toast.error.commentAdd': 'Thêm bình luận thất bại. Vui lòng thử lại.',
    'toast.error.commentDelete': 'Xóa bình luận thất bại. Vui lòng thử lại.',
    'toast.error.follow': 'Theo dõi người dùng thất bại. Vui lòng thử lại.',
    'toast.error.unfollow': 'Bỏ theo dõi người dùng thất bại. Vui lòng thử lại.',
    'toast.error.messageSend': 'Gửi tin nhắn thất bại. Vui lòng thử lại.',
    'toast.error.groupCreate': 'Tạo nhóm thất bại. Vui lòng thử lại.',
    'toast.error.userAdd': 'Thêm người dùng vào nhóm thất bại. Vui lòng thử lại.',
    'toast.error.userRemove': 'Xóa người dùng khỏi nhóm thất bại. Vui lòng thử lại.',
    'toast.error.avatarUpdate': 'Cập nhật avatar thất bại. Vui lòng thử lại.',
    'toast.error.settingsSave': 'Lưu cài đặt thất bại. Vui lòng thử lại.',
    'toast.error.network': 'Lỗi mạng. Vui lòng kiểm tra kết nối.',
    'toast.error.unauthorized': 'Bạn không có quyền thực hiện hành động này.',
    'toast.error.forbidden': 'Truy cập bị từ chối. Bạn không có quyền.',
    'toast.error.notFound': 'Không tìm thấy tài nguyên được yêu cầu.',
    'toast.error.server': 'Lỗi máy chủ. Vui lòng thử lại sau.',
    'toast.error.validation': 'Vui lòng kiểm tra thông tin nhập vào và thử lại.',
    'toast.error.fileUpload': 'Tải lên tệp thất bại. Vui lòng thử lại.',
    'toast.error.fileSize': 'Kích thước tệp quá lớn. Vui lòng chọn tệp nhỏ hơn.',
    'toast.error.fileType': 'Loại tệp không hợp lệ. Vui lòng chọn tệp được hỗ trợ.',
    
    // Warning messages
    'toast.warning.unsavedChanges': 'Bạn có thay đổi chưa được lưu. Bạn có chắc muốn rời đi?',
    'toast.warning.accountDeletion': 'Xóa tài khoản là vĩnh viễn và không thể hoàn tác.',
    'toast.warning.postDeletion': 'Xóa bài viết là vĩnh viễn và không thể hoàn tác.',
    'toast.warning.commentDeletion': 'Xóa bình luận là vĩnh viễn và không thể hoàn tác.',
    'toast.warning.groupLeave': 'Bạn có chắc muốn rời khỏi nhóm này?',
    'toast.warning.dataLoss': 'Hành động này có thể gây mất dữ liệu. Vui lòng thận trọng.',
    
    // Info messages
    'toast.info.loading': 'Đang tải...',
    'toast.info.saving': 'Đang lưu...',
    'toast.info.uploading': 'Đang tải lên...',
    'toast.info.processing': 'Đang xử lý...',
    'toast.info.connecting': 'Đang kết nối...',
    'toast.info.disconnected': 'Mất kết nối. Đang thử kết nối lại...',
    'toast.info.reconnected': 'Kết nối đã được khôi phục!',
    'toast.info.newMessage': 'Có tin nhắn mới',
    'toast.info.newNotification': 'Có thông báo mới',
    'toast.info.updateAvailable': 'Có bản cập nhật. Vui lòng làm mới trang.',
  }
};

export const ToastProvider = ({ children }) => {
  const { isDark } = useTheme();
  const { t } = useLanguage();

  // Get translated toast message
  const getToastMessage = useCallback((key, fallback = '') => {
    // Try current language first
    if (toastTranslations[t.language]?.[key]) {
      return toastTranslations[t.language][key];
    }
    // Fallback to English
    if (toastTranslations.en?.[key]) {
      return toastTranslations.en[key];
    }
    // Return fallback or key
    return fallback || key;
  }, [t.language]);

  // Success toast
  const success = useCallback((key, options = {}) => {
    const message = getToastMessage(key, options.message);
    return toast.success(message, {
      ...options,
      className: isDark ? 'dark' : '',
    });
  }, [getToastMessage, isDark]);

  // Error toast
  const error = useCallback((key, options = {}) => {
    const message = getToastMessage(key, options.message);
    return toast.error(message, {
      ...options,
      className: isDark ? 'dark' : '',
    });
  }, [getToastMessage, isDark]);

  // Warning toast
  const warning = useCallback((key, options = {}) => {
    const message = getToastMessage(key, options.message);
    return toast.warning(message, {
      ...options,
      className: isDark ? 'dark' : '',
    });
  }, [getToastMessage, isDark]);

  // Info toast
  const info = useCallback((key, options = {}) => {
    const message = getToastMessage(key, options.message);
    return toast.info(message, {
      ...options,
      className: isDark ? 'dark' : '',
    });
  }, [getToastMessage, isDark]);

  // Loading toast
  const loading = useCallback((key, options = {}) => {
    const message = getToastMessage(key, options.message);
    return toast.loading(message, {
      ...options,
      className: isDark ? 'dark' : '',
    });
  }, [getToastMessage, isDark]);

  // Promise toast
  const promise = useCallback((promise, options = {}) => {
    const successKey = options.success || 'toast.success.generic';
    const errorKey = options.error || 'toast.error.generic';
    
    return toast.promise(promise, {
      loading: getToastMessage(options.loading || 'toast.info.loading'),
      success: getToastMessage(successKey),
      error: getToastMessage(errorKey),
      ...options,
      className: isDark ? 'dark' : '',
    });
  }, [getToastMessage, isDark]);

  // Dismiss toast
  const dismiss = useCallback((toastId) => {
    return toast.dismiss(toastId);
  }, []);

  // Dismiss all toasts
  const dismissAll = useCallback(() => {
    return toast.dismiss();
  }, []);

  const value = {
    success,
    error,
    warning,
    info,
    loading,
    promise,
    dismiss,
    dismissAll,
    getToastMessage,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
};
