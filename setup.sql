
-- 1. TABELA DE ARTIGOS
CREATE TABLE IF NOT EXISTS articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  content TEXT NOT NULL,
  author_name TEXT NOT NULL,
  section TEXT NOT NULL,
  image_url TEXT,
  images TEXT[],
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir leitura pública articles" ON articles;
CREATE POLICY "Permitir leitura pública articles" ON articles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Permitir gestão de articles" ON articles;
CREATE POLICY "Permitir gestão de articles" ON articles FOR ALL USING (true) WITH CHECK (true);

-- 8. TABELA DE CONFIGURAÇÕES
CREATE TABLE IF NOT EXISTS configs (
  key TEXT PRIMARY KEY,
  value TEXT
);

INSERT INTO configs (key, value) VALUES ('monthly_pdf', '') ON CONFLICT DO NOTHING;

ALTER TABLE configs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir leitura pública de configs" ON configs;
CREATE POLICY "Permitir leitura pública de configs" ON configs FOR SELECT USING (true);
DROP POLICY IF EXISTS "Permitir gestão de configs" ON configs;
CREATE POLICY "Permitir gestão de configs" ON configs FOR ALL USING (true);

-- 9. TABELA DE NEWSLETTER
CREATE TABLE IF NOT EXISTS newsletter (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE newsletter ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir leitura newsletter" ON newsletter;
CREATE POLICY "Permitir leitura newsletter" ON newsletter FOR SELECT USING (true);
DROP POLICY IF EXISTS "Permitir inserção pública newsletter" ON newsletter;
CREATE POLICY "Permitir inserção pública newsletter" ON newsletter FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Permitir gestão de newsletter" ON newsletter;
CREATE POLICY "Permitir gestão de newsletter" ON newsletter FOR ALL USING (true);

-- 10. TABELA DE RECADINHOS (Mural)
CREATE TABLE IF NOT EXISTS recadinhos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE recadinhos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir leitura pública recadinhos" ON recadinhos;
CREATE POLICY "Permitir leitura pública recadinhos" ON recadinhos FOR SELECT USING (true);
DROP POLICY IF EXISTS "Permitir inserção pública recadinhos" ON recadinhos;
CREATE POLICY "Permitir inserção pública recadinhos" ON recadinhos FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Permitir gestão de recadinhos" ON recadinhos;
CREATE POLICY "Permitir gestão de recadinhos" ON recadinhos FOR ALL USING (true);
