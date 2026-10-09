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

export type FileType = 'pdf' | 'docx' | 'image' | 'code' | 'zip' | 'video'

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
