# ProofMark Team Presentation Script

## Team Role Distribution
- Harshal: opening, problem statement, technology overview, architecture explanation, and final conclusion
- Hardik: objective setting, smart contract logic, manufacturer registration, and blockchain trust model
- Jeet: frontend workflow, product registration flow, QR scanning, and verification process
- Kavya: demo explanation, practical use case, real-world impact, and audience-friendly summary

### Technology Mapping by Member
- Harshal: React frontend architecture, blockchain workflow explanation, overall system design, and technical narrative
- Hardik: Solidity, Hardhat, smart contract deployment, manufacturer authorization logic, and on-chain data model
- Jeet: React UI, QR scanning flow, verification form logic, customer-side UX, and application workflow
- Kavya: demo narration, product use-case explanation, audience-friendly summary, and practical value of the system

### Contribution of Each Member
- Harshal: introduced the project idea, explained the main problem and architecture, and closed the presentation with the overall conclusion.
- Hardik: handled the core smart contract logic, product registration rules, and blockchain trust concept.
- Jeet: built and explained the frontend flow, QR verification process, and user-facing registration experience.
- Kavya: simplified the demo, highlighted the real-world usefulness, and presented the practical impact in an easy-to-understand way.

> Important: Harshal starts the presentation and also closes it, but the remaining sections are divided so that Hardik, Jeet, and Kavya each speak in their own part of the flow. The goal is to keep the presentation balanced and natural, without any single person dominating the entire talk.

---

## Full Presentation Script (7–8 minutes)

### 1. Opening by Harshal (Harshal, 15%)
**Harshal:**
"Good morning everyone. I am Harshal, and today I am presenting our project, ProofMark: Product Authenticity Verification Using Blockchain. We are a team of four members: Harshal, Hardik, Jeet, and Kavya. Our project focuses on solving a real-world problem that affects both businesses and customers—counterfeit and fake products."

"In today’s market, customers often trust the packaging and labels, but they cannot always be sure whether the product is genuine. This is especially risky in sectors like medicine, food, electronics, and luxury goods. So we developed a system where product authenticity can be verified using blockchain technology."

---

### 2. Problem Statement and Motivation (Harshal, 15%)
**Harshal:**
"The main problem we targeted is that counterfeit products are increasing and can cause financial loss, health risks, and trust issues for both manufacturers and consumers. Traditional systems often depend on centralized databases or physical labels, which are easy to manipulate or duplicate."

"A product should not only have a label; it should also have a trustworthy digital identity. In our project, we store a secure, tamper-resistant record of product data on blockchain so the product can be verified transparently and reliably."

---

### 3. Project Objective and Scope (Hardik, 15%)
**Hardik:**
"The objective of ProofMark is simple: to register a product on the blockchain and allow customers to verify whether it is authentic or fake. We want to build a system where only authorized manufacturers can register products, and anyone can verify the product status using a secure hash-based process."

"This project combines blockchain, smart contracts, front-end application logic, and QR-based verification into one practical system. It not only demonstrates technical learning but also solves a meaningful real-life problem."

---

### 4. Technologies Used (Harshal, 15%)
**Harshal:**
"For this project, we used a combination of technologies. The front-end is built using React, which helps us create a smooth user interface. For blockchain interaction, we used MetaMask, which allows users to connect their wallet and perform blockchain transactions."

"For the smart contract, we used Solidity, which is the main language for writing blockchain logic on Ethereum-compatible networks. Hardhat was used for local blockchain testing and deployment, while Sepolia was used for public deployment. The product data is protected using hashing, especially SHA-256, so sensitive product information is not directly exposed."

"On the application side, React handles the interface and user actions, MetaMask handles wallet connectivity and transaction signing, Solidity defines the rules on-chain, and Hardhat/Sepolia provide the blockchain environment for execution. So in simple terms, the frontend collects the data, the smart contract stores the trusted record, and the blockchain ensures that the record is immutable and transparent."

---

### 5. System Architecture and Overall Flow (Hardik + Jeet, 25%)
**Hardik:**
"The architecture of our system can be understood in four layers. First is the user interface, where the manufacturer enters product details. Second is the wallet layer, where MetaMask helps sign transactions. Third is the blockchain layer, where the smart contract is deployed and runs logic. Fourth is the verification layer, where the customer checks whether the product is genuine."

**Jeet:**
"When the manufacturer enters details such as the product ID, name, batch number, and manufacturer details, the frontend calculates a unique hash from these values. This hash acts like a digital fingerprint. The same hash is then sent to the smart contract for registration. Once the transaction is confirmed, the product is recorded on-chain."

"Later, when the customer wants to verify the product, the app generates the same hash again and checks the contract for a matching product. If the record exists and is active, the product is treated as authentic."

---

### 6. Smart Contract Logic and Manufacturer Registration (Hardik, 15%)
**Hardik:**
"The core logic is written in Solidity inside the smart contract. The contract contains functions for product registration, product verification, and manufacturer authorization. The important point is that only an authorized manufacturer can register a product. This prevents unauthorized users from writing fake product records to the blockchain."

"The contract stores a product record that contains fields like product ID, name, batch number, unique hash, manufacturer address, timestamp, and active status. These values are stored on-chain, which means they are not easy to modify after deployment."

"When the manufacturer registers a product, the system checks whether the product is valid and whether the manufacturer is authorized. If everything is correct, the record is stored permanently. This is the key idea behind trust in blockchain-based applications."

---

### 7. Why Hashing is Important (Jeet, 10%)
**Jeet:**
"We use hashing instead of storing raw product data directly. The hash acts as a unique fingerprint of the product details. Even a small change in the product information leads to a completely different hash. This makes it easier to compare values and validate authenticity without exposing the full data on-chain."

