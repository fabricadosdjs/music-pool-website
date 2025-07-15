-- Tabela de perfis de usuário
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  is_paid_user BOOLEAN DEFAULT FALSE NOT NULL,
  download_limit TEXT DEFAULT 'listen_only' NOT NULL, -- '100_per_day', '200_per_day', 'unlimited', 'listen_only'
  marketing_emails BOOLEAN DEFAULT FALSE NOT NULL,
  milestone_emails BOOLEAN DEFAULT FALSE NOT NULL,
  recommendation_emails BOOLEAN DEFAULT FALSE NOT NULL,
  free_download_emails BOOLEAN DEFAULT FALSE NOT NULL,
  role TEXT DEFAULT 'user' NOT NULL, -- 'user', 'admin'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Row Level Security (RLS) para a tabela profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Política para usuários visualizarem seu próprio perfil
CREATE POLICY "Users can view their own profile." ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Política para usuários atualizarem seu próprio perfil (ex: preferências de email, nome)
CREATE POLICY "Users can update their own profile." ON profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Política para administradores visualizarem todos os perfis
-- Política para administradores atualizarem todos os perfis

-- Qualquer usuário autenticado pode listar perfis.
-- (Em produção, use Service-Role ou uma VIEW se precisar restringir.)
CREATE POLICY "Authenticated users can view profiles." ON profiles
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Usuários só podem editar o próprio perfil
CREATE POLICY "Users can update their own profile." ON profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Função para criar um perfil para novos usuários
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, first_name, last_name, is_paid_user, download_limit, marketing_emails, milestone_emails, recommendation_emails, free_download_emails, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    FALSE,
    'listen_only',
    (NEW.raw_user_meta_data->>'marketing_emails')::boolean,
    (NEW.raw_user_meta_data->>'milestone_emails')::boolean,
    (NEW.raw_user_meta_data->>'recommendation_emails')::boolean,
    (NEW.raw_user_meta_data->>'free_download_emails')::boolean,
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para chamar a função handle_new_user em novas inserções em auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- NOTA IMPORTANTE PARA O ADMIN:
-- Para que o usuário 'edersonleonardo@nexorrecords.com.br' seja admin,
-- ele deve primeiro se cadastrar normalmente pelo formulário do site.
-- Após o cadastro, você precisará ir no painel do Supabase, na tabela 'profiles',
-- encontrar o perfil dele e manualmente alterar a coluna 'role' de 'user' para 'admin'.
-- Ou, se preferir, pode executar o seguinte comando SQL no Supabase SQL Editor
-- APÓS o usuário ter se cadastrado:
-- UPDATE profiles
-- SET role = 'admin'
-- WHERE id = (SELECT id FROM auth.users WHERE email = 'edersonleonardo@nexorrecords.com.br');
