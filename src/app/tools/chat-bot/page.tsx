'use client';

import React from 'react';
import { useChat } from '@ai-sdk/react';
import { UIMessage, TextStreamChatTransport } from 'ai';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useChatStore } from '@/store/chatStore';

const transport = new TextStreamChatTransport({ api: '/api/chat' });

const SUGGESTED_QUESTIONS = [
  {
    title: 'Tech Stack & Frontend Architecture',
    text: 'Query Tech Stack: Explain how Next.js, Tailwind CSS v4, and local JSON wealth storage are architected.',
    icon: 'code_blocks'
  },
  {
    title: 'Deployment Pipelines & Automation',
    text: 'Query Pipelines: Analyze the automated CD pipeline from GitHub Actions down to AWS EC2 Docker hosts.',
    icon: 'rocket_launch'
  },
  {
    title: 'Infrastructure & Network Security',
    text: 'Query Infrastructure: Detail the AWS security perimeter layout (VPC, Cognito, Security Groups) and routing.',
    icon: 'shield_lock'
  }
];

export default function ChatBotPage() {
  const [input, setInput] = React.useState('');
  
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  
  const { savedMessages, setSavedMessages, shouldClear, ackClear } = useChatStore();
  
  const { messages, setMessages, sendMessage, status, error, stop } = useChat({ 
    id: 'portfolio-chat-session',
    transport
  });

  // Inject initial messages on mount if empty
  React.useEffect(() => {
    if (messages.length === 0 && savedMessages.length > 0) {
      setMessages(savedMessages as any);
    }
  }, []);
  
  const isLoading = status === 'streaming' || status === 'submitted';

  // Sync local messages to global store safely
  React.useEffect(() => {
    // Prevent accidental wipe on remount if messages briefly resets
    if (messages.length > 0 || shouldClear) {
      setSavedMessages(messages);
    }
  }, [messages, setSavedMessages, shouldClear]);

  // Listen for Sidebar "New Chat" trigger
  React.useEffect(() => {
    if (shouldClear) {
      if (isLoading) stop();
      setMessages([]);
      setSavedMessages([]);
      setInput('');
      ackClear();
    }
  }, [shouldClear, isLoading, stop, setMessages, setSavedMessages, ackClear]);

  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading && !error) {
        handleSubmit(e as any);
      }
    }
  };

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const messageText = input;
    setInput('');
    try {
      await sendMessage({ text: messageText });
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleSuggestedClick = async (text: string) => {
    if (isLoading) return;
    try {
      await sendMessage({ text });
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const renderInputForm = () => (
    <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-[24px] shadow-sm flex flex-col focus-within:border-slate-300 focus-within:shadow-md transition-all overflow-hidden p-2 mx-auto w-full max-w-3xl shrink-0">
      <textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={isLoading}
        placeholder="Query this portfolio's tech stack..."
        maxLength={500}
        className="w-full bg-transparent px-4 py-3 text-sm sm:text-base resize-none focus:outline-none min-h-[44px] max-h-[200px] text-slate-800 disabled:opacity-50 placeholder:text-slate-400 font-sans custom-scrollbar"
        rows={1}
        onKeyDown={handleKeyDown}
      />
      <div className="flex items-center justify-between px-2 pb-1 pt-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 bg-slate-50 px-2 py-1 rounded-sm border border-slate-200 shadow-sm cursor-default">
            <span className="relative inline-flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 animate-radar-ping" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </span>
            <span className="font-semibold tracking-wider">GEMINI 3.1 FLASH LITE</span>
          </div>
        </div>
        <div>
          {isLoading ? (
            <button
              type="button"
              onClick={() => stop()}
              className="w-10 h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Stop generating"
            >
              <span className="material-symbols-outlined text-[20px]">stop_circle</span>
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim() || !!error}
              className="w-10 h-10 rounded-[12px] bg-slate-900 hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-300 text-white flex items-center justify-center transition-colors cursor-pointer disabled:cursor-not-allowed"
              title="Send message"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_upward</span>
            </button>
          )}
        </div>
      </div>
    </form>
  );

  return (
    <div className="h-full flex flex-col relative pt-2">
      <div className="flex flex-col h-[calc(100vh-180px)] min-h-[400px] relative mt-2">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center pb-10">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight font-sans mb-8">
              Ask anything for this website?🤔
            </h1>
            <div className="w-full px-4">
              {renderInputForm()}
            </div>
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-3 w-full max-w-4xl px-4">
              {SUGGESTED_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestedClick(q.text)}
                  className="flex flex-col items-start p-3 border-2 border-[#003049] rounded-sm bg-white hover:bg-slate-50 transition-colors text-left shadow-sm group"
                >
                  <div className="flex items-center gap-1.5 text-[#003049] font-bold text-xs mb-1 group-hover:text-indigo-600 transition-colors font-mono tracking-wide uppercase">
                    <span className="material-symbols-outlined text-[16px]">{q.icon}</span>
                    {q.title}
                  </div>
                  <p className="text-slate-700 text-[11px] leading-relaxed line-clamp-2">
                    {q.text}
                  </p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div 
              ref={scrollContainerRef}
              className="flex-1 overflow-y-auto space-y-6 p-2 custom-scrollbar mb-4 scroll-smooth pb-10"
            >
              {messages.map((message) => {
                const isUser = message.role === 'user';
                return (
                  <div
                    key={message.id}
                    className={`group flex gap-3 text-sm leading-relaxed max-w-[85%] ${
                      isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-sm shrink-0 flex items-center justify-center border font-mono text-[10px] font-bold uppercase overflow-hidden mt-1 ${
                        isUser
                          ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                          : 'bg-slate-100 border-slate-300 text-slate-700'
                      }`}
                    >
                      {isUser ? (
                        <span className="material-symbols-outlined text-[16px]">person</span>
                      ) : (
                        <img src="/icon.png" alt="AI" className="w-full h-full object-cover bg-white" />
                      )}
                    </div>
                    <div
                      className={`p-4 rounded-sm border min-w-0 ${
                        isUser
                          ? 'bg-indigo-50/50 border-indigo-100 text-slate-800'
                          : 'bg-white border-slate-200 text-slate-800 shadow-sm'
                      }`}
                    >
                      {message.parts?.map((part, i) => {
                        if (part.type === 'text') {
                          return (
                            <ReactMarkdown
                              key={i}
                              remarkPlugins={[remarkGfm]}
                              components={{
                                p: ({node, ...props}) => <p className="mb-3 last:mb-0" {...props} />,
                                a: ({node, ...props}) => <a className="text-indigo-600 hover:underline font-medium" target="_blank" rel="noopener noreferrer" {...props} />,
                                pre: ({node, ...props}) => <pre className="bg-slate-900 text-slate-50 p-4 rounded-sm overflow-x-auto my-3 font-mono text-xs shadow-inner" {...props} />,
                                code: ({node, inline, className, children, ...props}: any) => 
                                  inline ? (
                                    <code className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded-sm font-mono text-xs border border-slate-200" {...props}>
                                      {children}
                                    </code>
                                  ) : (
                                    <code className={className} {...props}>{children}</code>
                                  ),
                                ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-3 space-y-1" {...props} />,
                                ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-3 space-y-1" {...props} />,
                                li: ({node, ...props}) => <li className="pl-1" {...props} />,
                                h1: ({node, ...props}) => <h1 className="text-xl font-bold mb-3 mt-4 text-slate-900" {...props} />,
                                h2: ({node, ...props}) => <h2 className="text-lg font-bold mb-3 mt-4 text-slate-900" {...props} />,
                                h3: ({node, ...props}) => <h3 className="text-base font-bold mb-2 mt-3 text-slate-900" {...props} />,
                                table: ({node, ...props}) => <div className="overflow-x-auto w-full mb-4"><table className="min-w-full divide-y divide-slate-200 border border-slate-200 rounded-sm" {...props} /></div>,
                                th: ({node, ...props}) => <th className="px-3 py-2 bg-slate-50 text-left text-xs font-medium text-slate-500 uppercase tracking-wider" {...props} />,
                                td: ({node, ...props}) => <td className="px-3 py-2 whitespace-normal break-words text-sm text-slate-700 border-t border-slate-200" {...props} />,
                                blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-slate-300 pl-4 italic text-slate-600 mb-3" {...props} />
                              }}
                            >
                              {part.text}
                            </ReactMarkdown>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex items-center gap-1.5 text-slate-400 pl-14 h-8 mt-4">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              )}

              {error && (
                <div className="bg-rose-50 border border-rose-200 p-4 relative overflow-hidden rounded-sm pl-9 mx-12">
                  <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
                  <h3 className="text-[10px] font-black text-rose-700 uppercase mb-1 flex items-center gap-2 font-mono">
                    <span className="material-symbols-outlined text-xs">report</span>
                    Connection Failure
                  </h3>
                  <p className="text-[10px] text-rose-600 leading-relaxed uppercase font-mono">{error.message || 'Failed to generate response'}</p>
                </div>
              )}

              <div ref={messagesEndRef} className="h-6" />
            </div>


            <div className="w-full px-2">
              {renderInputForm()}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

