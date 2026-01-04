# SEDULUR FUND

A decentralized crowdfunding platform built on the Base blockchain, featuring smart contracts developed with Foundry and a modern Next.js frontend.

## ✨ Features

### Smart Contracts
- **Dual Payment Support**: Accept donations in ETH or SedulurToken (SDT)
- **Campaign Categories**: Support for multiple categories including Charity, Technology, Art, Music, Gaming, Education, Health, Environment, and Community
- **Campaign Management**:
  - Create campaigns with customizable target amount, duration, and description
  - Update campaign description and images
  - Extend campaign deadlines (up to 30 days)
  - Cancel campaigns (before receiving donations)
- **Secure Fund Handling**:
  - Creators can withdraw funds only after the campaign ends and target is met
  - Donors can claim refunds if the target is not reached
- **Built-in Faucet**: SedulurToken includes a faucet feature with 24-hour cooldown
- **Security Features**:
  - ReentrancyGuard protection
  - Rate limiting (max 5 active campaigns per creator)
  - Minimum donation requirements
  - Checks-Effects-Interactions pattern

### Frontend
- Modern UI built with Next.js 15 and React 19
- Web3 integration with Wagmi and Viem
- Responsive design with TailwindCSS
- Real-time blockchain data with TanStack Query

## 🛠️ Technology Stack

### Smart Contracts
| Technology | Version | Description |
|------------|---------|-------------|
| Solidity | ^0.8.20 | Smart contract programming language |
| Foundry | Latest | Development framework for testing and deployment |
| OpenZeppelin | Latest | Security-audited contract libraries |

### Frontend
| Technology | Version | Description |
|------------|---------|-------------|
| Next.js | 15.x | React framework with App Router |
| React | 19.x | UI library |
| TypeScript | 5.x | Type-safe JavaScript |
| Wagmi | 3.x | React hooks for Ethereum |
| Viem | 2.x | TypeScript Ethereum library |
| TailwindCSS | 4.x | Utility-first CSS framework |
| TanStack Query | 5.x | Async state management |

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Foundry** - Install via:
  ```bash
  curl -L https://foundry.paradigm.xyz | bash
  foundryup
  ```
- **Git**
- A wallet like **MetaMask** configured for Base Sepolia testnet

## 📁 Project Structure

```
crowdfunding-on-base/
├── contracts/                    # Smart contracts (Foundry project)
│   ├── src/
│   │   ├── CrowdFunding.sol     # Main crowdfunding contract
│   │   └── SedulurToken.sol     # ERC20 token with faucet
│   ├── test/                     # Contract tests
│   ├── script/                   # Deployment scripts
│   ├── lib/                      # Dependencies (OpenZeppelin, etc.)
│   └── foundry.toml             # Foundry configuration
│
├── frontend/                     # Next.js frontend application
│   ├── app/                      # App Router pages
│   │   ├── campaigns/           # Campaign pages
│   │   ├── creator/             # Creator dashboard
│   │   ├── donor/               # Donor dashboard
│   │   ├── faucet/              # Token faucet page
│   │   └── api/                 # API routes
│   ├── components/              # React components
│   ├── hooks/                   # Custom React hooks
│   ├── lib/                     # Utility functions
│   ├── config/                  # Configuration files
│   ├── types/                   # TypeScript types
│   └── public/                  # Static assets
│
└── README.md
```

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/crowdfunding-on-base.git
cd crowdfunding-on-base
```

### 2. Install Contract Dependencies

```bash
cd contracts
forge install
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### 4. Environment Setup

Create a `.env` file in the `contracts` directory:

```env
PRIVATE_KEY=your_private_key_here
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
BASESCAN_API_KEY=your_basescan_api_key
```

Create a `.env.local` file in the `frontend` directory:

```env
# Pinata IPFS Configuration
NEXT_PUBLIC_PINATA_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your_pinata_jwt_token_here
NEXT_PUBLIC_PINATA_GATEWAY=your-gateway-name.mypinata.cloud

# Base Sepolia Network
NEXT_PUBLIC_RPC_URL=https://sepolia.base.org

# Deployed Contract Addresses
NEXT_PUBLIC_CROWDFUNDING_ADDRESS=0x1234567890abcdef1234567890abcdef12345678
NEXT_PUBLIC_SEDULUR_TOKEN_ADDRESS=0xabcdef1234567890abcdef1234567890abcdef12
```

> **Note**: Replace the example values above with your actual credentials and deployed contract addresses.

## 💻 Usage

### Running Tests

```bash
cd contracts
forge test
```

Run tests with verbosity:

```bash
forge test -vvv
```

### Deploying Contracts

Deploy to Base Sepolia:

```bash
cd contracts
forge script script/DeployCrowdFunding.s.sol --rpc-url $BASE_SEPOLIA_RPC_URL --broadcast --verify
```

### Running the Frontend

Development mode:

```bash
cd frontend
npm run dev
```

Production build:

```bash
npm run build
npm start
```

### Interacting with Contracts

**Creating a Campaign:**

```solidity
// Example: Create a charity campaign accepting ETH
crowdfunding.createCampaign(
    "Help Build a School",           // title
    "Building schools in rural...",  // description
    1 ether,                          // target amount
    30 days,                          // duration
    "QmImageCID...",                  // IPFS image CID
    PaymentType.ETH,                  // payment type
    Category.CHARITY                  // category
);
```

**Donating to a Campaign:**

```solidity
// Donate ETH (minimum 0.001 ETH)
crowdfunding.donateETH{value: 0.1 ether}(campaignId);

// Donate tokens (minimum 1 SDT)
token.approve(address(crowdfunding), amount);
crowdfunding.donateToken(campaignId, amount);
```

**Claiming Faucet Tokens:**

```solidity
// Claim 100 SDT (24-hour cooldown)
sedulurToken.claimFaucet();
```

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork the repository**

2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Commit your changes**
   ```bash
   git commit -m "Add some amazing feature"
   ```

4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```

5. **Open a Pull Request**

### Contribution Guidelines

- Follow the existing code style and conventions
- Write comprehensive tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting
- Use descriptive commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

**Built with ❤️ on Base**
