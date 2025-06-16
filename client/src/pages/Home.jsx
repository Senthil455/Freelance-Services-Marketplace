import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';

export default function Home() {
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
    </main>
  );
}
