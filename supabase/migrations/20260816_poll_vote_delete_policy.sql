-- Apply after 20260816_product_features.sql on already-migrated projects.
-- The delete policy lets a student replace or remove their own poll vote.

DROP POLICY IF EXISTS "Own poll vote delete" ON public.poll_votes;
CREATE POLICY "Own poll vote delete" ON public.poll_votes FOR DELETE
  USING (auth.uid() = user_id);
