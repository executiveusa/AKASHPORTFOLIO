
import React, { ReactNode } from 'react';

interface SectionProps {
    id: string;
    title: string;
    subtitle?: string;
    children: ReactNode;
}

export const Section: React.FC<SectionProps> = ({ id, title, subtitle, children }) => {
    return (
        <section 
            id={id} 
            className="py-16 md:py-24 border-t border-white/5"
        >
            <div className="max-w-3xl mx-auto text-center mb-16">
                <h2 className="font-serif text-4xl md:text-5xl font-medium tracking-tight text-white">
                    {title}
                </h2>
                {subtitle && <p className="mt-6 text-lg text-synthia-amber font-serif italic tracking-widest uppercase opacity-90">{subtitle}</p>}
            </div>
            {children}
        </section>
    );
};
