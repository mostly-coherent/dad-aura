'use client';

import { useState, useRef, useEffect, FormEvent } from 'react';

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

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function DadTribunal({ onVerdictSaved }: DadTribunalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentVerdict, setCurrentVerdict] = useState<Verdict | null>(null);
  const [showSavedMessage, setShowSavedMessage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setError(null);
    setIsLoading(true);

    // Add user message to chat
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      // Call the tribunal API (OpenAI generates, Anthropic checks safety)
      const response = await fetch('/api/dad-tribunal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: userMessage }],
        }),
      });

      if (!response.ok) {
        throw new Error('The Tribunal is temporarily unavailable');
      }

      const responseText = await response.text();

      // Add assistant message
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseText,
      };
      setMessages((prev) => [...prev, assistantMsg]);

      // Parse the verdict
      const cleanContent = responseText
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/g, '');
      const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        const verdict = JSON.parse(jsonMatch[0]) as Verdict;
        setCurrentVerdict(verdict);

        // Auto-save the verdict
        const saveResponse = await fetch('/api/dad-tribunal', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(verdict),
        });

        if (saveResponse.ok) {
          setShowSavedMessage(true);
          setTimeout(() => {
            setShowSavedMessage(false);
            setCurrentVerdict(null);
            // Don't clear messages - keep chat history visible
          }, 3000);
          onVerdictSaved();
        } else {
          console.error('Failed to save verdict');
          setError('Failed to save the verdict. Please try again.');
        }
      } else {
        console.error('No JSON found in response');
        setError('Could not parse the verdict. Please try again.');
      }
    } catch (err) {
      console.error('Tribunal error:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section
      className="px-4 sm:px-6 py-6 sm:py-8"
      aria-label="The Dad Tribunal - AI Judge"
    >
      <div className="bg-gradient-to-br from-amber-900 via-amber-800 to-yellow-900 rounded-xl shadow-2xl overflow-hidden border-4 border-amber-600">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-700 to-yellow-700 px-4 sm:px-6 py-4 sm:py-5 text-center border-b-4 border-amber-600">
          <div className="text-3xl sm:text-4xl mb-2" role="img" aria-label="Gavel">
            ⚖️
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white drop-shadow-lg">
            The Dad Tribunal
          </h2>
          <p className="text-amber-100 text-sm sm:text-base mt-1 drop-shadow">
            Tell us how Dad performed today. We shall judge.
          </p>
          <p className="text-amber-200/80 text-xs mt-2">
            🛡️ All verdicts are reviewed for safety
          </p>
          {messages.length > 0 && (
            <button
              onClick={() => {
                setMessages([]);
                setInput('');
                setError(null);
                setCurrentVerdict(null);
                setShowSavedMessage(false);
              }}
              className="mt-3 text-xs px-3 py-1.5 bg-amber-600/50 hover:bg-amber-600 text-white rounded-full transition-colors"
            >
              🔄 New Chat Session
            </button>
          )}
        </div>

        {/* Chat Area */}
        <div className="p-4 sm:p-6">
          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-red-100 border-2 border-red-400 rounded-lg p-4 text-center">
              <span className="text-red-800 font-medium">⚠️ {error}</span>
            </div>
          )}

          {/* Messages - scrollable chat history */}
          {messages.length > 0 && (
            <div className="mb-4 space-y-4 max-h-[500px] sm:max-h-[600px] overflow-y-auto scroll-smooth">
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

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-amber-100 text-amber-900 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <span className="animate-spin">⚖️</span>
                      <span className="text-sm font-medium">
                        The Tribunal is deliberating & checking safety...
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Status indicators - compact, non-blocking */}
          <div className="mb-3 flex justify-center">
            {currentVerdict && !showSavedMessage && (
              <span className="inline-flex items-center gap-2 text-amber-200 text-sm bg-amber-800/50 px-3 py-1.5 rounded-full">
                <span className="animate-spin">⏳</span> Saving...
              </span>
            )}
            {showSavedMessage && (
              <span className="inline-flex items-center gap-2 text-green-100 text-sm bg-green-700 px-3 py-1.5 rounded-full">
                ✅ Saved!
              </span>
            )}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <label htmlFor="tribunal-input" className="sr-only">Tell The Tribunal what Dad did today</label>
            <textarea
              id="tribunal-input"
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tell The Tribunal what Dad did today..."
              className="flex-1 px-4 py-3 rounded-lg border-2 border-amber-400 bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none text-sm sm:text-base min-h-[48px]"
              disabled={isLoading}
              aria-describedby="tribunal-input-hint"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e as unknown as FormEvent);
                }
              }}
            />
            <span id="tribunal-input-hint" className="sr-only">Press Enter to submit, Shift+Enter for new line</span>
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
                type="button"
                key={prompt}
                onClick={() => setInput(prompt)}
                className="text-xs px-2 py-1 bg-amber-700/50 hover:bg-amber-700 text-amber-100 rounded-full transition-colors"
                disabled={isLoading}
                aria-label={`Use quick prompt: ${prompt}`}
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
    // Remove safety notes before parsing
    const cleanContent = content
      .replace(/\n\n🛡️.*/g, '')
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/g, '');
    const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const verdict = JSON.parse(jsonMatch[0]) as Verdict;
      const hasSafetyNote = content.includes('🛡️');

      return (
        <div className="space-y-3">
          {/* Emoji and Points */}
          <div className="flex items-center gap-3">
            <span className="text-4xl">{verdict.emoji}</span>
            <span
              className={`text-2xl sm:text-3xl font-bold ${verdict.points >= 0 ? 'text-green-700' : 'text-red-700'}`}
            >
              {verdict.points > 0 ? '+' : ''}
              {verdict.points}
            </span>
          </div>

          {/* Verdict Title */}
          <div className="font-bold text-lg sm:text-xl text-amber-900 border-b border-amber-300 pb-2">
            🔨 {verdict.verdict}
          </div>

          {/* Explanation */}
          <p className="text-sm sm:text-base text-amber-800">{verdict.explanation}</p>

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

          {/* Safety note indicator */}
          {hasSafetyNote && (
            <div className="text-xs text-amber-600 flex items-center gap-1">
              <span>🛡️</span>
              <span>This response was reviewed for safety</span>
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
