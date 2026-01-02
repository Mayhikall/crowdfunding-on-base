export const CROWDFUNDING_ADDRESS = '0x1A8DA2385043aDDA13Afa12772e8D8cbCdd3B367' as const
export const SEDULUR_TOKEN_ADDRESS = '0xA7781a2D948303809355f958027a750eFe8e71CB' as const

export const CROWDFUNDING_ABI = [
    // View Functions
    {
        type: 'function',
        name: 'getCampaign',
        inputs: [{ name: 'campaignId', type: 'uint256' }],
        outputs: [{
            name: '',
            type: 'tuple',
            components: [
                { name: 'creator', type: 'address' },
                { name: 'paymentType', type: 'uint8' },
                { name: 'claimed', type: 'bool' },
                { name: 'cancelled', type: 'bool' },
                { name: 'category', type: 'uint8' },
                { name: 'targetAmount', type: 'uint128' },
                { name: 'amountCollected', type: 'uint128' },
                { name: 'deadline', type: 'uint64' },
                { name: 'title', type: 'string' },
                { name: 'description', type: 'string' },
                { name: 'imageCID', type: 'string' }
            ]
        }],
        stateMutability: 'view'
    },
    {
        type: 'function',
        name: 'getCampaigns',
        inputs: [
            { name: 'start', type: 'uint256' },
            { name: 'limit', type: 'uint256' }
        ],
        outputs: [{
            name: 'campaigns',
            type: 'tuple[]',
            components: [
                { name: 'creator', type: 'address' },
                { name: 'paymentType', type: 'uint8' },
                { name: 'claimed', type: 'bool' },
                { name: 'cancelled', type: 'bool' },
                { name: 'category', type: 'uint8' },
                { name: 'targetAmount', type: 'uint128' },
                { name: 'amountCollected', type: 'uint128' },
                { name: 'deadline', type: 'uint64' },
                { name: 'title', type: 'string' },
                { name: 'description', type: 'string' },
                { name: 'imageCID', type: 'string' }
            ]
        }],
        stateMutability: 'view'
    },
    {
        type: 'function',
        name: 'getCampaignCount',
        inputs: [],
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view'
    },
    {
        type: 'function',
        name: 'getCampaignsByCategory',
        inputs: [{ name: 'category', type: 'uint8' }],
        outputs: [{ name: 'campaignIds', type: 'uint256[]' }],
        stateMutability: 'view'
    },
    {
        type: 'function',
        name: 'getDonators',
        inputs: [{ name: 'campaignId', type: 'uint256' }],
        outputs: [{ name: '', type: 'address[]' }],
        stateMutability: 'view'
    },
    {
        type: 'function',
        name: 'getDonation',
        inputs: [
            { name: 'campaignId', type: 'uint256' },
            { name: 'donator', type: 'address' }
        ],
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view'
    },
    {
        type: 'function',
        name: 'isCampaignActive',
        inputs: [{ name: 'campaignId', type: 'uint256' }],
        outputs: [{ name: '', type: 'bool' }],
        stateMutability: 'view'
    },
    {
        type: 'function',
        name: 'isCampaignSuccessful',
        inputs: [{ name: 'campaignId', type: 'uint256' }],
        outputs: [{ name: '', type: 'bool' }],
        stateMutability: 'view'
    },
    {
        type: 'function',
        name: 'getActiveCampaignCount',
        inputs: [{ name: 'creator', type: 'address' }],
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view'
    },
    {
        type: 'function',
        name: 'i_acceptedToken',
        inputs: [],
        outputs: [{ name: '', type: 'address' }],
        stateMutability: 'view'
    },
    // Constants
    {
        type: 'function',
        name: 'MIN_DONATION_ETH',
        inputs: [],
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view'
    },
    {
        type: 'function',
        name: 'MIN_DONATION_TOKEN',
        inputs: [],
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view'
    },
    {
        type: 'function',
        name: 'MAX_CAMPAIGNS_PER_CREATOR',
        inputs: [],
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view'
    },
    {
        type: 'function',
        name: 'MAX_EXTENSION_DURATION',
        inputs: [],
        outputs: [{ name: '', type: 'uint64' }],
        stateMutability: 'view'
    },
    // Write Functions
    {
        type: 'function',
        name: 'createCampaign',
        inputs: [
            { name: 'title', type: 'string' },
            { name: 'description', type: 'string' },
            { name: 'targetAmount', type: 'uint128' },
            { name: 'duration', type: 'uint64' },
            { name: 'imageCID', type: 'string' },
            { name: 'paymentType', type: 'uint8' },
            { name: 'category', type: 'uint8' }
        ],
        outputs: [{ name: 'campaignId', type: 'uint256' }],
        stateMutability: 'nonpayable'
    },
    {
        type: 'function',
        name: 'updateCampaign',
        inputs: [
            { name: 'campaignId', type: 'uint256' },
            { name: 'newDescription', type: 'string' },
            { name: 'newImageCID', type: 'string' }
        ],
        outputs: [],
        stateMutability: 'nonpayable'
    },
    {
        type: 'function',
        name: 'extendDeadline',
        inputs: [
            { name: 'campaignId', type: 'uint256' },
            { name: 'additionalDuration', type: 'uint64' }
        ],
        outputs: [],
        stateMutability: 'nonpayable'
    },
    {
        type: 'function',
        name: 'cancelCampaign',
        inputs: [{ name: 'campaignId', type: 'uint256' }],
        outputs: [],
        stateMutability: 'nonpayable'
    },
    {
        type: 'function',
        name: 'donateETH',
        inputs: [{ name: 'campaignId', type: 'uint256' }],
        outputs: [],
        stateMutability: 'payable'
    },
    {
        type: 'function',
        name: 'donateToken',
        inputs: [
            { name: 'campaignId', type: 'uint256' },
            { name: 'amount', type: 'uint256' }
        ],
        outputs: [],
        stateMutability: 'nonpayable'
    },
    {
        type: 'function',
        name: 'withdraw',
        inputs: [{ name: 'campaignId', type: 'uint256' }],
        outputs: [],
        stateMutability: 'nonpayable'
    },
    {
        type: 'function',
        name: 'refund',
        inputs: [{ name: 'campaignId', type: 'uint256' }],
        outputs: [],
        stateMutability: 'nonpayable'
    },
    // Events
    {
        type: 'event',
        name: 'CampaignCreated',
        inputs: [
            { name: 'campaignId', type: 'uint256', indexed: true },
            { name: 'creator', type: 'address', indexed: true },
            { name: 'paymentType', type: 'uint8', indexed: false },
            { name: 'category', type: 'uint8', indexed: false },
            { name: 'targetAmount', type: 'uint128', indexed: false },
            { name: 'deadline', type: 'uint64', indexed: false }
        ]
    },
    {
        type: 'event',
        name: 'DonationReceived',
        inputs: [
            { name: 'campaignId', type: 'uint256', indexed: true },
            { name: 'donator', type: 'address', indexed: true },
            { name: 'amount', type: 'uint256', indexed: false },
            { name: 'paymentType', type: 'uint8', indexed: false }
        ]
    }
] as const

