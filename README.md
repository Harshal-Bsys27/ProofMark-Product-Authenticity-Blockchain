# ProofMark: Product Authenticity Verification Using Blockchain

**Blockchain Technology Mini-Project**  
**Final-Year B.E. CSE (AIML) Student**

ProofMark records essential product identity data on an Ethereum-compatible blockchain and lets anyone verify the same details through a read-only lookup.

## Documentation

- [Architecture and workflow](ARCHITECTURE_AND_WORKFLOW.md)
- [Demo runbook](DEMO_RUNBOOK.md)
- [Viva quick guide](VIVA_QUICK_GUIDE.md)
- [Detailed startup guide](STARTUP_GUIDE.md)

## Fastest Start

Run this from the project root. It authorizes and funds the configured MetaMask wallet automatically:

```powershell
powershell -ExecutionPolicy Bypass -File .\start-demo.ps1
```

The launcher starts Hardhat, deploys the contract, updates `proofmark-frontend/.env.local`, and starts the frontend with a funded and authorized local demo wallet. To use another wallet, pass `-ManufacturerAddress "0xYOUR_WALLET"`.

---

## 📋 Table of Contents

1. [Problem Statement](#problem-statement)
2. [Objective](#objective)
3. [Proposed Solution](#proposed-solution)
4. [System Architecture](#system-architecture)
5. [Technologies Used](#technologies-used)
6. [Blockchain Implementation](#blockchain-implementation)
7. [Project Structure](#project-structure)
8. [Installation](#installation)
9. [Running the Project](#running-the-project)
10. [How to Use](#how-to-use)
11. [Testing](#testing)
12. [Key Blockchain Concepts](#key-blockchain-concepts)
13. [Limitations](#limitations)
14. [Future Scope](#future-scope)
15. [References](#references)

---

## 🎯 Problem Statement

Counterfeit products cost the global economy $2+ trillion annually and threaten consumer safety.  
**Challenge:** How can consumers verify product authenticity without trusting a centralized authority?

**Current Limitations:**
- ❌ Centralized databases can be hacked or tampered with
- ❌ QR codes alone can be easily replicated
- ❌ Supply chain lacks transparency
- ❌ No cryptographic proof of manufacturer verification

---

## 🚀 Objective

Build a **blockchain-based product authenticity verification system** that:

1. ✅ Allows manufacturers to register authentic products on an immutable ledger
2. ✅ Uses SHA-256 cryptographic hashing for tamper-proof verification
3. ✅ Enables customers to verify authenticity by checking blockchain records
4. ✅ Demonstrates core blockchain concepts (immutability, smart contracts, cryptography)
5. ✅ Integrates optional AI/OCR for automated product information extraction
6. ✅ Works on local Ethereum-compatible blockchain (Hardhat)

---

## 💡 Proposed Solution

### Core Technology Stack

**Blockchain:** Hardhat + Solidity Smart Contracts  
**Frontend:** React + CRACO + ethers.js  
**Wallet:** MetaMask  
**Hashing:** SHA-256  
**Optional AI:** Not required for the current working flow

### Verification Flow

```
REGISTER: Product Data → SHA-256 Hash → Blockchain Storage
VERIFY:   Product Data → Same SHA-256 Hash → Blockchain Lookup → Result
```

---

## 🏗️ System Architecture

```
┌──────────────────────────┐
│    React Frontend        │
│  (Register & Verify UI)  │
└────────────┬─────────────┘
             │
      MetaMask Wallet
      (Transaction Signing)
             │
┌────────────▼─────────────────────┐
│   Hardhat Local Blockchain       │
│  (Ethereum-compatible)           │
│                                   │
│  ┌──────────────────────────┐    │
│  │ ProductAuthenticity SC   │    │
│  │  - registerProduct()     │    │
│  │  - getProduct()          │    │
│  │  - deactivateProduct()   │    │
│  └──────────────────────────┘    │
└─────────────────────────────────┘
```

---

## 🛠️ Technologies Used

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Blockchain** | Solidity 0.8.17 | Smart contract development |
| **Dev Environment** | Hardhat 2.14+ | Local blockchain & testing |
| **Web3 Interaction** | ethers.js 5.7+ | Connect to blockchain |
| **Frontend** | React 18.2+  | User interface |
| **Build Tool** | Create React App + CRACO | Frontend development and production build |
| **Wallet** | MetaMask | Transaction signing |
| **UI Components** | Material-UI 5.11+ | Professional styling |
| **Testing** | Mocha + Chai | Smart contract tests |
| **Hashing** | SHA-256 (crypto) | Product data hashing |
| **Optional AI** | EasyOCR | Product ID extraction |

---

## ⛓️ Blockchain Implementation

### Smart Contract: ProductAuthenticity

**Features:**
- ✅ Manufacturer authorization (access control)
- ✅ Product registration with SHA-256 hash
- ✅ Product verification against blockchain
- ✅ Product deactivation capability
- ✅ Comprehensive event emission
- ✅ 40+ comprehensive tests

**Core Functions:**

```solidity
// Register product on blockchain
registerProduct(bytes32 hash, string productId, string name, string batch)

// Read product details without a wallet or gas
getProduct(bytes32 hash) returns (Product, bool)

// Emit an on-chain verification event when called as a transaction
verifyProduct(bytes32 hash) returns (bool, Product, string)

// Get product details
getProduct(bytes32 hash) returns (Product, bool)

// Deactivate product (e.g., recall)
deactivateProduct(bytes32 hash)

// Authorize manufacturer
authorizeManufacturer(address manufacturer)
```

### Events Emitted

- `ProductRegistered` - When product is registered
- `ProductVerified` - When product is verified
- `ProductDeactivated` - When product is deactivated
- `ManufacturerAuthorized` - When new manufacturer is authorized

### Key Blockchain Concepts Demonstrated

1. **Immutability** - Once registered, data cannot be changed
2. **Cryptography** - SHA-256 ensures data integrity
3. **Access Control** - Only authorized parties can perform actions
4. **Events** - Actions are announced and logged
5. **Decentralization** - No single central authority

---

## 📁 Project Structure

```
product-authenticity-blockchain/
├── contracts/
│   └── ProductAuthenticity.sol         # Main smart contract
├── scripts/
│   └── deploy.js                       # Deployment script
├── test/
│   └── ProductAuthenticity.test.js     # 40+ comprehensive tests
├── proofmark-frontend/
│   ├── src/
│   │   ├── components/                 # Reusable React components
│   │   ├── pages/                      # 4 main pages
│   │   ├── utils/                      # Web3 & hashing utilities
│   │   └── App.jsx
│   └── package.json
├── proofmark-contracts/                # Hardhat and Solidity layer
├── proofmark-frontend/                 # React application
├── .env.example                        # Environment template
├── README.md                           # This file
├── VIVA_NOTES.md                       # Viva presentation guide
└── .gitignore
```

---

## 🔧 Installation

### Prerequisites

- **Node.js v16+** and **npm v7+**
- **MetaMask browser extension**
- **Git**

### Step 1: Clone Repository

```bash
git clone https://github.com/Harshal-Bsys27/Product-Authenticity-Blockchain.git
cd Product-Authenticity-Blockchain
```

### Step 2: Install Smart Contract Dependencies

```bash
cd proofmark-contracts
npm install
```

### Step 3: Install Frontend Dependencies

```bash
cd ../proofmark-frontend
npm install
```

### Step 4: Verify Installation

```bash
cd ../proofmark-contracts
npm run compile
# Should show: Compiled 1 Solidity file successfully
```

---

## 🚀 Running the Project

### Quick Start

Use the one-command launcher from the project root:

```powershell
powershell -ExecutionPolicy Bypass -File .\start-demo.ps1
```

For a different MetaMask wallet:

```powershell
powershell -ExecutionPolicy Bypass -File .\start-demo.ps1 -ManufacturerAddress "0xYOUR_WALLET_ADDRESS"
```

The launcher deploys the contract, authorizes and funds the manufacturer wallet, writes the current address to `proofmark-frontend/.env.local`, and starts the frontend.

Manual setup is also available:

**Terminal 1 - Start Blockchain:**
```bash
cd proofmark-contracts
npm run node
```

**Terminal 2 - Deploy Contract:**
```bash
cd proofmark-contracts
npm run deploy
# This also authorizes/funds the default demo wallet and updates frontend/.env.local
```

**Terminal 3 - Start Frontend:**
```bash
cd proofmark-frontend
npm start
```

The frontend normally opens at `http://localhost:3000`. If that port is busy, use the URL printed by React.

For a custom wallet during manual setup, use:

```powershell
$env:MANUFACTURER_ADDRESS = "0xYOUR_WALLET_ADDRESS"
npm run authorize
Remove-Item Env:MANUFACTURER_ADDRESS
```

Restart the frontend after deployment so React loads the updated contract address.

---

## 📖 How to Use

### Register a Product (Manufacturer)

1. Connect MetaMask wallet
2. Navigate to "Register Product"
3. Enter product details:
   - Product ID
   - Product Name
   - Batch Number
4. Click "Generate Hash" - see SHA-256 hash
5. Click "Register on Blockchain"
6. Approve in MetaMask
7. ✅ See transaction hash and block number
8. Download the generated product QR code from the successful registration panel

### Verify a Product (Customer)

1. Go to "Verify Product"
2. Upload a downloaded product QR image, open the camera scanner, or enter product details manually
3. Generate the hash when using manual entry, then click "Verify"
4. See result:
   - ✅ AUTHENTIC - Product found on blockchain
   - ⚠️ NOT VERIFIED - Product not found
5. View blockchain details if authentic

Verification uses the read-only `getProduct()` lookup, so QR upload, camera scanning, and manual verification do not require MetaMask or gas.

### View Blockchain Details

- See all transaction information
- Manufacturer wallet address
- Registration timestamp
- Product hash
- Contract address

### MetaMask Network

```text
Network name: Hardhat Local
RPC URL: http://127.0.0.1:8545
Chain ID: 1337
Currency: ETH
```

---

## 🧪 Testing

### Run All Tests

```bash
cd proofmark-contracts
npm test
```

**Expected:** 40+ tests passing with gas reports

### Test Coverage

```bash
npm run coverage
```

### View Gas Report

```bash
npm run gas-report
```

Shows gas consumption for each smart contract function

---

## 🎓 Key Blockchain Concepts

### 1. What is Blockchain?

A **distributed ledger** - multiple computers store identical copies of transaction history. Cannot be tampered with because:
- Changes to one computer's copy are immediately detected
- Majority consensus required for any change
- Cryptographic hashing links all blocks together

### 2. Smart Contracts

Self-executing code on blockchain that:
- Runs exactly as written
- Cannot be stopped or changed
- Automatically enforces business logic
- Transparent and auditable

### 3. Cryptographic Hashing (SHA-256)

Function that:
- Converts any input to fixed 256-bit output
- Always produces same output for same input (deterministic)
- Cannot be reversed
- One-bit change produces completely different hash

```
Input 1:  "SKU-001Authentic"  → Hash: 0x5f8c...
Input 2:  "SKU-002Authentic"  → Hash: 0x8a2c...
(different inputs = different hashes)
```

### 4. Immutability

Once written, blockchain data cannot be changed because:
- New blocks reference previous block hash
- Changing old block changes its hash
- All subsequent blocks become invalid
- Network consensus detects tampering

### 5. Decentralization

No single authority controls data:
- Multiple independent nodes store data
- Consensus required for any change
- Transparent to all participants
- No single point of failure

### 6. Access Control

Smart contracts enforce permissions:
- Only authorized addresses can register products
- Only owner can authorize new manufacturers
- Anyone can verify (read) products
- Demonstrates blockchain-based authorization

### 7. MetaMask & Digital Wallets

Wallets:
- Store private keys securely
- Sign transactions with private key (proof of ownership)
- Connect to blockchain through public key
- Allow user to approve actions

### 8. Transactions & Blocks

Each action:
- Creates transaction with unique hash
- Is mined into a block
- Gets block number and timestamp
- Becomes permanent part of blockchain

---

## ⚠️ Limitations & Important Notes

### 1. Verifies Registration, Not Physical Authenticity

```
✓ System can verify: "This product data is registered on blockchain"
✗ System cannot verify: "This physical product is genuine"

Why? Counterfeiters can also register fake products
Solution: Combine with physical security features (holograms, packaging)
```

### 2. Private Key Security

If manufacturer's private key is compromised:
- Attacker can register fake products
- Cannot be recovered

**Protection:**
- Use hardware wallets (Ledger, Trezor)
- Multi-signature wallets
- Secure key management practices

### 3. Network Assumptions

Assumes blockchain network is secure:
- Ethereum: Billions in security infrastructure
- 51% attack cost: Tens of billions of dollars
- Safe for this project's purposes

### 4. Off-Chain Data Trust

Product hash is computed off-chain (frontend). Requires:
- Frontend code is trustworthy
- Same hashing algorithm for register and verify
- User enters same product data both times

### 5. Scalability

Current contract stores all products on-chain:
- Fine for mini-project
- Production uses: Layer 2, sidechains, sharding
- Gas costs increase with data size

### 6. Privacy

All on-chain data is public:
- Anyone can see all products registered
- Manufacturer addresses visible
- Solution: Zero-knowledge proofs, privacy chains

---

## 🔮 Future Scope

1. **Supply Chain Tracking** - Track product journey from manufacturer to customer
2. **Mobile App** - React Native/Flutter with QR scanner
3. **Multi-Signature** - Multiple parties must approve registration
4. **NFT Integration** - Mint NFT for each product
5. **Cross-Chain** - Deploy to Polygon, Arbitrum for lower fees
6. **DAO Governance** - Manufacturers vote on system changes
7. **Automated Recalls** - Mass deactivate batches
8. **Advanced AI** - Computer vision for product verification
9. **Compliance** - Integrate with EU tracking regulations
10. **Analytics Dashboard** - Statistics and reporting

---

## 📚 References

### Documentation

- Ethereum Docs: https://ethereum.org/en/developers/docs/
- Solidity: https://docs.soliditylang.org/
- Hardhat: https://hardhat.org/docs
- ethers.js: https://docs.ethers.org/v5/
- MetaMask: https://docs.metamask.io/

### Learning

- CryptoZombies: https://cryptozombies.io/
- OpenZeppelin Contracts: https://docs.openzeppelin.com/
- Ethereum Whitepaper: https://ethereum.org/en/whitepaper/

### Original Project Reference

This project was adapted from existing anti-counterfeit blockchain implementations and simplified for educational purposes. Focus shifted from complex supply chain tracking to core blockchain concepts suitable for academic mini-projects.

---

## 📄 Important Academic Notes

### For Your Viva Presentation

Be prepared to explain:
1. ✅ Why blockchain solves the counterfeit problem
2. ✅ How smart contracts work
3. ✅ What SHA-256 hashing provides
4. ✅ How immutability works
5. ✅ Limitations and realistic use cases
6. ✅ Difference between decentralized and centralized systems
7. ✅ Role of MetaMask and digital wallets
8. ✅ How your project demonstrates blockchain concepts

### Key Talking Points

- **Core Technology:** Smart contracts store and verify product data immutably
- **Verification Method:** Deterministic SHA-256 hashing ensures data integrity
- **Innovation:** Combines blockchain immutability with cryptographic hashing
- **Practical Value:** Provides transparent, tamper-proof product registration
- **Limitations:** Honest about what blockchain can and cannot verify

See **VIVA_NOTES.md** for detailed viva preparation.

---

## 🎓 Learning Outcomes

After completing this project, you understand:

- ⭐ How smart contracts enable trustless verification
- ⭐ Cryptographic hashing for data integrity
- ⭐ Blockchain immutability and security
- ⭐ Access control and permissions on blockchain
- ⭐ Transaction structure and block generation
- ⭐ Event-driven architecture in smart contracts
- ⭐ Front-end blockchain interaction with ethers.js
- ⭐ Smart contract testing strategies
- ⭐ Gas optimization and cost analysis

---

## ✅ Project Success Checklist

- [ ] Hardhat blockchain runs without errors
- [ ] Smart contract compiles successfully
- [ ] All 40+ tests pass
- [ ] Contract deploys with clear console output
- [ ] Frontend connects to MetaMask
- [ ] Can register product and get transaction hash
- [ ] Can verify product and see result
- [ ] Blockchain details display correctly
- [ ] Can explain each component in detail
- [ ] Ready to demonstrate in viva

---

**Status:** ✅ Complete and Academic-Ready  
**Last Updated:** September 2024  
**For:** Blockchain Technology Mini-Project Viva
