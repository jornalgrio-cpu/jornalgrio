
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Article, ArticleSection } from '../types';
import { checkPortugueseText, generateLeadSuggestion } from '../geminiService';
import { Send, Trash2, CheckCircle, Wand2, FileText, PlusCircle } from 'lucide-react';

const Admin: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [section, setSection] = useState<ArticleSection>('Aconteceu na Escola');
  const [imageUrl, setImageUrl] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    const { data } = await supabase.from('articles').select('*').order('created_at', { ascending: false });
    if (data) setArticles(data);
  };

  const handleSpellcheck = async () => {
    setIsChecking(true);
    const correctedTitle = await checkPortugueseText(title);
    const correctedSubtitle = await checkPortugueseText(subtitle);
    const correctedContent = await checkPortugueseText(content);
    
    setTitle(correctedTitle);
    setSubtitle(correctedSubtitle);
    setContent(correctedContent);
    setIsChecking(false);
    alert("Texto otimizado com IA de acordo com a norma culta!");
  };

  const handleAILead = async () => {
    if (!title || !content) return alert("Preencha título e conteúdo primeiro.");
    setIsChecking(true);
    const lead = await generateLeadSuggestion(title, content);
    if (lead) setSubtitle(lead);
    setIsChecking(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('articles').insert({
      title,
      subtitle,
      content,
      author_name: author,
      section,
      image_url: imageUrl,
      is_published: true
    });

    if (error) {
      alert("Erro ao publicar: " + error.message);
    } else {
      alert("Artigo publicado com sucesso!");
      resetForm();
      fetchArticles();
      setShowForm(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setSubtitle('');
    setContent('');
    setAuthor('');
    setImageUrl('');
  };

  const deleteArticle = async (id: string) => {
    if (!confirm("Tem certeza?")) return;
    await supabase.from('articles').delete().eq('id', id);
    fetchArticles();
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-12">
        <h2 className="font-display text-4xl font-black text-afro-brown">Painel do Editor</h2>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-afro-terracotta text-white px-6 py-3 rounded-full font-bold shadow-lg hover:scale-105 transition-transform"
        >
          {showForm ? 'Fechar Editor' : <><PlusCircle size={20}/> Novo Artigo</>}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-8 rounded-lg shadow-2xl border-t-8 border-afro-gold mb-12">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Título da Manchete</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full p-3 border-2 border-gray-100 focus:border-afro-gold outline-none text-xl font-display"
                  placeholder="Ex: Aluno do Frederico ganha medalha de ouro..."
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Autor</label>
                <input 
                  type="text" 
                  value={author}
                  onChange={e => setAuthor(e.target.value)}
                  className="w-full p-3 border-2 border-gray-100 focus:border-afro-gold outline-none"
                  placeholder="Seu nome completo"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Seção</label>
                <select 
                  value={section}
                  onChange={e => setSection(e.target.value as ArticleSection)}
                  className="w-full p-3 border-2 border-gray-100 outline-none"
                >
                  <option>Editorial</option>
                  <option>Aconteceu na Escola</option>
                  <option>Entrevistas</option>
                  <option>Opinião</option>
                  <option>Estudos</option>
                  <option>Curiosidades</option>
                  <option>Carreira</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500">URL da Imagem</label>
                <input 
                  type="url" 
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  className="w-full p-3 border-2 border-gray-100 focus:border-afro-gold outline-none"
                  placeholder="Link da foto (ex: picsum.photos)"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Lide / Subtítulo</label>
                <button 
                  type="button" 
                  onClick={handleAILead}
                  disabled={isChecking}
                  className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded flex items-center gap-1 hover:bg-purple-200"
                >
                  <Wand2 size={12}/> Sugerir Lide com IA
                </button>
              </div>
              <textarea 
                rows={2}
                value={subtitle}
                onChange={e => setSubtitle(e.target.value)}
                className="w-full p-3 border-2 border-gray-100 focus:border-afro-gold outline-none italic font-serif"
                placeholder="Breve resumo que responda: quem, o que, onde..."
              ></textarea>
            </div>

            <div className="space-y-2">
               <div className="flex justify-between">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Corpo do Texto</label>
                <button 
                  type="button" 
                  onClick={handleSpellcheck}
                  disabled={isChecking}
                  className="text-xs bg-afro-green/10 text-afro-green px-2 py-1 rounded flex items-center gap-1 hover:bg-afro-green/20"
                >
                  <CheckCircle size={12}/> Corretor Gramatical IA
                </button>
              </div>
              <textarea 
                rows={10}
                value={content}
                onChange={e => setContent(e.target.value)}
                className="w-full p-4 border-2 border-gray-100 focus:border-afro-gold outline-none font-serif leading-relaxed"
                placeholder="Desenvolva a notícia..."
                required
              ></textarea>
            </div>

            <div className="flex gap-4">
              <button 
                type="submit" 
                className="flex-grow bg-afro-brown text-paper font-bold py-4 rounded uppercase tracking-widest hover:bg-black transition-colors flex justify-center items-center gap-2"
              >
                <Send size={20}/> Publicar no Jornal
              </button>
              <button 
                type="button"
                onClick={resetForm}
                className="px-6 border-2 border-gray-200 hover:bg-gray-50 rounded"
              >
                Limpar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded shadow-sm overflow-hidden border border-gray-100">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-4 text-xs font-bold uppercase text-gray-500">Artigo</th>
              <th className="p-4 text-xs font-bold uppercase text-gray-500">Seção</th>
              <th className="p-4 text-xs font-bold uppercase text-gray-500">Data</th>
              <th className="p-4 text-xs font-bold uppercase text-gray-500 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {articles.map(art => (
              <tr key={art.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="p-4">
                  <div className="font-bold text-gray-800">{art.title}</div>
                  <div className="text-xs text-gray-400">Por {art.author_name}</div>
                </td>
                <td className="p-4">
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded uppercase font-bold text-gray-600">{art.section}</span>
                </td>
                <td className="p-4 text-xs text-gray-500">
                  {new Date(art.created_at).toLocaleDateString('pt-BR')}
                </td>
                <td className="p-4 text-right">
                  <button 
                    onClick={() => deleteArticle(art.id)}
                    className="text-red-400 hover:text-red-600 p-2"
                  >
                    <Trash2 size={18}/>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Admin;
