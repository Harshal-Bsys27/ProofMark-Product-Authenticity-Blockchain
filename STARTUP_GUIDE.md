# Project Startup Guide

## Quick Start (3 Steps)

### Recommended One-Command Start

From the project root:

```powershell
powershell -ExecutionPolicy Bypass -File .\start-demo.ps1
```

Import Hardhat Account #0 into MetaMask once. It is automatically funded and authorized whenever the local node starts.

Follow these steps to run the complete product authenticity verification system:

### Step 1: Start the Blockchain (Terminal 1)

```bash
cd proofmark-contracts
npm install
npm run node
```

**What this does:**
- Starts a local Ethereum blockchain on your computer
- Runs on `http://localhost:8545`
- Creates 10 test accounts with fake ETH
- Keeps running in the background

**Expected output:**
```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/
```

### Step 2: Deploy Smart Contract (Terminal 2)

Keep Terminal 1 running, open a new terminal:

```bash
cd proofmark-contracts
npm run deploy
```

**What this does:**
- Compiles the Solidity smart contract
- Deploys it to the local blockchain
- Saves contract address for frontend to use
- Shows the deployment details

**Expected output:**
```
✅ ProductAuthenticity deployed to: 0x5FbDB2315678afccB33F7d3c0ab96d6D2e2B9bfd
📦 Contract saved to contractDeployment.json
```

**Important:** Copy the contract address from the output. You'll need it in Step 3.

### Step 3: Start the Frontend (Terminal 3)

Keep Terminals 1 & 2 running, open a new terminal:

```bash
cd proofmark-frontend
npm install
npm start
```

**What this does:**
- Starts React development server
- Opens browser at `http://localhost:3000`
- Loads the web interface
- Ready to interact with blockchain

**Expected output:**
```
webpack compiled successfully
Compiled successfully!

You can now view ProofMark in the browser.
Local: http://localhost:3000
```

---

## Complete Step-by-Step Guide

### Prerequisites

Before starting, ensure you have:
- ✅ Node.js v16+ installed (`node --version`)
- ✅ npm v8+ installed (`npm --version`)
- ✅ MetaMask browser extension installed
- ✅ All project files in place

### Terminal Setup

You need 3 terminals open simultaneously:
- **Terminal 1:** Blockchain (never close)
- **Terminal 2:** Deployment script (one-time, can close after deploy)
- **Terminal 3:** Frontend (development server)

### Detailed Setup Instructions

#### Terminal 1: Start Local Blockchain

```bash
# Navigate to smart contract folder
cd c:\Users\HARSHAL BARHATE\OneDrive\Desktop\Product-Authenticity-Blockchain\proofmark-contracts

# Install dependencies (first time only)
npm install

# Start local blockchain
npm run node
```

**Keep this terminal running!** It maintains the blockchain throughout your session.

**What's happening:**
- Hardhat is running a local Ethereum blockchain
- Blockchain runs at: `http://localhost:8545`
- 10 pre-funded test accounts are available
- All transactions are instant (no real miners)
- Data persists until you close this terminal

---

#### Terminal 2: Deploy Smart Contract

```bash
# In a NEW terminal, navigate to smart contract folder
cd c:\Users\HARSHAL BARHATE\OneDrive\Desktop\Product-Authenticity-Blockchain\proofmark-contracts

# Deploy the contract
npm run deploy
```

**Output will show:**
```
🚀 Deploying ProductAuthenticity contract...

Deployer address: 0x8ba1f109551bD432803012645Ac136ddd64DBA72
Deployer balance: 10000 ETH

✅ ProductAuthenticity deployed to: 0x5FbDB2315678afccB33F7d3c0ab96d6D2e2B9bfd
📄 Deployment receipt:
   Block: 1
   Gas used: 850000
   Transaction Hash: 0x1234...

📦 Deployment info saved to contractDeployment.json
```

**Important Actions:**
1. Copy the contract address (starts with 0x)
2. You'll use this address in the frontend configuration

