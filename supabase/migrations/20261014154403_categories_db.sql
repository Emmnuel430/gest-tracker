-- Migration V2.2.0: Table categories, contraintes, RLS et Backfill de données
-- Source: Spécifications rm.md section 4 (ADR-01)

-- 1. Création de l'Enum CategoryKind
DO $$ BEGIN
  CREATE TYPE "CategoryKind" AS ENUM ('INCOME', 'EXPENSE', 'BOTH');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Création de la table categories
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  kind "CategoryKind" NOT NULL,
  color TEXT NOT NULL,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT categories_pkey PRIMARY KEY (id),
  CONSTRAINT categories_user_id_name_key UNIQUE (user_id, name)
);

CREATE INDEX IF NOT EXISTS categories_user_id_kind_idx ON public.categories (user_id, kind);
CREATE INDEX IF NOT EXISTS categories_user_id_idx ON public.categories (user_id);

-- 3. Ajout de category_id sur transactions, budgets et recurring_rules
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS category_id TEXT;
ALTER TABLE public.budgets ADD COLUMN IF NOT EXISTS category_id TEXT;
ALTER TABLE public.recurring_rules ADD COLUMN IF NOT EXISTS category_id TEXT;

DO $$ BEGIN
  ALTER TABLE public.transactions
    ADD CONSTRAINT transactions_category_id_fkey
    FOREIGN KEY (category_id) REFERENCES public.categories(id)
    ON DELETE RESTRICT;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE public.budgets
    ADD CONSTRAINT budgets_category_id_fkey
    FOREIGN KEY (category_id) REFERENCES public.categories(id)
    ON DELETE RESTRICT;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE public.recurring_rules
    ADD CONSTRAINT recurring_rules_category_id_fkey
    FOREIGN KEY (category_id) REFERENCES public.categories(id)
    ON DELETE RESTRICT;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE INDEX IF NOT EXISTS transactions_category_id_idx ON public.transactions (category_id);
CREATE INDEX IF NOT EXISTS budgets_category_id_idx ON public.budgets (category_id);
CREATE INDEX IF NOT EXISTS recurring_rules_category_id_idx ON public.recurring_rules (category_id);

-- 4. Row Level Security (RLS) sur public.categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can select their own categories"
    ON public.categories FOR SELECT
    TO authenticated
    USING ((select auth.uid())::text = user_id);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert their own categories"
    ON public.categories FOR INSERT
    TO authenticated
    WITH CHECK ((select auth.uid())::text = user_id);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their own categories"
    ON public.categories FOR UPDATE
    TO authenticated
    USING ((select auth.uid())::text = user_id)
    WITH CHECK ((select auth.uid())::text = user_id);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete their own categories"
    ON public.categories FOR DELETE
    TO authenticated
    USING ((select auth.uid())::text = user_id);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 5. Backfill des données existantes pour chaque utilisateur
DO $$
DECLARE
  u RECORD;
