
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Recadinho } from '../types';
import { Heart, Send, Loader2, MessageCircle } from 'lucide-react';

const Mural: React.FC = () => {
  const [recados, setRecados] = useState<Recadinho[]>([]);
  const [loading, setLoading] = useState(true);
  const [sender, setSender] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    fetchRecados();
  }, []);

  const fetchRecados = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('recadinhos')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setRecados(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sender || !message) return;

    setIsSending(true);
    const { error } = await supabase
      .from('recadinhos')
      .insert({ sender, message });

    if (error) {
      alert("Erro ao enviar seu recado.");
    } else {
      setSender('');
      setMessage('');
      fetchRecados();
      alert("Recado enviado com sucesso para o mural!");
    }
    setIsSending(false);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <h2 className="font-display text-5xl font-black text-afro-brown uppercase mb-4 tracking-tighter">
          Mural de Recados
        </h2>
        <p className="font-serif italic text-gray-600 text-lg max-w-2xl mx-auto">
          "Compartilhe palavras de incentivo, recados para os colegas ou sua opinião sobre o jornal. Este é o nosso espaço de voz!"
        </p>
        <div className="mt-6 inline-flex items-center gap-2 bg-afro-gold/20 text-afro-brown px-4 py-2 rounded-full font-bold uppercase text-[10px] tracking-widest">
          <Heart size={14} className="text-afro-terracotta fill-afro-terracotta" /> Protagonismo Estudantil
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Formulário de Envio */}
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-lg shadow-xl border-t-8 border-afro-terracotta sticky top-24">
            <h3 className="font-display text-2xl font-bold text-afro-brown mb-6 flex items-center gap-2">
              <MessageCircle size={24} className="text-afro-terracotta" /> Deixar um Recado
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Seu Nome / Apelido</label>
                <input 
                  type="text" 
                  value={sender}
                  onChange={e => setSender(e.target.value)}
                  className="w-full p-3 border-2 border-gray-100 focus:border-afro-gold outline-none font-sans text-sm"
                  placeholder="Ex: João do 3º Ano"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Mensagem</label>
                <textarea 
                  rows={4}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  className="w-full p-3 border-2 border-gray-100 focus:border-afro-gold outline-none font-serif text-sm leading-relaxed"
                  placeholder="Escreva aqui seu recadinho..."
                  required
                ></textarea>
              </div>
              <button 
                type="submit"
                disabled={isSending}
                className="w-full bg-afro-brown text-paper font-bold py-4 rounded uppercase tracking-widest text-xs hover:bg-black transition-all flex justify-center items-center gap-2 shadow-lg"
              >
                {isSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                {isSending ? 'Enviando...' : 'Publicar no Mural'}
              </button>
            </form>
          </div>
        </div>

        {/* Lista de Recados */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="flex justify-center p-20">
              <Loader2 size={40} className="animate-spin text-afro-brown opacity-20" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recados.map((rec) => (
                <div key={rec.id} className="bg-white p-6 rounded shadow-md border-l-8 border-afro-gold hover:shadow-lg transition-shadow relative overflow-hidden group">
                  <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                    <MessageCircle size={100} />
                  </div>
                  <p className="text-gray-700 font-serif leading-relaxed mb-4 text-sm italic">
                    "{rec.message}"
                  </p>
                  <div className="flex justify-between items-end border-t border-gray-50 pt-4">
                    <span className="font-bold text-afro-brown text-[10px] uppercase tracking-widest">— {rec.sender}</span>
                    <span className="text-[9px] text-gray-300 font-sans uppercase">
                      {new Date(rec.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              ))}
              {recados.length === 0 && (
                <div className="col-span-full py-20 text-center border-4 border-dashed border-gray-100 rounded-xl">
                   <p className="text-gray-400 font-serif italic">Nenhum recado ainda. Seja o primeiro a inaugurar nosso mural!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Mural;
