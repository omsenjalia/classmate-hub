import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ClassmateHub', short_name: 'ClassmateHub', description: 'Your class materials and community hub.',
    start_url: '/dashboard', display: 'standalone', background_color: '#0f1117', theme_color: '#4f46e5',
    icons: [{ src: '/logo.png', sizes: '512x512', type: 'image/png' }],
  }
}
