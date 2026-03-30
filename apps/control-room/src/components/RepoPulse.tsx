"use client";

import { useEffect, useState } from 'react';
import type { RepoMetadata } from '@/lib/git-manager';

export default function RepoPulse() {
    const [repos, setRepos] = useState<RepoMetadata[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchRepos() {
            try {
                const res = await fetch('/api/repos');
                const data = await res.json();
                setRepos(data);
            } catch (err) {
                console.error("Failed to fetch repo pulse:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchRepos();
    }, []);

    if (loading) return <div className="text-zinc-500 animate-pulse uppercase text-xs tracking-widest">Sincronizando Repositorios...</div>;

    return (
        <section className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-400">Estado de la Flota (KUPURI MEDIA)</h2>
                <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded text-zinc-500">{repos.length} REPOS</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {repos.map((repo) => (
                    <div key={repo.repo} className="p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-zinc-400 transition-colors group cursor-pointer">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-sm font-bold truncate pr-4">{repo.repo}</h3>
                            <div className={`w-2 h-2 rounded-full ${repo.status === 'healthy' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-[10px] uppercase tracking-wider text-zinc-500">
                                <span>Issues</span>
                                <span className="text-zinc-900 dark:text-zinc-100">{repo.openIssues}</span>
                            </div>
                            <div className="flex justify-between text-[10px] uppercase tracking-wider text-zinc-500">
                                <span>Build</span>
                                <span className={repo.buildStatus === 'passing' ? 'text-emerald-500' : 'text-rose-500'}>{repo.buildStatus}</span>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="text-[10px] font-bold uppercase text-zinc-400 hover:text-zinc-900 dark:hover:text-white">Ver Detalles →</button>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
