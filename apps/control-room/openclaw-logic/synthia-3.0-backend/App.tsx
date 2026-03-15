
import React, { useState } from 'react';
import { Header } from './components/Header';
import { Section } from './components/Section';
import { GlassCard } from './components/GlassCard';
import { CodeBlock } from './components/CodeBlock';
import { BrainIcon, CodeBracketIcon, ColorSwatchIcon, CpuChipIcon, MagnifyingGlassIcon, ScaleIcon } from './components/Icons';
import { translations, Language } from './translations';

const App: React.FC = () => {
    const [language, setLanguage] = useState<Language>('es');
    const t = translations[language];

    const capabilitiesIcons = [<BrainIcon />, <ColorSwatchIcon />, <CpuChipIcon />, <MagnifyingGlassIcon />, <ScaleIcon />];

    return (
        <div className="min-h-screen bg-synthia-ink font-sans overflow-x-hidden selection:bg-synthia-amber/30">
            <div className="relative z-10">
                <Header 
                    subtitle={t.hero.subtitle} 
                    language={language} 
                    onLanguageChange={setLanguage} 
                />

                <main className="container mx-auto px-6 py-24 max-w-5xl">
                    <Section id="intro" title={t.intro.title}>
                        <p className="text-xl md:text-2xl text-synthia-parchment leading-relaxed font-serif italic text-center max-w-4xl mx-auto">
                            {t.intro.text}
                        </p>
                    </Section>

                    <Section id="capabilities" title={t.capabilities.title}>
                        <div className="grid md:grid-cols-2 gap-8 mt-8">
                            {t.capabilities.items.map((cap, index) => (
                                <GlassCard key={index} icon={capabilitiesIcons[index]} title={cap.title}>
                                    {cap.text}
                                </GlassCard>
                            ))}
                        </div>
                    </Section>
                    
                    <Section id="philosophy" title={t.philosophy.title}>
                        <div className="space-y-8 mt-8">
                            {t.philosophy.items.map((point, index) => (
                                <GlassCard key={index} title={point.title}>
                                    {point.text}
                                </GlassCard>
                            ))}
                        </div>
                    </Section>

                     <Section id="metamorphosis" title={t.metamorphosis.title} subtitle={t.metamorphosis.subtitle}>
                        <div className="mt-8 text-center bg-white/5 rounded-3xl p-12 border border-white/5">
                            <p className="text-xl md:text-2xl text-synthia-parchment font-serif italic leading-relaxed">
                                {t.metamorphosis.text}
                            </p>
                        </div>
                    </Section>

                    <Section id="architecture" title={t.architecture.title} subtitle={t.architecture.subtitle}>
                        <div className="grid lg:grid-cols-2 gap-12 mt-8 items-start">
                             <CodeBlock title={t.architecture.topologyTitle} language="asciidoc" code={t.architecture.topologyCode} />
                             <div className="flex flex-col gap-6">
                                {t.architecture.agents.map((agent, index) => (
                                     <GlassCard key={index} title={agent.name} smallTitle>
                                         <span className="text-synthia-parchment/80">{agent.expertise}</span>
                                     </GlassCard>
                                ))}
                            </div>
                        </div>
                    </Section>
                    
                    <Section id="commitment" title={t.commitment.title}>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
                             {t.commitment.items.map((item, index) => (
                                 <GlassCard key={index} title={item.title} smallTitle>
                                     <p className="text-sm">{item.text}</p>
                                 </GlassCard>
                             ))}
                        </div>
                    </Section>
                    
                    <footer className="text-center mt-32 py-16 border-t border-white/5">
                         <p className="font-serif text-3xl tracking-[0.3em] text-white uppercase">SYNTHIA 3.0</p>
                         <p className="text-synthia-amber mt-4 font-serif italic tracking-widest">{t.footer.status}</p>
                    </footer>

                </main>
            </div>
        </div>
    );
};

export default App;
