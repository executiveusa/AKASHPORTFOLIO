"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';

const GATE_COPY = {
  es: {
    title: 'SYNTHIA 3.0',
    subtitle: 'Acceso Exclusivo // Solo por Invitación',
    placeholder: 'INTRODUZCA CÓDIGO DE AGENCIA',
    button: 'Entrar al Núcleo',
    error: '⚠ Código Inválido',
    footer: 'Este sistema está en fase alfa. Todas las operaciones son monitoreadas por el Protocolo de Seguridad ACIP v1.3.',
  },
  en: {
    title: 'SYNTHIA 3.0',
    subtitle: 'Exclusive Access // Invite Only',
    placeholder: 'ENTER AGENCY CODE',
    button: 'Enter the Core',
    error: '⚠ Invalid Code',
    footer: 'This system is in alpha phase. All operations are monitored by ACIP v1.3 Security Protocol.',
  },
};

export default function InviteGate({ children }: { children: React.ReactNode }) {
    const [code, setCode] = useState('');
    const [authorized, setAuthorized] = useState(false);
    const [shake, setShake] = useState(false);
    const [lang, setLang] = useState<'es' | 'en'>('es');
    const t = GATE_COPY[lang];

    const handleAccess = () => {
        const validCode = process.env.NEXT_PUBLIC_INVITE_CODE ?? 'KUPURI2026';
        if (code === validCode) {
            setAuthorized(true);
        } else {
            setShake(true);
            setTimeout(() => setShake(false), 500);
        }
    };

    const shakeVariants = {
        shake: {
            x: [0, -10, 10, -10, 10, 0],
            transition: { duration: 0.5 }
        }
    };

    if (authorized) return <>{children}</>;

    return (
        <div className="fixed inset-0 z-[100] bg-charcoal-900 flex flex-col items-center justify-center p-8">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-charcoal-800 to-charcoal-900" />

            {/* Content */}
            <motion.div
                variants={shakeVariants}
                animate={shake ? 'shake' : 'normal'}
                className="relative z-10 flex flex-col items-center"
            >
                {/* Language toggle */}
                <button
                    onClick={() => setLang(lang === 'es' ? 'en' : 'es')}
                    className="absolute top-4 right-4 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border border-gold-600/30 text-gold-400 hover:bg-gold-400/10 transition-colors"
                >
                    {lang === 'es' ? 'EN' : 'ES'}
                </button>

                {/* Logo */}
                <div className="w-20 h-20 bg-gold-400 rounded-full flex items-center justify-center text-charcoal-900 font-display font-bold text-4xl mb-12">
                    S
                </div>

                {/* Title */}
                <h1 className="text-5xl font-display font-bold tracking-tight text-gold-400 mb-2">
                    {t.title}
                </h1>
                <p className="text-[10px] uppercase tracking-[0.5em] text-cream-400 mb-12">
                    {t.subtitle}
                </p>

                {/* Input Section */}
                <div className="flex flex-col gap-4 w-full max-w-sm">
                    <motion.input
                        type="password"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAccess()}
                        placeholder={t.placeholder}
                        className="bg-charcoal-800 border border-gold-600/30 p-4 rounded-xl text-center font-mono tracking-widest text-cream-100 outline-none focus:border-gold-400/60 transition-all focus:bg-charcoal-700"
                        whileFocus={{ scale: 1.02 }}
                    />
                    <motion.button
                        onClick={handleAccess}
                        className="bg-gold-400 text-charcoal-900 font-bold uppercase tracking-widest p-4 rounded-xl hover:bg-gold-300 transition-all active:scale-95"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {t.button}
                    </motion.button>
                </div>

                {/* Error Message */}
                {shake && (
                    <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-6 text-sm text-gold-600 uppercase tracking-widest font-bold text-center"
                    >
                        {t.error}
                    </motion.p>
                )}

                {/* Footer */}
                <p className="mt-12 text-[10px] text-cream-400 uppercase tracking-widest text-center max-w-xs">
                    {t.footer}
                </p>
            </motion.div>
        </div>
    );
}