BEGIN
  -- Itération sur tous les utilisateurs distincts ayant des données ou existant dans auth.users
  FOR u IN (
    SELECT DISTINCT id::text as user_id FROM auth.users
    UNION
    SELECT DISTINCT user_id FROM public.transactions WHERE user_id IS NOT NULL
    UNION
    SELECT DISTINCT user_id FROM public.wallets WHERE user_id IS NOT NULL
    UNION
    SELECT DISTINCT user_id FROM public.budgets WHERE user_id IS NOT NULL
    UNION
    SELECT DISTINCT user_id FROM public.recurring_rules WHERE user_id IS NOT NULL
  ) LOOP
    -- A. Insertion des catégories par défaut
    INSERT INTO public.categories (id, user_id, name, kind, color, is_archived, created_at, updated_at)
    VALUES
      (gen_random_uuid()::text, u.user_id, 'Travail PC', 'INCOME'::"CategoryKind", '#00DF81', false, NOW(), NOW()),
      (gen_random_uuid()::text, u.user_id, 'Cours en ligne', 'INCOME'::"CategoryKind", '#3A86FF', false, NOW(), NOW()),
      (gen_random_uuid()::text, u.user_id, 'Répetition', 'INCOME'::"CategoryKind", '#FFBE0B', false, NOW(), NOW()),
      (gen_random_uuid()::text, u.user_id, 'Freelance', 'INCOME'::"CategoryKind", '#8338EC', false, NOW(), NOW()),
      (gen_random_uuid()::text, u.user_id, 'Business', 'INCOME'::"CategoryKind", '#FB5607', false, NOW(), NOW()),
      (gen_random_uuid()::text, u.user_id, 'Don', 'INCOME'::"CategoryKind", '#FF006E', false, NOW(), NOW()),
      (gen_random_uuid()::text, u.user_id, 'Alimentation', 'EXPENSE'::"CategoryKind", '#FF5964', false, NOW(), NOW()),
      (gen_random_uuid()::text, u.user_id, 'Transport', 'EXPENSE'::"CategoryKind", '#FF9F1C', false, NOW(), NOW()),
      (gen_random_uuid()::text, u.user_id, 'Famille', 'EXPENSE'::"CategoryKind", '#2EC4B6', false, NOW(), NOW()),
      (gen_random_uuid()::text, u.user_id, 'Kajai', 'EXPENSE'::"CategoryKind", '#E71D36', false, NOW(), NOW()),
      (gen_random_uuid()::text, u.user_id, 'Logement', 'EXPENSE'::"CategoryKind", '#7209B7', false, NOW(), NOW()),
      (gen_random_uuid()::text, u.user_id, 'Santé', 'EXPENSE'::"CategoryKind", '#4CC9F0', false, NOW(), NOW()),
      (gen_random_uuid()::text, u.user_id, 'Éducation', 'EXPENSE'::"CategoryKind", '#4361EE', false, NOW(), NOW()),
      (gen_random_uuid()::text, u.user_id, 'Abonnement', 'EXPENSE'::"CategoryKind", '#F72585', false, NOW(), NOW()),
      (gen_random_uuid()::text, u.user_id, 'Loisirs', 'EXPENSE'::"CategoryKind", '#B5179E', false, NOW(), NOW()),
      (gen_random_uuid()::text, u.user_id, 'Personnel', 'EXPENSE'::"CategoryKind", '#70E000', false, NOW(), NOW()),
      (gen_random_uuid()::text, u.user_id, 'Travail', 'EXPENSE'::"CategoryKind", '#38B000', false, NOW(), NOW()),
      (gen_random_uuid()::text, u.user_id, 'Autre', 'BOTH'::"CategoryKind", '#9E9E9E', false, NOW(), NOW())
    ON CONFLICT (user_id, name) DO NOTHING;

    -- B. Insertion des catégories orphelines présentes dans les transactions existantes
    INSERT INTO public.categories (id, user_id, name, kind, color, is_archived, created_at, updated_at)
    SELECT
      gen_random_uuid()::text,
      u.user_id,
      t.category,
      CASE
        WHEN bool_or(t.type = 'INCOME') AND bool_or(t.type = 'EXPENSE') THEN 'BOTH'::"CategoryKind"
        WHEN bool_or(t.type = 'INCOME') THEN 'INCOME'::"CategoryKind"
        ELSE 'EXPENSE'::"CategoryKind"
      END,
      '#9E9E9E',
      false,
      NOW(),
      NOW()
    FROM public.transactions t
    WHERE t.user_id = u.user_id
      AND t.category IS NOT NULL
      AND t.category != ''
      AND NOT EXISTS (
        SELECT 1 FROM public.categories c WHERE c.user_id = u.user_id AND c.name = t.category
      )
    GROUP BY t.category
    ON CONFLICT (user_id, name) DO NOTHING;

    -- C. Insertion des catégories orphelines des budgets
    INSERT INTO public.categories (id, user_id, name, kind, color, is_archived, created_at, updated_at)
    SELECT
      gen_random_uuid()::text,
      u.user_id,
      b.category,
      'EXPENSE'::"CategoryKind",
      '#9E9E9E',
      false,
      NOW(),
      NOW()
    FROM public.budgets b
    WHERE b.user_id = u.user_id
      AND b.category IS NOT NULL
      AND b.category != ''
      AND NOT EXISTS (
        SELECT 1 FROM public.categories c WHERE c.user_id = u.user_id AND c.name = b.category
      )
    GROUP BY b.category
    ON CONFLICT (user_id, name) DO NOTHING;

    -- D. Insertion des catégories orphelines des recurring_rules
    INSERT INTO public.categories (id, user_id, name, kind, color, is_archived, created_at, updated_at)
    SELECT
      gen_random_uuid()::text,
      u.user_id,
      r.category,
      CASE
        WHEN r.type = 'INCOME' THEN 'INCOME'::"CategoryKind"
        ELSE 'EXPENSE'::"CategoryKind"
      END,
      '#9E9E9E',
      false,
      NOW(),
      NOW()
    FROM public.recurring_rules r
    WHERE r.user_id = u.user_id
      AND r.category IS NOT NULL
      AND r.category != ''
      AND NOT EXISTS (
        SELECT 1 FROM public.categories c WHERE c.user_id = u.user_id AND c.name = r.category
      )
    GROUP BY r.category, r.type
    ON CONFLICT (user_id, name) DO NOTHING;

  END LOOP;

  -- 6. Rapprochement et mise à jour des category_id
  UPDATE public.transactions t
  SET category_id = c.id
  FROM public.categories c
  WHERE c.user_id = t.user_id
    AND c.name = t.category
    AND t.category_id IS NULL;

  UPDATE public.budgets b
  SET category_id = c.id
  FROM public.categories c
  WHERE c.user_id = b.user_id
    AND c.name = b.category
    AND b.category_id IS NULL;

  UPDATE public.recurring_rules r
  SET category_id = c.id
  FROM public.categories c
  WHERE c.user_id = r.user_id
    AND c.name = r.category
    AND r.category_id IS NULL;

END $$;
