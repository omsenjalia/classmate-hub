-- Apply after schema.sql's security migration on existing projects.

CREATE TABLE IF NOT EXISTS material_versions (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), material_id UUID NOT NULL REFERENCES materials ON DELETE CASCADE, version_number INT NOT NULL, file_url TEXT, file_key TEXT, file_name TEXT, file_size_bytes BIGINT, change_note TEXT, created_by UUID REFERENCES profiles ON DELETE SET NULL, created_at TIMESTAMPTZ DEFAULT NOW(), UNIQUE(material_id, version_number));
CREATE TABLE IF NOT EXISTS notifications (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), user_id UUID NOT NULL REFERENCES profiles ON DELETE CASCADE, type TEXT NOT NULL CHECK (type IN ('announcement','deadline','event','material','message','system')), title TEXT NOT NULL, body TEXT, href TEXT, is_read BOOLEAN NOT NULL DEFAULT FALSE, created_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS moderation_reports (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), reporter_id UUID NOT NULL REFERENCES profiles ON DELETE CASCADE, message_id UUID REFERENCES messages ON DELETE CASCADE, reason TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','resolved','dismissed')), reviewed_by UUID REFERENCES profiles ON DELETE SET NULL, created_at TIMESTAMPTZ DEFAULT NOW(), reviewed_at TIMESTAMPTZ);
CREATE TABLE IF NOT EXISTS audit_logs (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), actor_id UUID REFERENCES profiles ON DELETE SET NULL, action TEXT NOT NULL, entity_type TEXT NOT NULL, entity_id TEXT, metadata JSONB, created_at TIMESTAMPTZ DEFAULT NOW());
ALTER TABLE material_versions ENABLE ROW LEVEL SECURITY; ALTER TABLE notifications ENABLE ROW LEVEL SECURITY; ALTER TABLE moderation_reports ENABLE ROW LEVEL SECURITY; ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public material versions" ON material_versions FOR SELECT USING (TRUE);
CREATE POLICY "Owner or admin material versions" ON material_versions FOR INSERT WITH CHECK (auth.uid() = created_by OR is_admin());
CREATE POLICY "Own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Mark own notifications read" ON notifications FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Create reports" ON moderation_reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Read own or admin reports" ON moderation_reports FOR SELECT USING (auth.uid() = reporter_id OR is_admin());
CREATE POLICY "Admin review reports" ON moderation_reports FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin audit logs" ON audit_logs FOR SELECT USING (is_admin());

CREATE OR REPLACE FUNCTION public.notify_class_members()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE kind TEXT; headline TEXT; detail TEXT; target TEXT; actor UUID;
BEGIN
  IF TG_TABLE_NAME = 'materials' THEN kind := 'material'; headline := 'New study material'; detail := NEW.title; target := '/materials/' || NEW.id; actor := NEW.uploaded_by;
  ELSIF TG_TABLE_NAME = 'announcements' THEN kind := 'announcement'; headline := NEW.title; detail := NEW.content; target := '/dashboard'; actor := NEW.created_by;
  ELSE kind := 'deadline'; headline := 'New deadline: ' || NEW.title; detail := NEW.description; target := '/deadlines'; actor := NEW.created_by;
  END IF;
  INSERT INTO notifications (user_id,type,title,body,href) SELECT id,kind,headline,detail,target FROM profiles WHERE id IS DISTINCT FROM actor;
  RETURN NEW;
END; $$;
CREATE OR REPLACE FUNCTION public.write_audit_log()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN INSERT INTO audit_logs (actor_id,action,entity_type,entity_id,metadata) VALUES (auth.uid(),lower(TG_OP),TG_TABLE_NAME,(CASE WHEN TG_OP = 'DELETE' THEN OLD.id ELSE NEW.id END)::TEXT,jsonb_build_object('at',now())); RETURN COALESCE(NEW,OLD); END; $$;
CREATE TRIGGER notify_material_created AFTER INSERT ON materials FOR EACH ROW EXECUTE FUNCTION notify_class_members();
CREATE TRIGGER notify_announcement_created AFTER INSERT ON announcements FOR EACH ROW EXECUTE FUNCTION notify_class_members();
CREATE TRIGGER notify_deadline_created AFTER INSERT ON deadlines FOR EACH ROW EXECUTE FUNCTION notify_class_members();
CREATE TRIGGER audit_material_changes AFTER INSERT OR UPDATE OR DELETE ON materials FOR EACH ROW EXECUTE FUNCTION write_audit_log();
CREATE TRIGGER audit_report_changes AFTER INSERT OR UPDATE ON moderation_reports FOR EACH ROW EXECUTE FUNCTION write_audit_log();
