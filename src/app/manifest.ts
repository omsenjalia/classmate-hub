import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ClassmateHub',
    short_name: 'ClassmateHub',
    description: 'Lecture notes, lab manuals and solution code for your class.',
    start_url: '/materials',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#f5f4ef',
    theme_color: '#f5f4ef',
    icons: [{ src: '/logo.png', sizes: '512x512', type: 'image/png' }],
    shortcuts: [
      { name: 'Upload material', url: '/materials/upload' },
      { name: 'Saved', url: '/saved' },
    ],
  }
}
