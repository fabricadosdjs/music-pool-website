-- Criar tabela de músicas
CREATE TABLE IF NOT EXISTS tracks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  artist VARCHAR(255) NOT NULL,
  genre VARCHAR(100) NOT NULL,
  bitrate INTEGER NOT NULL, -- Alterado de bpm para bitrate
  style VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL, -- NEW, FEATURED, TRENDING, CHARTS
  thumbnail TEXT, -- URL da imagem
  play_url TEXT,
  download_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de ações do usuário (downloads e likes)
CREATE TABLE IF NOT EXISTS user_actions (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  track_id INTEGER REFERENCES tracks(id) ON DELETE CASCADE,
  action_type VARCHAR(20) NOT NULL CHECK (action_type IN ('download', 'like')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, track_id, action_type)
);

-- Inserir música de exemplo (se ainda não existir)
INSERT INTO tracks (title, artist, genre, bitrate, style, category, thumbnail, play_url, download_url) 
VALUES (
  'VERSACE ON THE FLOOR (BRUNO MARS VS. DAVID GUETTA)',
  'DAVID GUETTA',
  'FUNK',
  100,
  'Remix',
  'NEW',
  '/placeholder.svg?height=60&width=60',
  'https://drive.google.com/uc?export=download&id=1QO7J4Mo_GaF92FTBrtS8XcczLekjiBDV',
  'https://drive.google.com/uc?export=download&id=1QO7J4Mo_GaF92FTBrtS8XcczLekjiBDV'
) ON CONFLICT (title, artist, genre, bitrate, style) DO NOTHING; -- Adicionado ON CONFLICT para evitar duplicatas
