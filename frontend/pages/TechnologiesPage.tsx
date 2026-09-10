import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Code2, Search, ArrowRight, Sparkles, Layers } from 'lucide-react';
import { eventApi } from '../services/api.ts';
import { TechnologyItem } from '../types.ts';

export const TechnologiesPage: React.FC = () => {
  const [technologies, setTechnologies] = useState<TechnologyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const navigate = useNavigate();

  useEffect(() => {
    async function loadTechs() {
      try {
        const res = await eventApi.getTechnologies();
        setTechnologies(res.data || []);
      } catch (err) {
        console.error('Failed to load technologies:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTechs();
  }, []);

  const categories = ['all', ...Array.from(new Set(technologies.map(t => t.category)))];

  const filtered = technologies.filter(t => {
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'all' || t.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 min-h-screen">
      {/* Header */}
      <div className="max-w-3xl mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20 mb-3">
          <Code2 className="w-3.5 h-3.5" />
          <span>Technology Taxonomy & Ecosystems</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
          Explore by Technology
        </h1>
        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 mt-2 leading-relaxed">
          Find hackathons, summits, and user group meetups organized specifically around your favorite programming languages, AI models, frameworks, and tools.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                selectedCategory === cat
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search technologies..."
            className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="h-44 rounded-2xl bg-zinc-200 dark:bg-zinc-800/60" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center text-zinc-500">
          No technologies matching your search "{search}".
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filtered.map(tech => (
            <div
              key={tech.name}
              id={`tech-detail-card-${tech.name.toLowerCase()}`}
              onClick={() => navigate(`/events?technology=${encodeURIComponent(tech.name)}`)}
              className="group cursor-pointer p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/60 hover:border-violet-500/60 dark:hover:border-cyan-500/60 hover:shadow-xl hover:shadow-violet-500/5 transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span
                    className="w-3.5 h-3.5 rounded-full shadow-xs"
                    style={{ backgroundColor: tech.color || '#7C3AED' }}
                  />
                  <span className="text-[11px] font-mono text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
                    {tech.category}
                  </span>
                </div>

                <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 group-hover:text-violet-600 dark:group-hover:text-cyan-400 transition-colors">
                  {tech.name}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
                  {tech.description}
                </p>
              </div>

              <div className="mt-6 pt-3 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between text-xs text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                <span className="font-semibold text-violet-600 dark:text-cyan-400">
                  {tech.count} upcoming events
                </span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
