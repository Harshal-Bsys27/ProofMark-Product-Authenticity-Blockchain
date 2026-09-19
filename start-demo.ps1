param(
  [string]$ManufacturerAddress = '0x7F3faBF7D7170d6aF9C90a0821b11F0a0A10CB69'
)
$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$contracts = Join-Path $root 'proofmark-contracts'
$frontend = Join-Path $root 'proofmark-frontend'
$demoWallet = $ManufacturerAddress

Write-Host 'Starting ProofMark local blockchain...' -ForegroundColor Cyan
Start-Process powershell -ArgumentList @(
  '-NoExit',
  '-Command',
  "Set-Location '$contracts'; npm run node"
)

Write-Host 'Waiting for Hardhat RPC at http://127.0.0.1:8545 ...' -ForegroundColor DarkCyan
while (-not (Test-NetConnection -ComputerName 127.0.0.1 -Port 8545 -InformationLevel Quiet -WarningAction SilentlyContinue)) {
}

Write-Host 'Preparing contract, authorization, and test funds...' -ForegroundColor Cyan
Set-Location $contracts
$env:MANUFACTURER_ADDRESS = $demoWallet
npm run setup-demo
Remove-Item Env:MANUFACTURER_ADDRESS -ErrorAction SilentlyContinue

Write-Host 'Starting ProofMark frontend...' -ForegroundColor Cyan
Start-Process powershell -ArgumentList @(
  '-NoExit',
  '-Command',
  "Set-Location '$frontend'; npm start"
)

Write-Host ''
Write-Host 'ProofMark is ready.' -ForegroundColor Green
Write-Host 'Open the frontend URL printed by the frontend terminal.'
Write-Host "Use MetaMask wallet $demoWallet on Hardhat Local, chain ID 1337." -ForegroundColor Yellow
