import React, { useEffect, useRef, useState, useCallback, memo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { useSelector } from "react-redux";
import useGetAllMessage from "@/hooks/useGetAllMessage";
import useGetRealtimeMessage from "@/hooks/useGetRealtimeMessage";
import axios from "axios";
import { Loader2, Check, Reply } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { debounce } from "lodash";

const MessageItem = memo(
  ({
    msg,
    isOwnMessage,
    user,
    handleReplyClick,
    selectedConversation,
    messageRef,
  }) => {
    const repliedMessage = msg.reply_to_id;

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

            <div
              className={`flex items-start gap-2 ${
                isOwnMessage ? "flex-row" : "flex-row"
              }`}
            >
              {/* Nếu là tin nhắn của bản thân thì reply nằm TRÁI */}
              {isOwnMessage && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="flex-shrink-0 self-start mt-2 p-1 hover:bg-gray-100"
                  onClick={() => handleReplyClick(msg)}
                >
                  <Reply className="w-4 h-4" />
                </Button>
              )}

              <div className="flex flex-col w-full">
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
                  className={`p-2 rounded-lg whitespace-pre-wrap break-words ${
                    isOwnMessage
                      ? "bg-blue-500 text-white rounded-br-none"
                      : "bg-gray-200 text-black rounded-bl-none"
                  }`}
                >
                  {msg.text}
                  {isOwnMessage && msg.isTemp && (
                    <span className="flex items-center text-xs text-gray-300 ml-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Đang gửi...
                    </span>
                  )}
                  {isOwnMessage && !msg.isTemp && (
                    <span className="flex items-center text-xs text-gray-300 ml-2">
                      <Check className="w-4 h-4" /> Đã gửi
                    </span>
                  )}
                </div>

                <span className="text-xs text-gray-400 mt-1">
                  {formatDistanceToNow(new Date(msg.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>

              {/* Nếu là người khác thì reply nằm PHẢI */}
              {!isOwnMessage && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="flex-shrink-0 self-start mt-2 p-1 hover:bg-gray-100"
                  onClick={() => handleReplyClick(msg)}
                >
                  <Reply className="w-4 h-4" />
                </Button>
              )}
            </div>
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
  handleRetrySend,
  messagesEndRef,
}) => {
  const user = useSelector((store) => store.auth.profile);
  const { selectedConversation, messages } = useSelector((store) => store.chat);
  const containerRef = useRef(null);
  const messageRefs = useRef({});
  const { fetchMoreMessages, hasMore, loading } = useGetAllMessage();
  useGetRealtimeMessage();

  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const isInitialLoadRef = useRef(true);
  const lastNewestIdRef = useRef(null);
  const prevMessagesLengthRef = useRef(0);

  const scrollToBottom = useCallback(
    (behavior = "auto") => {
      const c = containerRef.current;
      if (!c) return;
      c.scrollTop = c.scrollHeight;
      setIsAtBottom(true);
      setShowScrollButton(false);

      try {
        if (messagesEndRef?.current) {
          messagesEndRef.current.scrollIntoView({ behavior });
        }
      } catch (e) {
        // Ignore
      }
    },
    [messagesEndRef]
  );

  const scrollToMessage = useCallback((messageId, behavior = "smooth") => {
    const c = containerRef.current;
    if (!c || !messageRefs.current[messageId]?.current) return;
    messageRefs.current[messageId].current.scrollIntoView({
      block: "center",
      behavior,
    });
  }, []);

  useEffect(() => {
    const updateLastRead = async () => {
      if (
        !selectedConversation?._id ||
        !messages?.length ||
        messages[0]?.isTemp
      ) {
        return;
      }
      try {
        await axios.post(
          `http://localhost:5000/api/v1/message/${selectedConversation._id}/read`,
          { lastMessageId: messages[0]._id },
          { withCredentials: true }
        );
        if (typeof updateConversationUnread === "function") {
          updateConversationUnread(selectedConversation._id);
        }
      } catch (err) {
        console.error(
          "Lỗi khi cập nhật lastRead:",
          err?.response?.data || err?.message
        );
      }
    };

    updateLastRead();
  }, [selectedConversation?._id, messages?.length, updateConversationUnread]);

  // Scroll xuống đáy chỉ 1 lần khi mở conversation
  useEffect(() => {
    isInitialLoadRef.current = true;
    const t = setTimeout(() => {
      if (messages?.length) {
        scrollToBottom("auto");
        lastNewestIdRef.current = messages[0]._id;
        prevMessagesLengthRef.current = messages.length;
      } else {
        lastNewestIdRef.current = null;
        prevMessagesLengthRef.current = 0;
      }
      isInitialLoadRef.current = false;
    }, 100);

    return () => clearTimeout(t);
  }, [selectedConversation?._id]);

  useEffect(() => {
    if (!messages?.length) return;

    const newest = messages[0];
    if (!lastNewestIdRef.current) {
      lastNewestIdRef.current = newest._id;
      prevMessagesLengthRef.current = messages.length;
      return;
    }

    if (lastNewestIdRef.current !== newest._id && isAtBottom) {
      scrollToBottom("smooth");
      lastNewestIdRef.current = newest._id;
      prevMessagesLengthRef.current = messages.length;
    } else if (lastNewestIdRef.current !== newest._id) {
      setShowScrollButton(true);
    }
  }, [messages?.length, isAtBottom, scrollToBottom]);

  useEffect(() => {
    const c = containerRef.current;
    if (!c) return;
    const { scrollTop, scrollHeight, clientHeight } = c;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    const atBottom = distanceFromBottom < 120;
    setIsAtBottom(atBottom);
    setShowScrollButton(!atBottom);
  }, [messages?.length]);

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
  }, [fetchMoreMessages, hasMore, loading, messages]);

  const handleScroll = useCallback(
    debounce(() => {
      const c = containerRef.current;
      if (!c || isInitialLoadRef.current || isFetchingMore) return;

      const { scrollTop, scrollHeight, clientHeight } = c;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      const atBottom = distanceFromBottom < 120;
      setIsAtBottom(atBottom);
      setShowScrollButton(!atBottom);
    }, 50),
    []
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

  return (
    <div
      className="flex-1 overflow-auto p-4 relative"
      ref={containerRef}
      style={{ height: "calc(100vh - 120px)" }}
    >
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

      {loading && messages?.length > 0 && !isFetchingMore && (
        <div className="flex justify-center mb-4">
          <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
        </div>
      )}

      <div className="flex flex-col-reverse gap-3">
        {messages && messages.length > 0 ? (
          messages.map((msg) => (
            <MessageItem
              key={msg._id}
              msg={msg}
              isOwnMessage={msg.sender?._id === user?._id}
              user={user}
              handleReplyClick={handleReplyClick}
              selectedConversation={selectedConversation}
              messageRef={messageRefs.current[msg._id]}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <p className="text-sm">Chưa có tin nhắn</p>
            <p className="text-xs">Bắt đầu cuộc trò chuyện</p>
          </div>
        )}
      </div>

      {showScrollButton && (
        <Button
          className="absolute bottom-4 right-4 rounded-full shadow-md bg-blue-500 text-white hover:bg-blue-600"
          onClick={onClickScrollDown}
          size="sm"
        >
          ↓
        </Button>
      )}
    </div>
  );
};

export default Messages;
