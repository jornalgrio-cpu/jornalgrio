
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import Home from './pages/Home';
import ArticleDetail from './pages/ArticleDetail';
import Admin from './pages/Admin';
import SectionView from './pages/SectionView';
import Login from './pages/Login';
import { Youtube, Home as HomeIcon, Settings, User as UserIcon, Menu } from 'lucide-react';

const Header = ({ session }: { session: any }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 200);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="bg-paper">
      {/* Top bar with date and social/admin - Static */}
      <div className="container mx-auto px-4 py-3 text-[10px] md:text-xs uppercase tracking-[0.2em] font-bold text-afro-brown border-b border-afro-brown/10 flex justify-between items-center">
        <div className="hidden md:block">
          Palmas, Tocantins • {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
        <div className="md:hidden">
          {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
        </div>
        <div className="flex items-center gap-4">
          <a href="https://www.youtube.com/channel/UCXTMxk4z8UHu4Ys6sWfTGPQ" target="_blank" rel="noopener noreferrer" className="hover:text-red-700 transition-colors flex items-center gap-1">
            <Youtube size={14} /> <span className="hidden sm:inline">YouTube</span>
          </a>
          <Link to={session ? "/admin" : "/login"} className="hover:text-afro-terracotta transition-colors flex items-center gap-1">
            {session ? <><UserIcon size={14} /> Painel</> : <><Settings size={14} /> Acesso</>}
          </Link>
        </div>
      </div>

      {/* Main Logo and Title Area - Static (Scrolls away) */}
      <div className="container mx-auto px-4 py-8 flex flex-col items-center">
        <Link to="/" className="mb-4 hover:opacity-90 transition-opacity">
          <img 
            src="/logo.png" 
            alt="Logo Vozes da Ancestralidade" 
            className="h-24 md:h-36 w-auto block mx-auto"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (!target.src.includes('error-fallback')) { target.src = 'logo.png'; }
            }}
          />
        </Link>
        <div className="text-center">
          <h1 className="font-display text-3xl md:text-6xl font-black text-afro-brown uppercase tracking-tighter leading-none mb-2">
            Vozes da Ancestralidade
          </h1>
          <p className="font-display italic text-sm md:text-xl text-afro-terracotta border-t border-b border-afro-terracotta/20 py-1 inline-block px-4">
            "A escuta que educa, a palavra que liberta"
          </p>
        </div>
        <div className="mt-4 bg-afro-gold text-afro-brown font-black px-4 py-1 uppercase text-[9px] tracking-[0.3em] shadow-sm rounded-sm">
          Edição: Poder Afro
        </div>
      </div>
      
      {/* Sticky Navigation Bar - Stays on top when scrolling */}
      <div className={`w-full bg-paper z-50 transition-all duration-300 border-b border-afro-brown/20 ${isScrolled ? 'fixed top-0 shadow-md py-2' : 'relative py-1 border-t-2 border-afro-brown'}`}>
        <div className="container mx-auto px-4 flex items-center justify-between">
          {/* Logo compacta na rolagem */}
          <Link to="/" className={`transition-all duration-500 overflow-hidden flex items-center gap-2 ${isScrolled ? 'w-auto opacity-100' : 'w-0 opacity-0'}`}>
            <img src="/logo.png" className="h-8 w-auto" alt="logo" />
            <span className="font-display font-black text-xs uppercase tracking-tighter text-afro-brown hidden sm:block">Vozes da Ancestralidade</span>
          </Link>

          <nav className="flex-1 flex justify-center items-center gap-4 md:gap-6 overflow-x-auto whitespace-nowrap text-[9px] md:text-xs font-black uppercase tracking-widest no-scrollbar px-2">
            <Link to="/" className="hover:text-afro-terracotta transition-colors p-2 flex items-center gap-1"><HomeIcon size={12}/> <span className="hidden md:inline">Início</span></Link>
            <Link to="/secao/Editorial" className="hover:text-afro-terracotta transition-colors p-2">Editorial</Link>
            <Link to="/secao/Aconteceu na Escola" className="hover:text-afro-terracotta transition-colors p-2">Escola</Link>
            <Link to="/secao/Entrevistas" className="hover:text-afro-terracotta transition-colors p-2">Entrevistas</Link>
            <Link to="/secao/Opinião" className="hover:text-afro-terracotta transition-colors p-2">Opinião</Link>
            <Link to="/secao/Estudos" className="hover:text-afro-terracotta transition-colors p-2">Estudos</Link>
            <Link to="/secao/Carreira" className="hover:text-afro-terracotta transition-colors p-2">Carreira</Link>
          </nav>

          <div className={`${isScrolled ? 'w-10' : 'w-0'} flex justify-end`}>
             {/* Espaçador para manter o menu centralizado na rolagem */}
          </div>
        </div>
      </div>
    </header>
  );
};

const Footer = () => (
  <footer className="bg-afro-brown text-paper py-16 border-t-8 border-afro-gold">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-12 text-center md:text-left">
        <div className="flex flex-col items-center md:items-start">
          <img 
            src="/logo.png" 
            alt="Selo Vozes da Ancestralidade" 
            className="h-24 w-auto mb-6 brightness-0 invert opacity-90"
          />
          <h3 className="font-display text-2xl font-bold mb-4">Vozes da Ancestralidade</h3>
          <p className="text-paper/70 text-sm leading-relaxed font-serif">
            Jornal do Colégio Estadual Frederico Pedreira Neto. 
            Valorizando raízes e fortalecendo a identidade.
          </p>
        </div>
        
        <div>
          <h4 className="font-bold uppercase tracking-[0.2em] text-afro-gold mb-8 text-sm border-b border-afro-gold/30 pb-2 inline-block">Editorias</h4>
          <ul className="space-y-4 text-xs font-medium uppercase tracking-widest text-paper/80">
            <li><Link to="/secao/Estudos" className="hover:text-afro-gold transition-colors">Educação e Vestibular</Link></li>
            <li><Link to="/secao/Entrevistas" className="hover:text-afro-gold transition-colors">Nossos Mestres</Link></li>
            <li><Link to="/secao/Aconteceu na Escola" className="hover:text-afro-gold transition-colors">Crônicas do Frederico</Link></li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-bold uppercase tracking-[0.2em] text-afro-gold mb-8 text-sm border-b border-afro-gold/30 pb-2 inline-block">Expediente</h4>
          <div className="space-y-4 text-xs font-serif italic text-paper/70">
            <p><span className="font-sans font-bold not-italic text-afro-gold uppercase">Horário:</span> 07:00 h às 23:00 h</p>
            <p><span className="font-sans font-bold not-italic text-afro-gold uppercase">E-mail:</span> jornalgrio@gmail.com</p>
            <p className="mt-8 text-[9px] uppercase font-sans font-bold tracking-widest not-italic leading-loose opacity-50">
              Colégio Estadual Frederico Pedreira Neto<br/>
              Palmas - Tocantins
            </p>
          </div>
        </div>
      </div>
      
      <div className="text-center pt-12 border-t border-paper/10">
        <div className="text-[10px] uppercase tracking-[0.4em] font-bold text-paper/30">
          &copy; {new Date().getFullYear()} Vozes da Ancestralidade
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
