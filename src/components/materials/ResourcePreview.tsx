'use client'

import { FileText } from 'lucide-react'
import { Material } from '@/lib/types'
import VideoEmbed from '@/components/materials/VideoEmbed'
import { formatDate } from '@/lib/utils'

/** Video / PDF / image / pseudo-code preview for the stored resource. */
export default function ResourcePreview({ material }: { material: Material }) {
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-muted flex items-center gap-2">
        <FileText className="w-4 h-4 text-indigo-500" /> Resource Preview
      </h2>

      {material.video_url ? (
        <VideoEmbed url={material.video_url} />
      ) : material.file_url ? (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xl min-h-[500px] flex flex-col">
          {material.file_type === 'pdf' ? (
            <iframe
              src={material.file_url}
              className="w-full h-[650px] border-0"
              title={material.title}
            />
          ) : material.file_type === 'image' ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={material.file_url}
              alt={material.title}
              className="w-full max-h-[600px] object-contain p-4 bg-page"
            />
          ) : (
            <div className="p-6 font-mono text-xs text-primary bg-page overflow-x-auto space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3 text-muted">
                <span>{material.file_name || 'source_code'}</span>
                <span>Syntax Highlighting</span>
              </div>
              <pre className="text-emerald-400 leading-relaxed">
                {`/* ClassmateHub Resource: ${material.title} */\n// Subject: ${material.subjects?.name || 'General'}\n// Date: ${formatDate(material.created_at)}\n\n#include <stdio.h>\n\nint main() {\n    printf("ClassmateHub Code Preview\\n");\n    return 0;\n}`}
              </pre>
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}
