import { NextRequest, NextResponse } from 'next/server'

const PINATA_JWT = process.env.PINATA_JWT

export async function POST(request: NextRequest) {
    if (!PINATA_JWT) {
        return NextResponse.json(
            { error: 'Pinata not configured' },
            { status: 500 }
        )
    }

    try {
        const formData = await request.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            )
        }

        // Validate file
        const MAX_SIZE = 5 * 1024 * 1024 // 5MB
        const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json(
                { error: 'Invalid file type. Use JPG, PNG, WebP, or GIF.' },
                { status: 400 }
            )
        }

        if (file.size > MAX_SIZE) {
            return NextResponse.json(
                { error: 'File too large. Max 5MB.' },
                { status: 400 }
            )
        }

        // Upload to Pinata
        const pinataFormData = new FormData()
        pinataFormData.append('file', file)

        const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${PINATA_JWT}`,
            },
            body: pinataFormData,
        })

        if (!response.ok) {
            const error = await response.json().catch(() => ({}))
            return NextResponse.json(
                { error: error.message || 'Upload to Pinata failed' },
                { status: response.status }
            )
        }

        const data = await response.json()
        return NextResponse.json({ cid: data.IpfsHash })
    } catch (error) {
        console.error('Upload error:', error)
        return NextResponse.json(
            { error: 'Upload failed' },
            { status: 500 }
        )
    }
}
