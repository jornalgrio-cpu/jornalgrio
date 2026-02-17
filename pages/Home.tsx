
import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Article, AgendaItem, Recadinho } from '../types';
import { Link } from 'react-router-dom';
import { Calendar, Heart, GraduationCap, ArrowRight, Download, Loader2, Send } from 'lucide-react';

const Home: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [agenda, setAgenda] = useState<AgendaItem[]>([]);
  const [recadinhos, setRecadinhos] = useState<Recadinho[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Newsletter State
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubmittingNewsletter, setIsSubmittingNewsletter] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [arts, sched, notes] = await Promise.all([
        supabase.from('articles').select('*').order('created_at', { ascending: false }).limit(6),
        supabase.from('agenda').select('*').order('event_date', { ascending: true }).limit(5),
        supabase.from('recadinhos').select('*').order('created_at', { ascending: false }).limit(8)
      ]);

      if (arts.data) setArticles(arts.data);
      if (sched.data) setAgenda(sched.data);
      if (notes.data) setRecadinhos(notes.data);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;

    setIsSubmittingNewsletter(true);
    const { error } = await supabase.from('newsletter').insert({ email: newsletterEmail });

    if (error) {
      if (error.code === '23505') {
        alert("Este e-mail já está em nossa lista de leitores!");
      } else {
        alert("Ocorreu um erro ao processar sua inscrição. Tente novamente em instantes.");
      }
    } else {
      alert("Inscrição realizada! Agora você faz parte da nossa comunidade de leitores.");
      setNewsletterEmail('');
    }
    setIsSubmittingNewsletter(false);
  };

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      const { data, error } = await supabase.from('configs').select('value').eq('key', 'monthly_pdf').single();
      
      if (error || !data || !data.value) {
        alert("A edição deste mês ainda não foi disponibilizada em PDF pelos editores.");
        return;
      }

      const base64Content = data.value.split(',')[1];
      const binaryString = window.atob(base64Content);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Vozes-da-Ancestralidade-Edicao-Mensal.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Erro ao processar o download do PDF.");
    } finally {
      setIsDownloading(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-96">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-afro-brown"></div>
    </div>
  );

  const mainArticle = articles[0];
  const secondaryArticles = articles.slice(1);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <div className="lg:col-span-8 space-y-12">
          {mainArticle && (
            <article className="border-b border-afro-brown/20 pb-12">
              <Link to={`/artigo/${mainArticle.id}`} className="group block">
                <div className="mb-4">
                  <span className="text-afro-terracotta font-bold uppercase tracking-widest text-sm">{mainArticle.section}</span>
                </div>
                <h2 className="font-display text-4xl md:text-5xl font-black mb-4 group-hover:underline leading-tight">
                  {mainArticle.title}
                </h2>
                <p className="text-xl text-gray-700 mb-6 font-serif italic">
                  {mainArticle.subtitle}
                </p>
                {mainArticle.image_url && (
                  <img 
                    src={mainArticle.image_url} 
                    alt={mainArticle.title} 
                    className="w-full h-96 object-cover mb-6 grayscale hover:grayscale-0 transition-all duration-500 rounded-sm"
                  />
                )}
                <div className="flex justify-between items-center text-sm text-gray-500 font-sans">
                  <span>Por <strong>{mainArticle.author_name}</strong></span>
                  <span>{new Date(mainArticle.created_at).toLocaleDateString('pt-BR')}</span>
                </div>
              </Link>
            </article>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {secondaryArticles.map((art) => (
              <article key={art.id} className="border-b border-afro-brown/10 pb-6">
                <Link to={`/artigo/${art.id}`} className="group block">
                   <div className="mb-2">
                    <span className="text-afro-terracotta font-bold uppercase text-xs">{art.section}</span>
                  </div>
                  <h3 className="font-display text-2xl font-bold mb-3 group-hover:underline">
                    {art.title}
                  </h3>
                  <p className="text-gray-600 line-clamp-3 text-sm leading-relaxed mb-4">
                    {art.subtitle}
                  </p>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>{art.author_name}</span>
                    <span>{new Date(art.created_at).toLocaleDateString('pt-BR')}</span>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </div>

        <aside className="lg:col-span-4 space-y-12">
          <div className="bg-afro-brown p-6 text-paper rounded-sm shadow-xl border-b-4 border-afro-gold">
            <h3 className="font-display text-2xl font-bold mb-4 border-b border-paper/20 pb-2">Assine a Newsletter</h3>
            <p className="text-xs mb-6 opacity-80 uppercase tracking-widest leading-relaxed">Receba o Vozes da Ancestralidade e as novidades do Colégio Frederico Pedreira Neto no seu e-mail.</p>
            <form className="space-y-4" onSubmit={handleNewsletterSubmit}>
              <div className="relative">
                <input 
                  type="email" 
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Seu melhor e-mail" 
                  required
                  className="w-full bg-paper/10 border border-paper/20 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-afro-gold placeholder:text-paper/40 text-paper"
                />
              </div>
              <button 
                type="submit"
                disabled={isSubmittingNewsletter}
                className="w-full bg-afro-gold text-afro-brown font-bold p-3 uppercase tracking-[0.2em] text-xs hover:bg-white transition-all transform active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {isSubmittingNewsletter ? <Loader2 size={16} className="animate-spin" /> : <Send size={14} />}
                {isSubmittingNewsletter ? 'Processando...' : 'Cadastrar agora'}
              </button>
            </form>
          </div>

          <div className="border border-afro-brown/20 p-6 rounded-sm">
            <h3 className="font-display text-xl font-bold mb-6 flex items-center gap-2 border-b border-afro-brown/10 pb-2">
              <Calendar size={20} className="text-afro-terracotta" /> Agenda da Escola
            </h3>
            <div className="space-y-4">
              {agenda.length > 0 ? agenda.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="flex flex-col items-center bg-afro-brown/5 p-2 min-w-[50px] rounded">
                    <span className="text-xs font-bold uppercase">{new Date(item.event_date).toLocaleDateString('pt-BR', { month: 'short' })}</span>
                    <span className="text-xl font-black">{new Date(item.event_date).getDate()}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm leading-tight">{item.event_title}</h4>
                    <p className="text-xs text-gray-500">{item.description}</p>
                  </div>
                </div>
              )) : (
                <p className="text-xs text-gray-400 italic">Consulte a agenda completa no link abaixo.</p>
              )}
            </div>
            <a 
              href="https://calendar.google.com/calendar/u/0?cid=NWI1YWY0MGJlYjgzMzc5NDEyNGFmMzgxMDZjYjVmOTA5ZTUzMjBjYmVjODc1Y2EyODhhNDg5YjQ3ODg5NzgzNUBncm91cC5jYWxlbmRhci5nb29nbGUuY29t"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full mt-6 text-xs uppercase font-bold text-afro-terracotta flex items-center justify-center gap-1 hover:gap-2 transition-all"
            >
              Ver agenda completa <ArrowRight size={12}/>
            </a>
          </div>

          <div className="bg-afro-gold/10 p-6 border border-afro-gold/30 rounded-sm">
            <h3 className="font-display text-xl font-bold mb-6 flex items-center gap-2 border-b border-afro-gold/40 pb-2 text-afro-brown">
              <Heart size={20} className="text-afro-terracotta" /> Mural de Recados
            </h3>
            <div className="space-y-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
              {recadinhos.map((note) => (
                <div key={note.id} className="bg-white p-3 rounded shadow-sm border-l-4 border-afro-terracotta">
                  <p className="text-sm italic text-gray-700">"{note.message}"</p>
                  <p className="text-[10px] mt-2 font-bold text-afro-brown uppercase">— {note.sender}</p>
                </div>
              ))}
            </div>
            <Link to="/mural" className="block text-center mt-6 text-xs uppercase font-bold text-afro-brown bg-afro-gold px-4 py-2 hover:bg-afro-brown hover:text-white transition-colors">
              Mandar um recadinho
            </Link>
          </div>

          <div className="p-6 bg-white border border-afro-brown/5 shadow-lg flex flex-col items-center text-center">
             < GraduationCap size={40} className="text-afro-brown mb-4" />
             <h3 className="font-display text-xl font-bold mb-2">Edição Impressa</h3>
             <p className="text-sm text-gray-600 mb-6">Baixe a versão mensal para imprimir e compartilhar no colégio.</p>
             <button 
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="flex items-center gap-2 bg-afro-brown text-paper px-6 py-3 rounded-full font-bold text-sm hover:bg-afro-terracotta transition-colors shadow-md disabled:opacity-50"
             >
               {isDownloading ? (
                 <><Loader2 size={18} className="animate-spin" /> Buscando arquivo...</>
               ) : (
                 <><Download size={18} /> Baixar PDF Mensal</>
               )}
             </button>
          </div>

        </aside>
      </div>
    </div>
  );
};

export default Home;
