"use client";

import { useState } from 'react';

export default function SocialMediaManager() {
  const [posts, setPosts] = useState([
    {
      id: '1',
      content: 'Transformando negocios con IA 🚀',
      platforms: ['instagram', 'twitter', 'linkedin'],
      client: 'Kupuri Media',
      status: 'published',
      published: '2026-03-02',
      engagement: 342
    },
    {
      id: '2',
      content: 'Nuevo caso de éxito: 3x ROI en 3 meses 📊',
      platforms: ['linkedin', 'facebook'],
      client: 'Agencia Digital CDMX',
      status: 'scheduled',
      published: '2026-03-04',
      engagement: 0
    },
    {
      id: '3',
      content: 'Synthia™ ahora con control por voz 🎤',
      platforms: ['instagram', 'twitter', 'tiktok'],
      client: 'Kupuri Media',
      status: 'draft',
      published: '2026-03-05',
      engagement: 0
    }
  ]);

  const [showNewPost, setShowNewPost] = useState(false);
  const [newPost, setNewPost] = useState({
    content: '',
    platforms: [] as string[],
    client: 'Kupuri Media',
    scheduleDate: ''
  });

  const platformIcons = {
    instagram: '📸',
    twitter: '𝕏',
    linkedin: '💼',
    facebook: '👥',
    tiktok: '🎵'
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-emerald-900/30 border-emerald-500/30 text-emerald-400';
      case 'scheduled': return 'bg-blue-900/30 border-blue-500/30 text-blue-400';
      case 'draft': return 'bg-zinc-800/30 border-zinc-700/30 text-zinc-400';
      default: return 'bg-zinc-800/30 border-zinc-700/30 text-zinc-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'published': return 'Publicado';
      case 'scheduled': return 'Programado';
      case 'draft': return 'Borrador';
      default: return status;
    }
  };

  const togglePlatform = (platform: string) => {
    setNewPost(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform]
    }));
  };

  const handleNewPost = () => {
    if (newPost.content && newPost.platforms.length > 0) {
      const post = {
        id: Math.random().toString(36).substr(2, 9),
        content: newPost.content,
        platforms: newPost.platforms,
        client: newPost.client,
        status: newPost.scheduleDate ? 'scheduled' : 'draft' as const,
        published: newPost.scheduleDate || new Date().toISOString().split('T')[0],
        engagement: 0
      };
      setPosts([post, ...posts]);
      setNewPost({ content: '', platforms: [], client: 'Kupuri Media', scheduleDate: '' });
      setShowNewPost(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
          <h3 className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">Gestión de Redes Sociales</h3>
        </div>
        <button
          onClick={() => setShowNewPost(!showNewPost)}
          className="px-3 py-1 text-xs font-semibold bg-purple-600 hover:bg-purple-700 rounded transition-colors"
        >
          + Nuevo Post
        </button>
      </div>

      {showNewPost && (
        <div className="p-6 bg-zinc-900/50 border border-zinc-700 rounded-xl">
          <div className="mb-4">
            <label className="text-xs font-semibold text-zinc-400 mb-2 block">Cliente</label>
            <select
              value={newPost.client}
              onChange={(e) => setNewPost({ ...newPost, client: e.target.value })}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-white text-sm"
            >
              <option value="Kupuri Media">Kupuri Media</option>
              <option value="Agencia Digital CDMX">Agencia Digital CDMX</option>
              <option value="Coach Empresarial">Coach Empresarial</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="text-xs font-semibold text-zinc-400 mb-2 block">Contenido</label>
            <textarea
              placeholder="Escribe tu post aquí..."
              value={newPost.content}
              onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-white text-sm"
              rows={4}
            />
          </div>

          <div className="mb-4">
            <label className="text-xs font-semibold text-zinc-400 mb-3 block">Plataformas</label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {Object.entries(platformIcons).map(([platform, icon]) => (
                <button
                  key={platform}
                  onClick={() => togglePlatform(platform)}
                  className={`p-3 rounded-lg border transition-all text-center ${
                    newPost.platforms.includes(platform)
                      ? 'bg-purple-600/50 border-purple-500 text-white'
                      : 'bg-zinc-800/30 border-zinc-700 text-zinc-400 hover:border-zinc-600'
                  }`}
                >
                  <div className="text-2xl mb-1">{icon}</div>
                  <div className="text-[10px] capitalize font-semibold">{platform}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="text-xs font-semibold text-zinc-400 mb-2 block">Programar para (opcional)</label>
            <input
              type="date"
              value={newPost.scheduleDate}
              onChange={(e) => setNewPost({ ...newPost, scheduleDate: e.target.value })}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-white text-sm"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleNewPost}
              className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded text-sm font-semibold transition-colors"
            >
              {newPost.scheduleDate ? 'Programar Post' : 'Publicar Ahora'}
            </button>
            <button
              onClick={() => setShowNewPost(false)}
              className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded text-sm font-semibold transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {posts.map((post) => (
          <div
            key={post.id}
            className={`p-4 border rounded-lg transition-colors ${getStatusColor(post.status)}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <p className="text-sm leading-relaxed">{post.content}</p>
                <div className="flex items-center gap-2 mt-2 text-xs text-zinc-500">
                  <span className="text-[10px] font-semibold">{post.client}</span>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-1 bg-black/30 rounded whitespace-nowrap ml-2">
                {getStatusLabel(post.status)}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex gap-2">
                {post.platforms.map((platform) => (
                  <span key={platform} className="text-lg">
                    {platformIcons[platform as keyof typeof platformIcons]}
                  </span>
                ))}
              </div>
              <div className="flex gap-4 text-zinc-400">
                {post.status === 'published' && (
                  <span>👁️ {post.engagement} visualizaciones</span>
                )}
                <span>{post.published}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
