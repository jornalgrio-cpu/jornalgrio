
import React from 'react';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import ArticleDetail from './pages/ArticleDetail';
import Admin from './pages/Admin';
import SectionView from './pages/SectionView';
import { Newspaper, Youtube, Home as HomeIcon, Settings, Calendar, Heart, BookOpen } from 'lucide-react';

const Header = () => (
  <header className="border-b-4 border-afro-brown bg-paper sticky top-0 z-50">
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col items-center">
        <div className="flex justify-between w-full mb-4 items-center">
          <div className="text-xs uppercase tracking-widest font-bold text-afro-brown hidden md:block">
            Tocantins, {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          <Link to="/" className="text-center group">
            <h1 className="font-display text-5xl md:text-7xl font-black text-afro-brown hover:text-afro-terracotta transition-colors uppercase tracking-tighter">
              O Griô
            </h1>
            <p className="font-display italic text-lg text-afro-terracotta mt-1">
              "A escuta que educa, a palavra que liberta"
            </p>
          </Link>
          <div className="flex items-center gap-4">
            <a href="https://www.youtube.com/channel/UCXTMxk4z8UHu4Ys6sWfTGPQ" target="_blank" rel="noopener noreferrer" className="text-red-700 hover:scale-110 transition-transform">
              <Youtube size={24} />
            </a>
            <Link to="/admin" className="text-afro-brown hover:scale-110 transition-transform">
              <Settings size={24} />
            </Link>
          </div>
        </div>
        
        <div className="w-full border-y border-afro-brown/20 py-2 mt-4 overflow-x-auto">
          <nav className="flex justify-center items-center gap-6 whitespace-nowrap text-sm font-bold uppercase tracking-wide">
            <Link to="/" className="hover:text-afro-terracotta transition-colors flex items-center gap-1"><HomeIcon size={14}/> Início</Link>
            <Link to="/secao/Editorial" className="hover:text-afro-terracotta transition-colors">Editorial</Link>
            <Link to="/secao/Aconteceu na Escola" className="hover:text-afro-terracotta transition-colors">Aconteceu na Escola</Link>
            <Link to="/secao/Entrevistas" className="hover:text-afro-terracotta transition-colors">Entrevistas</Link>
            <Link to="/secao/Opinião" className="hover:text-afro-terracotta transition-colors">Opinião</Link>
            <Link to="/secao/Estudos" className="hover:text-afro-terracotta transition-colors">Estudos</Link>
            <Link to="/secao/Carreira" className="hover:text-afro-terracotta transition-colors">Guia de Emprego</Link>
          </nav>
        </div>
        
        <div className="mt-2 bg-afro-gold text-afro-brown font-black px-4 py-1 uppercase text-xs tracking-widest shadow-sm rounded-sm">
          Tema Central: O Poder Afro
        </div>
      </div>
    </div>
  </header>
);

const Footer = () => (
  <footer className="bg-afro-brown text-paper py-12 mt-12">
    <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12">
      <div>
        <h3 className="font-display text-2xl font-bold mb-4">O Griô</h3>
        <p className="text-paper/80 text-sm leading-relaxed">
          Jornal Escolar do Colégio Estadual Frederico Pedreira Neto. 
          Uma iniciativa interdisciplinar focada na valorização da cultura afro e no protagonismo estudantil.
        </p>
      </div>
      <div>
        <h4 className="font-bold uppercase tracking-widest text-afro-gold mb-4">Seções Rápidas</h4>
        <ul className="space-y-2 text-sm text-paper/80">
          <li><Link to="/secao/Estudos" className="hover:text-afro-gold transition-colors">Dicas de Vestibular</Link></li>
          <li><Link to="/secao/Entrevistas" className="hover:text-afro-gold transition-colors">Entrevistas Exclusivas</Link></li>
          <li><Link to="/secao/Aconteceu na Escola" className="hover:text-afro-gold transition-colors">Eventos Escolares</Link></li>
        </ul>
      </div>
      <div>
        <h4 className="font-bold uppercase tracking-widest text-afro-gold mb-4">Expediente</h4>
        <p className="text-xs text-paper/70 leading-loose">
          Equipe Griô: 10 membros ativos<br/>
          Orientação: Professores de Linguagens e Ciências Humanas<br/>
          Local: Palmas - Tocantins
        </p>
      </div>
    </div>
    <div className="text-center mt-12 pt-8 border-t border-paper/10 text-xs text-paper/40">
      &copy; {new Date().getFullYear()} O Griô. Todos os direitos reservados.
    </div>
  </footer>
);

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col font-serif">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/artigo/:id" element={<ArticleDetail />} />
            <Route path="/secao/:name" element={<SectionView />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
