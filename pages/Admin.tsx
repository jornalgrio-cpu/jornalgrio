
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { Article, ArticleSection } from '../types';
import { checkPortugueseText, generateLeadSuggestion } from '../geminiService';
import { Send, Trash2, CheckCircle, Wand2, PlusCircle, LogOut, Key, User, Image as ImageIcon, X, Edit3, RotateCcw, Upload, Link as LinkIcon, Loader2 } from 'lucide-react';

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
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  
  const mainFileRef = useRef<HTMLInputElement>(null);
  const galleryFileRef = useRef<HTMLInputElement>(null);

  const [newPassword, setNewPassword] = useState('');
  const [changingPass, setChangingPass] = useState(false);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    const { data, error } = await supabase.from('articles').select('*').order('created_at', { ascending: false });
    if (error) console.error("Erro ao buscar matérias:", error);
    if (data) setArticles(data);
  };

  const handleFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (file.size > 2 * 1024 * 1024) { // Limite de 2MB para Base64 no banco
        alert("A imagem é muito grande. Tente fotos menores que 2MB.");
        reject("Arquivo muito grande");
      }
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await handleFileToBase64(file);
        setImageUrl(base64);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = [...additionalImages];
      for (let i = 0; i < files.length; i++) {
        try {
          const base64 = await handleFileToBase64(files[i]);
          newImages.push(base64);
        } catch (err) {
          console.error(err);
        }
      }
      setAdditionalImages(newImages);
    }
  };

  const startEditing = (article: Article) => {
    setEditingArticleId(article.id);
    setTitle(article.title);
    setSubtitle(article.subtitle || '');
    setContent(article.content);
    setAuthor(article.author_name);
    setSection(article.section);
    setImageUrl(article.image_url || '');
    setAdditionalImages(article.images || []);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEditing = () => {
    resetForm();
    setShowForm(false);
  };

  const resetForm = () => {
    setTitle('');
    setSubtitle('');
    setContent('');
    setAuthor('');
    setImageUrl('');
    setAdditionalImages([]);
    setEditingArticleId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const articleData = {
        title,
        subtitle,
        content,
        author_name: author,
        section,
        image_url: imageUrl,
        images: additionalImages.filter(img => img && img.trim() !== ''),
        is_published: true
      };

      if (editingArticleId) {
        const { error } = await supabase
          .from('articles')
          .update(articleData)
          .eq('id', editingArticleId);

        if (error) throw error;
        alert("Matéria atualizada com sucesso!");
      } else {
        const { error } = await supabase
          .from('articles')
          .insert(articleData);

        if (error) throw error;
        alert("Matéria publicada com sucesso!");
      }

      resetForm();
      await fetchArticles();
      setShowForm(false);
    } catch (error: any) {
      console.error("Erro no salvamento:", error);
      alert("Erro ao salvar: " + (error.message || "Verifique se a coluna 'images' foi criada no Supabase."));
    } finally {
      setIsSaving(false);
    }
  };

  const deleteArticle = async (id: string) => {
    if (!confirm("Deseja mesmo apagar esta edição?")) return;
    const { error } = await supabase.from('articles').delete().eq('id', id);
    if (error) alert("Erro ao deletar: " + error.message);
    else fetchArticles();
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
        <div>
          <h2 className="font-display text-4xl font-black text-afro-brown uppercase">Painel da Redação</h2>
          <p className="text-sm font-serif italic text-gray-500">Editor: {session.user.email}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowProfile(!showProfile)} className="flex items-center gap-2 border-2 border-afro-brown/20 px-4 py-2 rounded font-bold text-xs uppercase hover:bg-gray-50 transition-colors">
            <User size={16}/> Perfil
          </button>
          <button 
            disabled={isSaving}
            onClick={() => editingArticleId ? cancelEditing() : setShowForm(!showForm)} 
            className={`flex items-center gap-2 px-6 py-3 rounded font-bold shadow-lg transition-colors uppercase text-xs tracking-widest ${showForm || editingArticleId ? 'bg-gray-200 text-gray-700' : 'bg-afro-terracotta text-white hover:bg-afro-brown'}`}
          >
            {editingArticleId ? 'Cancelar Edição' : (showForm ? 'Fechar Editor' : <><PlusCircle size={16}/> Nova Matéria</>)}
          </button>
          <button onClick={() => supabase.auth.signOut()} className="flex items-center gap-2 text-red-600 px-4 py-2 font-bold text-xs uppercase hover:bg-red-50 rounded">
            <LogOut size={16}/> Sair
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white p-8 rounded-lg shadow-2xl border-t-8 border-afro-gold mb-12">
          <form onSubmit={handleSubmit} className="space-y-6">
            <h3 className="font-display text-2xl font-bold uppercase text-afro-brown border-b pb-4">
              {editingArticleId ? 'Editando Publicação' : 'Nova Matéria'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Título</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-3 border-2 border-gray-100 focus:border-afro-gold outline-none text-xl font-display" required />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Autor</label>
                <input type="text" value={author} onChange={e => setAuthor(e.target.value)} className="w-full p-3 border-2 border-gray-100 focus:border-afro-gold outline-none" required />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Editoria</label>
                <select value={section} onChange={e => setSection(e.target.value as ArticleSection)} className="w-full p-3 border-2 border-gray-100 outline-none">
                  <option>Editorial</option><option>Aconteceu na Escola</option><option>Entrevistas</option><option>Opinião</option><option>Estudos</option><option>Curiosidades</option><option>Carreira</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Foto de Capa</label>
                <div className="flex flex-col gap-3">
                  <div className="flex gap-2">
                    <button type="button" onClick={() => mainFileRef.current?.click()} className="flex items-center gap-2 bg-afro-brown text-white px-4 py-2 rounded text-[10px] font-bold uppercase">
                      <Upload size={14}/> Carregar Foto
                    </button>
                    <input type="file" ref={mainFileRef} onChange={handleMainImageUpload} accept="image/*" className="hidden" />
                    <input type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="flex-1 p-2 border border-gray-200 text-[10px] outline-none rounded" placeholder="Ou URL da imagem..." />
                  </div>
                  {imageUrl && (
                    <div className="relative w-full h-40 bg-gray-50 rounded border overflow-hidden">
                      <img src={imageUrl} className="w-full h-full object-contain" alt="Preview" />
                      <button type="button" onClick={() => setImageUrl('')} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"><X size={14}/></button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 bg-paper/30 rounded-lg border-2 border-dashed border-afro-gold/20">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-xs font-black uppercase tracking-widest text-afro-brown flex items-center gap-2">
                  <ImageIcon size={16}/> Galeria Adicional
                </h4>
                <button type="button" onClick={() => galleryFileRef.current?.click()} className="text-[10px] bg-afro-gold text-afro-brown px-4 py-2 rounded-full font-bold uppercase flex items-center gap-2">
                  <Upload size={14}/> Anexar Mais Fotos
                </button>
                <input type="file" ref={galleryFileRef} onChange={handleGalleryUpload} accept="image/*" multiple className="hidden" />
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {additionalImages.map((img, index) => (
                  <div key={index} className="relative aspect-square bg-white rounded border overflow-hidden group shadow-sm">
                    <img src={img} className="w-full h-full object-cover" alt="Thumb" />
                    <button type="button" onClick={() => setAdditionalImages(additionalImages.filter((_, i) => i !== index))} className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <X size={12}/>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Lide</label>
              <textarea rows={2} value={subtitle} onChange={e => setSubtitle(e.target.value)} className="w-full p-3 border-2 border-gray-100 outline-none italic font-serif" />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Corpo do Texto</label>
              <textarea rows={12} value={content} onChange={e => setContent(e.target.value)} className="w-full p-4 border-2 border-gray-100 outline-none font-serif leading-relaxed" required />
            </div>

            <button 
              type="submit" 
              disabled={isSaving}
              className="w-full bg-afro-brown text-paper font-bold py-4 rounded uppercase tracking-widest hover:bg-black transition-colors flex justify-center items-center gap-2 shadow-lg disabled:opacity-50"
            >
              {isSaving ? (
                <><Loader2 className="animate-spin" size={20}/> Salvando Alterações...</>
              ) : (
                <><Send size={20}/> {editingArticleId ? 'Salvar Edição' : 'Publicar Agora'}</>
              )}
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded shadow-sm overflow-hidden border border-gray-100">
        <div className="p-4 bg-gray-50 border-b border-gray-100 font-bold uppercase text-xs tracking-widest">
          Histórico de Publicações
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100 text-[10px] font-bold uppercase text-gray-400">
              <tr>
                <th className="p-4">Capa</th>
                <th className="p-4">Título</th>
                <th className="p-4">Seção</th>
                <th className="p-4">Data</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {articles.map(art => (
                <tr key={art.id} className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${editingArticleId === art.id ? 'bg-afro-gold/5' : ''}`}>
                  <td className="p-4 w-20">
                    <img src={art.image_url || 'https://via.placeholder.com/100'} className="h-10 w-16 object-cover rounded" alt="Capa" />
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-gray-800 text-sm truncate max-w-[300px]">{art.title}</div>
                    <div className="text-[10px] text-gray-400 uppercase">{art.author_name}</div>
                  </td>
                  <td className="p-4">
                    <span className="text-[10px] bg-gray-100 px-2 py-1 rounded uppercase font-bold text-gray-500">{art.section}</span>
                  </td>
                  <td className="p-4 text-xs text-gray-500 font-serif">
                    {new Date(art.created_at).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => startEditing(art)} className="text-afro-brown hover:text-afro-terracotta p-2"><Edit3 size={16}/></button>
                      <button onClick={() => deleteArticle(art.id)} className="text-red-300 hover:text-red-600 p-2"><Trash2 size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Admin;
