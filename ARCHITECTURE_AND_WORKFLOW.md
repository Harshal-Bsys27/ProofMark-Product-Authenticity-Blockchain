# ProofMark Architecture and Workflow

## 1. Project Purpose

ProofMark is a blockchain-based product registration and verification system. An authorized manufacturer registers a product fingerprint on an Ethereum-compatible blockchain. A customer later enters the same product details and checks whether the generated fingerprint exists on-chain.

The system demonstrates:

- Cryptographic hashing with SHA-256
- Smart-contract access control
- Immutable blockchain storage
- Wallet-based transaction signing
- Read-only product verification

## 2. Current Project Structure

```text
Product-Authenticity-Blockchain/
├── proofmark-contracts/
│   ├── contracts/ProductAuthenticity.sol
│   ├── scripts/deploy.js
│   ├── scripts/authorize.js
│   ├── scripts/fund-account.js
│   └── test/ProductAuthenticity.test.js
├── proofmark-frontend/
│   └── src/
│       ├── components/AppShell.jsx
│       ├── pages/Home.jsx
│       ├── pages/RegisterProduct.jsx
│       ├── pages/VerifyProduct.jsx
│       ├── pages/BlockchainDetails.jsx
│       └── utils/web3.js
├── ARCHITECTURE_AND_WORKFLOW.md
├── DEMO_RUNBOOK.md
├── VIVA_QUICK_GUIDE.md
└── README.md
```

## 3. System Layers

### Frontend Layer

React provides the user interface. It collects product fields, generates the SHA-256 fingerprint in the browser, connects to MetaMask, submits transactions, and displays verification results.

### Wallet Layer

MetaMask exposes the user's account to the browser. It signs write transactions locally. The private key is never sent to ProofMark.

### Blockchain Layer

Hardhat runs a local Ethereum-compatible JSON-RPC network at `http://127.0.0.1:8545`.

Current local network settings:

```text
Network name: Hardhat Local
Chain ID: 1337
Currency: ETH
```

### Smart Contract Layer

`ProductAuthenticity.sol` stores the essential product record and enforces authorization rules.

## 4. Registration Workflow

```text
Manufacturer enters product details
        |
        v
Frontend combines productId + productName + batchNumber
        |
        v
ethers.js calculates SHA-256 hash
        |
        v
MetaMask asks the manufacturer to approve a transaction
        |
        v
ProductAuthenticity.registerProduct() executes
        |
        v
Contract checks authorizedManufacturers[msg.sender]
        |
        v
Product data, manufacturer, timestamp, and active status are stored
        |
        v
Transaction receipt and ProductRegistered event are created
```

### Stored Product Fields

- `productHash`
- `productId`
- `productName`
- `batchNumber`
- `manufacturer`
- `registrationTime`
- `isActive`

The contract rejects duplicate hashes, empty product IDs, and empty product names.

## 5. Verification Workflow

```text
User enters the product details
        |
        v
Frontend calculates the same SHA-256 hash
        |
        v
Frontend calls ProductAuthenticity.verifyProduct()
        |
        v
Contract checks the product mapping
        |
        v
Matching record -> AUTHENTIC
No matching record -> NOT VERIFIED
```

Verification is a read-only call. It does not create a transaction and does not require gas.

## 6. Access Control

The contract deployer becomes the owner and is automatically authorized. The owner can call `authorizeManufacturer(address)` to permit another wallet to register products.

The `onlyAuthorizedManufacturer` modifier protects `registerProduct()`.

If registration fails with:

```text
Only authorized manufacturers can register products
```

then the connected MetaMask address has not been authorized on the current Hardhat session.

## 7. Transaction Lookup

The Blockchain Details page accepts a transaction hash and uses ethers.js provider methods to read:

- Transaction hash
- From address
- To address
- ETH value
- Block number
- Confirmation status
- Gas used
- Block timestamp

This is also read-only.

## 8. Why the Hash Matters

SHA-256 is deterministic: the same input produces the same output. It also has an avalanche effect: changing one character changes the entire output.

For example:

```text
SKU-001 + Creating + BATCH-2026-04
```

and:

```text
SKU-001 + Creating + BATCH-2026-05
```

produce different fingerprints. That is why verification requires exact details.

## 9. What the System Does Not Claim

ProofMark verifies that a matching product record was registered by an authorized wallet. It does not physically inspect the product, prove that a copied label belongs to the original item, or replace packaging security features.

For a production system, the blockchain layer should be combined with secure QR codes, tamper-evident packaging, manufacturer onboarding, and a persistent public network.
