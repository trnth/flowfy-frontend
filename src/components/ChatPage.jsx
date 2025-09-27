import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { FaRegEdit } from "react-icons/fa";
import { MessageCircleCode, RotateCw } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import Messages from "./Messages";
import axios from "axios";
import {
  setMessages,
  setSelectedConversation,
  setConversation,
  addMessage,
  removeMessage,
  setLastRead,
} from "@/redux/chatSlice";
import useSocket from "@/hooks/useSocket";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/contexts/ToastContext";
import { vi } from "date-fns/locale";
import NewConversationDialog from "./NewConversationDialog";
import EditGroupMembersDialog from "./EditGroupMembersDialog";
import EditGroupPicture from "./EditGroupPicture";
import GroupDetailDialog from "./GroupDetailDialog";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { getCommonClasses } from "@/utils/themeUtils";

const ChatPage = () => {
  const user = useSelector((store) => store.auth.profile);
  const {
    conversations,
    selectedConversation,
    lastReadMessageId,
    lastConversationId,
  } = useSelector((store) => store.chat);
  const onlineUsers = useSelector((store) => store.user.onlineUsers);
  const dispatch = useDispatch();
  const socket = useSocket();
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const { success, error } = useToast();
  const classes = getCommonClasses(isDark);

  const [textMessage, setTextMessage] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [messageStatus, setMessageStatus] = useState(null);
  const [tempMessageId, setTempMessageId] = useState(null);
  const [openNewConv, setOpenNewConv] = useState(false);
  const [uploadingGroupPicture, setUploadingGroupPicture] = useState(false);
  const [addingUsers, setAddingUsers] = useState(false);
  const [removingUsers, setRemovingUsers] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(Date.now());
  const groupPicInputRef = React.useRef(null);
  const [groupPicSrc, setGroupPicSrc] = useState(null);
  const [openEditGroupPic, setOpenEditGroupPic] = useState(false);
  const [openEditMembers, setOpenEditMembers] = useState(false);
  const [openGroupDetail, setOpenGroupDetail] = useState(false);
  const [editMode, setEditMode] = useState("add");
  const lastConvUpdateRef = React.useRef({});
  const conversationsRef = React.useRef(conversations);
  const selectedConvRef = React.useRef(selectedConversation);

  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);
  useEffect(() => {
    selectedConvRef.current = selectedConversation;
  }, [selectedConversation]);

  useEffect(() => {
    console.log("onlineUsers:", onlineUsers);
  }, [onlineUsers]);

  const fetchConversations = async () => {
    if (!user?._id) {
      toast.error(t('chat.userNotAuthenticated'));
      return;
    }
    try {
      const res = await axios.get(`/message/all`);
      if (res.data.success) {
        console.log("Fetched conversations:", res.data.conversations);
        const incoming = Array.isArray(res.data.conversations) ? res.data.conversations : [];
        // Merge an toàn: chỉ ghi đè nếu mới hơn
        const merged = [...(conversations || [])];
        const byId = new Map(merged.map((c) => [c._id, c]));
        incoming.forEach((inc) => {
          const cur = byId.get(inc._id);
          if (!cur) {
            byId.set(inc._id, inc);
            return;
          }
          const curTs = new Date(cur.lastMessage?.createdAt || cur.updatedAt || 0).getTime();
          const incTs = new Date(inc.lastMessage?.createdAt || inc.updatedAt || 0).getTime();
          if (incTs >= curTs) {
            // Guard: tránh ghi đè bằng lastMessage thiếu
            const incValid = !inc.lastMessage || inc.lastMessage.type === "system" || (inc.lastMessage.text && inc.lastMessage.sender);
            if (incValid) byId.set(inc._id, { ...cur, ...inc });
          }
        });
        const next = Array.from(byId.values()).sort((a, b) => {
          const at = new Date(a.lastMessage?.createdAt || a.updatedAt || 0).getTime();
          const bt = new Date(b.lastMessage?.createdAt || b.updatedAt || 0).getTime();
          return bt - at;
        });
        dispatch(setConversation(next));
      } else {
        toast.error(res.data.error || t('chat.failedLoadConversations'));
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
      toast.error(
        error.response?.data?.error || t('chat.failedLoadConversations')
      );
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [dispatch, user]);

  useEffect(() => {
    if (!socket) return;

    const handleConversationUpdated = (data) => {
      console.log("Received conversationUpdated:", data);
      const { conversationId, lastRead, unread, lastMessage, participantsCount, updatedAt } = data;
      const incomingTs = new Date(lastMessage?.createdAt || updatedAt || 0).getTime();
      const lockTs = lastConvUpdateRef.current[conversationId] || 0;
      if (incomingTs && lockTs && incomingTs < lockTs) {
        console.log("Skip stale conversationUpdated due to lockTs", { incomingTs, lockTs });
        return;
      }
      const base = conversationsRef.current || [];
      const updatedConversations = base.map((conv) => {
        if (conv._id !== conversationId) return conv;
        // Chỉ ghi đè lastMessage nếu payload mới hơn
        const currentTs = new Date(conv.lastMessage?.createdAt || conv.updatedAt || 0).getTime();
        // Guard: bỏ qua payload lastMessage thiếu dữ liệu quan trọng
        const isValidIncoming = !!lastMessage && (
          (lastMessage.type === "system") ||
          (lastMessage.text && lastMessage.sender)
        );
        const nextLastMessage = (incomingTs >= currentTs && isValidIncoming) ? lastMessage : conv.lastMessage;
        return {
          ...conv,
          lastRead: lastRead ?? conv.lastRead,
          unread: typeof unread === "boolean" ? unread : conv.unread,
          lastMessage: nextLastMessage,
          participantsCount: participantsCount ?? conv.participantsCount,
          updatedAt: updatedAt || conv.updatedAt,
        };
      });
      // Reorder list by lastMessage.createdAt desc, fallback updatedAt
      const sorted = [...updatedConversations].sort((a, b) => {
        const at = new Date(a.lastMessage?.createdAt || a.updatedAt || 0).getTime();
        const bt = new Date(b.lastMessage?.createdAt || b.updatedAt || 0).getTime();
        return bt - at;
      });
      // Guard: chỉ dispatch nếu có thay đổi thực sự
      const prev = conversationsRef.current || [];
      const sameLength = prev.length === sorted.length;
      const sameOrder = sameLength && prev.every((c, i) => {
        const n = sorted[i];
        const cKey = `${c._id}:${c.lastMessage?._id || ''}:${c.lastMessage?.createdAt || c.updatedAt || ''}`;
        const nKey = `${n._id}:${n.lastMessage?._id || ''}:${n.lastMessage?.createdAt || n.updatedAt || ''}`;
        return cKey === nKey;
      });
      if (!sameOrder) {
        dispatch(setConversation(sorted));
      }
      if (incomingTs) {
        lastConvUpdateRef.current[conversationId] = incomingTs;
      }
      const sc = selectedConvRef.current;
      if (sc?._id === conversationId && lastRead && !unread) {
        dispatch(
          setLastRead({ lastMessageId: lastRead[user._id], conversationId })
        );
      }
    };

    socket.on("conversationUpdated", handleConversationUpdated);

    return () => {
      socket.off("conversationUpdated", handleConversationUpdated);
    };
  }, [socket, user._id, dispatch]);

  // Cập nhật lastActive khi server phát sự kiện sau disconnect
  useEffect(() => {
    if (!socket) return;
    const handleUserLastActive = ({ userId, lastActive }) => {
      const base = conversationsRef.current || [];
      const updated = base.map((conv) => {
        const participants = conv.participants?.map((p) =>
          p?._id === userId ? { ...p, lastActive } : p
        );
        return { ...conv, participants };
      });
      dispatch(setConversation(updated));
      const sc = selectedConvRef.current;
      if (sc?._id) {
        const hasUser = sc.participants?.some(
          (p) => p?._id === userId
        );
        if (hasUser) {
          const scUpdated = {
            ...sc,
            participants: sc.participants.map((p) =>
              p?._id === userId ? { ...p, lastActive } : p
            ),
          };
          dispatch(setSelectedConversation(scUpdated));
        }
      }
    };
    socket.on("userLastActiveUpdated", handleUserLastActive);
    return () => socket.off("userLastActiveUpdated", handleUserLastActive);
  }, [socket, dispatch]);

  const selectConversationHandler = async (conversation) => {
    if (!conversation?._id) {
      error('toast.error.notFound');
      return;
    }
    try {
      console.log("Selecting conversation:", conversation._id);
      dispatch(setSelectedConversation(conversation));

      const res = await axios.get(`/message/${conversation._id}/all`);
      if (res.data.success) {
        console.log(
          "Fetched messages for conversation:",
          conversation._id,
          res.data.messages
        );
        dispatch(setMessages(res.data.messages));
      } else {
        toast.error(res.data.error || t('chat.failedLoadMessages'));
      }
    } catch (error) {
      console.error("Error selecting conversation:", error);
      toast.error(error.response?.data?.error || t('chat.failedLoadMessages'));
    }
  };

  const updateConversationUnread = (conversationId) => {
    console.log("Updating unread for conversation:", conversationId);
    const base = conversationsRef.current || [];
    const updatedConversations = base.map((conv) =>
      conv._id === conversationId ? { ...conv, unread: false } : conv
    );
    // Re-sort theo tiêu chí chung
    const sorted = [...updatedConversations].sort((a, b) => {
      const at = new Date(a.lastMessage?.createdAt || a.updatedAt || 0).getTime();
      const bt = new Date(b.lastMessage?.createdAt || b.updatedAt || 0).getTime();
      return bt - at;
    });
    // Guard: chỉ dispatch nếu có thay đổi thực sự
    const prev = conversationsRef.current || [];
    const sameLength = prev.length === sorted.length;
    const sameOrder = sameLength && prev.every((c, i) => {
      const n = sorted[i];
      const cKey = `${c._id}:${c.unread ? 1 : 0}:${c.lastMessage?._id || ''}:${c.lastMessage?.createdAt || c.updatedAt || ''}`;
      const nKey = `${n._id}:${n.unread ? 1 : 0}:${n.lastMessage?._id || ''}:${n.lastMessage?.createdAt || n.updatedAt || ''}`;
      return cKey === nKey;
    });
    if (!sameOrder) {
      dispatch(setConversation(sorted));
    }
  };

  const truncateMessage = (text, maxLength = 25) => {
    if (!text) return "";
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  };

  const handleSendMessage = async (
    text = textMessage,
    replyToId = replyingTo?._id
  ) => {
    if (!text.trim() || !selectedConversation?._id) {
      toast.error(t('chat.invalidMessageOrConversation'));
      return;
    }
    setMessageStatus("pending");
    const tempId = `temp-${Date.now()}`;
    const tempMessage = {
      _id: tempId,
      sender: {
        _id: user._id,
        username: user.username,
        profilePicture: user.profilePicture,
      },
      text,
      conversationId: selectedConversation._id,
      createdAt: new Date().toISOString(),
      reply_to_id: replyToId || null,
      isTemp: true,
    };
    setTempMessageId(tempId);
    dispatch(addMessage(tempMessage));
    // Optimistic: cập nhật danh sách hội thoại ngay để tắt unread và cập nhật preview
    {
      const optimisticConversations = conversations.map((conv) =>
        conv._id === selectedConversation._id
          ? {
              ...conv,
              unread: false,
              lastMessage: {
                _id: tempId,
                text,
                createdAt: tempMessage.createdAt,
                sender: tempMessage.sender,
              },
            }
          : conv
      );
      // Đưa lên đầu danh sách theo thời gian tạo temp
      const sorted = [...optimisticConversations].sort((a, b) => {
        const at = new Date(a.lastMessage?.createdAt || a.updatedAt || 0).getTime();
        const bt = new Date(b.lastMessage?.createdAt || b.updatedAt || 0).getTime();
        return bt - at;
      });
      dispatch(setConversation(sorted));
    }

    try {
      const isNewConversation = selectedConversation._id.startsWith("temp-");
      const url = isNewConversation
        ? `/message/new/send`
        : `/message/${selectedConversation._id}/send`;

      const payload = isNewConversation
        ? {
            textMessage: text,
            replyToId: replyToId || null,
            recipientId: selectedConversation.participants.find(
              (p) => p !== user._id
            ),
          }
        : {
            textMessage: text,
            replyToId: replyToId || null,
          };

      const res = await axios.post(url, payload, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      if (res.status === 201 && res.data?.success) {
        const processedNewMessage = {
          ...res.data.newMessage,
          createdAt: new Date(res.data.newMessage.createdAt).toISOString(),
          reply_to_id: res.data.newMessage.reply_to_id
            ? {
                ...res.data.newMessage.reply_to_id,
                createdAt: new Date(
                  res.data.newMessage.reply_to_id.createdAt
                ).toISOString(),
              }
            : null,
        };
        setMessageStatus("sent");
        dispatch(removeMessage(tempId));
        dispatch(addMessage(processedNewMessage));
        // Kéo xuống đáy khi là người gửi
        try {
          const container = document.querySelector('[data-messages-container]');
          if (container) {
            container.scrollTop = container.scrollHeight;
          }
        } catch {}

        if (isNewConversation) {
          // Cập nhật selectedConversation với ID thực sự
          dispatch(
            setSelectedConversation({
              _id: res.data.newMessage.conversationId,
              participants: [user._id, payload.recipientId].sort(), // Sắp xếp participants
              isGroup: false,
              lastRead: new Map([
                [user._id, processedNewMessage._id],
                [payload.recipientId, null],
              ]),
              unread: false,
            })
          );
        }

        const updatedConversations = conversations.map((conv) =>
          conv._id === selectedConversation._id
            ? { ...conv, lastMessage: processedNewMessage, unread: false }
            : conv
        );
        const sorted = [...updatedConversations].sort((a, b) => {
          const at = new Date(a.lastMessage?.createdAt || a.updatedAt || 0).getTime();
          const bt = new Date(b.lastMessage?.createdAt || b.updatedAt || 0).getTime();
          return bt - at;
        });
        dispatch(setConversation(sorted));
        setTextMessage("");
        setReplyingTo(null);
        setTempMessageId(null);

        return processedNewMessage;
      } else {
        setMessageStatus("failed");
        error('toast.error.messageSend');
        return null;
      }
    } catch (error) {
      console.error("Send message error:", error);
      setMessageStatus("failed");
      error('toast.error.messageSend');
      return null;
    }
  };

  const handleSendMessageWithRead = async (messageText) => {
    try {
      const newMessage = await handleSendMessage(messageText);
      if (newMessage?._id && selectedConversation?._id) {
        if (
          lastReadMessageId !== newMessage._id ||
          lastConversationId !== selectedConversation._id
        ) {
          console.log("Calling updateLastRead after sending message:", {
            conversationId: selectedConversation._id,
            lastMessageId: newMessage._id,
          });
          await axios.post(
            `/message/${selectedConversation._id}/read`,
            { lastMessageId: newMessage._id }
          );
          dispatch(
            setLastRead({
              lastMessageId: newMessage._id,
              conversationId: selectedConversation._id,
            })
          );
          updateConversationUnread(selectedConversation._id);
        }
      }
    } catch (err) {
      console.error("Error sending message or marking read:", err);
    }
  };

  const handleRetrySend = async () => {
    if (tempMessageId) {
      dispatch(removeMessage(tempMessageId));
      setTempMessageId(null);
    }
    await handleSendMessage();
    try {
      const container = document.querySelector('[data-messages-container]');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    } catch {}
  };

  const cancelReplyHandler = () => {
    setReplyingTo(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessageWithRead(textMessage);
    }
  };

  const onChangeGroupPicture = (e) => {
    const file = e.target.files?.[0];
    if (!file || !selectedConversation?.isGroup) return;
    const url = URL.createObjectURL(file);
    setGroupPicSrc(url);
    setOpenEditGroupPic(true);
  };

  const onAddUsersToGroup = async (userIds = []) => {
    if (!selectedConversation?.isGroup || !userIds.length) return;
    try {
      setAddingUsers(true);
      const res = await axios.post(
        `/message/${selectedConversation._id}/add`,
        { userIds, addedBy: user._id }
      );
      if (res.data?.conversation) {
        const updated = conversations.map((c) =>
          c._id === selectedConversation._id ? res.data.conversation : c
        );
        dispatch(setConversation(updated));
        dispatch(setSelectedConversation(res.data.conversation));
        toast.success(t('chat.memberAdded'));
      }
    } catch (err) {
      console.error("Add users error:", err);
      toast.error(t('chat.cannotAddMember'));
    } finally {
      setAddingUsers(false);
    }
  };

  const onRemoveUsersFromGroup = async (userIds = []) => {
    if (!selectedConversation?.isGroup || !userIds.length) return;
    try {
      setRemovingUsers(true);
      const res = await axios.delete(
        `/message/${selectedConversation._id}/remove`,
        { data: { userIds } }
      );
      if (res.data?.conversation) {
        const updated = conversations.map((c) =>
          c._id === selectedConversation._id ? res.data.conversation : c
        );
        dispatch(setConversation(updated));
        dispatch(setSelectedConversation(res.data.conversation));
        toast.success(t('chat.memberRemoved'));
      }
    } catch (err) {
      console.error("Remove users error:", err);
      toast.error(t('chat.cannotRemoveMember'));
    } finally {
      setRemovingUsers(false);
    }
  };

  return (
    <div className="flex md:ml-[80px] h-screen bg-white dark:bg-slate-900">
      <section className="w-20 lg:w-[350px] border-r border-slate-200 dark:border-slate-700">
        <div className="flex justify-center lg:justify-between items-center">
          <h1 className="font-bold my-4 px-3 text-lg hidden lg:block text-slate-900 dark:text-slate-100">
            {user?.username || "User"}
          </h1>
          <FaRegEdit
            className="w-8 h-8 lg:mx-4 my-4 cursor-pointer text-slate-900 dark:text-slate-100"
            onClick={() => setOpenNewConv(true)}
          />
        </div>
        <hr className="border-slate-200 dark:border-slate-700" />
        <div className="overflow-y-auto h-[80vh]">
          {[...(conversations || [])]
            .sort((a, b) => {
              if (!!a.unread !== !!b.unread) return a.unread ? -1 : 1;
              const at = new Date(a.lastMessage?.createdAt || a.updatedAt || 0);
              const bt = new Date(b.lastMessage?.createdAt || b.updatedAt || 0);
              return bt - at;
            })
            .map((conversation) => {
            const recipient = conversation.isGroup
              ? null
              : conversation.participants?.find((p) => p?._id !== user?._id);
            const isOnline = recipient && onlineUsers?.includes(recipient?._id);
            const groupAnyOnline = conversation.isGroup
              ? (conversation.participants || []).some((p) =>
                  onlineUsers?.includes(p?._id)
                )
              : false;
            const groupOnlySelfOnline = conversation.isGroup
              ? (conversation.participants || []).filter((p) =>
                  onlineUsers?.includes(p?._id)
                ).length === 1 && onlineUsers?.includes(user?._id)
              : false;
            const lastMessage = conversation.lastMessage;
            const senderName =
              lastMessage?.sender?._id === user?._id
                ? t('chat.you')
                : lastMessage?.sender?.username || t('chat.system');
            const timeAgo = lastMessage?.createdAt
              ? formatDistanceToNow(new Date(lastMessage.createdAt), {
                  addSuffix: false,
                  locale: vi,
                })
              : "";
              return (
              <div
                key={conversation._id}
                onClick={() => selectConversationHandler(conversation)}
                className={`flex gap-3 items-center p-3 hover:theme-bg-secondary cursor-pointer theme-transition ${
                  selectedConversation?._id === conversation._id
                    ? "theme-bg-tertiary"
                    : ""
                }`}
              >
                <div className="relative">
                  <Avatar className="w-14 h-14">
                    <AvatarImage
                      src={
                        conversation.isGroup
                          ? conversation.groupPicture || undefined
                          : recipient?.profilePicture || undefined
                      }
                    />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                    {conversation.unread && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-blue-500 border-2 border-white" />
                    )}
                  {!conversation.isGroup && (
                    <span
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${
                        isOnline ? "bg-green-600" : "bg-red-600"
                      }`}
                    ></span>
                  )}
                  {conversation.isGroup && groupAnyOnline && (
                    <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${
                      groupOnlySelfOnline ? "bg-red-600" : "bg-green-600"
                    }`}></span>
                  )}
                </div>
                <div className="hidden lg:flex lg:flex-col flex-1">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-900 dark:text-slate-100">
                      {conversation.isGroup
                        ? conversation.groupName || t('chat.group')
                        : recipient?.username || t('chat.unknown')}
                    </span>
                    <span className="ml-auto text-xs text-slate-500 dark:text-slate-400">
                      {timeAgo}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {conversation.isGroup
                      ? `Group (${conversation.participantsCount || 0} ${t('chat.members')})`
                      : ""}
                  </span>
                  {lastMessage && (
                    (() => {
                      const isSystem = lastMessage.type === "system";
                      let systemText = "";
                      if (isSystem) {
                        if (lastMessage.event === "group_created") {
                          systemText = `${lastMessage.sender?.username || t('chat.someone')} ${t('chat.groupCreated')}`;
                        } else if (lastMessage.event === "group_picture_updated") {
                          systemText = `${lastMessage.sender?.username || t('chat.someone')} ${t('chat.groupPictureUpdated')}`;
                        } else if (lastMessage.event === "user_added") {
                          const targetName = lastMessage.targetUser?.username || t('chat.member');
                          systemText = `${lastMessage.sender?.username || t('chat.someone')} ${t('chat.userAdded').replace('{user}', targetName)}`;
                        } else if (lastMessage.event === "user_removed") {
                          const targetName = lastMessage.targetUser?.username || t('chat.member');
                          systemText = `${lastMessage.sender?.username || t('chat.someone')} ${t('chat.userRemoved').replace('{user}', targetName)}`;
                        } else {
                          systemText = lastMessage.text || t('chat.systemNotification');
                        }
                      }
                      return (
                        <span className="text-xs text-slate-600 dark:text-slate-300 truncate">
                          {isSystem ? systemText : (
                            <>{senderName}: {truncateMessage(lastMessage.text)}</>
                          )}
                        </span>
                      );
                    })()
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {selectedConversation && user ? (
        <section className="flex-1 flex flex-col h-full">
          <div className="flex gap-3 items-center px-3 py-1 border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-900 z-10">
            <Avatar
              className="h-14 w-14 cursor-pointer"
              onClick={() => {
                if (selectedConversation.isGroup && groupPicInputRef.current) {
                  groupPicInputRef.current.click();
                }
              }}
            >
              <AvatarImage
                src={
                  selectedConversation.isGroup
                    ? selectedConversation.groupPicture || undefined
                    : selectedConversation.participants?.find(
                        (p) => p?._id !== user?._id
                      )?.profilePicture || undefined
                }
              />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div className="flex flex-col font-semibold">
              <span className="text-slate-900 dark:text-slate-100">
                {selectedConversation.isGroup
                  ? selectedConversation.groupName || t('chat.group')
                  : selectedConversation.participants?.find(
                      (p) => p?._id !== user?._id
                    )?.username || t('chat.unknown')}
              </span>
              {selectedConversation.isGroup ? (
                (() => {
                  // Kiểm tra có thành viên nào khác đang online không (ngoại trừ bản thân)
                  const otherParticipants = selectedConversation.participants?.filter(
                    (p) => p?._id !== user?._id
                  ) || [];
                  const onlineOthers = otherParticipants.filter(
                    (p) => onlineUsers?.includes(p?._id)
                  );
                  const hasOnlineMembers = onlineOthers.length > 0;
                  
                  return (
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {hasOnlineMembers 
                        ? `${onlineOthers.length} ${t('chat.members')} ${t('chat.active')}`
                        : `${selectedConversation.participantsCount || 0} ${t('chat.members')}`
                      }
                    </span>
                  );
                })()
              ) : (
                (() => {
                  const recipient = selectedConversation.participants?.find(
                    (p) => p?._id !== user?._id
                  );
                  const isOnline = recipient && onlineUsers?.includes(recipient?._id);
                  const lastActive = recipient?.lastActive;
                  return (
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {isOnline
                        ? t('chat.online')
                        : lastActive
                        ? `${t('chat.active')} ${formatDistanceToNow(new Date(lastActive), { addSuffix: true, locale: vi })}`
                        : ""}
                    </span>
                  );
                })()
              )}
            </div>
            {selectedConversation.isGroup && (
              <div className="ml-auto">
                <input
                  key={fileInputKey}
                  type="file"
                  accept="image/*"
                  onChange={onChangeGroupPicture}
                  disabled={uploadingGroupPicture}
                  ref={groupPicInputRef}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOpenGroupDetail(true)}
                >
                  <MessageCircleCode className="w-4 h-4 mr-1" />
                  {t('chat.details')}
                </Button>
              </div>
            )}
          </div>

          <Messages
            updateConversationUnread={updateConversationUnread}
            setReplyingTo={setReplyingTo}
            handleSendMessage={handleSendMessage}
            handleSendMessageWithRead={handleSendMessageWithRead}
            handleRetrySend={handleRetrySend}
          />

          <div className="sticky bottom-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 p-4 z-10">
            {replyingTo && (
              <div className="flex items-center p-2 bg-slate-50 dark:bg-slate-800 rounded mb-2 min-w-0">
                <span className="text-sm text-slate-600 dark:text-slate-300 mr-2 shrink-0">
                  {t('chat.replyingTo')} {replyingTo.sender?.username || t('chat.system')}:
                </span>
                <span className="text-sm truncate flex-1 min-w-0 text-slate-900 dark:text-slate-100">
                  {replyingTo.text}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-2 shrink-0"
                  onClick={cancelReplyHandler}
                >
                  {t('common.cancel')}
                </Button>
              </div>
            )}
            <div className="flex items-center w-full gap-2">
              <div className="flex-1 min-w-0">
                <Input
                  value={textMessage}
                  onChange={(e) => setTextMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  type="text"
                  className="w-full focus-visible:ring-transparent"
                  placeholder={t('chat.typeMessage')}
                />
              </div>
              {textMessage.trim() && (
                <Button
                  onClick={() => handleSendMessageWithRead(textMessage)}
                  disabled={messageStatus === "pending"}
                >
                  {t('chat.send')}
                </Button>
              )}
              {messageStatus === "failed" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRetrySend}
                  className="p-0 h-auto"
                >
                  <RotateCw className="w-4 h-4" /> {t('chat.retry')}
                </Button>
              )}
            </div>
          </div>
        </section>
      ) : (
        <div className="flex flex-col items-center justify-center mx-auto">
          <MessageCircleCode className="w-32 h-32 my-4 text-slate-900 dark:text-slate-100" />
          <h1 className="font-medium text-slate-900 dark:text-slate-100">{t('chat.yourMessages')}</h1>
          <span className="text-slate-600 dark:text-slate-300">{t('chat.selectConversation')}</span>
        </div>
      )}
      <NewConversationDialog
        open={openNewConv}
        onClose={setOpenNewConv}
        onCreated={({ type, conversation, messages }) => {
          if (conversation) {
            const exists = conversations.some((c) => c._id === conversation._id);
            const updated = exists ? conversations : [conversation, ...conversations];
            const sorted = [...updated].sort((a, b) => {
              const at = new Date(a.lastMessage?.createdAt || a.updatedAt || 0).getTime();
              const bt = new Date(b.lastMessage?.createdAt || b.updatedAt || 0).getTime();
              return bt - at;
            });
            dispatch(setConversation(sorted));
            dispatch(setSelectedConversation(conversation));
            if (messages) dispatch(setMessages(messages));
          }
        }}
      />
      {selectedConversation?.isGroup && (
        <EditGroupPicture
          open={openEditGroupPic}
          onClose={setOpenEditGroupPic}
          imageSrc={groupPicSrc}
          conversationId={selectedConversation?._id}
          fileInputRef={groupPicInputRef}
          onSaved={(img) => {
            const updated = conversations.map((c) =>
              c._id === selectedConversation._id ? { ...c, groupPicture: img } : c
            );
            dispatch(setConversation(updated));
            dispatch(
              setSelectedConversation({
                ...selectedConversation,
                groupPicture: img,
              })
            );
            if (groupPicSrc) URL.revokeObjectURL(groupPicSrc);
            setGroupPicSrc(null);
          }}
        />
      )}
      {selectedConversation?.isGroup && (
        <EditGroupMembersDialog
          open={openEditMembers}
          onClose={setOpenEditMembers}
          conversationId={selectedConversation?._id}
          mode={editMode}
          currentParticipantIds={(selectedConversation.participants || []).map(
            (p) => p?._id || p
          )}
          onUpdated={(conv) => {
            const updated = conversations.map((c) =>
              c._id === conv._id ? conv : c
            );
            dispatch(setConversation(updated));
            dispatch(setSelectedConversation(conv));
            // Refresh conversation list
            fetchConversations();
          }}
        />
      )}
      {selectedConversation?.isGroup && (
        <GroupDetailDialog
          open={openGroupDetail}
          setOpen={setOpenGroupDetail}
          conversation={selectedConversation}
          onLeaveGroup={() => {
            // Handle leave group - redirect to home or close chat
            dispatch(setSelectedConversation(null));
            dispatch(setMessages([]));
          }}
          onAddMembers={() => {
            // Mở dialog thêm thành viên
            setEditMode("add");
            setOpenEditMembers(true);
          }}
          onRemoveMember={() => {
            // Refresh conversation list
            fetchConversations();
          }}
          onUpdateGroupPicture={() => {
            // Open group picture edit dialog
            if (groupPicInputRef.current) {
              groupPicInputRef.current.click();
            }
          }}
          onUpdateGroupName={(newName) => {
            // Update conversation name in state
            const updated = conversations.map((c) =>
              c._id === selectedConversation._id ? { ...c, groupName: newName } : c
            );
            dispatch(setConversation(updated));
            dispatch(setSelectedConversation({ ...selectedConversation, groupName: newName }));
          }}
        />
      )}
    </div>
  );
};

export default ChatPage;
