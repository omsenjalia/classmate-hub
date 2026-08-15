'use client'

import YouTube from 'react-youtube'

export default function VideoEmbed({ url }: { url: string }) {
  if (!url) return null

  // Extract YouTube ID
  let youtubeId: string | null = null
  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/)
  if (ytMatch && ytMatch[1]) {
    youtubeId = ytMatch[1]
  }

  // Extract Google Drive ID
  let driveId: string | null = null
  const driveMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/)
  if (driveMatch && driveMatch[1]) {
    driveId = driveMatch[1]
  }

  if (youtubeId) {
    return (
      <div className="w-full aspect-video rounded-xl overflow-hidden border border-[#2D3148] shadow-lg">
        <YouTube
          videoId={youtubeId}
          className="w-full h-full"
          iframeClassName="w-full h-full"
          opts={{
            width: '100%',
            height: '100%',
            playerVars: {
              autoplay: 0,
            },
          }}
        />
      </div>
    )
  }

  if (driveId) {
    return (
      <div className="w-full aspect-video rounded-xl overflow-hidden border border-[#2D3148] shadow-lg bg-black">
        <iframe
          src={`https://drive.google.com/file/d/${driveId}/preview`}
          className="w-full h-full border-0"
          allow="autoplay"
        />
      </div>
    )
  }

  return (
    <div className="bg-[#1A1D27] border border-[#2D3148] rounded-xl p-6 text-center space-y-3">
      <p className="text-xs text-[#8B91A8]">External Video Link:</p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm font-semibold text-[#4F6EF7] hover:underline break-all"
      >
        {url}
      </a>
    </div>
  )
}
