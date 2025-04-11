import React, { useState, useRef, useEffect } from 'react';
import Modal from './Modal';
import { useAuth } from '../contexts/AuthContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  challengeIds?: string[];
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  tip: string;
}

export default function Chatbot() {
  const { token } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    // Add initial welcome message
    setMessages([{ role: 'assistant', content: 'Hi! How can I help today?' }]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch(`${apiUrl}/api/chatbot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Chatbot response not ok:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData.error
        });
        
        let errorMessage = 'Sorry, I encountered an error. Please try again.';
        if (response.status === 503) {
          errorMessage = 'The AI service is currently unavailable. Please try again later.';
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.response,
        challengeIds: data.challengeIds
      }]);
    } catch (error) {
      console.error('❌ Chatbot error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: error instanceof Error ? error.message : 'Sorry, I encountered an error. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChallengeClick = async (challengeId: string) => {
    try {
      const response = await fetch(`${apiUrl}/api/challenges/${challengeId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch challenge details');
      }

      const challenge = await response.json();
      setSelectedChallenge(challenge);
    } catch (error) {
      console.error('Error fetching challenge:', error);
    }
  };

  const handleMarkComplete = async () => {
    if (!selectedChallenge) return;

    try {
      const response = await fetch(`${apiUrl}/api/challenges/${selectedChallenge.id}/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to mark challenge as complete');
      }

      setSelectedChallenge(null);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Great job completing the "${selectedChallenge.title}" challenge! Would you like to try another one?` 
      }]);
    } catch (error) {
      console.error('Error marking challenge complete:', error);
    }
  };

  const renderMessage = (message: Message) => {
    const content = message.content.replace(
      /\[challenge:(\d+)\]/g,
      (match, challengeId) => {
        return `<a href="#" class="text-blue-500 hover:underline" onclick="event.preventDefault(); window.dispatchEvent(new CustomEvent('openChallenge', { detail: '${challengeId}' }));">View Challenge</a>`;
      }
    );

    return (
      <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`max-w-[70%] rounded-lg p-3 ${
          message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100'
        }`}>
          <div dangerouslySetInnerHTML={{ __html: content }} />
        </div>
      </div>
    );
  };

  useEffect(() => {
    const handleOpenChallenge = (event: CustomEvent) => {
      handleChallengeClick(event.detail);
    };

    window.addEventListener('openChallenge', handleOpenChallenge as EventListener);
    return () => {
      window.removeEventListener('openChallenge', handleOpenChallenge as EventListener);
    };
  }, []);

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          />
        </svg>
      </button>

      {/* Chat Modal */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Parenting Coach"
      >
        <div className="flex flex-col h-[60vh]">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div key={index}>
                {renderMessage(message)}
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className="bg-gray-100 rounded-lg p-3">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="p-4 border-t">
            <div className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      </Modal>

      <Modal
        isOpen={!!selectedChallenge}
        onClose={() => setSelectedChallenge(null)}
        title={selectedChallenge?.title || ''}
      >
        {selectedChallenge && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Description:</h3>
              <p>{selectedChallenge.description}</p>
            </div>
            <div>
              <h3 className="font-semibold">Tip:</h3>
              <p>{selectedChallenge.tip}</p>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleMarkComplete}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
              >
                Mark Complete
              </button>
              <button
                onClick={() => setSelectedChallenge(null)}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
} 