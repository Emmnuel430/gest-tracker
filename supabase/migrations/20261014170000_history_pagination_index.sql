-- Migration v2.4.0: Index composé pour la pagination serveur et les filtres de l'historique
-- Conforme aux spécifications de rm.md section 6.1

CREATE INDEX IF NOT EXISTS idx_transactions_user_date_id 
ON transactions (user_id, date DESC, id);
