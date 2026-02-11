
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Article, Comment } from '../types';
import { MessageSquare, Calendar, User, Share2 } from 'lucide-react';

const ArticleDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentName, setCommentName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchArticle(id);
  }, [id]);

  const fetchArticle = async (articleId: string) => {
    setLoading(true);
    const { data: art } = await supabase.from('articles').select('*').eq('id', articleId).single();
    const { data: comms } = await supabase.from('comments').select('*').eq('post_id', articleId).eq('is_approved', true).order('created_at', { ascending: false });

    if (art) setArticle(art);
    if (comms) setComments(comms);
    setLoading(false);
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentName || !commentText) return;

    const { error } = await supabase.from('comments').insert({
      post_id: id,
      author_name: commentName,
      content: commentText,
      is_approved: false // Needs editor approval
    });

    if (error) {
      alert("Erro ao enviar comentário.");
    } else {
      alert("Comentário enviado para aprovação dos editores!");
      setCommentName('');
      setCommentText('');
    }
  };

  if (loading) return <div className="p-20 text-center">Carregando conteúdo...</div>;
  if (!article) return <div className="p-20 text-center">Artigo não encontrado.</div>;

  return (
    <article className="container mx-auto max-w-4xl px-4 py-12">
      <header className="mb-12 text-center">
        <div className="mb-4">
          <Link to={`/secao/${article.section}`} className="bg-afro-gold/20 text-afro-brown px-3 py-1 rounded text-xs font-bold uppercase tracking-widest">
            {article.section}
          </Link>
        </div>
        <h1 className="font-display text-4xl md:text-6xl font-black mb-6 leading-tight text-afro-brown">
          {article.title}
        </h1>
        <p className="text-2xl text-gray-600 font-serif italic mb-8 max-w-2xl mx-auto">
          {article.subtitle}
        </p>
        <div className="flex flex-wrap justify-center items-center gap-6 text-sm font-sans text-gray-500 border-y border-afro-brown/10 py-4">
          <div className="flex items-center gap-2"><User size={16} /> Por <strong>{article.author_name}</strong></div>
          <div className="flex items-center gap-2"><Calendar size={16} /> {new Date(article.created_at).toLocaleDateString('pt-BR')}</div>
          <div className="flex items-center gap-2"><Share2 size={16} className="cursor-pointer hover:text-afro-terracotta" /> Compartilhar</div>
        </div>
      </header>

      {article.image_url && (
        <figure className="mb-12">
          <img src={article.image_url} alt={article.title} className="w-full h-auto rounded shadow-xl" />
          <figcaption className="text-xs text-gray-400 mt-2 italic text-right">Arquivo / O Griô</figcaption>
        </figure>
      )}

      <div className="prose prose-lg max-w-none font-serif text-gray-800 leading-relaxed mb-16 whitespace-pre-line">
        {article.content}
      </div>

      <section className="border-t-2 border-afro-brown/20 pt-12">
        <h3 className="font-display text-3xl font-bold mb-8 flex items-center gap-3">
          <MessageSquare className="text-afro-terracotta" /> Diálogo com o Leitor
        </h3>

        <div className="space-y-6 mb-12">
          {comments.length === 0 ? (
            <p className="text-gray-500 italic">Nenhum comentário ainda. Seja o primeiro a participar!</p>
          ) : (
            comments.map(c => (
              <div key={c.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-3">
                  <span className="font-bold text-afro-brown">{c.author_name}</span>
                  <span className="text-[10px] uppercase text-gray-400 font-bold">{new Date(c.created_at).toLocaleDateString('pt-BR')}</span>
                </div>
                <p className="text-gray-700 leading-relaxed">{c.content}</p>
              </div>
            ))
          )}
        </div>

        <div className="bg-paper p-8 border-2 border-afro-gold/30 rounded shadow-inner">
          <h4 className="font-bold mb-6 text-xl uppercase tracking-tighter">Deixe sua opinião</h4>
          <form onSubmit={handleCommentSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input 
                type="text" 
                placeholder="Seu Nome" 
                value={commentName}
                onChange={e => setCommentName(e.target.value)}
                className="w-full p-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-afro-gold bg-white"
                required
              />
            </div>
            <textarea 
              rows={4}
              placeholder="Sua mensagem..."
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              className="w-full p-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-afro-gold bg-white"
              required
            ></textarea>
            <button className="bg-afro-brown text-paper font-bold px-8 py-3 rounded uppercase tracking-widest text-sm hover:bg-afro-terracotta transition-colors">
              Enviar Comentário
            </button>
          </form>
          <p className="text-[10px] mt-4 text-gray-500 uppercase font-bold tracking-widest">* Seu comentário será revisado pela equipe editorial antes de ser publicado.</p>
        </div>
      </section>
    </article>
  );
};

export default ArticleDetail;
