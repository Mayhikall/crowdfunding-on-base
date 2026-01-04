// Pinata gateway - required
const PINATA_GATEWAY = process.env.NEXT_PUBLIC_PINATA_GATEWAY

/**
 * Upload file to Pinata via server-side API route
 */
export async function uploadToPinata(file: File): Promise<string> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
    })

    if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || 'Upload failed')
    }

    const data = await response.json()
    return data.cid
}

export function getIPFSUrl(cid: string): string {
    if (!cid) return '/placeholder.jpg'
    if (!PINATA_GATEWAY) {
        throw new Error('NEXT_PUBLIC_PINATA_GATEWAY is not configured')
    }
    return `${PINATA_GATEWAY}/ipfs/${cid}`
}

export function validateImageFile(file: File): string | null {
    const MAX_SIZE = 5 * 1024 * 1024 // 5MB
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

    if (!ALLOWED_TYPES.includes(file.type)) {
        return 'Format file tidak didukung. Gunakan JPG, PNG, WebP, atau GIF.'
    }

    if (file.size > MAX_SIZE) {
        return 'Ukuran file terlalu besar. Maksimal 5MB.'
    }

    return null
}
