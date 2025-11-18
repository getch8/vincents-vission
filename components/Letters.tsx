import React, { useState } from 'react';
import { SectionId } from '../types';
import { generateLetterResponse } from '../services/geminiService';
import { PenTool, Send, ArrowLeft } from 'lucide-react';

const Letters: React.FC = () => {
  const [step, setStep] = useState<'compose' | 'reading'>('compose');
  const [userLetter, setUserLetter] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userLetter.trim()) return;

    setLoading(true);
    const reply = await generateLetterResponse(userLetter);
    setResponse(reply);
    setLoading(false);
    setStep('reading');
  };

  const reset = () => {
    setStep('compose');
    setUserLetter('');
    setResponse('');
  };

  return (
    <section id={SectionId.LETTERS} className="py-24 bg-[#2c1810] relative overflow-hidden text-slate-800">
      {/* Wood Texture Background */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-40 z-0"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-transparent z-0 pointer-events-none"></div>

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-serif text-yellow-100 mb-4 drop-shadow-lg">The Correspondence</h2>
          <p className="text-yellow-200/80 max-w-xl mx-auto italic">
            "One must spoil as many canvases as one succeeds with." — Write to Vincent, and receive a letter from the past.
          </p>
        </div>

        <div className="flex justify-center min-h-[600px]">
          {step === 'compose' ? (
            <div className="w-full max-w-2xl bg-[#f0e6d2] p-8 md:p-12 rounded-sm shadow-[0_10px_40px_rgba(0,0,0,0.5)] relative transform transition-all animate-fade-in">
              {/* Paper texture overlay */}
              <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] pointer-events-none rounded-sm"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6 border-b border-slate-300 pb-4">
                   <PenTool className="text-slate-600" />
                   <h3 className="text-2xl font-serif text-slate-800">My Letter to Vincent</h3>
                </div>
                
                <form onSubmit={handleSend}>
                  <textarea
                    value={userLetter}
                    onChange={(e) => setUserLetter(e.target.value)}
                    placeholder="Dear Vincent, I find myself wondering about..."
                    className="w-full h-64 bg-transparent border-none outline-none text-lg font-serif leading-relaxed text-slate-700 placeholder:text-slate-400 resize-none custom-scrollbar"
                    style={{ backgroundImage: 'linear-gradient(transparent, transparent 31px, #cbd5e1 31px, #cbd5e1 32px)', backgroundSize: '100% 32px', lineHeight: '32px' }}
                  />
                  
                  <div className="mt-8 flex justify-end">
                    <button 
                      type="submit"
                      disabled={loading || !userLetter.trim()}
                      className="px-8 py-3 bg-[#8b4513] hover:bg-[#6d360e] text-yellow-100 font-serif text-lg rounded-sm shadow-md transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>Sending across time...</>
                      ) : (
                        <>
                          Send Letter <Send size={18} />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            <div className="w-full max-w-2xl bg-[#fffef0] p-10 md:p-16 rounded-sm shadow-[0_20px_50px_rgba(0,0,0,0.6)] relative transform rotate-1 animate-scale-up origin-top-left">
              {/* Aged Paper Texture */}
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] opacity-50 rounded-sm pointer-events-none"></div>
              {/* Coffee stain */}
              <div className="absolute top-10 right-10 w-24 h-24 bg-amber-900/10 rounded-full blur-xl pointer-events-none"></div>

              <div className="relative z-10 font-handwriting text-2xl md:text-3xl leading-loose text-slate-800">
                {response.split('\n').map((line, i) => (
                  <p key={i} className="mb-6">{line}</p>
                ))}
              </div>

              <div className="mt-12 pt-8 border-t border-slate-300/50 flex justify-between items-center relative z-10">
                <button 
                  onClick={reset}
                  className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-sans text-sm uppercase tracking-widest"
                >
                  <ArrowLeft size={16} /> Write Another
                </button>
                
                <div className="w-16 h-16 bg-red-800/80 rounded-full flex items-center justify-center shadow-inner border-4 border-red-900/20 opacity-80">
                   <span className="text-red-100 font-serif font-bold text-xs">VV</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Letters;