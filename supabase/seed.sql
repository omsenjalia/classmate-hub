-- ============================================================
-- GLOBAL DEFAULT CHANNELS (if not already present)
-- ============================================================
INSERT INTO channels (name, description, is_default)
SELECT 'general', 'General class discussion', TRUE
WHERE NOT EXISTS (SELECT 1 FROM channels WHERE name = 'general');

INSERT INTO channels (name, description, is_default)
SELECT 'off-topic', 'Anything goes', TRUE
WHERE NOT EXISTS (SELECT 1 FROM channels WHERE name = 'off-topic');

INSERT INTO channels (name, description, is_default)
SELECT 'resources', 'Share links, tips, and tools', TRUE
WHERE NOT EXISTS (SELECT 1 FROM channels WHERE name = 'resources');

-- ============================================================
-- SUBJECTS — Semester 1 (BVM Engineering College, IT Dept)
-- ============================================================
INSERT INTO subjects (id, code, name, semester, sort_order) VALUES
  (uuid_generate_v4(), '101BS', 'Mathematics - I',               1, 1),
  (uuid_generate_v4(), '104BS', 'Semiconductor Physics',          1, 2),
  (uuid_generate_v4(), '110ES', 'Basic Electrical Engineering',   1, 3),
  (uuid_generate_v4(), '119ES', 'Fundamentals of Programming',    1, 4),
  (uuid_generate_v4(), '114ES', 'IT Essentials Workshop',         1, 5),
  (uuid_generate_v4(), '121HS', 'Environmental Science',          1, 6)
ON CONFLICT (code) DO NOTHING;

-- ============================================================
-- LABS — Semester 1
-- ============================================================
WITH subject_ids AS (
  SELECT id, code FROM subjects WHERE semester = 1
)
INSERT INTO labs (id, subject_id, name, sort_order)
SELECT uuid_generate_v4(), s.id, lab.name, lab.sort_order
FROM subject_ids s
JOIN (VALUES
  -- 104BS: Semiconductor Physics
  ('104BS', 'Crystal Structure & Miller Indices',                    1),
  ('104BS', 'Quantum Mechanics — de Broglie & Uncertainty',         2),
  ('104BS', 'Diode I-V Characteristics & Parameter Extraction',     3),
  ('104BS', 'Hall Effect & Four-Point Probe Measurement',           4),
  ('104BS', 'UV-Vis Spectroscopy & Band Gap Determination',         5),
  ('104BS', 'Laser Properties: Coherence & Directionality',         6),

  -- 110ES: Basic Electrical Engineering
  ('110ES', 'DC Circuits — KVL, KCL & Network Theorems',           1),
  ('110ES', 'DC Circuits — Star-Delta & Nodal Analysis',            2),
  ('110ES', 'Electromagnetic Induction & Mutual Inductance',        3),
  ('110ES', 'AC Circuits — R, L, C & RLC Combinations',            4),
  ('110ES', 'Three-Phase Circuits & Power Measurement',             5),
  ('110ES', 'Electrical Safety — MCB, ELCB & Earthing',            6),

  -- 119ES: Fundamentals of Programming / C
  ('119ES', 'Lab 1 — Flowcharts, Pseudocode & Algorithm Design',   1),
  ('119ES', 'Lab 2 — C Basics: Data Types, Operators & Programs',  2),
  ('119ES', 'Lab 3 — Control Structures: if-else, switch & Loops', 3),
  ('119ES', 'Lab 4 — Arrays & String Manipulation',                4),
  ('119ES', 'Lab 5 — Functions, Recursion & Macros',               5),
  ('119ES', 'Lab 6 — Pointers & Dynamic Memory Allocation',        6),
  ('119ES', 'Lab 7 — Structures, Unions & Nested Structures',      7),
  ('119ES', 'Lab 8 — File Handling in C',                          8),

  -- 114ES: IT Essentials Workshop
  ('114ES', 'Workshop 1 — Computer Hardware & Software',           1),
  ('114ES', 'Workshop 2 — OS Basics: Windows & Linux',             2),
  ('114ES', 'Workshop 3 — IT Troubleshooting & Email',             3),
  ('114ES', 'Workshop 4 — Word Processing & Spreadsheets',         4),
  ('114ES', 'Workshop 5 — Programming Logic & Variables',          5),
  ('114ES', 'Workshop 6 — Cybersecurity Awareness',                6),
  ('114ES', 'Workshop 7 — Basic Networking & IP Addressing',       7),
  ('114ES', 'Workshop 8 — Cloud Computing & Storage',              8),
  ('114ES', 'Workshop 9 — Database Basics & SQL Queries',          9),
  ('114ES', 'Workshop 10 — No-Code Website Design',               10)
) AS lab(code, name, sort_order) ON s.code = lab.code;

-- ============================================================
-- INITIAL ANNOUNCEMENT
-- ============================================================
INSERT INTO announcements (title, content, is_pinned)
VALUES (
  'Welcome to ClassmateHub!',
  'ClassmateHub is live for our IT Department class. Browse course materials, lab experiment guides, join subject chat channels, track upcoming assignment deadlines, and participate in polls.',
  TRUE
);
