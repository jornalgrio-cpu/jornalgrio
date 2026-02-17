
-- 1. TABELA DE ARTIGOS (Notícias, Entrevistas, Editoriais)
CREATE TABLE IF NOT EXISTS articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  content TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_role TEXT,
  section TEXT NOT NULL, 
  image_url TEXT,
  images TEXT[] DEFAULT '{}', -- Coluna para múltiplas fotos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_published BOOLEAN DEFAULT true
);

-- Se a tabela já existir, execute apenas este comando no SQL Editor:
-- ALTER TABLE articles ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

-- 2. TABELA DE COMENTÁRIOS (Interação nas matérias)
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  content TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABELA DE NEWSLETTER
CREATE TABLE IF NOT EXISTS newsletter (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE,
  whatsapp TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABELA DE AGENDA
CREATE TABLE IF NOT EXISTS agenda (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_title TEXT NOT NULL,
  event_date DATE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TABELA DE RECADINHOS
CREATE TABLE IF NOT EXISTS recadinhos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. TABELA DE PARCEIROS
CREATE TABLE IF NOT EXISTS partners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  website_url TEXT,
  tier TEXT DEFAULT 'Parceiro',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. TABELA DE EQUIPE
CREATE TABLE IF NOT EXISTS team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  bio TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- POLÍTICAS DE ACESSO (RLS)
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter ENABLE ROW LEVEL SECURITY;
ALTER TABLE agenda ENABLE ROW LEVEL SECURITY;
ALTER TABLE recadinhos ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura pública de artigos" ON articles FOR SELECT USING (is_published = true);
CREATE POLICY "Permitir gestão total de artigos" ON articles FOR ALL USING (true);
CREATE POLICY "Permitir leitura de comentários aprovados" ON comments FOR SELECT USING (is_approved = true);
CREATE POLICY "Permitir inserção pública de comentários" ON comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir moderação de comentários" ON comments FOR ALL USING (true);
CREATE POLICY "Permitir inscrição na newsletter" ON newsletter FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir leitura de inscritos" ON newsletter FOR SELECT USING (true);
CREATE POLICY "Permitir leitura pública da agenda" ON agenda FOR SELECT USING (true);
CREATE POLICY "Permitir gestão da agenda" ON agenda FOR ALL USING (true);
CREATE POLICY "Permitir leitura pública de recadinhos" ON recadinhos FOR SELECT USING (true);
CREATE POLICY "Permitir inserção de recadinhos" ON recadinhos FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir leitura pública de parceiros" ON partners FOR SELECT USING (true);
CREATE POLICY "Permitir gestão de parceiros" ON partners FOR ALL USING (true);
CREATE POLICY "Permitir leitura pública da equipe" ON team_members FOR SELECT USING (true);
CREATE POLICY "Permitir gestão da equipe" ON team_members FOR ALL USING (true);
