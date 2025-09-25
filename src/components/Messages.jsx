import React, { useEffect, useRef, useState, useCallback, memo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { useSelector } from "react-redux";
import useGetAllMessage from "@/hooks/useGetAllMessage";
import useGetRealtimeMessage from "@/hooks/useGetRealtimeMessage";
import axios from "axios";
import { Loader2, Check, Reply } from "lucide-react";
import { debounce } from "lodash";
import { groupMessagesByTime } from "@/utils/groupMessagesByTime";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

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

    if (msg.type === "separator") {
      return (
        <div key={msg._id} className="text-center text-gray-500 text-xs my-3">
          {msg.label}
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
              <p className="text-xs font-semibold mb-1">
                {msg.sender?.username || "System"}
              </p>
            )}

            {repliedMessage && (
              <div
                className={`p-2 rounded-lg mb-1 whitespace-pre-wrap break-words ${
                  isOwnMessage
                    ? "bg-gray-100 text-black border-l-4 border-blue-500"
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
                    : "bg-gray-200 text-black rounded-bl-none"
                }`}
              >
                {msg.text}
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="flex-shrink-0 self-start mt-1 p-1 hover:bg-gray-100"
                onClick={() => handleReplyClick(msg)}
              >
                <Reply className="w-4 h-4" />
              </Button>
            </div>

            {isOwnMessage && (
              <>
                {msg.isTemp ? (
                  <span className="text-xs text-gray-400 mt-1 self-end flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" /> Đang gửi...
                  </span>
                ) : (
                  newestMessage &&
                  msg._id === newestMessage._id && (
                    <span className="text-xs text-gray-400 mt-1 self-end flex items-center gap-1">
                      <Check className="w-3 h-3" /> Đã gửi
                    </span>
                  )
                )}
              </>
            )}

            {!msg.isTemp && (
              <div className="flex gap-1 mt-1 self-end">
                {Object.entries(selectedConversation.lastRead || {})
                  .filter(([uid, mid]) => uid !== user._id && mid === msg._id)
                  .map(([uid]) => {
                    const participant = selectedConversation.participants.find(
                      (p) => p._id === uid
                    );
                    return (
                      <Avatar
                        key={uid}
                        className="w-4 h-4 border border-white rounded-full"
                      >
                        <AvatarImage src={participant?.profilePicture || ""} />
                        <AvatarFallback>
                          {participant?.username?.[0] || "U"}
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
  const user = useSelector((store) => store.auth.profile);
  const { selectedConversation, messages } = useSelector((store) => store.chat);

  const containerRef = useRef(null);
  const messageRefs = useRef({});
  const { fetchMoreMessages, hasMore, loading } = useGetAllMessage();
  const { newMessage } = useGetRealtimeMessage();

  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const isInitialLoadRef = useRef(true);
  const lastNewestIdRef = useRef(null);
  const prevMessagesLengthRef = useRef(0);

  const lastReadMessageIdRef = useRef(null);
  const lastConversationIdRef = useRef(null);

  /** 🔹 SỬA: Reset lastConversationIdRef và lastReadMessageIdRef khi chuyển conversation */
  useEffect(() => {
    lastConversationIdRef.current = null;
    lastReadMessageIdRef.current = null;
  }, [selectedConversation?._id]);

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
      if (!selectedConversation?._id || !lastMessageId) return;

      if (
        lastReadMessageIdRef.current === lastMessageId &&
        lastConversationIdRef.current === selectedConversation._id
      ) {
        return;
      }

      try {
        await axios.post(
          `http://localhost:5000/api/v1/message/${selectedConversation._id}/read`,
          { lastMessageId },
          { withCredentials: true }
        );

        lastReadMessageIdRef.current = lastMessageId;
        lastConversationIdRef.current = selectedConversation._id;

        if (typeof updateConversationUnread === "function") {
          updateConversationUnread(selectedConversation._id);
        }
      } catch (err) {
        console.error("Lỗi khi cập nhật lastRead:", err);
      }
    },
    [selectedConversation?._id, updateConversationUnread]
  );

  /** 🔹 Mark read khi mở conversation có unread */
  useEffect(() => {
    if (
      selectedConversation?.unread &&
      messages?.length &&
      !messages[0]?.isTemp &&
      lastReadMessageIdRef.current !== messages[0]._id &&
      lastConversationIdRef.current !== selectedConversation._id
    ) {
      markMessagesAsRead(messages[0]._id);
    }
  }, [
    selectedConversation?._id,
    selectedConversation?.unread,
    messages,
    markMessagesAsRead,
  ]);

  /** 🔹 Nhận tin nhắn realtime */
  useEffect(() => {
    if (
      newMessage &&
      selectedConversation?._id === newMessage.conversationId &&
      isAtBottom
    ) {
      if (lastReadMessageIdRef.current !== newMessage._id) {
        markMessagesAsRead(newMessage._id);
      }
      scrollToBottom("smooth");
    }
  }, [
    newMessage,
    selectedConversation?._id,
    isAtBottom,
    markMessagesAsRead,
    scrollToBottom,
  ]);

  /** 🔹 Scroll xuống đáy khi mở conversation */
  useEffect(() => {
    if (!messages?.length || isInitialLoadRef.current === false || loading)
      return;
    scrollToBottom("auto");
    lastNewestIdRef.current = messages[0]._id;
    prevMessagesLengthRef.current = messages.length;
    isInitialLoadRef.current = false;
  }, [selectedConversation?._id, messages, loading, scrollToBottom]);

  /** 🔹 Scroll khi có tin nhắn mới */
  useEffect(() => {
    if (!messages?.length) return;
    const newest = messages[0];
    if (!lastNewestIdRef.current) {
      lastNewestIdRef.current = newest._id;
      prevMessagesLengthRef.current = messages.length;
      return;
    }
    if (lastNewestIdRef.current !== newest._id) {
      scrollToBottom("smooth");
      lastNewestIdRef.current = newest._id;
      prevMessagesLengthRef.current = messages.length;
    }
  }, [messages, scrollToBottom]);

  /** 🔹 Theo dõi vị trí scroll */
  useEffect(() => {
    const c = containerRef.current;
    if (!c) return;
    const { scrollTop, scrollHeight, clientHeight } = c;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    setIsAtBottom(distanceFromBottom < 120);
  }, [messages]);

  /** 🔹 Load thêm tin nhắn */
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
              prevMessagesLengthRef.current = messages.length;
            }
          });
        }, 0);
      })
      .catch((err) => {
        console.error("Lỗi khi tải thêm tin nhắn:", err);
        setIsFetchingMore(false);
      });
  }, [fetchMoreMessages, hasMore, loading, messages, isFetchingMore]);

  /** 🔹 Scroll event */
  const handleScroll = useCallback(
    debounce(() => {
      const c = containerRef.current;
      if (!c || isInitialLoadRef.current || isFetchingMore) return;
      const { scrollTop, scrollHeight, clientHeight } = c;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      setIsAtBottom(distanceFromBottom < 120);
    }, 50),
    [isFetchingMore]
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

  const grouped = groupMessagesByTime(messages);
  const newestMessage = messages && messages.length > 0 ? messages[0] : null;

  return (
    <div
      className="flex-1 overflow-auto p-4 relative"
      ref={containerRef}
      style={{ height: "calc(100vh - 120px)" }}
    >
      {loading && !messages?.length && (
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
          <Loader2 className="w-8 h-8 animate-spin mb-2" />
          <p className="text-sm">Đang tải tin nhắn...</p>
        </div>
      )}

      {hasMore && (
        <div className="flex justify-center mb-4">
          <Button
            onClick={handleLoadMore}
            disabled={loading || isFetchingMore}
            className="bg-gray-200 text-gray-800 hover:bg-gray-300"
          >
            {isFetchingMore ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              "Load More"
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
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <p className="text-sm">Chưa có tin nhắn</p>
                <p className="text-xs">Bắt đầu cuộc trò chuyện</p>
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
