-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES (extends Supabase auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username     TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url   TEXT,
  bio          TEXT,
  role         TEXT NOT NULL DEFAULT 'student'
                   CHECK (role IN ('student', 'admin')),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- SUBJECTS & LABS
-- ============================================================
CREATE TABLE IF NOT EXISTS subjects (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  code        TEXT NOT NULL UNIQUE,        -- e.g. "CS301"
  semester    INT,
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS labs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_id  UUID REFERENCES subjects ON DELETE CASCADE,
  name        TEXT NOT NULL,         -- e.g. "Lab 3 – Sorting"
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- MATERIALS
-- ============================================================
CREATE TABLE IF NOT EXISTS materials (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title           TEXT NOT NULL,
  description     TEXT,
  -- file uploads (Cloudflare R2)
  file_url        TEXT,              -- R2 public CDN URL
  file_key        TEXT,              -- R2 object key
  file_name       TEXT,
  file_type       TEXT,              -- 'pdf'|'docx'|'image'|'code'|'zip'
  file_size_bytes BIGINT,
  -- video links (YouTube / Google Drive)
  video_url       TEXT,              -- YouTube or Drive share URL
  -- classification
  subject_id      UUID REFERENCES subjects ON DELETE SET NULL,
  lab_id          UUID REFERENCES labs ON DELETE SET NULL,  -- NULL = lecture material
  tags            TEXT[],
  -- ownership
  uploaded_by     UUID REFERENCES profiles ON DELETE SET NULL,
  -- admin control
  sort_order      INT DEFAULT 0,
  is_hidden       BOOLEAN DEFAULT FALSE,
  -- stats
  download_count  INT DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CHAT CHANNELS + MESSAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS channels (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,          -- "general", "off-topic", "cs301"
  description TEXT,
  subject_id  UUID REFERENCES subjects ON DELETE CASCADE,  -- NULL = global
  is_default  BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create a channel when a subject is added
CREATE OR REPLACE FUNCTION create_subject_channel()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO channels (name, description, subject_id)
  VALUES (
    lower(replace(NEW.code, ' ', '-')),  -- e.g. "cs301"
    NEW.name || ' subject discussion',
    NEW.id
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_subject_created ON subjects;
CREATE TRIGGER on_subject_created
  AFTER INSERT ON subjects
  FOR EACH ROW EXECUTE FUNCTION create_subject_channel();

CREATE TABLE IF NOT EXISTS messages (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel_id  UUID REFERENCES channels ON DELETE CASCADE,
  user_id     UUID REFERENCES profiles ON DELETE SET NULL,
  content     TEXT NOT NULL,
  edited_at   TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_messages_channel ON messages(channel_id, created_at DESC);

-- ============================================================
-- POLLS
-- ============================================================
CREATE TABLE IF NOT EXISTS polls (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question        TEXT NOT NULL,
  options         JSONB NOT NULL,     -- ["Option A", "Option B", ...]
  allow_multiple  BOOLEAN DEFAULT FALSE,
  is_anonymous    BOOLEAN DEFAULT FALSE,
  created_by      UUID REFERENCES profiles ON DELETE SET NULL,
  expires_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS poll_votes (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  poll_id          UUID REFERENCES polls ON DELETE CASCADE,
  user_id          UUID REFERENCES profiles ON DELETE CASCADE,
  selected_options INT[] NOT NULL,   -- indices into options array
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(poll_id, user_id)
);

-- ============================================================
-- EVENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS events (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title          TEXT NOT NULL,
  description    TEXT,
  type           TEXT NOT NULL
                     CHECK (type IN ('study_session','activity','workshop','exam_prep')),
  location       TEXT,              -- room name or Google Meet / Zoom link
  start_time     TIMESTAMPTZ,
  end_time       TIMESTAMPTZ,
  max_attendees  INT,               -- NULL = unlimited
  subject_id     UUID REFERENCES subjects ON DELETE SET NULL,
  created_by     UUID REFERENCES profiles ON DELETE SET NULL,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS event_rsvps (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id   UUID REFERENCES events ON DELETE CASCADE,
  user_id    UUID REFERENCES profiles ON DELETE CASCADE,
  status     TEXT NOT NULL CHECK (status IN ('going','maybe','not_going')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- ============================================================
-- ANNOUNCEMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS announcements (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       TEXT NOT NULL,
  content     TEXT NOT NULL,
  is_pinned   BOOLEAN DEFAULT TRUE,
  created_by  UUID REFERENCES profiles ON DELETE SET NULL,
  expires_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- BOOKMARKS
-- ============================================================
CREATE TABLE IF NOT EXISTS bookmarks (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID REFERENCES profiles ON DELETE CASCADE,
  material_id  UUID REFERENCES materials ON DELETE CASCADE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, material_id)
);

-- ============================================================
-- DEADLINES
-- ============================================================
CREATE TABLE IF NOT EXISTS deadlines (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       TEXT NOT NULL,
  description TEXT,
  subject_id  UUID REFERENCES subjects ON DELETE SET NULL,
  due_date    TIMESTAMPTZ NOT NULL,
  type        TEXT DEFAULT 'assignment'
                   CHECK (type IN ('assignment','exam','lab','project','other')),
  created_by  UUID REFERENCES profiles ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================
ALTER TABLE profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects      ENABLE ROW LEVEL SECURITY;
ALTER TABLE labs          ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials     ENABLE ROW LEVEL SECURITY;
ALTER TABLE channels      ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages      ENABLE ROW LEVEL SECURITY;
ALTER TABLE polls         ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_votes    ENABLE ROW LEVEL SECURITY;
ALTER TABLE events        ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_rsvps   ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks     ENABLE ROW LEVEL SECURITY;
ALTER TABLE deadlines     ENABLE ROW LEVEL SECURITY;

-- Helper function to check admin role
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- PROFILES
CREATE POLICY "Public profiles" ON profiles FOR SELECT USING (TRUE);
CREATE POLICY "Update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- SUBJECTS & LABS
CREATE POLICY "Public subjects" ON subjects FOR SELECT USING (TRUE);
CREATE POLICY "Admin subjects" ON subjects FOR ALL USING (is_admin());
CREATE POLICY "Public labs" ON labs FOR SELECT USING (TRUE);
CREATE POLICY "Admin labs" ON labs FOR ALL USING (is_admin());

-- MATERIALS
CREATE POLICY "Public materials read" ON materials FOR SELECT
  USING (is_hidden = FALSE OR is_admin());
CREATE POLICY "Authenticated upload" ON materials FOR INSERT
  WITH CHECK (auth.uid() = uploaded_by);
CREATE POLICY "Owner or admin update" ON materials FOR UPDATE
  USING (auth.uid() = uploaded_by OR is_admin());
CREATE POLICY "Owner or admin delete" ON materials FOR DELETE
  USING (auth.uid() = uploaded_by OR is_admin());

-- CHANNELS
CREATE POLICY "Public channels" ON channels FOR SELECT USING (TRUE);
CREATE POLICY "Admin channels" ON channels FOR ALL USING (is_admin());

-- MESSAGES
CREATE POLICY "Auth read messages" ON messages FOR SELECT
  USING (auth.role() = 'authenticated');
CREATE POLICY "Send messages" ON messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Delete own message" ON messages FOR DELETE
  USING (auth.uid() = user_id OR is_admin());
CREATE POLICY "Edit own message" ON messages FOR UPDATE
  USING (auth.uid() = user_id);

-- POLLS
CREATE POLICY "Public polls" ON polls FOR SELECT USING (TRUE);
CREATE POLICY "Auth create poll" ON polls FOR INSERT
  WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Owner or admin delete poll" ON polls FOR DELETE
  USING (auth.uid() = created_by OR is_admin());

-- POLL VOTES
CREATE POLICY "Vote insert" ON poll_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Vote read" ON poll_votes FOR SELECT USING (TRUE);

-- EVENTS
CREATE POLICY "Public events" ON events FOR SELECT USING (TRUE);
CREATE POLICY "Auth create event" ON events FOR INSERT
  WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Owner or admin delete event" ON events FOR DELETE
  USING (auth.uid() = created_by OR is_admin());

-- EVENT RSVPs
CREATE POLICY "Auth RSVP" ON event_rsvps FOR ALL
  USING (auth.uid() = user_id);
CREATE POLICY "Public RSVP read" ON event_rsvps FOR SELECT USING (TRUE);

-- ANNOUNCEMENTS
CREATE POLICY "Public announcements" ON announcements FOR SELECT USING (TRUE);
CREATE POLICY "Admin announcements" ON announcements FOR ALL USING (is_admin());

-- BOOKMARKS
CREATE POLICY "Own bookmarks" ON bookmarks FOR ALL USING (auth.uid() = user_id);

-- DEADLINES
CREATE POLICY "Public deadlines" ON deadlines FOR SELECT USING (TRUE);
CREATE POLICY "Auth create deadline" ON deadlines FOR INSERT
  WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Admin delete deadline" ON deadlines FOR DELETE
  USING (is_admin());
