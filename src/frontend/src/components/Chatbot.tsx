import React, { useState, useRef, useEffect } from 'react';
import Modal from './Modal';
import UniversalChallengeModal from './challenges/UniversalChallengeModal';
import { useAuth } from '../contexts/AuthContext';
import { useChildContext } from '../contexts/ChildContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  challengeIds?: string[];
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  goal: string;
  steps: string[];
  tip: string;
  example_dialogue: string;
  pillar_id: number;
  what_you_practice: string;
  start_prompt: string;
  guide_prompt: string;
  success_signals: string;
  why_it_matters: string;
}

export default function Chatbot() {
  const { token } = useAuth();
  const { selectedChild } = useChildContext();
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

  const markChallengeComplete = async (challengeId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/challenge-log`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          challenge_id: challengeId,
          child_id: selectedChild?.id
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to mark challenge as complete');
      }

      // Close the challenge modal
      setSelectedChallenge(null);

      // Add a success message to the chat
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Great job completing the challenge! 🎉 Would you like to try another one?'
      }]);
    } catch (error) {
      console.error('Error marking challenge complete:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I had trouble marking that challenge as complete. Please try again later.'
      }]);
    }
  };

  // Helper to extract challenge IDs from [challenge:ID] or [challenge ID] (case-insensitive, colon or space)
  function extractChallengeIds(text: string): string[] {
    const matches = [...text.matchAll(/\[challenge[: ]([^\]]+)\]/gi)];
    return matches.map(m => m[1]);
  }

  const renderMessage = (message: Message, index: number) => {
    // Remove [challenge:ID] and [challenge ID] tags and any "Click here to check out the challenge details" lines
    let content = message.content
      .replace(/\[challenge[: ][^\]]+\]/gi, '')
      .replace(/Click here to check out the challenge details:? ?\[challenge[: ][^\]]+\]/gi, '');

    // Extract challenge IDs for this message
    const challengeIds = extractChallengeIds(message.content);

    return (
      <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`} key={index}>
        <div className={`max-w-[70%] rounded-lg p-3 ${
          message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100'
        }`}>
          <div dangerouslySetInnerHTML={{ __html: content }} />
          {/* If assistant and challengeIds, show Start Challenge button */}
          {message.role === 'assistant' && challengeIds.length > 0 && (
            <div className="mt-4 flex justify-center">
              <button
                className="bg-kidoova-green text-white px-4 py-2 rounded-lg hover:bg-kidoova-accent transition-colors"
                onClick={() => handleChallengeClick(challengeIds[0])}
              >
                Start Challenge
              </button>
            </div>
          )}
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
            {messages.map(renderMessage)}
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

      <UniversalChallengeModal
        isOpen={!!selectedChallenge}
        onClose={() => setSelectedChallenge(null)}
        challenge={selectedChallenge || {
          id: '',
          title: '',
          description: '',
          goal: '',
          steps: [],
          tip: '',
          example_dialogue: '',
          pillar_id: 0,
          what_you_practice: '',
          start_prompt: '',
          guide_prompt: '',
          success_signals: '',
          why_it_matters: ''
        }}
        childId={selectedChild?.id || ''}
        onComplete={() => {
          if (selectedChallenge) {
            markChallengeComplete(selectedChallenge.id);
          }
        }}
      />
    </>
  );
} 