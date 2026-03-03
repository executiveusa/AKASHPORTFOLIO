
import React, { ReactNode } from 'react';

interface GlassCardProps {
    children: ReactNode;
    icon?: ReactNode;
    title?: string;
    smallTitle?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, icon, title, smallTitle = false }) => {
    return (
        <div className="bg-white/[0.08] backdrop-blur-md border border-white/10 rounded-3xl p-8 transition-all duration-500 hover:bg-white/[0.12] hover:border-white/20 shadow-2xl">
            {(icon || title) && (
                <div className="flex items-center mb-6">
                    {icon && <div className="text-synthia-amber mr-4 opacity-100">{icon}</div>}
                    {title && (
                        <h3 className={`font-serif ${smallTitle ? 'text-xl text-synthia-amber italic' : 'text-2xl text-white font-medium'}`}>
                            {title}
                        </h3>
                    )}
                </div>
            )}
            <div className={`font-sans font-normal tracking-wide ${smallTitle ? 'text-base text-synthia-parchment' : 'text-synthia-parchment/90 text-lg leading-relaxed'}`}>
                {children}
            </div>
        </div>
    );
};
