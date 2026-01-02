'use client'

import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi'
import { SEDULUR_TOKEN_ADDRESS, SEDULUR_TOKEN_ABI, CROWDFUNDING_ADDRESS } from '@/lib/contracts'

export function useTokenBalance(address: `0x${string}` | undefined) {
    return useReadContract({
        address: SEDULUR_TOKEN_ADDRESS,
        abi: SEDULUR_TOKEN_ABI,
        functionName: 'balanceOf',
        args: address ? [address] : undefined,
        query: {
            enabled: !!address,
        },
    })
}

export function useTokenAllowance(owner: `0x${string}` | undefined) {
    return useReadContract({
        address: SEDULUR_TOKEN_ADDRESS,
        abi: SEDULUR_TOKEN_ABI,
        functionName: 'allowance',
        args: owner ? [owner, CROWDFUNDING_ADDRESS] : undefined,
        query: {
            enabled: !!owner,
        },
    })
}

export function useCanClaimFaucet(address: `0x${string}` | undefined) {
    return useReadContract({
        address: SEDULUR_TOKEN_ADDRESS,
        abi: SEDULUR_TOKEN_ABI,
        functionName: 'canClaimFaucet',
        args: address ? [address] : undefined,
        query: {
            enabled: !!address,
        },
    })
}

export function useNextClaimTime(address: `0x${string}` | undefined) {
    return useReadContract({
        address: SEDULUR_TOKEN_ADDRESS,
        abi: SEDULUR_TOKEN_ABI,
        functionName: 'getNextClaimTime',
        args: address ? [address] : undefined,
        query: {
            enabled: !!address,
        },
    })
}

export function useFaucetAmount() {
    return useReadContract({
        address: SEDULUR_TOKEN_ADDRESS,
        abi: SEDULUR_TOKEN_ABI,
        functionName: 'FAUCET_AMOUNT',
    })
}

export function useClaimFaucet() {
    const { writeContract, data: hash, isPending, error } = useWriteContract()

    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
        hash,
    })

    const claimFaucet = () => {
        writeContract({
            address: SEDULUR_TOKEN_ADDRESS,
            abi: SEDULUR_TOKEN_ABI,
            functionName: 'claimFaucet',
        })
    }

    return {
        claimFaucet,
        hash,
        isPending,
        isConfirming,
        isSuccess,
        error,
    }
}

export function useApproveToken() {
    const { writeContract, data: hash, isPending, error } = useWriteContract()

    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
        hash,
    })

    const approve = (amount: bigint) => {
        writeContract({
            address: SEDULUR_TOKEN_ADDRESS,
            abi: SEDULUR_TOKEN_ABI,
            functionName: 'approve',
            args: [CROWDFUNDING_ADDRESS, amount],
        })
    }

    return {
        approve,
        hash,
        isPending,
        isConfirming,
        isSuccess,
        error,
    }
}
