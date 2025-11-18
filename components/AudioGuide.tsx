import React, { useState, useRef, useEffect } from 'react';
import { SectionId } from '../types';
import { generateVanGoghSpeech } from '../services/geminiService';
import { Headphones, Play, Square, Volume2, Music, Loader2 } from 'lucide-react';

const TOPICS = [
  { id: 'night', label: 'The Night Sky', prompt: 'The infinite beauty of the stars and the night sky.' },
  { id: 'yellow', label: 'The Color Yellow', prompt: 'Why the color yellow means so much to me, representing the sun and life.' },
  { id: 'brother', label: 'My Brother Theo', prompt: 'My deep gratitude and love for my brother Theo.' },
  { id: 'madness', label: 'Art & Struggle', prompt: 'The struggle of the artist and the healing power of painting.' },
];

// Decode base64 string to Uint8Array
const decodeBase64 = (base64: string): Uint8Array => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

// Manually decode raw PCM data (Int16) to AudioBuffer
const decodeAudioData = (
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1
): AudioBuffer => {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      // Convert Int16 to Float32 (-1.0 to 1.0)
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
};

const AudioGuide: React.FC = () => {
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Audio Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  // Stop audio cleanup
  const stopAudio = () => {
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
      } catch (e) {
        // ignore if already stopped
      }
      sourceNodeRef.current = null;
    }
    setIsPlaying(false);
  };

  useEffect(() => {
    return () => {
      stopAudio();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const handlePlay = async (topicId: string, prompt: string) => {
    // Stop current playback if any
    stopAudio();
    setActiveTopic(topicId);
    setLoading(true);
    setError(null);

    try {
      // Initialize Audio Context on user gesture
      if (!audioContextRef.current) {
        // Use 24000 sample rate which is standard for this model
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      // Fetch Audio from Gemini
      const base64Audio = await generateVanGoghSpeech(prompt);
      
      if (!base64Audio) {
        throw new Error("Silence returned from the API.");
      }

      // Decode Raw PCM and Play
      const audioBytes = decodeBase64(base64Audio);
      const audioBuffer = decodeAudioData(audioBytes, audioContextRef.current, 24000, 1);
      
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      
      source.onended = () => {
        setIsPlaying(false);
        setActiveTopic(null);
      };

      source.start(0);
      sourceNodeRef.current = source;
      setIsPlaying(true);

    } catch (err) {
      console.error(err);
      setError("The phonograph is broken. Please try again.");
      setActiveTopic(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id={SectionId.AUDIO} className="py-24 bg-[#0f172a] text-white relative overflow-hidden">
      {/* Atmospheric Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-[#0f172a] to-[#0f172a]"></div>
      
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row gap-12 items-center">
          
          {/* Left: Content */}
          <div className="w-full md:w-1/2 space-y-8">
            <div>
              <h2 className="text-4xl md:text-5xl font-serif text-yellow-100 mb-4 flex items-center gap-3">
                Echoes of Arles <Headphones className="text-yellow-500" size={32} />
              </h2>
              <p className="text-slate-300 text-lg font-light leading-relaxed">
                Hear the voice of Vincent. Using advanced AI speech synthesis, we bring his letters and thoughts to life. 
                Select a topic to listen to his musings.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {TOPICS.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => activeTopic === topic.id && isPlaying ? stopAudio() : handlePlay(topic.id, topic.prompt)}
                  disabled={loading && activeTopic !== topic.id}
                  className={`p-6 rounded-xl text-left transition-all duration-300 border group relative overflow-hidden ${
                    activeTopic === topic.id 
                      ? 'bg-yellow-500/10 border-yellow-500 ring-1 ring-yellow-500/50' 
                      : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800 hover:border-yellow-500/50'
                  }`}
                >
                  <div className="relative z-10">
                    <h3 className={`text-lg font-bold font-serif mb-1 group-hover:text-yellow-300 transition-colors ${activeTopic === topic.id ? 'text-yellow-400' : 'text-slate-200'}`}>
                      {topic.label}
                    </h3>
                    <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-medium">
                      {loading && activeTopic === topic.id ? (
                        <span className="text-yellow-400 flex items-center gap-1">
                          <Loader2 size={12} className="animate-spin" /> Generating...
                        </span>
                      ) : isPlaying && activeTopic === topic.id ? (
                        <span className="text-green-400 flex items-center gap-1">
                          <Volume2 size={12} className="animate-pulse" /> Playing
                        </span>
                      ) : (
                        <span className="text-slate-500 group-hover:text-slate-400 flex items-center gap-1">
                          <Play size={12} /> Listen
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
            
            {error && (
              <div className="text-red-400 text-sm bg-red-900/20 p-3 rounded border border-red-900/50">
                {error}
              </div>
            )}
          </div>

          {/* Right: Visualizer */}
          <div className="w-full md:w-1/2 flex items-center justify-center">
            <div className="relative w-72 h-72 rounded-full bg-slate-900 border-8 border-slate-800 shadow-2xl flex items-center justify-center overflow-hidden">
              {/* Spinning Record Effect */}
              <div className={`absolute inset-0 border border-white/5 rounded-full ${isPlaying ? 'animate-spin-slow' : ''}`} 
                   style={{ animationDuration: '10s' }}>
                 <div className="absolute top-1/2 left-1/2 w-[98%] h-[98%] border border-white/5 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                 <div className="absolute top-1/2 left-1/2 w-[70%] h-[70%] border border-white/5 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                 <div className="absolute top-1/2 left-1/2 w-[40%] h-[40%] border border-white/5 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
              </div>

              {/* Center Label */}
              <div className="relative z-20 w-24 h-24 bg-gradient-to-br from-yellow-600 to-yellow-800 rounded-full flex items-center justify-center shadow-inner">
                <Music className={`text-yellow-100 ${isPlaying ? 'animate-pulse' : 'opacity-50'}`} />
              </div>

              {/* Audio Bars Visualizer (Fake) */}
              {isPlaying && (
                <div className="absolute inset-0 z-10 flex items-center justify-center gap-1 opacity-50">
                  {[...Array(12)].map((_, i) => (
                    <div 
                      key={i}
                      className="w-2 bg-yellow-400 rounded-full animate-sound-wave"
                      style={{ 
                        height: '30%',
                        animationDelay: `${i * 0.1}s`,
                        transformOrigin: 'center'
                      }}
                    ></div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
      
      <style>{`
        @keyframes sound-wave {
          0%, 100% { height: 20%; opacity: 0.5; }
          50% { height: 60%; opacity: 1; }
        }
        .animate-sound-wave {
          animation: sound-wave 1s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spin 10s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </section>
  );
};

export default AudioGuide;