import React, { useEffect, useRef, useState, useCallback, memo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { useSelector, useDispatch } from "react-redux";
import useGetAllMessage from "@/hooks/useGetAllMessage";
import useGetRealtimeMessage from "@/hooks/useGetRealtimeMessage";
import useSocket from "@/hooks/useSocket";
import axios from "axios";
import { Loader2, Check, Reply } from "lucide-react";
import { debounce } from "lodash";
import { groupMessagesByTime } from "@/utils/groupMessagesByTime";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { setLastRead } from "@/redux/chatSlice";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";

const MessageItem = memo(
  ({
    msg,
    isOwnMessage,
    user,
    handleReplyClick,
    selectedConversation,
    messageRef,
    newestMessage,
  }) => {
    const repliedMessage = msg.reply_to_id;
    const { isDark } = useTheme();
    const { t, language } = useLanguage();

    if (msg.type === "separator") {
      return (
        <div
          key={msg._id}
          className={`text-center text-xs my-3 ${
            isDark ? "text-gray-400" : "text-gray-500"
          }`}
        >
          {msg.label}
        </div>
      );
    }
    if (msg.type === "system") {
      const getSystemMessageText = () => {
        if (msg.event === "group_created") {
          return `${msg.sender?.username || t("chat.someone")} ${t(
            "chat.groupCreated"
          )}`;
        } else if (msg.event === "group_picture_updated") {
          return `${msg.sender?.username || t("chat.someone")} ${t(
            "chat.groupPictureUpdated"
          )}`;
        } else if (msg.event === "user_added") {
          const targetName = msg.targetUser?.username || t("chat.member");
          return `${msg.sender?.username || t("chat.someone")} ${t(
            "chat.userAdded"
          ).replace("{user}", targetName)}`;
        } else if (msg.event === "user_removed") {
          const targetName = msg.targetUser?.username || t("chat.member");
          return `${msg.sender?.username || t("chat.someone")} ${t(
            "chat.userRemoved"
          ).replace("{user}", targetName)}`;
        }
        return msg.text || t("chat.systemNotification");
      };

      return (
        <div key={msg._id} className="flex justify-center my-2">
          <div
            className={`text-xs px-3 py-1 rounded-full ${
              isDark ? "text-gray-400 bg-gray-800" : "text-gray-500 bg-gray-100"
            }`}
          >
            {getSystemMessageText()}
          </div>
        </div>
      );
    }

    const tooltipTime = format(
      new Date(msg.createdAt),
      "EEEE, dd/MM/yyyy HH:mm",
      { locale: vi }
    );

    return (
      <div
        ref={messageRef}
        key={msg._id}
        data-message-id={msg._id}
        className={`flex ${
          isOwnMessage ? "justify-end" : "justify-start"
        } items-end mb-3`}
      >
        <div className="flex items-end max-w-[70%] relative">
          {!isOwnMessage && (
            <Avatar className="w-8 h-8 mr-2 flex-shrink-0">
              <AvatarImage src={msg.sender?.profilePicture || ""} />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          )}

          <div className="flex flex-col w-full">
            {selectedConversation?.isGroup && (
              <p
                className={`text-xs font-semibold mb-1 ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                {msg.sender?.username || "System"}
              </p>
            )}

            {repliedMessage && (
              <div
                className={`p-2 rounded-lg mb-1 whitespace-pre-wrap break-words ${
                  isOwnMessage
                    ? isDark
                      ? "bg-gray-700 text-white border-l-4 border-blue-500"
                      : "bg-gray-100 text-black border-l-4 border-blue-500"
                    : isDark
                    ? "bg-gray-700 text-white border-l-4 border-gray-500"
                    : "bg-gray-100 text-black border-l-4 border-gray-500"
                }`}
              >
                <p className="text-xs font-semibold">
                  {repliedMessage.sender?.username || "System"}
                </p>
                <p className="text-xs truncate">{repliedMessage.text}</p>
              </div>
            )}

            <div
              className={`flex items-start gap-2 ${
                isOwnMessage ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <div
                title={tooltipTime}
                className={`p-2 rounded-lg whitespace-pre-wrap break-words cursor-default ${
                  isOwnMessage
                    ? "bg-blue-500 text-white rounded-br-none"
                    : isDark
                    ? "bg-gray-700 text-white rounded-bl-none"
                    : "bg-gray-200 text-black rounded-bl-none"
                }`}
              >
                {msg.text}
              </div>

              <Button
                variant="ghost"
                size="icon"
                className={`flex-shrink-0 self-start mt-1 p-1 ${
                  isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"
                }`}
                onClick={() => handleReplyClick(msg)}
              >
                <Reply className="w-4 h-4" />
              </Button>
            </div>

            {isOwnMessage && (
              <>
                {msg.isTemp ? (
                  <span
                    className={`text-xs mt-1 self-end flex items-center gap-1 ${
                      isDark ? "text-gray-500" : "text-gray-400"
                    }`}
                  >
                    <Loader2 className="w-3 h-3 animate-spin" />{" "}
                    {t("chat.sending")}
                  </span>
                ) : (
                  newestMessage &&
                  msg._id === newestMessage._id && (
                    <span
                      className={`text-xs mt-1 self-end flex items-center gap-1 ${
                        isDark ? "text-gray-500" : "text-gray-400"
                      }`}
                    >
                      <Check className="w-3 h-3" /> {t("chat.sent")}
                    </span>
                  )
                )}
              </>
            )}

            {!msg.isTemp && (
              <div className="flex gap-1 mt-1 self-end">
                {Object.entries(selectedConversation.lastRead || {})
                  .filter(([uid, mid]) => {
                    const midStr = mid && mid.toString ? mid.toString() : mid;
                    return uid !== user._id && midStr === msg._id;
                  })
                  .map(([uid]) => {
                    const participant = (
                      selectedConversation.participants || []
                    ).find((p) => (p?._id || p)?.toString?.() === uid);
                    return (
                      <Avatar
                        key={uid}
                        className="w-4 h-4 border border-white rounded-full"
                        title={`${participant?.username || "Đã đọc"}`}
                      >
                        <AvatarImage
                          src={participant?.profilePicture || undefined}
                        />
                        <AvatarFallback>
                          {participant?.username?.[0]?.toUpperCase?.() || "U"}
                        </AvatarFallback>
                      </Avatar>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

const Messages = ({
  updateConversationUnread,
  setReplyingTo,
  handleSendMessage,
  handleSendMessageWithRead,
  handleRetrySend,
}) => {
  const dispatch = useDispatch();
  const user = useSelector((store) => store.auth.profile);
  const {
    selectedConversation,
    messages,
    lastReadMessageId,
    lastConversationId,
  } = useSelector((store) => store.chat);
  const socket = useSocket();
  const { isDark } = useTheme();
  const { t, language } = useLanguage();

  const containerRef = useRef(null);
  const messageRefs = useRef({});
  const { fetchMoreMessages, hasMore, loading } = useGetAllMessage();
  const { newMessage } = useGetRealtimeMessage();

  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const isMarkingRef = useRef(false);

  const isInitialLoadRef = useRef(true);

  useEffect(() => {
    if (socket && selectedConversation?._id) {
      socket.emit("joinConversation", {
        conversationId: selectedConversation._id,
      });
      return () => {
        socket.emit("leaveConversation", {
          conversationId: selectedConversation._id,
        });
      };
    }
  }, [selectedConversation?._id, socket]);

  // visibility handler will be registered after markMessagesAsRead is defined

  const scrollToBottom = useCallback((behavior = "auto") => {
    const c = containerRef.current;
    if (!c || !c.scrollHeight) return;
    c.scrollTop = c.scrollHeight;
    setIsAtBottom(true);
  }, []);

  const scrollToMessage = useCallback((messageId, behavior = "smooth") => {
    const c = containerRef.current;
    if (!c || !messageRefs.current[messageId]?.current) return;
    messageRefs.current[messageId].current.scrollIntoView({
      block: "center",
      behavior,
    });
  }, []);

  const markMessagesAsRead = useCallback(
    async (lastMessageId) => {
      // Bỏ qua nếu id tạm hoặc không hợp lệ
      const isValidObjectId = (v) =>
        typeof v === "string" && /^[a-fA-F0-9]{24}$/.test(v);
      if (
        !lastMessageId ||
        typeof lastMessageId !== "string" ||
        !isValidObjectId(lastMessageId)
      ) {
        return;
      }
      if (!selectedConversation?._id || !lastMessageId) {
        console.log(
          "Skipping markMessagesAsRead: missing conversationId or lastMessageId"
        );
        return;
      }

      if (isMarkingRef.current) {
        return; // tránh gọi song song
      }

      if (
        lastReadMessageId === lastMessageId &&
        lastConversationId === selectedConversation._id
      ) {
        console.log(
          "Skipping markMessagesAsRead: lastReadMessageId already matches",
          {
            lastMessageId,
            conversationId: selectedConversation._id,
          }
        );
        return;
      }

      try {
        isMarkingRef.current = true;
        console.log("Calling updateLastRead API with:", {
          conversationId: selectedConversation._id,
          lastMessageId,
        });
        const response = await axios.post(
          `/message/${selectedConversation._id}/read`,
          { lastMessageId }
        );

        if (response.data.success) {
          console.log("markMessagesAsRead success:", response.data);
          dispatch(
            setLastRead({
              lastMessageId,
              conversationId: selectedConversation._id,
            })
          );
          updateConversationUnread(selectedConversation._id);
        }
      } catch (err) {
        console.error("Error marking messages as read:", err);
      } finally {
        isMarkingRef.current = false;
      }
    },
    [
      selectedConversation?._id,
      lastReadMessageId,
      lastConversationId,
      updateConversationUnread,
      dispatch,
    ]
  );

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "visible" && messages?.length) {
        const latest = messages[0];
        if (latest && !latest.isTemp) {
          markMessagesAsRead(latest._id);
        }
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [messages, markMessagesAsRead]);

  useEffect(() => {
    if (
      selectedConversation?.unread &&
      messages?.length &&
      !messages[0]?.isTemp &&
      lastReadMessageId !== messages[0]._id &&
      lastConversationId !== selectedConversation._id
    ) {
      console.log("Triggering markMessagesAsRead on conversation open:", {
        conversationId: selectedConversation._id,
        lastMessageId: messages[0]._id,
      });
      markMessagesAsRead(messages[0]._id);
    }
  }, [
    selectedConversation?._id,
    selectedConversation?.unread,
    messages,
    lastReadMessageId,
    lastConversationId,
    markMessagesAsRead,
  ]);

  useEffect(() => {
    if (
      newMessage &&
      selectedConversation?._id === newMessage.conversationId &&
      isAtBottom &&
      lastReadMessageId !== newMessage._id
    ) {
      console.log("Triggering markMessagesAsRead on new message:", {
        conversationId: selectedConversation._id,
        lastMessageId: newMessage._id,
      });
      markMessagesAsRead(newMessage._id);
      scrollToBottom("smooth");
    }
  }, [
    newMessage,
    selectedConversation?._id,
    isAtBottom,
    lastReadMessageId,
    markMessagesAsRead,
    scrollToBottom,
  ]);

  useEffect(() => {
    if (!messages?.length || isInitialLoadRef.current === false || loading)
      return;
    scrollToBottom("auto");
    isInitialLoadRef.current = false;
  }, [selectedConversation?._id, messages, loading, scrollToBottom]);

  useEffect(() => {
    const c = containerRef.current;
    if (!c) return;
    const { scrollTop, scrollHeight, clientHeight } = c;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    setIsAtBottom(distanceFromBottom < 120);
  }, [messages]);

  const handleLoadMore = useCallback(() => {
    if (!hasMore || loading || isFetchingMore) return;
    setIsFetchingMore(true);
    const oldest = messages[messages.length - 1];
    const c = containerRef.current;
    if (!oldest || !c) {
      setIsFetchingMore(false);
      return;
    }

    const prevScrollHeight = c.scrollHeight;
    const prevScrollTop = c.scrollTop;

    fetchMoreMessages(oldest.createdAt)
      .then(() => {
        setTimeout(() => {
          requestAnimationFrame(() => {
            if (containerRef.current) {
              const newScrollHeight = containerRef.current.scrollHeight;
              containerRef.current.scrollTop =
                prevScrollTop + (newScrollHeight - prevScrollHeight);
              setIsFetchingMore(false);
            }
          });
        }, 0);
      })
      .catch((err) => {
        console.error("Error fetching more messages:", err);
        setIsFetchingMore(false);
      });
  }, [fetchMoreMessages, hasMore, loading, messages, isFetchingMore]);

  const handleScroll = useCallback(
    debounce(() => {
      const c = containerRef.current;
      if (!c || isInitialLoadRef.current || isFetchingMore) return;
      const { scrollTop, scrollHeight, clientHeight } = c;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      setIsAtBottom(distanceFromBottom < 120);
      if (
        isAtBottom &&
        messages[0] &&
        !messages[0].isTemp &&
        messages[0]._id !== lastReadMessageId
      ) {
        console.log("Triggering markMessagesAsRead on scroll:", {
          conversationId: selectedConversation._id,
          lastMessageId: messages[0]._id,
        });
        markMessagesAsRead(messages[0]._id); // Sử dụng tin nhắn mới nhất
      }
    }, 50),
    [
      isFetchingMore,
      messages,
      lastReadMessageId,
      markMessagesAsRead,
      selectedConversation,
    ]
  );

  useEffect(() => {
    const c = containerRef.current;
    if (!c) return;
    c.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      c.removeEventListener("scroll", handleScroll);
      handleScroll.cancel();
    };
  }, [handleScroll]);

  const onClickScrollDown = () => {
    scrollToBottom("smooth");
  };

  const handleReplyClick = useCallback(
    (msg) => {
      setReplyingTo(msg);
      if (msg.reply_to_id && messageRefs.current[msg.reply_to_id]?.current) {
        scrollToMessage(msg.reply_to_id, "smooth");
      }
    },
    [setReplyingTo, scrollToMessage]
  );

  useEffect(() => {
    messageRefs.current = messages.reduce((acc, msg) => {
      acc[msg._id] = acc[msg._id] || React.createRef();
      return acc;
    }, {});
  }, [messages]);

  const grouped = groupMessagesByTime(messages, {
    locale: language === "vi" ? "vi" : "en",
  });
  const newestMessage = messages && messages.length > 0 ? messages[0] : null;

  return (
    <div
      className="flex-1 overflow-auto p-4 relative"
      ref={containerRef}
      data-messages-container
      style={{ height: "calc(100vh - 120px)" }}
    >
      {loading && !messages?.length && (
        <div
          className={`flex flex-col items-center justify-center h-full ${
            isDark ? "text-gray-400" : "text-gray-500"
          }`}
        >
          <Loader2 className="w-8 h-8 animate-spin mb-2" />
          <p className="text-sm">{t("chat.loadingMessages")}</p>
        </div>
      )}

      {hasMore && (
        <div className="flex justify-center mb-4">
          <Button
            onClick={handleLoadMore}
            disabled={loading || isFetchingMore}
            className={`${
              isDark
                ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            {isFetchingMore ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              t("chat.loadMore")
            )}
          </Button>
        </div>
      )}

      <div className="flex flex-col-reverse gap-3">
        {grouped && grouped.length > 0
          ? grouped.map((msg) => (
              <MessageItem
                key={msg._id}
                msg={msg}
                isOwnMessage={msg.sender?._id === user?._id}
                user={user}
                handleReplyClick={handleReplyClick}
                selectedConversation={selectedConversation}
                messageRef={messageRefs.current[msg._id]}
                newestMessage={newestMessage}
              />
            ))
          : !loading && (
              <div
                className={`flex flex-col items-center justify-center h-64 ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                <p className="text-sm">{t("chat.noMessages")}</p>
                <p className="text-xs">{t("chat.startConversation")}</p>
              </div>
            )}
      </div>

      {!isAtBottom && (
        <div className="sticky bottom-2 flex justify-center">
          <Button
            className="rounded-full shadow-md bg-blue-500 text-white hover:bg-blue-600"
            onClick={onClickScrollDown}
            size="sm"
          >
            ↓
          </Button>
        </div>
      )}
    </div>
  );
};

export default Messages;