export const SEDULUR_TOKEN_ABI = [
    // ERC20 Standard
    {
        type: 'function',
        name: 'name',
        inputs: [],
        outputs: [{ name: '', type: 'string' }],
        stateMutability: 'view'
    },
    {
        type: 'function',
        name: 'symbol',
        inputs: [],
        outputs: [{ name: '', type: 'string' }],
        stateMutability: 'view'
    },
    {
        type: 'function',
        name: 'decimals',
        inputs: [],
        outputs: [{ name: '', type: 'uint8' }],
        stateMutability: 'view'
    },
    {
        type: 'function',
        name: 'totalSupply',
        inputs: [],
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view'
    },
    {
        type: 'function',
        name: 'balanceOf',
        inputs: [{ name: 'account', type: 'address' }],
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view'
    },
    {
        type: 'function',
        name: 'allowance',
        inputs: [
            { name: 'owner', type: 'address' },
            { name: 'spender', type: 'address' }
        ],
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view'
    },
    {
        type: 'function',
        name: 'approve',
        inputs: [
            { name: 'spender', type: 'address' },
            { name: 'amount', type: 'uint256' }
        ],
        outputs: [{ name: '', type: 'bool' }],
        stateMutability: 'nonpayable'
    },
    {
        type: 'function',
        name: 'transfer',
        inputs: [
            { name: 'to', type: 'address' },
            { name: 'amount', type: 'uint256' }
        ],
        outputs: [{ name: '', type: 'bool' }],
        stateMutability: 'nonpayable'
    },
    {
        type: 'function',
        name: 'transferFrom',
        inputs: [
            { name: 'from', type: 'address' },
            { name: 'to', type: 'address' },
            { name: 'amount', type: 'uint256' }
        ],
        outputs: [{ name: '', type: 'bool' }],
        stateMutability: 'nonpayable'
    },
    // Faucet Functions
    {
        type: 'function',
        name: 'FAUCET_AMOUNT',
        inputs: [],
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view'
    },
    {
        type: 'function',
        name: 'FAUCET_COOLDOWN',
        inputs: [],
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view'
    },
    {
        type: 'function',
        name: 'claimFaucet',
        inputs: [],
        outputs: [],
        stateMutability: 'nonpayable'
    },
    {
        type: 'function',
        name: 'canClaimFaucet',
        inputs: [{ name: 'user', type: 'address' }],
        outputs: [
            { name: 'canClaim', type: 'bool' },
            { name: 'timeRemaining', type: 'uint256' }
        ],
        stateMutability: 'view'
    },
    {
        type: 'function',
        name: 'getLastClaimTime',
        inputs: [{ name: 'user', type: 'address' }],
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view'
    },
    {
        type: 'function',
        name: 'getNextClaimTime',
        inputs: [{ name: 'user', type: 'address' }],
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view'
    },
    // Events
    {
        type: 'event',
        name: 'FaucetClaimed',
        inputs: [
            { name: 'user', type: 'address', indexed: true },
            { name: 'amount', type: 'uint256', indexed: false },
            { name: 'timestamp', type: 'uint256', indexed: false }
        ]
    },
    {
        type: 'event',
        name: 'Transfer',
        inputs: [
            { name: 'from', type: 'address', indexed: true },
            { name: 'to', type: 'address', indexed: true },
            { name: 'value', type: 'uint256', indexed: false }
        ]
    },
    {
        type: 'event',
        name: 'Approval',
        inputs: [
            { name: 'owner', type: 'address', indexed: true },
            { name: 'spender', type: 'address', indexed: true },
            { name: 'value', type: 'uint256', indexed: false }
        ]
    }
] as const
