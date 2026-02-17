
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import Home from './pages/Home';
import ArticleDetail from './pages/ArticleDetail';
import Admin from './pages/Admin';
import SectionView from './pages/SectionView';
import Login from './pages/Login';
import Mural from './pages/Mural'; // Importando a nova página
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

      <div className="container mx-auto px-4 py-8 flex flex-col items-center">
        <Link to="/" className="mb-4 hover:opacity-90 transition-opacity">
          <img 
            src="/logo.png" 
            alt="Logo Vozes da Ancestralidade" 
            className="h-24 md:h-36 w-auto block mx-auto"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://via.placeholder.com/150?text=VOZES';
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
      </div>
      
      <div className={`w-full bg-paper z-50 transition-all duration-300 border-b border-afro-brown/20 ${isScrolled ? 'fixed top-0 shadow-md py-2' : 'relative py-1 border-t-2 border-afro-brown'}`}>
        <div className="container mx-auto px-4 flex items-center justify-between">
          <Link to="/" className={`transition-all duration-500 overflow-hidden flex items-center gap-2 ${isScrolled ? 'w-auto opacity-100' : 'w-0 opacity-0'}`}>
            <span className="font-display font-black text-xs uppercase tracking-tighter text-afro-brown">Vozes</span>
          </Link>

          <nav className="flex-1 flex justify-center items-center gap-4 md:gap-6 overflow-x-auto whitespace-nowrap text-[9px] md:text-xs font-black uppercase tracking-widest no-scrollbar px-2">
            <Link to="/" className="hover:text-afro-terracotta transition-colors p-2 flex items-center gap-1"><HomeIcon size={12}/> <span className="hidden md:inline">Início</span></Link>
            <Link to="/secao/Editorial" className="hover:text-afro-terracotta transition-colors p-2">Editorial</Link>
            <Link to="/secao/Aconteceu na Escola" className="hover:text-afro-terracotta transition-colors p-2">Escola</Link>
            <Link to="/secao/Entrevistas" className="hover:text-afro-terracotta transition-colors p-2">Entrevistas</Link>
            <Link to="/secao/Opinião" className="hover:text-afro-terracotta transition-colors p-2">Opinião</Link>
            <Link to="/mural" className="hover:text-afro-terracotta transition-colors p-2">Mural</Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

const Footer = () => (
  <footer className="bg-afro-brown text-paper py-16 border-t-8 border-afro-gold">
    <div className="container mx-auto px-4 text-center">
      <div className="text-[10px] uppercase tracking-[0.4em] font-bold text-paper/30">
        &copy; {new Date().getFullYear()} Vozes da Ancestralidade - Colégio Frederico Pedreira Neto
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
            <Route path="/mural" element={<Mural />} />
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
