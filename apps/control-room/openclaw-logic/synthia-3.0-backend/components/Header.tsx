
import React from 'react';
import { Language } from '../translations';

interface HeaderProps {
    subtitle: string;
    language: Language;
    onLanguageChange: (lang: Language) => void;
}

export const Header: React.FC<HeaderProps> = ({ subtitle, language, onLanguageChange }) => {
    return (
        <header className="min-h-screen flex flex-col items-center justify-center text-center relative overflow-hidden bg-hero px-6">
            <div className="absolute inset-0 bg-black/20 z-0"></div>
            
            {/* Language Toggle */}
            <div className="absolute top-8 right-8 z-50 flex gap-4">
                <button 
                    onClick={() => onLanguageChange('es')}
                    className={`font-serif italic text-sm tracking-widest transition-all duration-300 ${language === 'es' ? 'text-synthia-amber border-b border-synthia-amber' : 'text-white/50 hover:text-white'}`}
                >
                    ESPAÑOL
                </button>
                <button 
                    onClick={() => onLanguageChange('en')}
                    className={`font-serif italic text-sm tracking-widest transition-all duration-300 ${language === 'en' ? 'text-synthia-amber border-b border-synthia-amber' : 'text-white/50 hover:text-white'}`}
                >
                    INGLÉS
                </button>
            </div>

            <div className="relative z-10 max-w-5xl mx-auto pt-20">
                <h1 className="font-display leading-[0.8] font-light tracking-tighter mb-16 flex flex-col items-center">
                    <span className="text-[15vw] md:text-[12vw] text-white drop-shadow-2xl">
                        SYNTHIA
                    </span>
                    <span className="text-[10vw] md:text-[7vw] text-synthia-amber tracking-tighter mt-2 opacity-90 uppercase font-medium">
                        3.0
                    </span>
                </h1>
                <div className="w-24 h-[1px] bg-white/30 mx-auto mb-12"></div>
                <p className="text-xl md:text-2xl text-synthia-parchment font-serif italic tracking-wide max-w-2xl mx-auto opacity-90">
                    {subtitle}
                </p>
            </div>
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce opacity-50">
                <div className="w-[1px] h-16 bg-gradient-to-b from-white to-transparent"></div>
            </div>
        </header>
    );
};
