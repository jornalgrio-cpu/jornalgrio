
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Article } from '../types';

const SectionView: React.FC = () => {
  const { name } = useParams<{ name: string }>();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (name) fetchArticles(name);
  }, [name]);

  const fetchArticles = async (sectionName: string) => {
    setLoading(true);
    const { data } = await supabase.from('articles').select('*').eq('section', sectionName).order('created_at', { ascending: false });
    if (data) setArticles(data);
    setLoading(false);
  };

  if (loading) return <div className="p-20 text-center">Carregando seção...</div>;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12 border-b-4 border-afro-gold pb-4 inline-block">
        <h2 className="font-display text-4xl font-black text-afro-brown uppercase tracking-tighter">
          Editoria: {name}
        </h2>
      </div>

      {articles.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-lg">
          <p className="text-gray-500 font-serif italic">Ainda não há publicações nesta seção. Em breve novidades da nossa equipe!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {articles.map(art => (
            <article key={art.id} className="group">
              <Link to={`/artigo/${art.id}`}>
                {art.image_url && (
                  <div className="aspect-video overflow-hidden rounded mb-4">
                    <img 
                      src={art.image_url} 
                      alt={art.title} 
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-105 group-hover:scale-100"
                    />
                  </div>
                )}
                <h3 className="font-display text-2xl font-bold mb-3 group-hover:underline leading-tight">
                  {art.title}
                </h3>
                <p className="text-gray-600 line-clamp-3 mb-4 font-serif text-sm">
                  {art.subtitle}
                </p>
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  <span>{art.author_name}</span>
                  <span>{new Date(art.created_at).toLocaleDateString('pt-BR')}</span>
                </div>
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default SectionView;
