# ProofMark Demo Runbook

Use this script for a reliable classroom or viva demonstration.

## 1. Before the Demo

Install:

- Node.js and npm
- MetaMask

Install project dependencies once:

```powershell
cd "C:\Users\HARSHAL BARHATE\OneDrive\Desktop\Product-Authenticity-Blockchain\proofmark-contracts"
npm install
cd ..\proofmark-frontend
npm install
```

## 2. Start the Local Blockchain

For the easiest repeatable demo, run this from the project root:

```powershell
powershell -ExecutionPolicy Bypass -File .\start-demo.ps1
```

It opens the blockchain and frontend terminals, waits for the RPC, deploys the contract, updates the frontend contract address, and prepares the configured manufacturer wallet.

To use a different MetaMask wallet:

```powershell
powershell -ExecutionPolicy Bypass -File .\start-demo.ps1 -ManufacturerAddress "0xYOUR_WALLET_ADDRESS"
```

Use the manual steps below only when you want to control each terminal separately.

Open Terminal 1:

```powershell
cd "C:\Users\HARSHAL BARHATE\OneDrive\Desktop\Product-Authenticity-Blockchain\proofmark-contracts"
npm run node
```

Keep this terminal open. It provides the local blockchain and test accounts.

## 3. Prepare the Demo Chain

Open Terminal 2:

```powershell
cd "C:\Users\HARSHAL BARHATE\OneDrive\Desktop\Product-Authenticity-Blockchain\proofmark-contracts"
npm run setup-demo
```

By default this deploys the contract for the configured demo wallet, authorizes it, funds it with 100 local test ETH, writes `contractDeployment.json`, and updates `proofmark-frontend/.env.local`.

To use a different MetaMask wallet, set `MANUFACTURER_ADDRESS` before running the command. The script will authorize and fund that wallet with 100 test ETH.

`npm run deploy` also authorizes and funds the default demo wallet. Set `MANUFACTURER_ADDRESS` when using another wallet.

## 4. Configure the Manufacturer Wallet

MetaMask must use:

```text
Network: Hardhat Local
RPC URL: http://127.0.0.1:8545
Chain ID: 1337
Currency: ETH
```

Import a Hardhat test account into MetaMask using a test-only private key printed by Terminal 1:

```text
0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

Never use this public test key on a real network.

The default configured demo wallet is:

```text
0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
```

The `setup-demo` command above authorizes and funds the configured wallet automatically after every Hardhat restart.

To authorize manually:

```powershell
$env:MANUFACTURER_ADDRESS = "0x7F3faBF7D7170d6aF9C90a0821b11F0a0A10CB69"
npm run authorize
Remove-Item Env:MANUFACTURER_ADDRESS
```

If the wallet has no test ETH:

```powershell
$env:RECIPIENT_ADDRESS = "0x7F3faBF7D7170d6aF9C90a0821b11F0a0A10CB69"
npm run fund
Remove-Item Env:RECIPIENT_ADDRESS
```

## 5. Start the Frontend

Open Terminal 3:

```powershell
cd "C:\Users\HARSHAL BARHATE\OneDrive\Desktop\Product-Authenticity-Blockchain\proofmark-frontend"
npm start
```

Open the displayed local URL, usually `http://localhost:3000`.

## 6. Registration Demonstration

Use these values:

```text
Product ID: SKU-001
Product Name: Creating
Batch Number: BATCH-2026-04
```

Demo steps:

1. Open **Register**.
2. Connect MetaMask.
3. Enter the three values.
4. Click **Generate SHA-256 Hash**.
5. Explain that the hash is a deterministic digital fingerprint.
6. Click **Register on Blockchain**.
7. Review the MetaMask transaction on Hardhat Local.
8. Confirm the transaction.
9. Point out the transaction hash, block number, manufacturer address, and gas used.
10. Download the generated QR code from the registration result.

Expected result: the product is registered successfully.

## 7. Verification Demonstration

1. Open **Verify**.
2. Upload the downloaded QR image, use the camera scanner, or enter the exact same values.
3. For manual entry, generate the hash and click **Verify on Blockchain**.
4. Point out the `AUTHENTIC` result, product record, manufacturer, registration time, and active status.

Explain that verification uses the read-only `getProduct()` call, so MetaMask does not request a transaction or gas fee.

## 8. Tamper Demonstration

Change only the batch number:

```text
BATCH-2026-05
```

Generate the hash and verify again. The result should be `NOT VERIFIED` because the changed input produces a different SHA-256 fingerprint.

This is the strongest short demonstration of the system's core idea.

## 9. Blockchain Details Demonstration

Open **Ledger** and show:

- Hardhat Local network
- Chain ID `1337`
- Current block
- Gas price
- ProductAuthenticity contract address
- Contract functions
- Transaction search

Paste a registration transaction hash into **Search Transaction** to display its status, block number, sender, receiver, gas used, value, and timestamp.

## 10. Common Recovery Steps

### Wrong network

Select Hardhat Local in MetaMask. Confirm the chain ID is `1337`.

### Unauthorized manufacturer

Restart with `start-demo.ps1 -ManufacturerAddress "0xCONNECTED_WALLET"`, or run the manual authorization flow using the connected wallet address.

### Insufficient funds

Run the `npm run fund` command. The ETH is local test ETH and has no real value.

### Contract not found

Keep Terminal 1 running and redeploy from Terminal 2. The deployment script updates `proofmark-frontend/.env.local`; restart the frontend afterward. A Hardhat restart creates a new chain state.

### Old frontend port

If port 3000 is busy, React offers another port such as 3001. Open the URL printed in the terminal.
