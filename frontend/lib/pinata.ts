const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT
const PINATA_GATEWAY = process.env.NEXT_PUBLIC_PINATA_GATEWAY || 'https://gateway.pinata.cloud'

export async function uploadToPinata(file: File): Promise<string> {
    if (!PINATA_JWT) {
        throw new Error('Pinata JWT tidak dikonfigurasi')
    }

    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${PINATA_JWT}`,
        },
        body: formData,
    })

    if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.message || 'Upload ke Pinata gagal')
    }

    const data = await response.json()
    return data.IpfsHash
}

export function getIPFSUrl(cid: string): string {
    if (!cid) return '/placeholder.jpg'
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
