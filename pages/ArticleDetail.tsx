
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Article, Comment } from '../types';
import { MessageSquare, Calendar, User, Share2, Image as ImageIcon, FileText, Download, BookOpen, Loader2 } from 'lucide-react';

const ArticleDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentName, setCommentName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

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

  const handleDownloadArticlePdf = (pdfItem: string) => {
    setIsDownloading(true);
    try {
      const base64Content = pdfItem.split(',')[1];
      const binaryString = window.atob(base64Content);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Vozes-${article?.title.replace(/\s+/g, '-') || 'reportagem'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (e) {
      alert("Erro ao baixar o PDF desta reportagem.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleViewArticlePdf = (pdfItem: string) => {
    try {
      const base64Content = pdfItem.split(',')[1];
      const binaryString = window.atob(base64Content);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (e) {
      alert("Erro ao abrir visualização do PDF.");
    }
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

  if (loading) return <div className="p-20 text-center font-serif italic text-afro-brown">Carregando conteúdo...</div>;
  if (!article) return <div className="p-20 text-center font-serif italic">Artigo não encontrado.</div>;

  const pdfItem = article.images?.find(img => img.startsWith('data:application/pdf')) || null;
  const additionalPhotos = article.images?.filter(img => !img.startsWith('data:application/pdf')) || [];

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
          <div className="flex items-center gap-2"><Share2 size={16} className="cursor-pointer hover:text-afro-terracotta transition-colors" /> Compartilhar</div>
        </div>
      </header>

      {article.image_url && (
        <figure className="mb-12">
          <img src={article.image_url} alt={article.title} className="w-full h-auto rounded-sm shadow-xl grayscale hover:grayscale-0 transition-all duration-700" />
          <figcaption className="text-xs text-gray-400 mt-3 italic text-right font-serif">Foto: Acervo / Vozes da Ancestralidade</figcaption>
        </figure>
      )}

      {pdfItem && (
        <div className="mb-12 bg-afro-gold/10 border-2 border-afro-gold/30 rounded p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center shadow-md animate-in fade-in duration-500">
          <div className="bg-afro-brown text-paper p-4 rounded shadow-lg flex items-center justify-center min-w-[70px] aspect-square">
            <FileText size={42} className="text-afro-gold" />
          </div>
          <div className="flex-1 text-center md:text-left space-y-2">
            <span className="bg-afro-terracotta text-paper text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-widest inline-block">Reportagem Diagramada (PDF)</span>
            <h3 className="font-display text-xl font-bold text-afro-brown">Edição Especial em Alta Fidelidade</h3>
            <p className="font-serif italic text-sm text-gray-600 leading-relaxed">
              Esta matéria possui uma linda versão impressa/diagramada como as páginas de jornal físico anexadas pela redação. Leia na tela ou baixe o PDF completo.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row gap-3 w-full md:w-auto">
            <button 
              onClick={() => handleViewArticlePdf(pdfItem)}
              className="flex items-center justify-center gap-2 bg-white border-2 border-afro-brown text-afro-brown font-bold px-5 py-3 rounded text-xs uppercase tracking-wider hover:bg-gray-50 transition-colors w-full sm:w-auto whitespace-nowrap"
            >
              <BookOpen size={16} /> Ler na Tela
            </button>
            <button 
              onClick={() => handleDownloadArticlePdf(pdfItem)}
              disabled={isDownloading}
              className="flex items-center justify-center gap-2 bg-afro-brown text-[#FDFCF0] font-bold px-6 py-3 rounded text-xs uppercase tracking-wider hover:bg-afro-terracotta transition-colors shadow-md w-full sm:w-auto whitespace-nowrap disabled:opacity-50"
            >
              {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} 
              {isDownloading ? 'Baixando...' : 'Baixar PDF'}
            </button>
          </div>
        </div>
      )}

      <div className="prose prose-lg max-w-none font-serif text-gray-800 leading-relaxed mb-16 whitespace-pre-line text-justify first-letter:text-5xl first-letter:font-bold first-letter:mr-3 first-letter:float-left first-letter:text-afro-brown">
        {article.content}
      </div>

      {/* Galeria de Fotos Adicionais */}
      {additionalPhotos.length > 0 && (
        <section className="mb-16">
          <h3 className="font-display text-xl font-bold mb-6 flex items-center gap-2 text-afro-brown border-b border-afro-brown/10 pb-2 uppercase tracking-widest">
            <ImageIcon size={20} className="text-afro-terracotta" /> Registros da Redação
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {additionalPhotos.map((img, idx) => (
              <div key={idx} className="overflow-hidden rounded-sm shadow-md group">
                <img 
                  src={img} 
                  alt={`Galeria ${idx + 1}`} 
                  className="w-full h-64 object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500 cursor-pointer"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="border-t-2 border-afro-brown/20 pt-12">
        <h3 className="font-display text-3xl font-bold mb-8 flex items-center gap-3">
          <MessageSquare className="text-afro-terracotta" /> Diálogo com o Leitor
        </h3>

        <div className="space-y-6 mb-12">
          {comments.length === 0 ? (
            <p className="text-gray-500 italic font-serif">Nenhum comentário ainda. Seja o primeiro a participar!</p>
          ) : (
            comments.map(c => (
              <div key={c.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-3">
                  <span className="font-bold text-afro-brown">{c.author_name}</span>
                  <span className="text-[10px] uppercase text-gray-400 font-bold tracking-widest">{new Date(c.created_at).toLocaleDateString('pt-BR')}</span>
                </div>
                <p className="text-gray-700 leading-relaxed font-serif">{c.content}</p>
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
                className="w-full p-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-afro-gold bg-white font-sans"
                required
              />
            </div>
            <textarea 
              rows={4}
              placeholder="Sua mensagem..."
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              className="w-full p-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-afro-gold bg-white font-serif"
              required
            ></textarea>
            <button className="bg-afro-brown text-paper font-bold px-8 py-3 rounded uppercase tracking-widest text-sm hover:bg-afro-terracotta transition-colors shadow-md">
              Enviar Comentário
            </button>
          </form>
          <p className="text-[10px] mt-4 text-gray-400 uppercase font-bold tracking-widest">* Seu comentário será revisado pela equipe editorial antes de ser publicado.</p>
        </div>
      </section>
    </article>
  );
};

export default ArticleDetail;
