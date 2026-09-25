import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, Sparkles } from 'lucide-react';
import { formatTimeOfDay } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';

const RoomChat = ({
  messages = [],
  onSendMessage,
  isSending = false
}) => {
  const [inputText, setInputText] = useState('');
  const messagesContainerRef = useRef(null);
  const prevCountRef = useRef(0);
  const { user } = useAuth();

  const scrollToBottom = (smooth = true) => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto'
      });
    }
  };

  useEffect(() => {
    // Scroll strictly inside the chat box container, never scrolling the main webpage
    if (messages.length > 0) {
      const isInitial = prevCountRef.current === 0;
      scrollToBottom(!isInitial);
      prevCountRef.current = messages.length;
    }
  }, [messages.length]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim() || isSending) return;
    onSendMessage(inputText.trim());
    setInputText('');
    setTimeout(() => scrollToBottom(true), 80);
  };

  return (
    <div className="p-5 rounded-[28px] ios-card shadow-ios border border-white/40 dark:border-white/10 flex flex-col h-[400px] backdrop-blur-xl">
      {/* Chat Header */}
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
        <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
          <MessageSquare className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Study Room Wall
          </h3>
          <p className="text-[11px] text-slate-400">
            Share progress, questions, or notes with friends
          </p>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-400">
            <Sparkles className="w-6 h-6 mb-1 text-indigo-400 opacity-60" />
            <p>Welcome! Be the first to post a study goal or question.</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isSystem = msg.name === 'System' || msg.avatar === 'system';
            const isMe = msg.sender === user?.id || msg.sender === user?._id;

            if (isSystem) {
              return (
                <div key={index} className="text-center py-1">
                  <span className="text-[11px] text-slate-400 italic bg-slate-100 dark:bg-slate-800/60 px-3 py-1 rounded-full">
                    {msg.text}
                  </span>
                </div>
              );
            }

            return (
              <div
                key={index}
                className={`flex items-start gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5 shadow-sm">
                  {msg.name ? msg.name.charAt(0).toUpperCase() : 'U'}
                </div>

                <div className={`max-w-[80%] ${isMe ? 'text-right' : 'text-left'}`}>
                  <div className="flex items-baseline gap-1.5 mb-0.5">
                    <span className="text-[10px] font-bold text-slate-500">
                      {isMe ? 'You' : msg.name}
                    </span>
                    <span className="text-[9px] text-slate-400">
                      {formatTimeOfDay(msg.createdAt)}
                    </span>
                  </div>

                  <div
                    className={`p-2.5 rounded-2xl text-xs break-words leading-relaxed ${
                      isMe
                        ? 'bg-indigo-600 text-white rounded-tr-none'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input Box */}
      <form onSubmit={handleSubmit} className="pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Share study note or update..."
          maxLength={500}
          className="flex-1 px-3.5 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
        />
        <Button
          type="submit"
          variant="primary"
          size="sm"
          icon={Send}
          disabled={!inputText.trim() || isSending}
          className="px-3"
        >
          Send
        </Button>
      </form>
    </div>
  );
};

export default RoomChat;
