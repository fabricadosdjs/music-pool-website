CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  username text UNIQUE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  is_paid_user boolean DEFAULT FALSE NOT NULL,
  download_limit text DEFAULT 'listen_only'::text NOT NULL,
  marketing_emails boolean DEFAULT FALSE NOT NULL,
  milestone_emails boolean DEFAULT FALSE NOT NULL,
  recommendation_emails boolean DEFAULT FALSE NOT NULL,
  free_download_emails boolean DEFAULT FALSE NOT NULL,
  role text DEFAULT 'user'::text NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  next_due_date date -- Nova coluna para o próximo vencimento
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para a tabela profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;
CREATE POLICY "Users can update their own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Trigger para criar um perfil automaticamente ao registrar um novo usuário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, first_name, last_name, is_paid_user, download_limit, marketing_emails, milestone_emails, recommendation_emails, free_download_emails, role)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'username', NEW.raw_user_meta_data->>'first_name', NEW.raw_user_meta_data->>'last_name', FALSE, 'listen_only', COALESCE((NEW.raw_user_meta_data->>'marketing_emails')::boolean, FALSE), COALESCE((NEW.raw_user_meta_data->>'milestone_emails')::boolean, FALSE), COALESCE((NEW.raw_user_meta_data->>'recommendation_emails')::boolean, FALSE), COALESCE((NEW.raw_user_meta_data->>'free_download_emails')::boolean, FALSE), 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Função para atualizar o timestamp 'updated_at'
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para a tabela profiles
DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
