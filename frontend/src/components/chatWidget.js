import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid'; // For generating session IDs
import './chatWidget.css';

// Simple Chat Bubble Icon (You can replace with an SVG or image)
const ChatIcon = ({ onClick }) => (
  <svg onClick={onClick} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="32px" height="32px">
    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
    <path d="M0 0h24v24H0z" fill="none"/>
  </svg>
);

// Simple Close Icon
const CloseIcon = ({ onClick }) => (
  <svg onClick={onClick} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24px" height="24px">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
    <path d="M0 0h24v24H0z" fill="none"/>
  </svg>
);


const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Initialize sessionId
  useEffect(() => {
    let currentSessionId = localStorage.getItem('chatSessionId');
    if (!currentSessionId) {
      currentSessionId = uuidv4();
      localStorage.setItem('chatSessionId', currentSessionId);
    }
    setSessionId(currentSessionId);

    // Optional: Load chat history when component mounts and session ID is available
    // if (currentSessionId) {
    //   fetchHistory(currentSessionId);
    // }
  }, []);

  // Scroll to bottom of messages when new messages are added
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
    }
  }, [messages, isOpen]);

  // const fetchHistory = async (sid) => {
  //   if (!sid) return;
  //   try {
  //     const response = await fetch(`http://localhost:3000/api/chat/history/${sid}`);
  //     if (!response.ok) {
  //       throw new Error('Failed to fetch chat history');
  //     }
  //     const data = await response.json();
  //     if (data.history && data.history.length > 0) {
  //        setMessages(data.history);
  //     } else {
  //       // Add a default welcome message if history is empty
  //       setMessages([{ role: 'assistant', content: 'Welcome to our Egyptian Medical Tourism Assistant! How can I help you today?' }]);
  //     }
  //   } catch (error) {
  //     console.error('Error fetching history:', error);
  //     // Add a default welcome message on error
  //     setMessages([{ role: 'assistant', content: 'Hello! How can I assist you with Egyptian medical tourism today?' }]);
  //   }
  // };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen && messages.length === 0) {
      // If opening for the first time and no messages, fetch history or show welcome
      // fetchHistory(sessionId); // or set a default welcome message immediately
      setMessages([{ role: 'assistant', content: 'Welcome! How can I help you explore sustainable medical tourism in Egypt?' }]);
    }
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage = { role: 'user', content: inputValue.trim() };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/aichat/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage.content, sessionId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Network response was not ok');
      }

      const data = await response.json();
      const assistantMessage = { role: 'assistant', content: data.answer, sources: data.sources };
      setMessages((prevMessages) => [...prevMessages, assistantMessage]);

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = { role: 'assistant', content: `Sorry, I encountered an error: ${error.message}` };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {!isOpen && (
        <div className="chat-widget-icon" onClick={toggleChat}>
          <ChatIcon />
          <span className="chat-widget-tooltip">Chat with AI</span>
        </div>
      )}

      {isOpen && (
        <div className="chat-widget-window">
          <div className="chat-widget-header">
            <h3>AI Assistant</h3>
            <button onClick={toggleChat} className="chat-widget-close-btn">
              <CloseIcon />
            </button>
          </div>
          <div className="chat-widget-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`chat-message ${msg.role}`}>
                <div className="chat-message-bubble">
                  <p>{msg.content}</p>
                  {msg.role === 'assistant' && msg.sources && msg.sources.length > 0 && (
                    <div className="chat-message-sources">
                      <strong>Sources:</strong>
                      <ul>
                        {msg.sources.map((source, idx) => (
                          <li key={idx}>
                            {source.title} ({source.location})
                            {source.sustainability !== 'Information not available' && ` - Sustain.: ${source.sustainability}`}
                            {source.carbonEmission !== 'Information not available' && ` - Carbon: ${source.carbonEmission}`}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="chat-message assistant">
                <div className="chat-message-bubble typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <form className="chat-widget-input-area" onSubmit={handleSendMessage}>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder="Ask about Egyptian medical tourism..."
              disabled={isLoading}
            />
            <button type="submit" disabled={isLoading}>
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatWidget;