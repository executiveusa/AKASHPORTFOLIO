"use client";

import { useState } from 'react';

const SKILLS = [
    { name: 'Generación SEO', description: 'Optimización automática de metatags y contenido.', category: 'Marketing' },
    { name: 'Audit de Seguridad', description: 'Escáneo de vulnerabilidades en repositorios.', category: 'Security' },
    { name: 'UGC Creator', description: 'Producción de videos cortos para redes sociales.', category: 'Creative' },
    { name: 'Lead Scraper', description: 'Extracción de prospectos de alta fidelidad.', category: 'Sales' },
    { name: 'Auto-Localization', description: 'Traducción y rebranding de landing pages.', category: 'Operations' },
];

export default function SkillMarket() {
    return (
        <section className="flex flex-col gap-6">
            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-400">Mercado de Habilidades (Skill Fish)</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SKILLS.map((skill) => (
                    <div key={skill.name} className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-between hover:border-zinc-500 transition-colors group">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] uppercase tracking-widest text-cyan-500 font-bold">{skill.category}</span>
                            <h3 className="text-sm font-bold text-white">{skill.name}</h3>
                            <p className="text-[10px] text-zinc-500">{skill.description}</p>
                        </div>
                        <button className="text-[10px] font-bold uppercase border border-zinc-700 px-3 py-1 rounded-full group-hover:bg-white group-hover:text-black transition-colors">
                            Asignar
                        </button>
                    </div>
                ))}
            </div>
        </section>
    );
}
