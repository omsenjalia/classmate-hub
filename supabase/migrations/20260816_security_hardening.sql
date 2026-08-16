-- Apply this migration to existing Supabase projects that were initialized
-- before the corresponding changes in schema.sql.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.prevent_profile_role_change()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only an administrator can change a profile role';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_profile_role_change ON public.profiles;
CREATE TRIGGER prevent_profile_role_change
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_profile_role_change();

DROP POLICY IF EXISTS "Update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Update own profile or admin" ON public.profiles;
CREATE POLICY "Update own profile or admin" ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR public.is_admin())
  WITH CHECK (auth.uid() = id OR public.is_admin());

ALTER POLICY "Owner or admin update" ON public.materials
  WITH CHECK (auth.uid() = uploaded_by OR public.is_admin());
ALTER POLICY "Edit own message" ON public.messages
  WITH CHECK (auth.uid() = user_id);
ALTER POLICY "Auth RSVP" ON public.event_rsvps
  WITH CHECK (auth.uid() = user_id);
ALTER POLICY "Own bookmarks" ON public.bookmarks
  WITH CHECK (auth.uid() = user_id);
