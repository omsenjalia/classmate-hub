/**
 * Files are stored as 3MB parts plus a manifest (see github-storage.ts), so
 * GitHub's 100MB-per-file limit doesn't apply. This cap only bounds how long
 * one upload or download can take.
 */
export const MAX_FILE_SIZE_BYTES = 1024 * 1024 * 1024 // 1GB
export const MAX_FILE_SIZE_LABEL = '1 GB'

export const ALLOWED_FILE_EXTENSIONS = [
  'pdf', 'docx', 'png', 'jpg', 'jpeg',
  'c', 'py', 'java', 'js', 'ts', 'zip', 'rar'
]

export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/png',
  'image/jpeg',
  'text/x-c',
  'text/x-python',
  'text/x-java-source',
  'text/javascript',
  'text/typescript',
  'application/zip',
  'application/x-rar-compressed',
  'text/plain',
]

export const SYLLABUS_PDFS = [
  { code: '101BS', name: 'Mathematics - I', url: 'https://www.bvmengineering.ac.in/syllabi/UG2425/BS/101BS.pdf' },
  { code: '104BS', name: 'Semiconductor Physics', url: 'https://www.bvmengineering.ac.in/syllabi/UG2425/BS/104BS.pdf' },
  { code: '110ES', name: 'Basic Electrical Engineering', url: 'https://www.bvmengineering.ac.in/syllabi/UG2425/ES/110ES.pdf' },
  { code: '119ES', name: 'Fundamentals of Programming', url: 'https://www.bvmengineering.ac.in/syllabi/UG2425/ES/119ES.pdf' },
  { code: '114ES', name: 'IT Essentials Workshop', url: 'https://www.bvmengineering.ac.in/syllabi/UG2425/ES/114ES.pdf' },
  { code: '121HS', name: 'Environmental Science', url: 'https://www.bvmengineering.ac.in/syllabi/UG2425/HS/121HS.PDF' },
]
