# ProofMark Viva Quick Guide

## 1. One-Minute Introduction

> ProofMark is a blockchain-based product authenticity verification system. An authorized manufacturer enters a product ID, product name, and batch number. The frontend generates a SHA-256 fingerprint and sends it to a Solidity smart contract through MetaMask. The contract stores the product record on an Ethereum-compatible blockchain. Later, anyone can enter the same details and perform a read-only lookup. If the generated fingerprint matches the stored record, the product is shown as authentic.

## 2. Problem Statement

Counterfeit products are difficult to verify using labels or centralized databases alone. A centralized database can be modified by an administrator or compromised by an attacker. Customers need a verifiable record that links product details to an authorized manufacturer.

## 3. Proposed Solution

ProofMark combines:

- React for the user interface
- ethers.js for browser-to-blockchain communication
- MetaMask for wallet connection and transaction signing
- Solidity for business rules
- Hardhat for the local Ethereum-compatible test network
- SHA-256 for deterministic product fingerprints

## 4. Explain the Architecture

Use this order during the presentation:

1. The user enters product details in React.
2. The browser creates a SHA-256 hash.
3. MetaMask signs a registration transaction.
4. The Solidity contract validates the manufacturer.
5. The contract stores the product record and emits an event.
6. A customer later generates the same hash.
7. The frontend queries the contract without sending a transaction.

## 5. Important Smart Contract Functions

### `registerProduct()`

A write function protected by `onlyAuthorizedManufacturer`. It rejects duplicate hashes and empty required fields, then stores the product and emits `ProductRegistered`.

### `verifyProduct()`

A read function. It checks whether the hash exists, whether the record is active, and returns the product details and a message.

### `authorizeManufacturer()`

An owner-only function. It adds a wallet address to `authorizedManufacturers`.

### `deactivateProduct()`

A manufacturer-or-owner function used for recall or deactivation scenarios.

## 6. Common Viva Questions

### Why use blockchain instead of a database?

A database can be controlled and modified by one organization. Blockchain provides a shared, append-oriented, auditable record. The manufacturer signs the write, and the contract enforces the authorization rule.

### Why use hashing?

The hash acts as a compact digital fingerprint. It is deterministic, one-way, and sensitive to small input changes. The system can compare fingerprints without needing to trust a centralized comparison service.

### Is the product image stored on the blockchain?

No. Images and other large or unnecessary fields are kept off-chain to control storage and gas costs. The essential identity fields and their hash are stored.

### Does verification cost gas?

No. Verification uses a read-only provider call. Registration and other state-changing functions require a signed transaction and gas.

### What happens if one character changes?

SHA-256 produces a different hash. The new hash will not match the registered mapping, so the product will be shown as not verified.

### Who can register a product?

Only addresses marked true in `authorizedManufacturers`. The deployer is authorized in the constructor, and the owner can authorize additional manufacturers.

### Where is the private key stored?

The private key remains inside MetaMask. The website requests a signature; it does not receive or store the private key.

### Is the current blockchain production-ready?

No. This implementation uses a local Hardhat network for demonstration. A production deployment would use a persistent public or private network, secure manufacturer onboarding, encrypted off-chain media storage, and stronger operational monitoring.

### Can blockchain prove the physical object is genuine?

No. It proves that matching details were registered by an authorized wallet. A counterfeit can copy printed details, so physical anti-counterfeit features should be combined with blockchain verification.

## 7. Strong Closing Statement

> The main contribution of ProofMark is the combination of deterministic hashing, wallet-based authorization, and immutable smart-contract storage. It does not claim to solve every counterfeit problem, but it creates a transparent and tamper-resistant registration proof that can be checked without paying gas.

## 8. Presentation Checklist

- Start the Hardhat node before opening the app.
- Confirm MetaMask uses Hardhat Local, chain ID `1337`.
- Deploy the contract after a fresh node restart.
- Authorize the demonstration wallet.
- Fund the wallet with local test ETH if necessary.
- Demonstrate one successful registration.
- Demonstrate one authentic verification.
- Change one field and demonstrate not verified.
- Show the transaction hash and Ledger page.
- Explain limitations honestly.
