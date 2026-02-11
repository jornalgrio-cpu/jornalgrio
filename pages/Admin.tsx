
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Article, ArticleSection } from '../types';
import { checkPortugueseText, generateLeadSuggestion } from '../geminiService';
import { Send, Trash2, CheckCircle, Wand2, PlusCircle, LogOut, Key, User } from 'lucide-react';

interface AdminProps {
  session: any;
}

const Admin: React.FC<AdminProps> = ({ session }) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [section, setSection] = useState<ArticleSection>('Aconteceu na Escola');
  const [imageUrl, setImageUrl] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  
  // Password change state
  const [newPassword, setNewPassword] = useState('');
  const [changingPass, setChangingPass] = useState(false);

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
    alert("Texto otimizado com IA!");
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
    if (!confirm("Tem certeza que deseja excluir esta matéria?")) return;
    await supabase.from('articles').delete().eq('id', id);
    fetchArticles();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangingPass(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      alert("Erro ao mudar senha: " + error.message);
    } else {
      alert("Senha alterada com sucesso!");
      setNewPassword('');
    }
    setChangingPass(false);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Top Header Admin */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
        <div>
          <h2 className="font-display text-4xl font-black text-afro-brown uppercase">Painel da Redação</h2>
          <p className="text-sm font-serif italic text-gray-500">Bem-vindo, {session.user.email}</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2 border-2 border-afro-brown/20 px-4 py-2 rounded font-bold text-xs uppercase hover:bg-gray-50 transition-colors"
          >
            <User size={16}/> Perfil
          </button>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-afro-terracotta text-white px-6 py-3 rounded font-bold shadow-lg hover:bg-afro-brown transition-colors uppercase text-xs tracking-widest"
          >
            {showForm ? 'Fechar Editor' : <><PlusCircle size={16}/> Nova Matéria</>}
          </button>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-600 px-4 py-2 font-bold text-xs uppercase hover:bg-red-50 rounded"
          >
            <LogOut size={16}/> Sair
          </button>
        </div>
      </div>

      {/* Profile Section */}
      {showProfile && (
        <div className="bg-paper p-8 border-2 border-afro-gold/30 rounded mb-12 shadow-inner max-w-lg">
          <h3 className="font-display text-2xl font-bold mb-6 flex items-center gap-2">
            <Key size={20} className="text-afro-terracotta" /> Segurança da Conta
          </h3>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Nova Senha</label>
              <input 
                type="password" 
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-afro-gold bg-white"
                placeholder="Mínimo 6 caracteres"
                required
                minLength={6}
              />
            </div>
            <button 
              disabled={changingPass}
              className="bg-afro-brown text-paper font-bold px-6 py-2 rounded text-xs uppercase tracking-widest hover:bg-black"
            >
              {changingPass ? 'Alterando...' : 'Atualizar Senha'}
            </button>
          </form>
        </div>
      )}

      {/* Editor Form */}
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
                  placeholder="Ex: Aluno do Frederico ganha medalha..."
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Autor da Matéria</label>
                <input 
                  type="text" 
                  value={author}
                  onChange={e => setAuthor(e.target.value)}
                  className="w-full p-3 border-2 border-gray-100 focus:border-afro-gold outline-none"
                  placeholder="Nome do aluno ou professor"
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
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500">URL da Imagem de Capa</label>
                <input 
                  type="url" 
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  className="w-full p-3 border-2 border-gray-100 focus:border-afro-gold outline-none"
                  placeholder="https://exemplo.com/foto.jpg"
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
                placeholder="Breve resumo da notícia..."
              ></textarea>
            </div>

            <div className="space-y-2">
               <div className="flex justify-between">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Conteúdo Completo</label>
                <button 
                  type="button" 
                  onClick={handleSpellcheck}
                  disabled={isChecking}
                  className="text-xs bg-afro-green/10 text-afro-green px-2 py-1 rounded flex items-center gap-1 hover:bg-afro-green/20"
                >
                  <CheckCircle size={12}/> Revisão Gramatical IA
                </button>
              </div>
              <textarea 
                rows={10}
                value={content}
                onChange={e => setContent(e.target.value)}
                className="w-full p-4 border-2 border-gray-100 focus:border-afro-gold outline-none font-serif leading-relaxed"
                placeholder="Desenvolva o texto principal..."
                required
              ></textarea>
            </div>

            <button 
              type="submit" 
              className="w-full bg-afro-brown text-paper font-bold py-4 rounded uppercase tracking-widest hover:bg-black transition-colors flex justify-center items-center gap-2"
            >
              <Send size={20}/> Publicar no Vozes da Ancestralidade
            </button>
          </form>
        </div>
      )}

      {/* Articles List */}
      <div className="bg-white rounded shadow-sm overflow-hidden border border-gray-100">
        <div className="p-4 bg-gray-50 border-b border-gray-100 font-bold uppercase text-xs tracking-widest flex items-center gap-2">
          Gerenciamento de Publicações
        </div>
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-4 text-[10px] font-bold uppercase text-gray-400">Título / Autor</th>
              <th className="p-4 text-[10px] font-bold uppercase text-gray-400">Seção</th>
              <th className="p-4 text-[10px] font-bold uppercase text-gray-400">Publicado em</th>
              <th className="p-4 text-[10px] font-bold uppercase text-gray-400 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {articles.map(art => (
              <tr key={art.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="p-4">
                  <div className="font-bold text-gray-800 text-sm">{art.title}</div>
                  <div className="text-[10px] text-gray-400 uppercase">Por {art.author_name}</div>
                </td>
                <td className="p-4">
                  <span className="text-[10px] bg-gray-100 px-2 py-1 rounded uppercase font-bold text-gray-500">{art.section}</span>
                </td>
                <td className="p-4 text-xs text-gray-500 font-serif">
                  {new Date(art.created_at).toLocaleDateString('pt-BR')}
                </td>
                <td className="p-4 text-right">
                  <button 
                    onClick={() => deleteArticle(art.id)}
                    className="text-red-300 hover:text-red-600 p-2 transition-colors"
                    title="Excluir"
                  >
                    <Trash2 size={16}/>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {articles.length === 0 && (
          <div className="p-10 text-center text-gray-400 italic font-serif">
            Nenhuma matéria publicada ainda. Comece agora!
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
