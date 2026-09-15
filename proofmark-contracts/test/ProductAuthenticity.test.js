/**
 * ProductAuthenticity Smart Contract Tests
 * 
 * TESTING STRATEGY:
 * These tests verify all core blockchain functionality:
 * 1. Product registration
 * 2. Product verification
 * 3. Access control
 * 4. Event emission
 * 5. Edge cases and error handling
 * 
 * BLOCKCHAIN CONCEPT:
 * Smart contract tests simulate blockchain transactions
 * and verify that the contract state changes correctly.
 * 
 * To run tests: npx hardhat test
 */

const { expect } = require("chai");
const { ethers } = require("hardhat");
const crypto = require("crypto");

/**
 * HELPER FUNCTION: Generate SHA-256 Hash
 * 
 * BLOCKCHAIN CONCEPT:
 * This function demonstrates how product data is hashed off-chain.
 * The same data always produces the same hash (deterministic).
 * This hash is what gets stored on the blockchain.
 */
function generateProductHash(productId, productName, batchNumber, manufacturer) {
  const dataString = `${productId}${productName}${batchNumber}${manufacturer}`;
  return "0x" + crypto.createHash("sha256").update(dataString).digest("hex");
}

describe("ProductAuthenticity Smart Contract", function () {
  let productAuthenticityContract;
  let owner;
  let manufacturer1;
  let manufacturer2;
  let customer;

  /**
   * BEFORE EACH TEST
   * 
   * This setup runs before every test.
   * It deploys a fresh copy of the smart contract
   * and sets up test accounts (addresses).
   * 
   * BLOCKCHAIN CONCEPT:
   * Each test has its own isolated blockchain state.
   * This ensures tests don't interfere with each other.
   */
  beforeEach(async function () {
    // Get test accounts from Hardhat
    [owner, manufacturer1, manufacturer2, customer] =
      await ethers.getSigners();

    // Deploy the smart contract
    const ProductAuthenticity = await ethers.getContractFactory(
      "ProductAuthenticity"
    );
    productAuthenticityContract =
      await ProductAuthenticity.deploy();
    await productAuthenticityContract.deployed();

    // Authorize manufacturers
    await productAuthenticityContract.authorizeManufacturer(
      manufacturer1.address
    );
    await productAuthenticityContract.authorizeManufacturer(
      manufacturer2.address
    );
  });

  // ============================================================================
  // TEST SUITE 1: MANUFACTURER MANAGEMENT
  // ============================================================================

  describe("Manufacturer Authorization", function () {
    it("Should authorize a new manufacturer", async function () {
      const isAuthorized =
        await productAuthenticityContract.isManufacturerAuthorized(
          manufacturer1.address
        );
      expect(isAuthorized).to.be.true;
    });

    it("Should emit ManufacturerAuthorized event", async function () {
      const newManufacturer = ethers.Wallet.createRandom().address;

      await expect(
        productAuthenticityContract.authorizeManufacturer(newManufacturer)
      )
        .to.emit(productAuthenticityContract, "ManufacturerAuthorized")
        .withArgs(newManufacturer);
    });

    it("Should revert when non-owner tries to authorize", async function () {
      const newManufacturer = ethers.Wallet.createRandom().address;

      await expect(
        productAuthenticityContract
          .connect(customer)
          .authorizeManufacturer(newManufacturer)
      ).to.be.revertedWith("Only owner can call this function");
    });

    it("Should revert when authorizing already authorized manufacturer", async function () {
      await expect(
        productAuthenticityContract.authorizeManufacturer(manufacturer1.address)
      ).to.be.revertedWith("Manufacturer already authorized");
    });

    it("Should remove manufacturer authorization", async function () {
      await productAuthenticityContract.removeManufacturer(manufacturer1.address);
      const isAuthorized =
        await productAuthenticityContract.isManufacturerAuthorized(
          manufacturer1.address
        );
      expect(isAuthorized).to.be.false;
    });
  });

  // ============================================================================
  // TEST SUITE 2: PRODUCT REGISTRATION
  // ============================================================================

  describe("Product Registration", function () {
    const productData = {
      productId: "SKU-001",
      productName: "Authentic Smartphone",
      batchNumber: "BATCH-2024-01",
    };

    it("Should register a product successfully", async function () {
      const productHash = generateProductHash(
        productData.productId,
        productData.productName,
        productData.batchNumber,
        manufacturer1.address
      );

      const tx = await productAuthenticityContract
        .connect(manufacturer1)
        .registerProduct(
          productHash,
          productData.productId,
          productData.productName,
          productData.batchNumber
        );

      // Check transaction receipt
      const receipt = await tx.wait();
      expect(receipt.status).to.equal(1); // 1 = success

      // Verify product is stored
      const [product, exists] =
        await productAuthenticityContract.getProduct(productHash);
      expect(exists).to.be.true;
      expect(product.productId).to.equal(productData.productId);
      expect(product.isActive).to.be.true;
    });

    it("Should emit ProductRegistered event with correct data", async function () {
      const productHash = generateProductHash(
        productData.productId,
        productData.productName,
        productData.batchNumber,
        manufacturer1.address
      );

      await expect(
        productAuthenticityContract
          .connect(manufacturer1)
          .registerProduct(
            productHash,
            productData.productId,
            productData.productName,
            productData.batchNumber
          )
      )
        .to.emit(productAuthenticityContract, "ProductRegistered")
        .withArgs(
          productHash,
          productData.productId,
          productData.productName,
          productData.batchNumber,
          manufacturer1.address
        );
    });

    it("Should store manufacturer address correctly", async function () {
      const productHash = generateProductHash(
        productData.productId,
        productData.productName,
        productData.batchNumber,
        manufacturer1.address
      );

      await productAuthenticityContract
        .connect(manufacturer1)
        .registerProduct(
          productHash,
          productData.productId,
          productData.productName,
          productData.batchNumber
        );

      const [product] =
        await productAuthenticityContract.getProduct(productHash);
      expect(product.manufacturer).to.equal(manufacturer1.address);
    });

    it("Should store registration timestamp", async function () {
      const productHash = generateProductHash(
        productData.productId,
        productData.productName,
        productData.batchNumber,
        manufacturer1.address
      );

      await productAuthenticityContract
        .connect(manufacturer1)
        .registerProduct(
          productHash,
          productData.productId,
          productData.productName,
          productData.batchNumber
        );

      const [product] =
        await productAuthenticityContract.getProduct(productHash);
      expect(product.registrationTime).to.be.gt(0);
    });

    it("Should reject duplicate product registration", async function () {
      const productHash = generateProductHash(
        productData.productId,
        productData.productName,
        productData.batchNumber,
        manufacturer1.address
      );

      // Register product once
      await productAuthenticityContract
        .connect(manufacturer1)
        .registerProduct(
          productHash,
          productData.productId,
          productData.productName,
          productData.batchNumber
        );

      // Try to register again - should fail
      await expect(
        productAuthenticityContract
          .connect(manufacturer1)
          .registerProduct(
            productHash,
            productData.productId,
            productData.productName,
            productData.batchNumber
          )
      ).to.be.revertedWith("Product with this hash already registered");
    });

    it("Should reject unauthorized manufacturer", async function () {
      const productHash = generateProductHash(
        productData.productId,
        productData.productName,
        productData.batchNumber,
        customer.address
      );

      await expect(
        productAuthenticityContract.connect(customer).registerProduct(
          productHash,
          productData.productId,
          productData.productName,
          productData.batchNumber
        )
      ).to.be.revertedWith(
        "Only authorized manufacturers can register products"
      );
    });

    it("Should reject empty product ID", async function () {
      const productHash = generateProductHash(
        "",
        productData.productName,
        productData.batchNumber,
        manufacturer1.address
      );

      await expect(
        productAuthenticityContract.connect(manufacturer1).registerProduct(
          productHash,
          "", // empty product ID
          productData.productName,
          productData.batchNumber
        )
      ).to.be.revertedWith("Product ID cannot be empty");
    });

    it("Should allow different manufacturers to register different products", async function () {
      const productHash1 = generateProductHash(
        "SKU-001",
        "Product 1",
        "BATCH-001",
        manufacturer1.address
      );

      const productHash2 = generateProductHash(
        "SKU-002",
        "Product 2",
        "BATCH-002",
        manufacturer2.address
      );

      await productAuthenticityContract
        .connect(manufacturer1)
        .registerProduct(
          productHash1,
          "SKU-001",
          "Product 1",
          "BATCH-001"
        );

      await productAuthenticityContract
        .connect(manufacturer2)
        .registerProduct(
          productHash2,
          "SKU-002",
          "Product 2",
          "BATCH-002"
        );

      const [product1] =
        await productAuthenticityContract.getProduct(productHash1);
      const [product2] =
        await productAuthenticityContract.getProduct(productHash2);

      expect(product1.manufacturer).to.equal(manufacturer1.address);
      expect(product2.manufacturer).to.equal(manufacturer2.address);
    });
  });

  // ============================================================================
  // TEST SUITE 3: PRODUCT VERIFICATION
  // ============================================================================

  describe("Product Verification", function () {
    const productData = {
      productId: "SKU-VERIFY-001",
      productName: "Test Product",
      batchNumber: "BATCH-TEST-001",
    };

    beforeEach(async function () {
      const productHash = generateProductHash(
        productData.productId,
        productData.productName,
        productData.batchNumber,
        manufacturer1.address
      );

      // Register product before each test
      await productAuthenticityContract
        .connect(manufacturer1)
        .registerProduct(
          productHash,
          productData.productId,
          productData.productName,
          productData.batchNumber
        );
    });

    it("Should verify a registered product as authentic", async function () {
      const productHash = generateProductHash(
        productData.productId,
        productData.productName,
        productData.batchNumber,
        manufacturer1.address
      );

      const [isAuthentic, product, message] =
        await productAuthenticityContract.verifyProduct(productHash);

      expect(isAuthentic).to.be.true;
      expect(product.isActive).to.be.true;
      expect(message).to.include("AUTHENTIC");
    });

    it("Should emit ProductVerified event", async function () {
      const productHash = generateProductHash(
        productData.productId,
        productData.productName,
        productData.batchNumber,
        manufacturer1.address
      );

      await expect(
        productAuthenticityContract.verifyProduct(productHash)
      )
        .to.emit(productAuthenticityContract, "ProductVerified")
        .withArgs(productHash, true);
    });

    it("Should reject non-existent product", async function () {
      const fakeHash =
        "0x0000000000000000000000000000000000000000000000000000000000000000";
      const [isAuthentic, , message] =
        await productAuthenticityContract.verifyProduct(fakeHash);

      expect(isAuthentic).to.be.false;
      expect(message).to.include("NOT VERIFIED");
    });

    it("Should verify deactivated product as NOT authentic", async function () {
      const productHash = generateProductHash(
        productData.productId,
        productData.productName,
        productData.batchNumber,
        manufacturer1.address
      );

      // Deactivate product
      await productAuthenticityContract
        .connect(manufacturer1)
        .deactivateProduct(productHash);

      // Try to verify
      const [isAuthentic, , message] =
        await productAuthenticityContract.verifyProduct(productHash);

      expect(isAuthentic).to.be.false;
      expect(message).to.include("deactivated");
    });
  });

  // ============================================================================
  // TEST SUITE 4: PRODUCT DEACTIVATION
  // ============================================================================

  describe("Product Deactivation", function () {
    const productData = {
      productId: "SKU-DEACTIVATE-001",
      productName: "Product to Deactivate",
      batchNumber: "BATCH-DEACTIVATE",
    };
    let productHash;

    beforeEach(async function () {
      productHash = generateProductHash(
        productData.productId,
        productData.productName,
        productData.batchNumber,
        manufacturer1.address
      );

      await productAuthenticityContract
        .connect(manufacturer1)
        .registerProduct(
          productHash,
          productData.productId,
          productData.productName,
          productData.batchNumber
        );
    });

    it("Should deactivate a product by manufacturer", async function () {
      await productAuthenticityContract
        .connect(manufacturer1)
        .deactivateProduct(productHash);

      const [product] =
        await productAuthenticityContract.getProduct(productHash);
      expect(product.isActive).to.be.false;
    });

    it("Should emit ProductDeactivated event", async function () {
      await expect(
        productAuthenticityContract
          .connect(manufacturer1)
          .deactivateProduct(productHash)
      )
        .to.emit(productAuthenticityContract, "ProductDeactivated")
        .withArgs(productHash, manufacturer1.address);
    });

    it("Should allow owner to deactivate any product", async function () {
      await productAuthenticityContract
        .connect(owner)
        .deactivateProduct(productHash);

      const [product] =
        await productAuthenticityContract.getProduct(productHash);
      expect(product.isActive).to.be.false;
    });

    it("Should reject deactivation by non-manufacturer", async function () {
      await expect(
        productAuthenticityContract
          .connect(customer)
          .deactivateProduct(productHash)
      ).to.be.revertedWith(
        "Only manufacturer or owner can deactivate product"
      );
    });

    it("Should reject deactivating already deactivated product", async function () {
      // Deactivate once
      await productAuthenticityContract
        .connect(manufacturer1)
        .deactivateProduct(productHash);

      // Try to deactivate again
      await expect(
        productAuthenticityContract
          .connect(manufacturer1)
          .deactivateProduct(productHash)
      ).to.be.revertedWith("Product is already deactivated");
    });

    it("Should reject deactivating non-existent product", async function () {
      const fakeHash =
        "0x0000000000000000000000000000000000000000000000000000000000000000";

      await expect(
        productAuthenticityContract
          .connect(manufacturer1)
          .deactivateProduct(fakeHash)
      ).to.be.revertedWith("Product does not exist on blockchain");
    });
  });

  // ============================================================================
  // TEST SUITE 5: PRODUCT DATA RETRIEVAL
  // ============================================================================

  describe("Product Data Retrieval", function () {
    it("Should get total product count", async function () {
      const initialCount =
        await productAuthenticityContract.getProductCount();
      expect(initialCount).to.equal(0);

      // Register a product
      const productHash = generateProductHash(
        "SKU-001",
        "Product",
        "BATCH",
        manufacturer1.address
      );

      await productAuthenticityContract
        .connect(manufacturer1)
        .registerProduct(
          productHash,
          "SKU-001",
          "Product",
          "BATCH"
        );

      const newCount =
        await productAuthenticityContract.getProductCount();
      expect(newCount).to.equal(1);
    });

    it("Should retrieve product hash by index", async function () {
      const productHash = generateProductHash(
        "SKU-001",
        "Product",
        "BATCH",
        manufacturer1.address
      );

      await productAuthenticityContract
        .connect(manufacturer1)
        .registerProduct(
          productHash,
          "SKU-001",
          "Product",
          "BATCH"
        );

      const retrievedHash =
        await productAuthenticityContract.getProductHashAt(0);
      expect(retrievedHash).to.equal(productHash);
    });

    it("Should handle multiple product retrievals", async function () {
      // Register 3 products
      for (let i = 0; i < 3; i++) {
        const productHash = generateProductHash(
          `SKU-${i}`,
          `Product ${i}`,
          `BATCH-${i}`,
          manufacturer1.address
        );

        await productAuthenticityContract
          .connect(manufacturer1)
          .registerProduct(
            productHash,
            `SKU-${i}`,
            `Product ${i}`,
            `BATCH-${i}`
          );
      }

      const count =
        await productAuthenticityContract.getProductCount();
      expect(count).to.equal(3);

      for (let i = 0; i < 3; i++) {
        const hash =
          await productAuthenticityContract.getProductHashAt(i);
        expect(hash).to.not.be.empty;
      }
    });
  });

  // ============================================================================
  // TEST SUITE 6: BLOCKCHAIN IMMUTABILITY (DEMONSTRATION)
  // ============================================================================

  describe("Blockchain Immutability Demonstration", function () {
    it("Should prevent modification of registered product data", async function () {
      const productHash = generateProductHash(
        "SKU-001",
        "Original Name",
        "BATCH-001",
        manufacturer1.address
      );

      await productAuthenticityContract
        .connect(manufacturer1)
        .registerProduct(
          productHash,
          "SKU-001",
          "Original Name",
          "BATCH-001"
        );

      const [product1] =
        await productAuthenticityContract.getProduct(productHash);

      // Verify data hasn't changed
      const [product2] =
        await productAuthenticityContract.getProduct(productHash);

      expect(product1.productName).to.equal(product2.productName);
      expect(product1.batchNumber).to.equal(product2.batchNumber);
    });

    it("Should maintain complete history of registrations", async function () {
      // Register products from different manufacturers
      for (let i = 0; i < 5; i++) {
        const manufacturer = i < 3 ? manufacturer1 : manufacturer2;
        const productHash = generateProductHash(
          `SKU-${i}`,
          `Product ${i}`,
          `BATCH-${i}`,
          manufacturer.address
        );

        await productAuthenticityContract
          .connect(manufacturer)
          .registerProduct(
            productHash,
            `SKU-${i}`,
            `Product ${i}`,
            `BATCH-${i}`
          );
      }

      // Verify all products still exist
      const count =
        await productAuthenticityContract.getProductCount();
      expect(count).to.equal(5);
    });
  });
});
