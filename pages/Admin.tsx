
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { Article, ArticleSection, Recadinho } from '../types';
import { checkPortugueseText, generateLeadSuggestion } from '../geminiService';
import { Send, Trash2, CheckCircle, Wand2, PlusCircle, LogOut, Key, User, Image as ImageIcon, X, Edit3, RotateCcw, Upload, Link as LinkIcon, Loader2, FileText, Save, Mail, Users, MessageSquareHeart } from 'lucide-react';

interface AdminProps { session: any; }

const Admin: React.FC<AdminProps> = ({ session }) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [recadinhos, setRecadinhos] = useState<Recadinho[]>([]);
  const [activeTab, setActiveTab] = useState<'articles' | 'subscribers' | 'recadinhos'>('articles');
  
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [section, setSection] = useState<ArticleSection>('Aconteceu na Escola');
  const [imageUrl, setImageUrl] = useState('');
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  
  const [pdfBase64, setPdfBase64] = useState('');
  const [isUpdatingPdf, setIsUpdatingPdf] = useState(false);

  const mainFileRef = useRef<HTMLInputElement>(null);
  const pdfFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchArticles();
    fetchCurrentPdf();
    fetchSubscribers();
    fetchRecadinhos();
  }, []);

  const fetchArticles = async () => {
    const { data } = await supabase.from('articles').select('*').order('created_at', { ascending: false });
    if (data) setArticles(data);
  };

  const fetchSubscribers = async () => {
    const { data } = await supabase.from('newsletter').select('*').order('created_at', { ascending: false });
    if (data) setSubscribers(data);
  };

  const fetchRecadinhos = async () => {
    const { data } = await supabase.from('recadinhos').select('*').order('created_at', { ascending: false });
    if (data) setRecadinhos(data);
  };

  const fetchCurrentPdf = async () => {
    const { data } = await supabase.from('configs').select('value').eq('key', 'monthly_pdf').single();
    if (data) setPdfBase64(data.value);
  };

  const handleFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') return alert("Por favor, selecione apenas arquivos PDF.");
      const base64 = await handleFileToBase64(file);
      setPdfBase64(base64);
    }
  };

  const savePdfConfig = async () => {
    setIsUpdatingPdf(true);
    const { error } = await supabase.from('configs').upsert({ key: 'monthly_pdf', value: pdfBase64 });
    if (error) alert("Erro ao salvar PDF: " + error.message);
    else alert("PDF da edição mensal atualizado com sucesso!");
    setIsUpdatingPdf(false);
  };

  const handleDeleteArticle = async (id: string) => {
    if (!confirm("Tem certeza que deseja apagar esta matéria?")) return;
    const { error } = await supabase.from('articles').delete().eq('id', id);
    if (error) {
      console.error("Erro Supabase Delete Article:", error);
      alert("Erro ao excluir matéria: " + error.message + " (Verifique as políticas de RLS no Supabase)");
    } else {
      fetchArticles();
    }
  };

  const handleDeleteSubscriber = async (id: string) => {
    if (!confirm("Remover este e-mail da lista?")) return;
    const { error } = await supabase.from('newsletter').delete().eq('id', id);
    if (error) {
      console.error("Erro Supabase Delete Subscriber:", error);
      alert("Erro ao excluir inscrito: " + error.message + " (Verifique as políticas de RLS no Supabase)");
    } else {
      fetchSubscribers();
    }
  };

  const handleDeleteRecadinho = async (id: string) => {
    if (!confirm("Deseja apagar este recado do mural?")) return;
    const { error } = await supabase.from('recadinhos').delete().eq('id', id);
    if (error) {
      console.error("Erro Supabase Delete Recadinho:", error);
      alert("Erro ao excluir recado: " + error.message + " (Verifique as políticas de RLS no Supabase)");
    } else {
      fetchRecadinhos();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const articleData = {
      title, subtitle, content, author_name: author, section, image_url: imageUrl,
      images: additionalImages.filter(img => img && img.trim() !== ''), is_published: true
    };

    try {
      if (editingArticleId) {
        await supabase.from('articles').update(articleData).eq('id', editingArticleId);
        alert("Matéria atualizada!");
      } else {
        await supabase.from('articles').insert(articleData);
        alert("Matéria publicada!");
      }
      resetForm();
      fetchArticles();
      setShowForm(false);
    } catch (err) { alert("Erro ao salvar."); }
    setIsSaving(false);
  };

  const resetForm = () => {
    setTitle(''); setSubtitle(''); setContent(''); setAuthor(''); setImageUrl('');
    setAdditionalImages([]); setEditingArticleId(null);
  };

  const startEditing = (article: Article) => {
    setEditingArticleId(article.id);
    setTitle(article.title); setSubtitle(article.subtitle || ''); setContent(article.content);
    setAuthor(article.author_name); setSection(article.section); setImageUrl(article.image_url || '');
    setAdditionalImages(article.images || []);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
        <div>
          <h2 className="font-display text-4xl font-black text-afro-brown uppercase">Painel da Redação</h2>
          <p className="text-sm font-serif italic text-gray-500">Editor: {session.user.email}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-afro-terracotta text-white px-6 py-3 rounded font-bold shadow-lg uppercase text-xs tracking-widest">
            {showForm ? 'Fechar Editor' : <><PlusCircle size={16}/> Nova Matéria</>}
          </button>
          <button onClick={() => supabase.auth.signOut()} className="flex items-center gap-2 text-red-600 px-4 py-2 font-bold text-xs uppercase hover:bg-red-50 rounded">
            <LogOut size={16}/> Sair
          </button>
        </div>
      </div>

      <div className="flex border-b border-gray-200 mb-8 overflow-x-auto no-scrollbar">
        <button 
          onClick={() => setActiveTab('articles')}
          className={`px-6 py-3 font-bold text-[10px] md:text-xs uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'articles' ? 'border-afro-brown text-afro-brown' : 'border-transparent text-gray-400'}`}
        >
          <FileText size={16}/> Matérias
        </button>
        <button 
          onClick={() => setActiveTab('subscribers')}
          className={`px-6 py-3 font-bold text-[10px] md:text-xs uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'subscribers' ? 'border-afro-brown text-afro-brown' : 'border-transparent text-gray-400'}`}
        >
          <Users size={16}/> Newsletter ({subscribers.length})
        </button>
        <button 
          onClick={() => setActiveTab('recadinhos')}
          className={`px-6 py-3 font-bold text-[10px] md:text-xs uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'recadinhos' ? 'border-afro-brown text-afro-brown' : 'border-transparent text-gray-400'}`}
        >
          <MessageSquareHeart size={16}/> Mural ({recadinhos.length})
        </button>
      </div>

      {activeTab === 'articles' && (
        <>
          {showForm && (
            <div className="bg-white p-8 rounded-lg shadow-2xl border-t-8 border-afro-gold mb-12 animate-in slide-in-from-top duration-500">
              <form onSubmit={handleSubmit} className="space-y-6">
                <h3 className="font-display text-2xl font-bold uppercase text-afro-brown">{editingArticleId ? 'Editar Matéria' : 'Nova Matéria'}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Título" className="w-full p-3 border-2 border-gray-100 outline-none font-display text-xl" required />
                  <input type="text" value={author} onChange={e => setAuthor(e.target.value)} placeholder="Autor" className="w-full p-3 border-2 border-gray-100 outline-none" required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <select value={section} onChange={e => setSection(e.target.value as any)} className="w-full p-3 border-2 border-gray-100 outline-none">
                    <option>Editorial</option><option>Aconteceu na Escola</option><option>Entrevistas</option><option>Opinião</option><option>Estudos</option><option>Curiosidades</option><option>Carreira</option>
                  </select>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => mainFileRef.current?.click()} className="bg-afro-brown text-white px-4 py-2 rounded text-[10px] font-bold uppercase flex items-center gap-2"><Upload size={14}/> Foto de Capa</button>
                    <input type="file" ref={mainFileRef} onChange={async (e) => setImageUrl(await handleFileToBase64(e.target.files![0]))} className="hidden" accept="image/*" />
                    <input type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="URL da imagem (opcional)" className="flex-1 p-2 border border-gray-100 text-[10px]" />
                  </div>
                </div>
                <textarea rows={10} value={content} onChange={e => setContent(e.target.value)} placeholder="Conteúdo da matéria..." className="w-full p-4 border-2 border-gray-100 outline-none font-serif leading-relaxed" required />
                <button type="submit" disabled={isSaving} className="w-full bg-afro-brown text-white font-bold py-4 rounded uppercase tracking-widest hover:bg-black transition-colors flex justify-center items-center gap-2">
                  {isSaving ? <Loader2 className="animate-spin" /> : <Send size={20} />} {editingArticleId ? 'Salvar Edição' : 'Publicar Agora'}
                </button>
              </form>
            </div>
          )}

          <div className="bg-white rounded shadow-sm overflow-hidden border border-gray-100 mb-12">
            <div className="p-4 bg-gray-50 border-b font-bold uppercase text-xs tracking-widest">Matérias Publicadas</div>
            <table className="w-full text-left">
              <tbody>
                {articles.map(art => (
                  <tr key={art.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="p-4"><img src={art.image_url} className="w-16 h-10 object-cover rounded" alt={art.title} /></td>
                    <td className="p-4 font-bold text-sm">{art.title}</td>
                    <td className="p-4 text-right">
                      <button onClick={() => startEditing(art)} className="text-afro-brown p-2 hover:bg-gray-100 rounded transition-colors"><Edit3 size={18}/></button>
                      <button onClick={() => handleDeleteArticle(art.id)} className="text-red-300 hover:text-red-600 p-2 transition-colors"><Trash2 size={18}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-paper p-8 border-2 border-afro-gold/30 rounded-lg shadow-inner">
            <h3 className="font-display text-2xl font-black text-afro-brown uppercase mb-6 flex items-center gap-2">
              <FileText className="text-afro-terracotta" /> Edição Mensal (PDF)
            </h3>
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <button type="button" onClick={() => pdfFileRef.current?.click()} className="w-full md:w-auto bg-white border-2 border-afro-brown/20 text-afro-brown px-6 py-3 rounded font-bold text-xs uppercase hover:bg-gray-50 transition-colors">
                {pdfBase64 ? 'Trocar PDF Atual' : 'Selecionar PDF'}
              </button>
              <input type="file" ref={pdfFileRef} onChange={handlePdfUpload} accept="application/pdf" className="hidden" />
              <button onClick={savePdfConfig} disabled={isUpdatingPdf || !pdfBase64} className="w-full md:w-auto bg-afro-green text-white px-8 py-3 rounded font-bold text-xs uppercase shadow-md disabled:opacity-30">
                {isUpdatingPdf ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>} Atualizar Botão de Download
              </button>
            </div>
          </div>
        </>
      )}

      {activeTab === 'subscribers' && (
        <div className="bg-white rounded shadow-xl overflow-hidden border border-gray-100 animate-in fade-in duration-500">
          <div className="p-6 bg-afro-brown text-paper flex justify-between items-center">
             <h3 className="font-display text-xl font-bold uppercase tracking-widest">Newsletter</h3>
             <Mail className="text-afro-gold" size={24} />
          </div>
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b text-[10px] font-bold uppercase text-gray-400">
              <tr><th className="p-4">E-mail</th><th className="p-4">Data</th><th className="p-4 text-right">Ação</th></tr>
            </thead>
            <tbody>
              {subscribers.map((sub) => (
                <tr key={sub.id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-sm font-medium">{sub.email}</td>
                  <td className="p-4 text-[10px] text-gray-500 font-serif">{new Date(sub.created_at).toLocaleString('pt-BR')}</td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleDeleteSubscriber(sub.id)} className="text-red-300 hover:text-red-600 p-2 transition-colors"><Trash2 size={16}/></button>
                  </td>
                </tr>
              ))}
              {subscribers.length === 0 && (
                <tr><td colSpan={3} className="p-12 text-center text-gray-400 italic">Nenhum inscrito.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'recadinhos' && (
        <div className="bg-white rounded shadow-xl overflow-hidden border border-gray-100 animate-in fade-in duration-500">
          <div className="p-6 bg-afro-terracotta text-paper flex justify-between items-center">
             <h3 className="font-display text-xl font-bold uppercase tracking-widest">Moderação do Mural</h3>
             <MessageSquareHeart className="text-white" size={24} />
          </div>
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b text-[10px] font-bold uppercase text-gray-400">
              <tr><th className="p-4">Remetente</th><th className="p-4">Mensagem</th><th className="p-4 text-right">Ação</th></tr>
            </thead>
            <tbody>
              {recadinhos.map((rec) => (
                <tr key={rec.id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-sm font-bold text-afro-brown">{rec.sender}</td>
                  <td className="p-4 text-xs font-serif italic text-gray-600">"{rec.message}"</td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleDeleteRecadinho(rec.id)} className="text-red-300 hover:text-red-600 p-2 transition-colors"><Trash2 size={18}/></button>
                  </td>
                </tr>
              ))}
              {recadinhos.length === 0 && (
                <tr><td colSpan={3} className="p-12 text-center text-gray-400 italic">Nenhum recado no mural.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Admin;
