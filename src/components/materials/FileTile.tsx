import {
  ArticleIcon,
  CodeIcon,
  FileIcon,
  FileTextIcon,
  FileZipIcon,
  ImageIcon,
  PlayCircleIcon,
} from '@phosphor-icons/react/dist/ssr'
import type { Icon } from '@phosphor-icons/react'
import { cn, getExtension, getFileKind, type FileKind } from '@/lib/utils'
import type { Material } from '@/lib/types'

const ICONS: Record<FileKind, Icon> = {
  pdf: FileTextIcon,
  code: CodeIcon,
  video: PlayCircleIcon,
  zip: FileZipIcon,
  docx: ArticleIcon,
  image: ImageIcon,
  file: FileIcon,
}

interface FileTileProps {
  material: Pick<Material, 'file_name' | 'file_type' | 'video_url'>
  size?: 'md' | 'lg'
}

/** Square tile with the file-type glyph and its real extension underneath. */
export default function FileTile({ material, size = 'md' }: FileTileProps) {
  const kind = getFileKind(material)
  const IconComponent = ICONS[kind]
  return (
    <span
      aria-hidden
      className={cn(
        'flex shrink-0 flex-col items-center justify-center gap-0.5 rounded-tile border border-line bg-surface-2 text-ink-2',
        size === 'md' ? 'size-12' : 'size-16'
      )}
    >
      <IconComponent className={size === 'md' ? 'size-5' : 'size-7'} weight="duotone" />
      <span className="font-mono text-[9px] font-medium leading-none tracking-wide text-muted">
        {getExtension(material)}
      </span>
    </span>
  )
}
