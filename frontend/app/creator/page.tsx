'use client'

import { useState, useEffect } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther, parseUnits } from 'viem'
import { Button, Card, CardContent, Input, Textarea, Select, Badge, Progress } from '@/components/ui'
import { CROWDFUNDING_ADDRESS, CROWDFUNDING_ABI } from '@/lib/contracts'
import { useCampaigns, useActiveCampaignCount, transformCampaigns } from '@/hooks/useCrowdFunding'
import { useTokenBalance } from '@/hooks/useSedulurToken'
import { uploadToPinata, validateImageFile } from '@/lib/pinata'
import { parseContractError, formatAddress, formatETH, formatSDT, getProgress, getTimeRemaining } from '@/lib/utils'
import { PaymentType, Category, CATEGORY_LABELS, getCampaignStatus } from '@/types/campaign'
import { StatusBadge } from '@/components/ui/Badge'
import Link from 'next/link'

const categoryOptions = Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
  value: Number(value),
  label,
}))

const paymentOptions = [
  { value: PaymentType.ETH, label: 'ETH' },
  { value: PaymentType.TOKEN, label: 'SDT Token' },
]

export default function CreatorDashboardPage() {
  const { address, isConnected } = useAccount()
  const { data: activeCampaigns } = useActiveCampaignCount(address)
  const { data: rawCampaigns, refetch } = useCampaigns(0, 100)
  const { data: tokenBalance } = useTokenBalance(address)
  
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    targetAmount: '',
    duration: '',
    paymentType: PaymentType.ETH,
    category: Category.OTHER,
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const allCampaigns = transformCampaigns(rawCampaigns)
  const myCampaigns = allCampaigns.filter(
    c => address && c.creator.toLowerCase() === address.toLowerCase()
  )

  // Stats
  const active = myCampaigns.filter(c => getCampaignStatus(c) === 'active')
  const successful = myCampaigns.filter(c => getCampaignStatus(c) === 'success' || getCampaignStatus(c) === 'claimed')
  const totalRaisedETH = myCampaigns
    .filter(c => c.paymentType === PaymentType.ETH)
    .reduce((acc, c) => acc + c.amountCollected, 0n)
  const totalRaisedSDT = myCampaigns
    .filter(c => c.paymentType === PaymentType.TOKEN)
    .reduce((acc, c) => acc + c.amountCollected, 0n)

  useEffect(() => {
    if (isSuccess) {
      setShowForm(false)
      setForm({ title: '', description: '', targetAmount: '', duration: '', paymentType: PaymentType.ETH, category: Category.OTHER })
      setImageFile(null)
      setImagePreview(null)
      refetch()
    }
  }, [isSuccess, refetch])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const error = validateImageFile(file)
    if (error) { setUploadError(error); return }
    setImageFile(file)
    setUploadError(null)
    const reader = new FileReader()
    reader.onload = () => setImagePreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setUploadError(null)

    if (!form.title.trim()) { setFormError('Title is required'); return }
    if (!form.targetAmount || parseFloat(form.targetAmount) <= 0) { setFormError('Target amount must be greater than 0'); return }
    if (!form.duration || parseInt(form.duration) <= 0) { setFormError('Duration must be greater than 0 days'); return }

    let imageCID = ''
    if (imageFile) {
      try {
        setIsUploading(true)
        imageCID = await uploadToPinata(imageFile)
      } catch {
        setUploadError('Failed to upload image. Please try again.')
        setIsUploading(false)
        return
      }
      setIsUploading(false)
    }

    const targetAmount = form.paymentType === PaymentType.ETH
      ? parseEther(form.targetAmount)
      : parseUnits(form.targetAmount, 18)
    const durationSeconds = BigInt(parseInt(form.duration) * 24 * 60 * 60)

    writeContract({
      address: CROWDFUNDING_ADDRESS,
      abi: CROWDFUNDING_ABI,
      functionName: 'createCampaign',
      args: [form.title, form.description, targetAmount, durationSeconds, imageCID, form.paymentType, form.category],
    })
  }

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-black mb-4">Connect Wallet</h1>
        <p className="text-gray-600">Connect your wallet to access Creator Dashboard</p>
      </div>
    )
  }

  const canCreate = (activeCampaigns ?? 0n) < 5n

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-black uppercase">Creator Dashboard</h1>
          <p className="text-gray-600 font-mono">{formatAddress(address!)}</p>
        </div>
        {!showForm && (
          <Button 
            variant="donate" 
            onClick={() => setShowForm(true)}
            disabled={!canCreate}
          >
            Create Campaign
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card hover={false} className="bg-[#4ECDC4]">
          <CardContent className="text-center">
            <p className="text-sm uppercase font-bold opacity-80">Active</p>
            <p className="text-3xl font-black">{active.length}</p>
          </CardContent>
        </Card>
        <Card hover={false} className="bg-[#95E1D3]">
          <CardContent className="text-center">
            <p className="text-sm uppercase font-bold opacity-80">Successful</p>
            <p className="text-3xl font-black">{successful.length}</p>
          </CardContent>
        </Card>
        <Card hover={false} className="bg-[#FFE66D]">
          <CardContent className="text-center">
            <p className="text-sm uppercase font-bold opacity-80">Total Raised ETH</p>
            <p className="text-2xl font-black">{formatETH(totalRaisedETH)}</p>
          </CardContent>
        </Card>
        <Card hover={false} className="bg-white">
          <CardContent className="text-center">
            <p className="text-sm uppercase font-bold opacity-80">Total Raised SDT</p>
            <p className="text-2xl font-black">{formatSDT(totalRaisedSDT)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Create Form */}
      {showForm && (
        <Card className="mb-8">
          <CardContent>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black uppercase">New Campaign</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
            
            {!canCreate && (
              <div className="mb-4 p-4 bg-[#FF6B6B] text-white border-4 border-black">
                <p className="font-bold">You have 5 active campaigns. Complete or cancel one to create new.</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <Input label="Title" placeholder="Campaign title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              <Textarea label="Description" placeholder="Describe your campaign..." rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              
              <div>
                <label className="block mb-2 font-bold uppercase text-sm">Campaign Image</label>
                <div className="border-4 border-dashed border-black p-8 text-center cursor-pointer hover:bg-gray-100" onClick={() => document.getElementById('img-input')?.click()}>
                  {imagePreview ? <img src={imagePreview} alt="Preview" className="max-h-48 mx-auto border-4 border-black" /> : <p className="font-bold">Click to upload image (JPG, PNG, WebP)</p>}
                </div>
                <input id="img-input" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                {uploadError && <p className="text-red-500 mt-2">{uploadError}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Select label="Payment Type" options={paymentOptions} value={form.paymentType} onChange={(e) => setForm({ ...form, paymentType: Number(e.target.value) })} />
                <Select label="Category" options={categoryOptions} value={form.category} onChange={(e) => setForm({ ...form, category: Number(e.target.value) })} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input label={`Target (${form.paymentType === PaymentType.ETH ? 'ETH' : 'SDT'})`} type="number" step="0.001" min="0" placeholder="0.1" value={form.targetAmount} onChange={(e) => setForm({ ...form, targetAmount: e.target.value })} required />
                <Input label="Duration (Days)" type="number" min="1" max="365" placeholder="30" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} required />
              </div>

              {formError && <p className="text-red-500 font-bold">{formError}</p>}
              {writeError && <p className="text-red-500 font-bold">{parseContractError(writeError)}</p>}

              <Button type="submit" variant="donate" size="lg" className="w-full" disabled={!canCreate || isPending || isConfirming || isUploading} isLoading={isPending || isConfirming || isUploading}>
                {isUploading ? 'Uploading...' : isPending ? 'Confirm in wallet...' : isConfirming ? 'Processing...' : 'Create Campaign'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* My Campaigns */}
      <h2 className="text-2xl font-black uppercase mb-4">My Campaigns ({myCampaigns.length})</h2>
      {myCampaigns.length === 0 ? (
        <Card hover={false}>
          <CardContent className="text-center py-12">
            <h3 className="text-xl font-bold mb-2">No Campaigns Yet</h3>
            <p className="text-gray-600 mb-4">Create your first campaign to get started</p>
            <Button variant="donate" onClick={() => setShowForm(true)}>Create Campaign</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {myCampaigns.map((campaign) => {
            const status = getCampaignStatus(campaign)
            const progress = getProgress(campaign.amountCollected, campaign.targetAmount)
            const isETH = campaign.paymentType === PaymentType.ETH
            return (
              <Link href={`/campaign/${campaign.id}`} key={campaign.id}>
                <Card className="hover:translate-x-1 hover:translate-y-1">
                  <CardContent>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <StatusBadge status={status} />
                          <Badge variant={isETH ? 'info' : 'warning'}>{isETH ? 'ETH' : 'SDT'}</Badge>
                        </div>
                        <h3 className="font-bold text-lg truncate">{campaign.title}</h3>
                        <p className="text-sm text-gray-600">{getTimeRemaining(campaign.deadline)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{isETH ? formatETH(campaign.amountCollected) : formatSDT(campaign.amountCollected)}</p>
                        <p className="text-sm text-gray-500">of {isETH ? formatETH(campaign.targetAmount) : formatSDT(campaign.targetAmount)}</p>
                        <Progress value={progress} size="sm" showLabel={false} className="mt-2 w-24" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