**After this step completes, you can close Terminal 2** (or let it keep running, doesn't matter).

For a custom MetaMask wallet, run this instead of `npm run deploy`:

```powershell
$env:MANUFACTURER_ADDRESS = "0xYOUR_METAMASK_WALLET"
npm run setup-demo
Remove-Item Env:MANUFACTURER_ADDRESS
```

This deploys the contract, authorizes the wallet, and adds 100 local test ETH.

---

#### Terminal 3: Start Frontend

```bash
# In a NEW terminal, navigate to frontend folder
cd c:\Users\HARSHAL BARHATE\OneDrive\Desktop\Product-Authenticity-Blockchain\proofmark-frontend

# Install dependencies (first time only)
npm install

# Start development server
npm start
```

**Output will show:**
```
Compiled successfully!

You can now view ProofMark in the browser.
Local: http://localhost:3000
```

**Browser opens automatically** to `http://localhost:3000` with the home page.

---

### MetaMask Configuration

#### 1. Add Local Network to MetaMask

In MetaMask:
1. Click network dropdown (top left) → "Add a custom network"
2. Enter these details:
   - **Network Name:** Hardhat Local
   - **RPC URL:** http://127.0.0.1:8545
   - **Chain ID:** 1337
   - **Currency Symbol:** ETH
3. Click "Save"

#### 2. Import Test Account

From Terminal 1, you'll see account private keys. To import:
1. In MetaMask: Account → "Add account" → "Import account"
2. Paste private key from Terminal 1
3. Click "Import"

Or use the first default account:
- **Private Key:** 0xac0974bec39a17e36ba4a6b4d238ff944bacb476c6b8d6c1f02960247590a203

Now your MetaMask is connected to the local blockchain!

---

## Full Project Workflow

### Register a Product (Manufacturer Role)

1. **Go to home page:** http://localhost:3000
2. **Click "Connect Wallet"** → MetaMask popup → "Connect"
3. **Click "Register Product"** in the quick start section
4. **Fill in product details:**
   - Product ID: `SKU-001`
   - Product Name: `Authentic Smartphone`
   - Batch Number: `BATCH-2024-01`
5. **Click "Generate SHA-256 Hash"**
   - Shows the cryptographic hash
6. **Click "Register on Blockchain"**
   - MetaMask popup appears
   - Review transaction details
   - Click "Confirm"
7. **Wait for confirmation** (few seconds)
8. **See success message** with transaction hash

### Verify a Product (Customer Role)

1. **Go to home page:** http://localhost:3000
2. **Click "Verify Product"**
3. **Enter same product details as registered:**
   - Product ID: `SKU-001`
   - Product Name: `Authentic Smartphone`
   - Batch Number: `BATCH-2024-01`
4. **Click "Generate SHA-256 Hash"**
5. **Click "Verify on Blockchain"**
6. **See result:**
   - ✅ AUTHENTIC (if hash matches)
   - ❌ NOT VERIFIED (if hash doesn't exist)

### View Blockchain Details

1. **Go to home page:** http://localhost:3000
2. **Click "View Blockchain Details"**
3. **See:**
   - Network information
   - Smart contract details
   - Transaction history
   - Blockchain concepts explained

---

## Troubleshooting

### Problem: MetaMask can't connect to localhost

**Solution:**
1. Make sure Terminal 1 (blockchain) is still running
2. Verify http://localhost:8545 is accessible
3. Restart MetaMask browser extension
4. Clear browser cache

### Problem: Transaction fails with "insufficient funds"

**Solution:**
1. Import a test account with ETH from Terminal 1
2. Default account has plenty of fake ETH
3. Each transaction costs minimal gas (~50000 units)

### Problem: "Contract not found at address"

**Solution:**
1. Make sure you deployed contract (Terminal 2)
2. Copy the correct contract address from deployment output
3. Update .env file with correct address
4. Restart frontend (Ctrl+C, then `npm start`)

### Problem: Frontend won't start

**Solution:**
```bash
# Clear node modules and reinstall
rm -r node_modules
npm install
npm start
```

### Problem: Blockchain crashes or restarts

**Solution:**
1. Contracts are redeployed with new addresses
2. Previous registrations are lost (test data only)
3. Restart Terminal 1 and Terminal 2
4. Frontend will still work after redeployment

### Problem: "Module not found" error

**Solution:**
```bash
# Install missing dependencies
npm install

# If still failing, clear cache
npm cache clean --force
npm install
```

---

## Development Commands

### Smart Contract Commands

```bash
cd proofmark-contracts

# Compile contract
npm run compile

# Run tests
npm run test

# Generate gas report
npm run gas-report

# Run local node
npm run node

# Deploy to local blockchain
npm run deploy

# Deploy to Sepolia testnet
npm run deploy:sepolia

# Generate test coverage report
npm run coverage

# Clean build artifacts
npm run clean
```

### Frontend Commands

```bash
cd proofmark-frontend

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Eject configuration (advanced)
npm run eject
```

---

## File Structure

```
Product-Authenticity-Blockchain/
├── README.md                          # Project overview
├── VIVA_NOTES.md                      # Viva preparation guide
├── .env.example                       # Environment template

├── proofmark-contracts/                # Blockchain
│   ├── contracts/
│   │   └── ProductAuthenticity.sol    # Smart contract
│   ├── test/
│   │   └── ProductAuthenticity.test.js # Tests (40+ tests)
│   ├── scripts/
│   │   └── deploy.js                  # Deployment script
│   ├── package.json                   # Dependencies
│   └── hardhat.config.ts              # Hardhat configuration
│
└── proofmark-frontend/                 # Frontend
    ├── public/
    │   └── index.html                 # HTML entry
    ├── src/
    │   ├── pages/                     # 4 essential pages
    │   │   ├── Home.jsx               # Landing page
    │   │   ├── RegisterProduct.jsx    # Registration flow
    │   │   ├── VerifyProduct.jsx      # Verification flow
    │   │   └── BlockchainDetails.jsx  # Blockchain info
    │   ├── utils/
    │   │   └── web3.js                # Web3 utilities
    │   ├── css/
    │   │   ├── pages.css              # Page styles
    │   │   └── ... (other CSS)
    │   ├── App.js                     # Main app
    │   ├── App.css                    # App styles
    │   └── index.js                   # Entry point
    ├── package.json                   # Dependencies
    └── tsconfig.json                  # TypeScript config
```

---

## Key Technologies

| Component | Technology | Version |
|-----------|-----------|---------|
| Smart Contract | Solidity | 0.8.17 |
| Blockchain | Hardhat | 2.14+ |
| Testing | Mocha + Chai | Latest |
| Frontend | React | 18.2+ |
| Web3 | ethers.js | 5.7+ |
| Build Tool | Create React App + CRACO | Frontend development and production build |
| Wallet | MetaMask | Browser extension |
| Hashing | SHA-256 | crypto module |

---

## Performance Tips

1. **Keep blockchain running** in Terminal 1
2. **Don't close MetaMask** between transactions
3. **Refresh page** if transactions don't show immediately
4. **Use test accounts** with plenty of ETH
5. **Monitor browser console** for errors (F12)

---

## Security Notes

⚠️ **This is an academic project for learning:**
- Uses test accounts and fake ETH
- Smart contract NOT audited for production
- Private keys visible in terminal (test only)
- No password protection on test accounts
- All data is temporary and ephemeral

**Never use production private keys in this setup!**

---

## Next Steps After Setup

1. ✅ Register a test product
2. ✅ Verify the product
3. ✅ Try verifying a non-existent product
4. ✅ View blockchain details
5. ✅ View transaction hashes
6. ✅ Read VIVA_NOTES.md for explanation
7. ✅ Review smart contract code
8. ✅ Run tests to see them pass

---

## Getting Help

1. **Smart Contract Issues:** Check `test/ProductAuthenticity.test.js`
2. **Frontend Issues:** Check browser console (F12)
3. **Blockchain Issues:** Check Terminal 1 output
4. **General Questions:** Read README.md and VIVA_NOTES.md

---

## Tips for Viva

During viva demonstration:
1. Have all 3 terminals running
2. Have MetaMask open and connected
3. Demo should flow: Home → Register → Verify → Blockchain Details
4. Be ready to explain each step
5. Keep VIVA_NOTES.md nearby for reference

Good luck! 🚀
