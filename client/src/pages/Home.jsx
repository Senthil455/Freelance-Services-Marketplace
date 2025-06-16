import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Code, Palette, Megaphone, PenLine, Film, Music, Briefcase, Bot, Search } from 'lucide-react';
import api from '../api/client.js';
import { imgUrl } from '../utils/format.js';

const CATEGORY_ICONS = { Code, Palette, Megaphone, PenLine, Film, Music, Briefcase, Bot };

export default function Home() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data)).catch(() => {});
  }, []);

  return (
    <main>
      <section className="bg-gradient-to-b from-brand-50 to-white py-20 text-center">
        <h1 className="mx-auto max-w-3xl text-5xl font-extrabold tracking-tight text-gray-900">
          Your next big idea starts with a great service.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-gray-600">
          Find the right talent for design, development, writing, video and more on SkillForge.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link to="/search" className="btn-primary">
            <Search size={16} /> Explore services
          </Link>
          <Link to="/register" className="btn-secondary">Become a seller</Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <h2 className="text-2xl font-bold text-gray-900">Browse by category</h2>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {categories.map((c) => {
            const Icon = CATEGORY_ICONS[c.slug] || Briefcase;
            return (
              <Link to={`/category/${c.slug}`} key={c._id} className="card group flex items-center gap-3 p-4 transition hover:shadow-lift">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                  <Icon size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">{c.name}</p>
                  <p className="line-clamp-1 text-xs text-gray-500">{c.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
