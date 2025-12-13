'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from 'ai/react';

interface DadTribunalProps {
  onVerdictSaved: () => void;
}

interface Verdict {
  points: number;
  emoji: string;
  verdict: string;
  explanation: string;
  dadJoke?: string | null;
  memeReference?: string | null;
}

export default function DadTribunal({ onVerdictSaved }: DadTribunalProps) {
  const [currentVerdict, setCurrentVerdict] = useState<Verdict | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showSavedMessage, setShowSavedMessage] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } = useChat({
    api: '/api/dad-tribunal',
    onFinish: (message) => {
      // Parse the verdict from the AI response
      try {
        // Extract JSON from the response (it might have extra text)
        const jsonMatch = message.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const verdict = JSON.parse(jsonMatch[0]) as Verdict;
          setCurrentVerdict(verdict);
        }
      } catch (error) {
        console.error('Failed to parse verdict:', error);
      }
    },
  });

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  async function saveVerdict() {
    if (!currentVerdict) return;

    setIsSaving(true);
    try {
      const response = await fetch('/api/dad-tribunal', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentVerdict),
      });

      if (response.ok) {
        setShowSavedMessage(true);
        setTimeout(() => {
          setShowSavedMessage(false);
          setCurrentVerdict(null);
          setMessages([]);
        }, 2000);
        onVerdictSaved();
      }
    } catch (error) {
      console.error('Failed to save verdict:', error);
    } finally {
      setIsSaving(false);
    }
  }

  function discardVerdict() {
    setCurrentVerdict(null);
    setMessages([]);
  }

  const lastAssistantMessage = messages.filter(m => m.role === 'assistant').pop();

  return (
    <section 
      className="px-4 sm:px-6 py-6 sm:py-8"
      aria-label="The Dad Tribunal - AI Judge"
    >
      <div className="bg-gradient-to-br from-amber-900 via-amber-800 to-yellow-900 rounded-xl shadow-2xl overflow-hidden border-4 border-amber-600">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-700 to-yellow-700 px-4 sm:px-6 py-4 sm:py-5 text-center border-b-4 border-amber-600">
          <div className="text-3xl sm:text-4xl mb-2" role="img" aria-label="Gavel">⚖️</div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white drop-shadow-lg">
            The Dad Tribunal
          </h2>
          <p className="text-amber-100 text-sm sm:text-base mt-1 drop-shadow">
            Tell us how Dad performed today. We shall judge.
          </p>
        </div>

        {/* Chat Area */}
        <div className="p-4 sm:p-6">
          {/* Messages */}
          {messages.length > 0 && (
            <div className="mb-4 space-y-4 max-h-[300px] overflow-y-auto">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg p-3 sm:p-4 ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-amber-100 text-amber-900'
                    }`}
                  >
                    {message.role === 'assistant' ? (
                      <VerdictDisplay content={message.content} />
                    ) : (
                      <p className="text-sm sm:text-base">{message.content}</p>
                    )}
                  </div>
                </div>
              ))}
              
              {isLoading && !lastAssistantMessage && (
                <div className="flex justify-start">
                  <div className="bg-amber-100 text-amber-900 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <span className="animate-spin">⚖️</span>
                      <span className="text-sm font-medium">The Tribunal is deliberating...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Verdict Actions */}
          {currentVerdict && !showSavedMessage && (
            <div className="mb-4 bg-amber-100 rounded-lg p-4 border-2 border-amber-400">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={saveVerdict}
                  disabled={isSaving}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-4 rounded-lg transition-colors focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {isSaving ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin">⏳</span> Saving...
                    </span>
                  ) : (
                    <span>✅ Accept Verdict ({currentVerdict.points > 0 ? '+' : ''}{currentVerdict.points} points)</span>
                  )}
                </button>
                <button
                  onClick={discardVerdict}
                  disabled={isSaving}
                  className="flex-1 sm:flex-none bg-gray-500 hover:bg-gray-600 text-white font-bold py-2.5 px-4 rounded-lg transition-colors focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  ❌ Dismiss
                </button>
              </div>
            </div>
          )}

          {/* Saved Confirmation */}
          {showSavedMessage && (
            <div className="mb-4 bg-green-100 border-2 border-green-400 rounded-lg p-4 text-center animate-pulse">
              <span className="text-green-800 font-bold text-lg">
                ✅ Verdict recorded! Dad&apos;s aura has been updated.
              </span>
            </div>
          )}

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              placeholder="Tell The Tribunal what Dad did today..."
              className="flex-1 px-4 py-3 rounded-lg border-2 border-amber-400 bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none text-sm sm:text-base min-h-[48px]"
              disabled={isLoading}
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
                }
              }}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-6 rounded-lg transition-colors focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⚖️</span> Judging...
                </span>
              ) : (
                '⚖️ Submit for Judgment'
              )}
            </button>
          </form>

          {/* Quick Prompts */}
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-amber-200 text-xs sm:text-sm">Quick:</span>
            {[
              'Dad made breakfast today',
              'Dad forgot to pick me up',
              'Dad helped with homework',
              'Dad was on his phone all dinner',
              'Dad told a terrible joke',
            ].map((prompt) => (
              <button
                key={prompt}
                onClick={() => handleInputChange({ target: { value: prompt } } as React.ChangeEvent<HTMLTextAreaElement>)}
                className="text-xs px-2 py-1 bg-amber-700/50 hover:bg-amber-700 text-amber-100 rounded-full transition-colors"
                disabled={isLoading}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// Component to display the parsed verdict nicely
function VerdictDisplay({ content }: { content: string }) {
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const verdict = JSON.parse(jsonMatch[0]) as Verdict;
      return (
        <div className="space-y-3">
          {/* Emoji and Points */}
          <div className="flex items-center gap-3">
            <span className="text-4xl">{verdict.emoji}</span>
            <span className={`text-2xl sm:text-3xl font-bold ${verdict.points >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              {verdict.points > 0 ? '+' : ''}{verdict.points}
            </span>
          </div>
          
          {/* Verdict Title */}
          <div className="font-bold text-lg sm:text-xl text-amber-900 border-b border-amber-300 pb-2">
            🔨 {verdict.verdict}
          </div>
          
          {/* Explanation */}
          <p className="text-sm sm:text-base text-amber-800">
            {verdict.explanation}
          </p>
          
          {/* Dad Joke */}
          {verdict.dadJoke && (
            <div className="bg-yellow-100 rounded-lg p-3 border border-yellow-300">
              <p className="text-sm text-yellow-800">
                <span className="font-bold">😄 Dad Joke: </span>
                {verdict.dadJoke}
              </p>
            </div>
          )}
          
          {/* Meme Reference */}
          {verdict.memeReference && (
            <div className="bg-purple-100 rounded-lg p-3 border border-purple-300">
              <p className="text-sm text-purple-800">
                <span className="font-bold">🖼️ </span>
                {verdict.memeReference}
              </p>
            </div>
          )}
        </div>
      );
    }
  } catch {
    // If parsing fails, show raw content
  }
  
  return <p className="text-sm sm:text-base whitespace-pre-wrap">{content}</p>;
}

