'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { useAppStore } from '@/store/useAppStore'
import { createClient } from '@/lib/supabase/client'
import { uploadFileInGithubChunks } from '@/lib/github-upload'
import type { Profile } from '@/lib/types'
import { formatDate, getSubjectColor } from '@/lib/utils'
import {
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
  UserCircle2,
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
  const [profile, setProfile] = useState<Profile | null>(null)

  // No mock data — materials would be fetched from Supabase by user ID
  type ProfileMaterial = {
    id: string
    title: string
    description: string | null
    created_at: string
    download_count: number
    subjects?: { code: string; name: string } | null
  }
  const [userUploads, setUserUploads] = useState<ProfileMaterial[]>([])
  const [userBookmarks, setUserBookmarks] = useState<ProfileMaterial[]>([])

  useEffect(() => {
    const supabase = createClient()
    async function loadProfileData() {
      const { data: profile } = await supabase.from('profiles').select('*').eq('username', username).maybeSingle()
      if (!profile) return
      setProfile(profile as Profile)
      if (user?.id === profile.id) {
        setDisplayName(profile.display_name || '')
        setBio(profile.bio || '')
      }
      const { data: uploads } = await supabase.from('materials').select('id,title,description,created_at,download_count,subjects(code,name)').eq('uploaded_by', profile.id).order('created_at', { ascending: false })
      setUserUploads((uploads || []) as unknown as ProfileMaterial[])
      if (user?.id === profile.id) {
        const { data: bookmarks } = await supabase.from('bookmarks').select('materials(id,title,description,created_at,download_count,subjects(code,name))').eq('user_id', profile.id)
        setUserBookmarks((bookmarks || []).flatMap((bookmark) => bookmark.materials ? [bookmark.materials] : []) as unknown as ProfileMaterial[])
      }
    }
    void loadProfileData()
  }, [user?.id, username])

  const viewedProfile = profile || user

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setAvatarUploading(true)
    try {
      const upload = await uploadFileInGithubChunks(file)

      if (user) {
        const supabase = createClient()
        const { error } = await supabase
          .from('profiles')
          .update({ avatar_url: upload.publicUrl })
          .eq('id', user.id)

        if (error) throw new Error(error.message)

        setUser({
          ...user,
          avatar_url: upload.publicUrl,
        })
      }
      toast.success('Profile avatar updated!')
    } catch {
      toast.error('Failed to update avatar')
    } finally {
      setAvatarUploading(false)
    }
  }

  const handleSaveProfile = async () => {
    if (user) {
      const updates = { display_name: displayName.trim(), bio: bio.trim() }
      const { error } = await createClient().from('profiles').update(updates).eq('id', user.id)
      if (error) return toast.error(error.message)
      setUser({
        ...user,
        ...updates,
      })
      setProfile((current) => current ? { ...current, ...updates } : current)
    }
    setIsEditing(false)
    toast.success('Profile details saved!')
  }

  const currentList = activeTab === 'uploads' ? userUploads : userBookmarks

  return (
    <div className="space-y-8 animate-in fade-in duration-200 max-w-4xl mx-auto">
      {/* Profile Card */}
      <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10 text-center sm:text-left">
          {/* Avatar with Upload Hover */}
          <div className="relative group">
            <div className="w-24 h-24 rounded-full bg-indigo-500/20 border-2 border-indigo-500 flex items-center justify-center font-bold text-2xl text-indigo-500 overflow-hidden shadow-lg">
              {viewedProfile?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={viewedProfile.avatar_url} alt={username} className="w-full h-full object-cover" />
              ) : (
                username.charAt(0).toUpperCase()
              )}
            </div>

            {isOwnProfile && (
              <label
                htmlFor="avatar-upload"
                className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white"
              >
                {avatarUploading ? (
                  <span className="text-[10px]">Uploading…</span>
                ) : (
                  <Camera className="w-6 h-6" />
                )}
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
              <h1 className="text-2xl font-bold font-display text-primary">
                {viewedProfile?.display_name || username}
              </h1>
              <span className="text-xs font-mono text-muted">@{username}</span>
              {viewedProfile?.role === 'admin' && (
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
                  className="w-full bg-page border border-border rounded-xl px-3 py-1.5 text-xs text-primary focus:outline-none focus:border-indigo-500"
                />
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Bio description..."
                  className="w-full bg-page border border-border rounded-xl px-3 py-1.5 text-xs text-primary focus:outline-none focus:border-indigo-500"
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveProfile}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" /> Save
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="bg-elevated text-muted px-3 py-1.5 rounded-lg text-xs cursor-pointer hover:text-primary transition-colors"
                  >
                    <X className="w-3.5 h-3.5 inline mr-1" />Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted leading-relaxed max-w-lg">
                {viewedProfile?.bio || 'IT Department Student • BVM Engineering College'}
              </p>
            )}

            <div className="flex items-center justify-center sm:justify-start gap-4 pt-2 text-xs font-mono text-muted">
              <span>Joined {viewedProfile?.created_at ? formatDate(viewedProfile.created_at) : 'recently'}</span>
              <span>• {userUploads.length} Uploads</span>
            </div>
          </div>

          {isOwnProfile && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-elevated hover:bg-border border border-border text-primary text-xs font-medium px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" /> Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-border pb-1">
        <button
          onClick={() => setActiveTab('uploads')}
          className={`pb-3 text-xs font-mono font-bold uppercase transition-colors relative flex items-center gap-2 ${
            activeTab === 'uploads' ? 'text-indigo-500' : 'text-muted hover:text-primary'
          }`}
        >
          <FolderKanban className="w-4 h-4" /> Uploaded Materials ({userUploads.length})
          {activeTab === 'uploads' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('bookmarks')}
          className={`pb-3 text-xs font-mono font-bold uppercase transition-colors relative flex items-center gap-2 ${
            activeTab === 'bookmarks' ? 'text-indigo-500' : 'text-muted hover:text-primary'
          }`}
        >
          <Bookmark className="w-4 h-4" /> Bookmarked ({userBookmarks.length})
          {activeTab === 'bookmarks' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full" />
          )}
        </button>
      </div>

      {/* Materials Grid or Empty State */}
      {currentList.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-elevated flex items-center justify-center mx-auto">
            {activeTab === 'uploads' ? (
              <UserCircle2 className="w-6 h-6 text-muted" />
            ) : (
              <Bookmark className="w-6 h-6 text-muted" />
            )}
          </div>
          <h3 className="text-sm font-semibold text-primary">
            {activeTab === 'uploads' ? 'No uploads yet' : 'No bookmarks yet'}
          </h3>
          <p className="text-xs text-muted">
            {activeTab === 'uploads'
              ? 'Materials uploaded by this user will appear here.'
              : 'Bookmarked materials will appear here.'}
          </p>
          {activeTab === 'uploads' && (
            <Link
              href="/materials/upload"
              className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Upload a Material
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentList.map((item) => (
            <div
              key={item.id}
              className="bg-card border border-border rounded-2xl p-5 space-y-3 hover:border-indigo-500/40 transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-500" />
                  <Link
                    href={`/materials/${item.id}`}
                    className="text-sm font-bold text-primary font-display hover:text-indigo-500 transition-colors truncate"
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

              <p className="text-xs text-muted line-clamp-2">{item.description}</p>

              <div className="flex items-center justify-between text-xs font-mono text-muted pt-2 border-t border-border">
                <span>{formatDate(item.created_at)}</span>
                <div className="flex items-center gap-2">
                  <Link href={`/materials/${item.id}`} className="text-primary hover:text-indigo-500">
                    <Eye className="w-3.5 h-3.5" />
                  </Link>
                  <Link href={`/materials/${item.id}`} className="text-indigo-500 hover:underline flex items-center gap-1">
                    <Download className="w-3.5 h-3.5" /> ({item.download_count})
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
