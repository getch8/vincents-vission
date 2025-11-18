import React, { useState } from 'react';
import { SectionId } from '../types';
import { generateVanGoghStyleImage } from '../services/geminiService';
import { Paintbrush, Download, RefreshCw, Wand2, AlertCircle } from 'lucide-react';

const Studio: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const image = await generateVanGoghStyleImage(prompt);
      if (image) {
        setGeneratedImage(image);
      } else {
        setError("The muse is silent right now. Please try a different idea.");
      }
    } catch (err) {
      setError("We ran out of paint. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = () => {
    if (generatedImage) {
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = `vincent-vision-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <section id={SectionId.STUDIO} className="py-24 bg-[#1e293b] relative overflow-hidden text-white">
      {/* Background texture effect */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/canvas-orange.png')]"></div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif text-yellow-400 mb-4 drop-shadow-lg">
            The Dream Studio
          </h2>
          <p className="text-slate-300 max-w-2xl mx-auto text-lg font-light">
            "I dream my painting and I paint my dream." Describe any scene, and our AI will paint it with Vincent's brush.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 items-start">
          {/* Controls Side */}
          <div className="w-full lg:w-1/3 space-y-8">
            <div className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-xl border border-slate-700 shadow-xl">
              <form onSubmit={handleGenerate} className="space-y-6">
                <div>
                  <label className="block text-yellow-200 text-sm font-medium mb-2 uppercase tracking-wider">
                    Your Vision
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., A futuristic city with flying cars, A calm lake at sunset, A cat wearing a hat..."
                    className="w-full h-32 bg-slate-900/80 border border-slate-600 rounded-lg p-4 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none resize-none transition-all"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={loading || !prompt.trim()}
                  className="w-full py-4 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-slate-900 font-bold rounded-lg shadow-lg transform transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="animate-spin" /> Mixing Colors...
                    </>
                  ) : (
                    <>
                      <Paintbrush /> Paint it
                    </>
                  )}
                </button>
              </form>

              {error && (
                <div className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-2 text-red-200 text-sm">
                  <AlertCircle size={18} /> {error}
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-slate-700 text-sm text-slate-400">
                <p className="flex items-start gap-2">
                  <Wand2 size={16} className="mt-1 text-yellow-500" />
                  Powered by Gemini Imagen. The AI will interpret your prompt and apply Van Gogh's signature impasto style.
                </p>
              </div>
            </div>
          </div>

          {/* Canvas Side */}
          <div className="w-full lg:w-2/3">
            <div className="relative aspect-[4/3] bg-[#0f172a] rounded-sm shadow-2xl border-[16px] border-[#3f2e18] overflow-hidden group">
              {/* Inner Frame Shadow */}
              <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(0,0,0,0.8)] z-20 pointer-events-none"></div>

              {loading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-slate-900">
                  <div className="w-24 h-24 relative">
                     <div className="absolute inset-0 border-4 border-yellow-500/30 rounded-full"></div>
                     <div className="absolute inset-0 border-4 border-transparent border-t-yellow-500 rounded-full animate-spin"></div>
                  </div>
                  <p className="mt-6 text-yellow-200 font-serif animate-pulse tracking-widest">APPLYING BRUSHSTROKES...</p>
                </div>
              ) : generatedImage ? (
                <>
                  <img 
                    src={generatedImage} 
                    alt="AI Generated Art" 
                    className="w-full h-full object-cover animate-fade-in"
                  />
                  {/* Overlay Actions */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex justify-end">
                    <button
                      onClick={downloadImage}
                      className="flex items-center gap-2 px-6 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/30 rounded-full transition-all"
                    >
                      <Download size={18} /> Download Masterpiece
                    </button>
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 z-10 bg-[url('https://www.transparenttextures.com/patterns/canvas-orange.png')]">
                  <Paintbrush size={64} className="mb-4 opacity-20" />
                  <p className="text-lg font-serif opacity-50">The canvas is waiting for your dream.</p>
                </div>
              )}
            </div>
            
            {/* Easel Legs Visuals (CSS Art) */}
            <div className="w-[80%] mx-auto h-8 bg-[#2d2010] mt-[-4px] shadow-xl relative z-0 rounded-b-sm"></div>
            <div className="flex justify-between w-[70%] mx-auto">
                <div className="w-4 h-32 bg-[#2d2010] -mt-2 transform rotate-6 origin-top rounded-b-sm"></div>
                <div className="w-4 h-32 bg-[#2d2010] -mt-2 transform -rotate-6 origin-top rounded-b-sm"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Studio;