"This also helps in tamper detection. If someone changes the product details or tries to duplicate the identity, the hash will not match the stored blockchain record."

---

### 8. Frontend and QR Verification Workflow (Jeet, 15%)
**Jeet:**
"From a user perspective, the app is designed to be simple and practical. The manufacturer connects MetaMask, enters the product information, and clicks the Register button. The app then calculates the hash and submits the transaction to the blockchain. Once the transaction is confirmed, the product is registered successfully."

"For the customer, the flow is even simpler. They can either scan the QR code, upload the QR image, or manually enter the product details. The QR is scanned using the browser-based camera access in the application, which reads the product data encoded in the QR. That value is then sent back to the app, where the same hash generation logic is applied to the product details."

"This is important because we are not using OpenCV or a separate image-processing library for detection. Instead, we use the web app's QR scanning capability combined with the same hashing logic already used during registration. The app then fetches the stored record from the blockchain and compares it with the newly generated hash. If both match, the app shows that the product is authentic."

"This makes the system easy to use while still showing the power of blockchain verification in real life."

---

### 9. Demo Explanation by Kavya (Kavya, 10%)
**Kavya:**
"In the demo, first the manufacturer connects the wallet and selects the network. Then they fill in the product details and register the product. The app creates a hash and sends the transaction to the blockchain. After confirmation, the product gets stored securely and the QR code is generated."

"From a technology point of view, the front-end is built using React, the wallet interaction is handled by MetaMask, the blockchain logic is managed by Solidity, and the testing and deployment are done using Hardhat and Sepolia. So even though the explanation is simple, the system is actually a combination of several technologies working together."

"After that, the customer opens the verification page and scans the QR code or enters the product details. The app checks the blockchain and tells whether the product is authentic. So in simple words, the product is verified by comparing its digital fingerprint with the one stored on the blockchain."

"This demonstrates how blockchain can make a product record more trusted and transparent in a practical way."

---

### 10. Why This Project Is Useful (Kavya, 10%)
**Kavya:**
"This project is useful because it shows a real-world application of blockchain in product security. It can be used in industries where authenticity matters, such as medicine, consumer goods, electronics, and luxury products. Instead of trusting labels alone, people can verify the record directly on-chain."

"It also helps customers feel more confident while buying products and helps brands protect their reputation. The idea is easy to understand and also scalable for future real-world adoption."

---

### 11. Future Scope and Conclusion (Harshal, 15%)
**Harshal:**
"This project has strong future scope. We can extend it to supply chain tracking, where every movement of the product is recorded from manufacturer to retailer to customer. We can also add mobile app support, product recall systems, and better dashboards for product analytics."

"In the future, this system could be expanded to support larger industries and more secure manufacturer management. But the core idea remains the same: create a trusted digital identity for each product and verify it using blockchain."

"So in conclusion, ProofMark is not just a mini-project. It demonstrates how blockchain can solve a practical problem by improving trust, transparency, and product security."

---

## Shorter Viva Version

**Harshal:**
"Our project is ProofMark, a blockchain-based product authenticity system. It solves the real-world problem of counterfeit products by creating a secure digital identity for each product using blockchain and hashing."

**Hardik:**
"The Solidity smart contract stores product records and allows only authorized manufacturers to register them. This ensures that fake or unauthorized entries cannot be added to the system."

**Jeet:**
"The frontend collects product details, generates the hash, and allows users to verify products using a QR code or manual entered data. The result is shown quickly and clearly to the user."

**Kavya:**
"So in simple terms, the customer can trust the product by checking whether its digital record matches the one stored on blockchain."

---

## Demo Flow to Present
1. Open the application
2. Show the home page and project concept
3. Connect MetaMask wallet
4. Go to Register Product
5. Enter product details and submit
6. Show blockchain transaction confirmation
7. Show QR code generation
8. Open Verify Product page
9. Scan or enter product details
10. Show AUTHENTIC result
11. Explain the meaning of the blockchain verification

---

## Likely Viva Questions and Strong Answers

### Harshal should answer
- What is the problem your project solves?
- Why blockchain is suitable for authenticity?
- What technologies did you use?
- Why do we use hashing instead of storing raw product data?
- How is the full product flow connected?

### Hardik should answer
- What does the smart contract do?
- Why is manufacturer authorization important?
- What is the role of immutability in this project?
- How does the contract prevent fake records?

### Jeet should answer
- What happens in the frontend?
- How does QR verification work without using OpenCV?
- How is the QR value converted into a hash and compared with the blockchain record?
- Why is the app simple for customers?
- What makes the workflow user-friendly?

### Kavya should answer
- Why is this useful in real life?
- Which sectors can benefit from this?
- What is the main advantage to the customer?
- How do the technologies work together in the demo?
- What future improvements can be added?

---

## Presentation Strategy
- Harshal should start and finish strongly.
- Harshal can also step in during technical questions if the examiner asks deeper logic.
- Hardik should explain Solidity and contract logic clearly but not too long.
- Jeet should explain the product workflow and customer experience.
- Kavya should give a simple and calm explanation, not too technical.
- Keep the speech clear, confident, and practical.

---

## Final Team Positioning
- Harshal: lead presenter, technical explanation, project flow, final summary
- Hardik: blockchain logic and smart contract details
- Jeet: app workflow and user verification flow
- Kavya: simple demo narration and real-world impact

This division works well because Harshal carries the technical lead, Hardik and Jeet handle the moderate parts, and Kavya stays comfortable with the easier explanation while still contributing meaningfully to the presentation.
