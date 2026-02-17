
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import Home from './pages/Home';
import ArticleDetail from './pages/ArticleDetail';
import Admin from './pages/Admin';
import SectionView from './pages/SectionView';
import Login from './pages/Login';
import { Youtube, Home as HomeIcon, Settings, User as UserIcon } from 'lucide-react';

const Header = ({ session }: { session: any }) => (
  <header className="border-b-4 border-afro-brown bg-paper sticky top-0 z-50">
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col items-center">
        {/* Top bar with date and social/admin */}
        <div className="w-full flex justify-between items-center mb-6 text-[10px] md:text-xs uppercase tracking-[0.2em] font-bold text-afro-brown border-b border-afro-brown/10 pb-2">
          <div className="hidden md:block">
            Palmas, Tocantins • {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          <div className="md:hidden">
            {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
          </div>
          <div className="flex items-center gap-4">
            <a href="https://www.youtube.com/channel/UCXTMxk4z8UHu4Ys6sWfTGPQ" target="_blank" rel="noopener noreferrer" className="hover:text-red-700 transition-colors flex items-center gap-1">
              <Youtube size={16} /> <span className="hidden sm:inline">YouTube</span>
            </a>
            <Link to={session ? "/admin" : "/login"} className="hover:text-afro-terracotta transition-colors flex items-center gap-1">
              {session ? <><UserIcon size={16} /> Painel</> : <><Settings size={16} /> Acesso</>}
            </Link>
          </div>
        </div>

        {/* Central Logo and Title Area */}
        <div className="flex flex-col items-center mb-6">
          <Link to="/" className="mb-6 hover:opacity-90 transition-opacity">
            <img 
              src="/logo.png" 
              alt="Logo Vozes da Ancestralidade" 
              className="h-32 md:h-48 w-auto block mx-auto"
              style={{ maxWidth: '100%' }}
              onError={(e) => {
                // Tenta caminho relativo se o absoluto falhar
                const target = e.target as HTMLImageElement;
                if (!target.src.includes('error-fallback')) {
                   target.src = 'logo.png';
                }
              }}
            />
          </Link>
          <Link to="/" className="text-center group block">
            <h1 className="font-display text-4xl md:text-7xl font-black text-afro-brown hover:text-afro-terracotta transition-colors uppercase tracking-tighter leading-none mb-2">
              Vozes da Ancestralidade
            </h1>
            <p className="font-display italic text-lg md:text-2xl text-afro-terracotta mt-2 border-t border-b border-afro-terracotta/20 py-1 inline-block px-4">
              "A escuta que educa, a palavra que liberta"
            </p>
          </Link>
        </div>
        
        {/* Navigation bar with NYT style double rules */}
        <div className="w-full border-y-2 border-afro-brown py-1 mt-2">
          <div className="border-y border-afro-brown/20 py-2">
            <nav className="flex justify-center items-center gap-4 md:gap-8 overflow-x-auto whitespace-nowrap text-[10px] md:text-xs font-black uppercase tracking-widest no-scrollbar px-4">
              <Link to="/" className="hover:text-afro-terracotta transition-colors flex items-center gap-1"><HomeIcon size={14}/> Início</Link>
              <span className="text-afro-brown/20">|</span>
              <Link to="/secao/Editorial" className="hover:text-afro-terracotta transition-colors">Editorial</Link>
              <Link to="/secao/Aconteceu na Escola" className="hover:text-afro-terracotta transition-colors">Aconteceu na Escola</Link>
              <Link to="/secao/Entrevistas" className="hover:text-afro-terracotta transition-colors">Entrevistas</Link>
              <Link to="/secao/Opinião" className="hover:text-afro-terracotta transition-colors">Opinião</Link>
              <Link to="/secao/Estudos" className="hover:text-afro-terracotta transition-colors">Estudos</Link>
              <Link to="/secao/Carreira" className="hover:text-afro-terracotta transition-colors">Guia de Emprego</Link>
            </nav>
          </div>
        </div>
        
        {/* Banner Tag */}
        <div className="mt-4">
          <div className="bg-afro-gold text-afro-brown font-black px-6 py-1 uppercase text-[10px] tracking-[0.3em] shadow-sm rounded-sm">
            Edição Especial: Poder Afro
          </div>
        </div>
      </div>
    </div>
  </header>
);

const Footer = () => (
  <footer className="bg-afro-brown text-paper py-16 mt-12 border-t-8 border-afro-gold">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-12">
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <img 
            src="/logo.png" 
            alt="Selo Vozes da Ancestralidade" 
            className="h-32 w-auto mb-6 brightness-0 invert opacity-90"
            style={{ filter: 'brightness(0) invert(1)' }}
          />
          <h3 className="font-display text-2xl font-bold mb-4">Vozes da Ancestralidade</h3>
          <p className="text-paper/70 text-sm leading-relaxed font-serif">
            Jornal Escolar do Colégio Estadual Frederico Pedreira Neto. 
            Iniciativa dedicada à valorização das raízes e ao fortalecimento da identidade negra.
          </p>
        </div>
        
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <h4 className="font-bold uppercase tracking-[0.2em] text-afro-gold mb-8 text-sm border-b border-afro-gold/30 pb-2 w-full">Seções Principais</h4>
          <ul className="space-y-4 text-sm font-medium uppercase tracking-widest text-paper/80">
            <li><Link to="/secao/Estudos" className="hover:text-afro-gold transition-colors">Educação e Vestibular</Link></li>
            <li><Link to="/secao/Entrevistas" className="hover:text-afro-gold transition-colors">Nossos Mestres</Link></li>
            <li><Link to="/secao/Aconteceu na Escola" className="hover:text-afro-gold transition-colors">Crônicas do Frederico</Link></li>
            <li><Link to="/secao/Editorial" className="hover:text-afro-gold transition-colors">Palavra da Redação</Link></li>
          </ul>
        </div>
        
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <h4 className="font-bold uppercase tracking-[0.2em] text-afro-gold mb-8 text-sm border-b border-afro-gold/30 pb-2 w-full">Expediente</h4>
          <div className="space-y-4 text-sm font-serif italic text-paper/70">
            <p className="flex items-center gap-2 justify-center md:justify-start">
              <span className="font-sans font-bold not-italic text-afro-gold uppercase text-[10px]">Horário:</span> 07:00 h às 23:00 h
            </p>
            <p className="flex items-center gap-2 justify-center md:justify-start">
              <span className="font-sans font-bold not-italic text-afro-gold uppercase text-[10px]">E-mail:</span> 
              <a href="mailto:jornalgrio@gmail.com" className="hover:text-afro-gold transition-colors underline decoration-afro-gold/30">
                jornalgrio@gmail.com
              </a>
            </p>
            <p className="mt-8 text-[10px] uppercase font-sans font-bold tracking-widest not-italic leading-loose opacity-50">
              Colégio Estadual Frederico Pedreira Neto<br/>
              Palmas - Tocantins
            </p>
          </div>
        </div>
      </div>
      
      <div className="text-center pt-12 border-t border-paper/10">
        <div className="text-[10px] uppercase tracking-[0.4em] font-bold text-paper/30">
          &copy; {new Date().getFullYear()} Vozes da Ancestralidade • Todos os direitos reservados.
        </div>
      </div>
    </div>
  </footer>
);

function App() {
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <Router>
      <div className="min-h-screen flex flex-col font-serif selection:bg-afro-gold selection:text-afro-brown">
        <Header session={session} />
        <main className="flex-grow bg-[#FDFCF0]">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/artigo/:id" element={<ArticleDetail />} />
            <Route path="/secao/:name" element={<SectionView />} />
            <Route path="/login" element={!session ? <Login /> : <Navigate to="/admin" />} />
            <Route path="/admin" element={session ? <Admin session={session} /> : <Navigate to="/login" />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
