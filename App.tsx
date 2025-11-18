import React, { useState, useEffect } from 'react';
import Hero from './components/Hero';
import Gallery from './components/Gallery';
import Studio from './components/Studio';
import Vision from './components/Vision';
import Letters from './components/Letters';
import AudioGuide from './components/AudioGuide';
import About from './components/About';
import Visit from './components/Visit';
import AiCurator from './components/AiCurator';
import { SectionId } from './types';
import { Menu, X, Palette } from 'lucide-react';

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionId>(SectionId.HERO);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: SectionId) => {
    setIsMenuOpen(false);
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navLinks = [
    { id: SectionId.HERO, label: 'Home' },
    { id: SectionId.GALLERY, label: 'Artworks' },
    { id: SectionId.STUDIO, label: 'Studio' },
    { id: SectionId.VISION, label: 'Vision' },
    { id: SectionId.AUDIO, label: 'Listen' },
    { id: SectionId.LETTERS, label: 'Letters' },
    { id: SectionId.ABOUT, label: 'About' },
    { id: SectionId.VISIT, label: 'Visit' },
  ];

  return (
    <div className="min-h-screen bg-[#fdfbf7]">
      {/* Navigation Bar */}
      <nav 
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => scrollToSection(SectionId.HERO)}
          >
            <Palette className={`w-8 h-8 ${scrolled ? 'text-yellow-600' : 'text-yellow-300'}`} />
            <span className={`text-2xl font-serif font-bold ${scrolled ? 'text-slate-800' : 'text-white'}`}>
              Vincent
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className={`text-sm font-medium uppercase tracking-widest transition-colors hover:text-yellow-500 ${
                  scrolled ? 'text-slate-600' : 'text-white/90'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden text-slate-800"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className={scrolled ? 'text-slate-800' : 'text-white'} size={28} />
            ) : (
              <Menu className={scrolled ? 'text-slate-800' : 'text-white'} size={28} />
            )}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        <div 
          className={`fixed inset-0 bg-slate-900/95 backdrop-blur-xl z-40 flex flex-col items-center justify-center gap-8 transition-transform duration-300 md:hidden ${
            isMenuOpen ? 'translate-y-0' : '-translate-y-full'
          }`}
        >
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollToSection(link.id)}
              className="text-3xl font-serif text-white hover:text-yellow-400 transition-colors"
            >
              {link.label}
            </button>
          ))}
        </div>
      </nav>

      <main>
        <Hero scrollToSection={scrollToSection} />
        <Gallery />
        <Studio />
        <Vision />
        <AudioGuide />
        <Letters />
        <About />
        <Visit />
      </main>

      <AiCurator />
    </div>
  );
}

export default App;