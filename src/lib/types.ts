export type UserRole = 'student' | 'admin'

export interface Profile {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  role: UserRole
  created_at: string
}

export interface Subject {
  id: string
  name: string
  code: string
  semester: number
  sort_order: number
  created_at: string
}

export interface Lab {
  id: string
  subject_id: string
  name: string
  sort_order: number
  created_at: string
}

export type FileType = 'pdf' | 'docx' | 'image' | 'code' | 'zip'

export interface Material {
  id: string
  title: string
  description: string | null
  file_url: string | null
  file_key: string | null
  file_name: string | null
  file_type: FileType | string | null
  file_size_bytes: number | null
  video_url: string | null
  subject_id: string | null
  lab_id: string | null
  tags: string[] | null
  uploaded_by: string | null
  sort_order: number
  is_hidden: boolean
  download_count: number
  created_at: string
  // Optional joined relations
  profiles?: Profile | null
  subjects?: Subject | null
  labs?: Lab | null
}

export interface Channel {
  id: string
  name: string
  description: string | null
  subject_id: string | null
  is_default: boolean
  created_at: string
}

export interface Message {
  id: string
  channel_id: string
  user_id: string | null
  content: string
  edited_at: string | null
  created_at: string
  profiles?: Profile | null
}

export interface Poll {
  id: string
  question: string
  options: string[]
  allow_multiple: boolean
  is_anonymous: boolean
  created_by: string | null
  expires_at: string | null
  created_at: string
  profiles?: Profile | null
  votes_count?: Record<number, number>
  total_votes?: number
  user_voted_options?: number[]
}

export interface PollVote {
  id: string
  poll_id: string
  user_id: string
  selected_options: number[]
  created_at: string
}

export type EventType = 'study_session' | 'activity' | 'workshop' | 'exam_prep'

export interface EventItem {
  id: string
  title: string
  description: string | null
  type: EventType
  location: string | null
  start_time: string
  end_time: string | null
  max_attendees: number | null
  subject_id: string | null
  created_by: string | null
  created_at: string
  profiles?: Profile | null
  subjects?: Subject | null
  user_rsvp_status?: 'going' | 'maybe' | 'not_going' | null
  going_count?: number
  maybe_count?: number
}

export interface EventRSVP {
  id: string
  event_id: string
  user_id: string
  status: 'going' | 'maybe' | 'not_going'
  created_at: string
}

export interface Announcement {
  id: string
  title: string
  content: string
  is_pinned: boolean
  created_by: string | null
  expires_at: string | null
  created_at: string
  profiles?: Profile | null
}

export interface Bookmark {
  id: string
  user_id: string
  material_id: string
  created_at: string
  materials?: Material | null
}

export interface MaterialVersion {
  id: string
  material_id: string
  version_number: number
  file_url: string | null
  file_key: string | null
  file_name: string | null
  file_size_bytes: number | null
  change_note: string | null
  created_by: string | null
  created_at: string
}

export type NotificationType = 'announcement' | 'deadline' | 'event' | 'material' | 'message' | 'system'

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  body: string | null
  href: string | null
  is_read: boolean
  created_at: string
}

export interface ModerationReport {
  id: string
  reporter_id: string
  message_id: string | null
  reason: string
  status: 'open' | 'resolved' | 'dismissed'
  reviewed_by: string | null
  created_at: string
  reviewed_at: string | null
  messages?: Message | null
  profiles?: Profile | null
}

export type DeadlineType = 'assignment' | 'exam' | 'lab' | 'project' | 'other'

export interface Deadline {
  id: string
  title: string
  description: string | null
  subject_id: string | null
  due_date: string
  type: DeadlineType
  created_by: string | null
  created_at: string
  subjects?: Subject | null
}
