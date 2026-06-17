
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
  const [activeTab, setActiveTab] = useState<'articles' | 'subscribers' | 'recadinhos' | 'security'>('articles');
  
  const [newPassword, setNewPassword] = useState('fred@fred2026');
  const [passwordStatus, setNewPasswordStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setNewPasswordStatus({ type: 'error', message: 'A senha deve ter pelo menos 6 caracteres.' });
      return;
    }
    setIsUpdatingPassword(true);
    setNewPasswordStatus({ type: null, message: '' });
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setNewPasswordStatus({ type: 'success', message: 'Senha do editor-chefe alterada com sucesso para: ' + newPassword });
    } catch (err: any) {
      setNewPasswordStatus({ type: 'error', message: 'Erro ao alterar a senha: ' + (err.message || 'Erro desconhecido') });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [section, setSection] = useState<ArticleSection>('Aconteceu na Escola');
  const [imageUrl, setImageUrl] = useState('');
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  const [attachedPdf, setAttachedPdf] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  
  const [pdfBase64, setPdfBase64] = useState('');
  const [isUpdatingPdf, setIsUpdatingPdf] = useState(false);

  const mainFileRef = useRef<HTMLInputElement>(null);
  const pdfFileRef = useRef<HTMLInputElement>(null);
  const galleryFileRef = useRef<HTMLInputElement>(null);
  const partPdfFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchArticles();
    fetchCurrentPdf();
    fetchSubscribers();
    fetchRecadinhos();
  }, []);

  const fetchArticles = async () => {
    const { data } = await supabase.from('articles').select('id, title, subtitle, author_name, section, image_url, created_at, is_published').order('created_at', { ascending: false });
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
    
    // Agrupa imagens adicionais comuns e o novo anexo PDF (se houver) no array de imagens
    const finalImagesArray = [...additionalImages.filter(img => img && img.trim() !== '')];
    if (attachedPdf) {
      finalImagesArray.push(attachedPdf);
    }

    // Se tiver attachedPdf, garantimos que o subtítulo termina com " [PDF]" para listagem ultrarrápida
    const cleanSubField = subtitle ? subtitle.replace(/\s*\[PDF\]$/gi, '').trim() : '';
    const finalSubtitleField = attachedPdf ? `${cleanSubField} [PDF]` : cleanSubField;

    const articleData = {
      title, 
      subtitle: finalSubtitleField, 
      content, 
      author_name: author, 
      section, 
      image_url: imageUrl,
      images: finalImagesArray, 
      is_published: true
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
    setAdditionalImages([]); setAttachedPdf(''); setEditingArticleId(null);
  };

  const startEditing = async (article: Article) => {
    // Busca do banco de dados o artigo completo com todas as colunas pesadas
    const { data, error } = await supabase.from('articles').select('*').eq('id', article.id).single();
    if (error || !data) {
      alert("Erro ao buscar conteúdo completo desta matéria.");
      return;
    }
    const fullArticle = data;
    setEditingArticleId(fullArticle.id);
    setTitle(fullArticle.title); 
    
    // Mostra o subtítulo sem a marca [PDF] no formulário de edição
    const cleanSub = fullArticle.subtitle ? fullArticle.subtitle.replace(/\s*\[PDF\]$/gi, '').trim() : '';
    setSubtitle(cleanSub); 
    
    setContent(fullArticle.content);
    setAuthor(fullArticle.author_name); 
    setSection(fullArticle.section); 
    setImageUrl(fullArticle.image_url || '');
    
    // Separa imagens da galeria e o item em PDF específico
    const pdfItem = fullArticle.images?.find((img: string) => img.startsWith('data:application/pdf')) || '';
    const otherImages = fullArticle.images?.filter((img: string) => !img.startsWith('data:application/pdf')) || [];
    
    setAdditionalImages(otherImages);
    setAttachedPdf(pdfItem);
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
        <button 
          onClick={() => setActiveTab('security')}
          className={`px-6 py-3 font-bold text-[10px] md:text-xs uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'security' ? 'border-afro-brown text-afro-brown' : 'border-transparent text-gray-400'}`}
        >
          <Key size={16}/> Segurança
        </button>
      </div>

      {activeTab === 'articles' && (
        <>
          {showForm && (
            <div className="bg-white p-8 rounded-lg shadow-2xl border-t-8 border-afro-gold mb-12 animate-in slide-in-from-top duration-500">
              <form onSubmit={handleSubmit} className="space-y-6">
                <h3 className="font-display text-2xl font-bold uppercase text-afro-brown">{editingArticleId ? 'Editar Matéria' : 'Nova Matéria'}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Título Principal</label>
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Título da matéria" className="w-full p-3 border-2 border-gray-100 focus:border-afro-gold outline-none font-display text-xl" required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Autor / Repórter</label>
                    <input type="text" value={author} onChange={e => setAuthor(e.target.value)} placeholder="Nome do autor ou turma" className="w-full p-3 border-2 border-gray-100 focus:border-afro-gold outline-none" required />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Subtítulo / Linha de Apoio (Opcional)</label>
                  <input type="text" value={subtitle} onChange={e => setSubtitle(e.target.value)} placeholder="Subtítulo ou resumo que introduz a reportagem" className="w-full p-3 border-2 border-gray-100 focus:border-afro-gold outline-none italic font-serif text-sm" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                     <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Editoria / Seção</label>
                     <select value={section} onChange={e => setSection(e.target.value as any)} className="w-full p-3 border-2 border-gray-100 focus:border-afro-gold outline-none">
                       <option>Editorial</option><option>Aconteceu na Escola</option><option>Entrevistas</option><option>Opinião</option><option>Estudos</option><option>Curiosidades</option><option>Carreira</option>
                     </select>
                  </div>
                  <div className="space-y-1">
                     <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Foto de Capa Principal</label>
                     <div className="flex gap-2">
                       <button type="button" onClick={() => mainFileRef.current?.click()} className="bg-afro-brown text-white px-4 py-2 rounded text-[10px] font-bold uppercase flex items-center gap-2 whitespace-nowrap"><Upload size={14}/> Carregar</button>
                       <input type="file" ref={mainFileRef} onChange={async (e) => setImageUrl(await handleFileToBase64(e.target.files![0]))} className="hidden" accept="image/*" />
                       <input type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="Cole o link da foto ou carregue ao lado" className="flex-1 p-2 border border-gray-100 text-[10px] outline-none" />
                     </div>
                  </div>
                </div>

                {/* PDF e Fotos Adicionais específicos desta matéria */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#FDFCF0]/50 p-6 rounded-sm border-2 border-[#3D1B13]/10 pb-6">
                  <div className="space-y-3">
                    <h4 className="text-xs font-black uppercase tracking-widest text-afro-brown flex items-center gap-2">
                      <FileText size={16} className="text-afro-terracotta" /> Versão Diagramada (PDF do Artigo)
                    </h4>
                    <p className="text-[11px] text-gray-500 leading-relaxed font-serif italic">
                      Se você tem esta reportagem com diagramação de jornal como os anexos históricos pág. 1-4, envie o PDF abaixo para os leitores baixarem e lerem.
                    </p>
                    <div className="flex items-center gap-3 pt-1">
                      <button 
                        type="button" 
                        onClick={() => partPdfFileRef.current?.click()} 
                        className="bg-white border-2 border-afro-brown/20 text-afro-brown px-4 py-2 rounded text-[10px] font-bold uppercase hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Upload size={12}/> {attachedPdf ? 'Substituir PDF' : 'Anexar PDF'}
                      </button>
                      <input 
                        type="file" 
                        ref={partPdfFileRef} 
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.type !== 'application/pdf') return alert("Selecione somente arquivos PDF.");
                            const base64 = await handleFileToBase64(file);
                            setAttachedPdf(base64);
                          }
                        }} 
                        className="hidden" 
                        accept="application/pdf" 
                      />
                      {attachedPdf && (
                        <div className="flex items-center gap-1.5 text-xs text-afro-green font-bold">
                          <CheckCircle size={14}/> PDF Anexado
                          <button 
                            type="button" 
                            onClick={() => setAttachedPdf('')} 
                            className="text-red-500 hover:text-red-700 ml-2"
                            title="Remover anexo"
                          >
                            <X size={14}/>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-black uppercase tracking-widest text-afro-brown flex items-center gap-2">
                      <ImageIcon size={16} className="text-afro-terracotta" /> Galeria / Fotos da Reportagem
                    </h4>
                    <p className="text-[11px] text-gray-500 leading-relaxed font-serif italic">
                      Adicione fotos adicionais da redação para ilustrar o acontecimento.
                    </p>
                    <div className="flex items-center gap-3 pt-1">
                      <button 
                        type="button" 
                        onClick={() => galleryFileRef.current?.click()} 
                        className="bg-white border-2 border-afro-brown/20 text-afro-brown px-4 py-2 rounded text-[10px] font-bold uppercase hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Upload size={12}/> {additionalImages.length > 0 ? 'Adicionar Fotos' : 'Enviar Fotos'}
                      </button>
                      <input 
                        type="file" 
                        ref={galleryFileRef} 
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const base64 = await handleFileToBase64(file);
                            setAdditionalImages(prev => [...prev, base64]);
                          }
                        }} 
                        className="hidden" 
                        accept="image/*" 
                      />
                    </div>
                    {additionalImages.length > 0 && (
                      <div className="grid grid-cols-5 gap-2 pt-2 border-t border-gray-100">
                        {additionalImages.map((img, idx) => (
                          <div key={idx} className="relative w-full aspect-square border border-gray-100 rounded overflow-hidden group">
                            <img src={img} className="w-full h-full object-cover" alt="Adicional" />
                            <button 
                              type="button" 
                              onClick={() => setAdditionalImages(prev => prev.filter((_, i) => i !== idx))}
                              className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5 hover:bg-red-800 transition-colors"
                            >
                              <X size={10}/>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Conteúdo Escrito da Matéria</label>
                  <textarea rows={10} value={content} onChange={e => setContent(e.target.value)} placeholder="Conteúdo da matéria..." className="w-full p-4 border-2 border-gray-100 focus:border-afro-gold outline-none font-serif leading-relaxed" required />
                </div>

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

      {activeTab === 'security' && (
        <div className="bg-white rounded shadow-xl overflow-hidden border border-gray-100 max-w-lg mx-auto animate-in fade-in duration-500">
          <div className="p-6 bg-afro-brown text-paper flex justify-between items-center">
             <h3 className="font-display text-xl font-bold uppercase tracking-widest">Segurança da Redação</h3>
             <Key className="text-afro-gold" size={24} />
          </div>
          <div className="p-6 space-y-6">
            <p className="text-xs text-gray-500 leading-relaxed uppercase tracking-wider font-bold">
              Como editor-chefe ou redator credenciado do Frederico Pedreira Neto, você pode atualizar suas credenciais de acesso diretamente.
            </p>

            {passwordStatus.message && (
              <div id="password-status-alert" className={`p-4 rounded-sm text-sm border font-medium ${
                passwordStatus.type === 'success' 
                  ? 'bg-green-50 border-green-200 text-green-800' 
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                {passwordStatus.message}
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Nova Senha Escolhida</label>
                <input 
                  type="text" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-3 border-2 border-gray-100 focus:border-afro-gold outline-none font-mono"
                  placeholder="Coloque a senha desejada"
                  required
                />
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-sm p-4 text-xs text-amber-800 space-y-2">
                <p className="font-bold uppercase tracking-wider">💡 Dica de Mudança Rápida</p>
                <p>O campo já está preenchido com a nova senha solicitada: <strong className="font-mono bg-amber-100/50 px-1 py-0.5 rounded text-amber-900">fred@fred2026</strong>. Basta clicar no botão abaixo para confirmar a alteração no banco de dados do Supabase.</p>
              </div>

              <button 
                type="submit" 
                disabled={isUpdatingPassword}
                className="w-full bg-afro-terracotta text-paper font-bold py-4 rounded uppercase tracking-widest hover:bg-afro-brown transition-colors flex justify-center items-center gap-2"
              >
                {isUpdatingPassword ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Processando...
                  </>
                ) : (
                  <>
                    <CheckCircle size={18} />
                    Mudar Senha para {newPassword}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
