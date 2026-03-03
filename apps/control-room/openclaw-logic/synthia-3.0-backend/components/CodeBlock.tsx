
import React from 'react';

interface CodeBlockProps {
    code: string;
    language: string;
    title: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ code, language, title }) => {
    return (
        <div className="bg-synthia-ink rounded-3xl overflow-hidden border border-white/5 h-full shadow-2xl">
            <div className="flex items-center justify-between bg-white/5 px-6 py-4">
                 <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-white/20 rounded-full"></span>
                    <span className="w-2 h-2 bg-white/20 rounded-full"></span>
                    <span className="w-2 h-2 bg-white/20 rounded-full"></span>
                </div>
                <p className="text-xs font-serif italic tracking-widest text-synthia-amber/60 uppercase">{title}</p>
                <div className="w-12"></div>
            </div>
            <pre className="p-8 text-xs md:text-sm text-synthia-parchment/60 overflow-x-auto">
                <code className={`language-${language} font-mono leading-relaxed`}>{code}</code>
            </pre>
        </div>
    );
};
