'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import { useAppStore } from '@/store/useAppStore'
import { MOCK_MATERIALS, MOCK_USER } from '@/lib/mock-data'
import { formatDate, formatBytes, getSubjectColor } from '@/lib/utils'
import {
  User,
  ShieldCheck,
  Edit2,
  FolderKanban,
  Bookmark,
  Camera,
  Check,
  X,
  FileText,
  Download,
  Eye,
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function UserProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const resolvedParams = use(params)
  const username = resolvedParams.username

  const { user, setUser } = useAppStore()
  const isOwnProfile = user?.username.toLowerCase() === username.toLowerCase()

  const [activeTab, setActiveTab] = useState<'uploads' | 'bookmarks'>('uploads')
  const [isEditing, setIsEditing] = useState(false)
  const [displayName, setDisplayName] = useState(user?.display_name || '')
  const [bio, setBio] = useState(user?.bio || '')
  const [avatarUploading, setAvatarUploading] = useState(false)

  // Uploaded materials for this profile
  const userUploads = MOCK_MATERIALS.filter(
    (m) => m.uploaded_by === user?.id || isOwnProfile
  )

  // Bookmarked materials
  const userBookmarks = MOCK_MATERIALS.slice(0, 2)

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setAvatarUploading(true)
    try {
      const presignRes = await fetch('/api/upload/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: `avatars/${file.name}`,
          contentType: file.type || 'image/png',
          fileSize: file.size,
        }),
      })

      const { publicUrl } = await presignRes.json()
      const previewUrl = URL.createObjectURL(file)

      if (user) {
        setUser({
          ...user,
          avatar_url: previewUrl || publicUrl,
        })
      }
      toast.success('Profile avatar updated!')
    } catch {
      toast.error('Failed to update avatar')
    } finally {
      setAvatarUploading(false)
    }
  }

  const handleSaveProfile = () => {
    if (user) {
      setUser({
        ...user,
        display_name: displayName.trim(),
        bio: bio.trim(),
      })
    }
    setIsEditing(false)
    toast.success('Profile details saved!')
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200 max-w-4xl mx-auto">
      {/* Profile Card */}
      <div className="bg-[#1A1D27] border border-[#2D3148] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#4F6EF7]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10 text-center sm:text-left">
          {/* Avatar with Upload Hover */}
          <div className="relative group">
            <div className="w-24 h-24 rounded-full bg-[#4F6EF7]/20 border-2 border-[#4F6EF7] flex items-center justify-center font-bold text-2xl text-[#4F6EF7] overflow-hidden shadow-lg">
              {user?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatar_url} alt={username} className="w-full h-full object-cover" />
              ) : (
                username.charAt(0).toUpperCase()
              )}
            </div>

            {isOwnProfile && (
              <label
                htmlFor="avatar-upload"
                className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white"
              >
                <Camera className="w-6 h-6" />
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* User Bio & Details */}
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <h1 className="text-2xl font-bold font-display text-white">
                {user?.display_name || username}
              </h1>
              <span className="text-xs font-mono text-[#8B91A8]">@{username}</span>
              {user?.role === 'admin' && (
                <span className="inline-flex items-center gap-1 text-[10px] bg-amber-500/20 text-amber-300 font-mono px-2 py-0.5 rounded border border-amber-500/30">
                  <ShieldCheck className="w-3 h-3" /> ADMIN
                </span>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-3 pt-2">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Display name"
                  className="w-full bg-[#0F1117] border border-[#2D3148] rounded-xl px-3 py-1.5 text-xs text-white"
                />
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Bio description..."
                  className="w-full bg-[#0F1117] border border-[#2D3148] rounded-xl px-3 py-1.5 text-xs text-white"
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveProfile}
                    className="bg-[#4F6EF7] text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" /> Save
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="bg-[#242736] text-[#8B91A8] px-3 py-1.5 rounded-lg text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#8B91A8] leading-relaxed max-w-lg">
                {user?.bio || 'IT Department Student • BVM Engineering College'}
              </p>
            )}

            <div className="flex items-center justify-center sm:justify-start gap-4 pt-2 text-xs font-mono text-[#8B91A8]">
              <span>Joined {formatDate(user?.created_at)}</span>
              <span>• {userUploads.length} Uploads</span>
            </div>
          </div>

          {isOwnProfile && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-[#242736] hover:bg-[#2D3148] border border-[#2D3148] text-white text-xs font-medium px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" /> Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-[#2D3148] pb-1">
        <button
          onClick={() => setActiveTab('uploads')}
          className={`pb-3 text-xs font-mono font-bold uppercase transition-colors relative flex items-center gap-2 ${
            activeTab === 'uploads' ? 'text-[#4F6EF7]' : 'text-[#8B91A8] hover:text-white'
          }`}
        >
          <FolderKanban className="w-4 h-4" /> Uploaded Materials ({userUploads.length})
          {activeTab === 'uploads' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4F6EF7] rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('bookmarks')}
          className={`pb-3 text-xs font-mono font-bold uppercase transition-colors relative flex items-center gap-2 ${
            activeTab === 'bookmarks' ? 'text-[#4F6EF7]' : 'text-[#8B91A8] hover:text-white'
          }`}
        >
          <Bookmark className="w-4 h-4" /> Bookmarked Materials ({userBookmarks.length})
          {activeTab === 'bookmarks' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4F6EF7] rounded-full" />
          )}
        </button>
      </div>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(activeTab === 'uploads' ? userUploads : userBookmarks).map((item) => (
          <div
            key={item.id}
            className="bg-[#1A1D27] border border-[#2D3148] rounded-2xl p-5 space-y-3 hover:border-[#4F6EF7]/40 transition-all"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#4F6EF7]" />
                <Link
                  href={`/materials/${item.id}`}
                  className="text-sm font-bold text-white font-display hover:text-[#4F6EF7] transition-colors truncate"
                >
                  {item.title}
                </Link>
              </div>

              {item.subjects && (
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded border ${getSubjectColor(
                    item.subjects.code
                  )}`}
                >
                  {item.subjects.code}
                </span>
              )}
            </div>

            <p className="text-xs text-[#8B91A8] line-clamp-2">{item.description}</p>

            <div className="flex items-center justify-between text-xs font-mono text-[#8B91A8] pt-2 border-t border-[#2D3148]">
              <span>{formatDate(item.created_at)}</span>
              <div className="flex items-center gap-2">
                <Link href={`/materials/${item.id}`} className="text-white hover:text-[#4F6EF7]">
                  <Eye className="w-3.5 h-3.5" />
                </Link>
                <Link href={`/materials/${item.id}`} className="text-[#4F6EF7] hover:underline flex items-center gap-1">
                  <Download className="w-3.5 h-3.5" /> ({item.download_count})
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
