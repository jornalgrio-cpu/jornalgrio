
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { LogIn, UserPlus, ShieldCheck } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (isRegistering) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage('Cadastro realizado! Verifique seu e-mail para confirmar (se necessário).');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (error: any) {
      setMessage(error.message || 'Erro ao processar solicitação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-md px-4 py-20">
      <div className="bg-white p-8 border-t-8 border-afro-brown shadow-2xl rounded-sm">
        <div className="text-center mb-8">
          <ShieldCheck size={48} className="mx-auto text-afro-terracotta mb-4" />
          <h2 className="font-display text-3xl font-black text-afro-brown uppercase">
            Acesso à Redação
          </h2>
          <p className="font-serif italic text-gray-500 mt-2">
            {isRegistering ? 'Cadastre um novo editor' : 'Identifique-se para continuar'}
          </p>
        </div>

        {message && (
          <div className={`p-3 text-sm mb-6 rounded ${message.includes('Erro') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-400">E-mail Institucional</label>
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full p-3 border-2 border-gray-100 focus:border-afro-gold outline-none"
              placeholder="editor@vozesdaancestralidade.com.br"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Senha</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full p-3 border-2 border-gray-100 focus:border-afro-gold outline-none"
              placeholder="••••••••"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-afro-brown text-paper font-bold py-4 rounded uppercase tracking-widest hover:bg-black transition-colors flex justify-center items-center gap-2"
          >
            {loading ? 'Processando...' : (isRegistering ? <><UserPlus size={18}/> Cadastrar</> : <><LogIn size={18}/> Entrar</>)}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <button 
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-xs font-bold uppercase text-afro-terracotta hover:underline"
          >
            {isRegistering ? 'Já possui conta? Faça Login' : 'Novo por aqui? Cadastre-se'}
          </button>
        </div>
      </div>

      <div className="mt-8 text-center text-[10px] text-gray-400 uppercase tracking-widest font-bold">
        Sistema Restrito aos Editores do Frederico Pedreira Neto
      </div>
    </div>
  );
};

export default Login;
