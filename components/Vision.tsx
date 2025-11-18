import React, { useState, useRef } from 'react';
import { SectionId } from '../types';
import { generateImageCritique } from '../services/geminiService';
import { Upload, Image as ImageIcon, Loader2, Quote, Sparkles } from 'lucide-react';

const Vision: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [critique, setCritique] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      setImage(base64);
      setCritique(null);
      setLoading(true);

      const result = await generateImageCritique(base64, file.type);
      setCritique(result);
      setLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const onDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <section id={SectionId.VISION} className="py-24 bg-[#fdfbf7] border-t border-slate-200">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif text-slate-800 mb-4">The Artist's Eye</h2>
          <div className="w-24 h-1 bg-yellow-500 mx-auto rounded-full"></div>
          <p className="mt-4 text-slate-600 max-w-2xl mx-auto italic">
            "I want to touch people with my art. I want them to say 'he feels deeply, he feels tenderly'."
          </p>
          <p className="mt-2 text-sm text-slate-500">Upload a photo, and Vincent will tell you how he sees it.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 items-stretch min-h-[500px]">
          
          {/* Upload Zone */}
          <div className="w-full lg:w-1/2 flex flex-col">
            <div 
              className={`relative flex-1 border-2 border-dashed rounded-xl transition-all duration-300 flex flex-col items-center justify-center overflow-hidden bg-slate-50 ${
                dragActive ? 'border-yellow-500 bg-yellow-50' : 'border-slate-300'
              }`}
              onDragEnter={onDragEnter}
              onDragLeave={onDragLeave}
              onDragOver={onDragOver}
              onDrop={onDrop}
            >
              {image ? (
                <>
                  <img src={image} alt="Uploaded" className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors flex items-center justify-center group">
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="px-6 py-3 bg-white text-slate-900 rounded-full font-medium opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0 shadow-lg"
                    >
                      Choose Another
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center p-8 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6 text-yellow-600">
                    <Upload size={32} />
                  </div>
                  <h3 className="text-xl font-serif text-slate-700 mb-2">Upload a Photo</h3>
                  <p className="text-slate-500 mb-6">Drag & drop or click to select</p>
                  <p className="text-xs text-slate-400 uppercase tracking-wider">Supports JPG, PNG, WebP</p>
                </div>
              )}
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Analysis Zone */}
          <div className="w-full lg:w-1/2 relative">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] bg-[#fffdf5] shadow-lg rounded-sm border border-slate-200 p-8 md:p-12 flex flex-col">
              
              {!image && !loading && (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 opacity-60">
                  <ImageIcon size={48} className="mb-4" />
                  <p className="font-serif italic">Waiting for your canvas...</p>
                </div>
              )}

              {loading && (
                <div className="flex-1 flex flex-col items-center justify-center">
                  <Loader2 size={48} className="text-yellow-600 animate-spin mb-6" />
                  <p className="font-serif text-xl text-slate-700 animate-pulse">Observing the light...</p>
                  <p className="text-sm text-slate-500 mt-2">Vincent is studying your image</p>
                </div>
              )}

              {critique && !loading && (
                <div className="flex-1 flex flex-col animate-fade-in">
                  <Quote size={40} className="text-yellow-400/50 mb-6 rotate-180" />
                  <div className="prose prose-slate prose-lg flex-1 font-serif leading-loose text-slate-800 overflow-y-auto custom-scrollbar pr-2">
                    {critique.split('\n').map((paragraph, i) => (
                        <p key={i} className="mb-4">{paragraph}</p>
                    ))}
                  </div>
                  <div className="mt-8 pt-6 border-t border-slate-200/60 flex justify-between items-end">
                    <div className="flex flex-col">
                       <span className="font-handwriting text-3xl text-slate-600 transform -rotate-6 block mt-2" style={{ fontFamily: 'cursive' }}>Vincent</span>
                    </div>
                    <Sparkles className="text-yellow-400" size={24} />
                  </div>
                </div>
              )}
            </div>
            
            {/* Decorative Tape */}
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-32 h-8 bg-yellow-100/80 rotate-1 shadow-sm"></div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Vision;