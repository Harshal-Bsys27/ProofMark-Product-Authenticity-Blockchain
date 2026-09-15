// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/**
 * @title ProductAuthenticity
 * @dev Smart contract for verifying product authenticity using cryptographic hashing and blockchain immutability
 * @author Academic Project - Blockchain Technology Mini-Project
 * 
 * PURPOSE:
 * This contract demonstrates blockchain technology for product authenticity verification.
 * Products are registered with cryptographic hashes and can be verified by checking if the
 * hash exists on the blockchain. This proves the product was registered by an authorized manufacturer.
 * 
 * KEY CONCEPTS DEMONSTRATED:
 * - Solidity smart contracts
 * - On-chain data storage (immutable ledger)
 * - Cryptographic hashing for data integrity
 * - Event emission for transaction tracking
 * - Access control (only manufacturer can register)
 * - Product lifecycle (active/inactive)
 */

contract ProductAuthenticity {
    // ============================================================================
    // STATE VARIABLES
    // ============================================================================

    /// @dev Contract owner (deployer) - has special privileges
    address public owner;

    /// @dev Stores product information indexed by product hash
    mapping(bytes32 => Product) public products;

    /// @dev Tracks all registered product hashes
    bytes32[] public productHashes;

    /// @dev Stores whether a specific manufacturer address can register products
    mapping(address => bool) public authorizedManufacturers;

    // ============================================================================
    // DATA STRUCTURES
    // ============================================================================

    /**
     * @dev Product struct - Contains all essential information about a registered product
     * 
     * BLOCKCHAIN CONCEPT:
     * Once stored, this data is immutable on the blockchain.
     * It cannot be changed, deleted, or tampered with.
     */
    struct Product {
        // Product Identifiers
        string productId;           // Unique identifier (e.g., SKU)
        string productName;         // Human-readable name
        string batchNumber;         // Manufacturing batch
        
        // Cryptographic Proof
        bytes32 productHash;        // SHA-256 hash of product data (for verification)
        
        // Manufacturer Information
        address manufacturer;       // Ethereum address of manufacturer
        
        // Timestamps
        uint256 registrationTime;   // Block timestamp when registered
        
        // Status
        bool isActive;              // Whether product is still valid (not deactivated)
    }

    // ============================================================================
    // EVENTS
    // ============================================================================

    /**
     * @dev Emitted when a product is successfully registered on the blockchain
     * 
     * BLOCKCHAIN CONCEPT:
     * Events are stored in transaction logs and can be indexed for fast retrieval.
     * They prove the action occurred and show all relevant details.
     */
    event ProductRegistered(
        bytes32 indexed productHash,
        string productId,
        string productName,
        string batchNumber,
        address indexed manufacturer,
        uint256 registrationTime,
        uint256 registeredBlock
    );

    /**
     * @dev Emitted when a product is verified (checked against blockchain record)
     * 
     * This event tracks all verification attempts and their results.
     */
    event ProductVerified(
        bytes32 indexed productHash,
        bool isAuthentic,
        uint256 verificationTime,
        uint256 verifiedAtBlock
    );

    /**
     * @dev Emitted when a product is deactivated by the manufacturer
     * 
     * BLOCKCHAIN CONCEPT:
     * Even deactivation is recorded on the immutable ledger.
     */
    event ProductDeactivated(
        bytes32 indexed productHash,
        address indexed manufacturer,
        uint256 deactivationTime,
        uint256 deactivatedBlock
    );

    /**
     * @dev Emitted when a new manufacturer is authorized
     */
    event ManufacturerAuthorized(
        address indexed manufacturer,
        uint256 authorizationTime
    );

    // ============================================================================
    // MODIFIERS
    // ============================================================================

    /**
     * @dev Restricts function execution to contract owner only
     * 
     * ACCESS CONTROL CONCEPT:
     * This demonstrates basic access control - a key blockchain security pattern.
     */
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    /**
     * @dev Restricts function execution to authorized manufacturers only
     */
    modifier onlyAuthorizedManufacturer() {
        require(
            authorizedManufacturers[msg.sender],
            "Only authorized manufacturers can register products"
        );
        _;
    }

    /**
     * @dev Ensures a product exists in the blockchain ledger
     */
    modifier productExists(bytes32 _productHash) {
        require(
            products[_productHash].registrationTime != 0,
            "Product does not exist on blockchain"
        );
        _;
    }

    // ============================================================================
    // CONSTRUCTOR
    // ============================================================================

    /**
     * @dev Initializes the contract when deployed to the blockchain
     * 
     * The deployer becomes the owner and the first authorized manufacturer.
     */
    constructor() {
        owner = msg.sender;
        authorizedManufacturers[msg.sender] = true;
    }

    // ============================================================================
    // MANUFACTURER MANAGEMENT FUNCTIONS
    // ============================================================================

    /**
     * @dev Authorizes a manufacturer address to register products
     * 
     * @param _manufacturer Address of the manufacturer to authorize
     * 
     * BLOCKCHAIN CONCEPT:
     * Only the contract owner can authorize manufacturers.
     * This is stored permanently on the blockchain.
     */
    function authorizeManufacturer(address _manufacturer) public onlyOwner {
        require(_manufacturer != address(0), "Invalid manufacturer address");
        require(
            !authorizedManufacturers[_manufacturer],
            "Manufacturer already authorized"
        );

        authorizedManufacturers[_manufacturer] = true;
        emit ManufacturerAuthorized(_manufacturer, block.timestamp);
    }

    /**
     * @dev Removes authorization from a manufacturer
     * 
     * @param _manufacturer Address of the manufacturer to deauthorize
     */
    function removeManufacturer(address _manufacturer) public onlyOwner {
        require(authorizedManufacturers[_manufacturer], "Manufacturer not authorized");
        authorizedManufacturers[_manufacturer] = false;
    }

    // ============================================================================
    // PRODUCT REGISTRATION FUNCTIONS
    // ============================================================================

    /**
     * @dev Registers a product on the blockchain with its cryptographic hash
     * 
     * FLOW:
     * 1. Frontend generates SHA-256 hash from product data
     * 2. Manufacturer signs transaction with MetaMask
     * 3. Smart contract stores the product permanently on blockchain
     * 4. Event is emitted (stored in transaction logs)
     * 5. Anyone can now verify this product exists
     * 
     * @param _productHash SHA-256 hash of product data (generated off-chain by frontend)
     * @param _productId Unique product identifier (e.g., SKU)
     * @param _productName Name of the product
     * @param _batchNumber Manufacturing batch number
     * 
     * BLOCKCHAIN CONCEPTS DEMONSTRATED:
     * - Transaction signing (manufacturer address captured from msg.sender)
     * - Immutable storage (data cannot be changed after registration)
     * - Event emission (proof of action)
     * - Access control (only authorized manufacturers)
     * - Timestamp recording (block.timestamp proves when this occurred)
     * 
     * SECURITY:
     * The hash is computed off-chain by the frontend using the same hashing algorithm.
     * The manufacturer must provide the exact hash they created.
     * This proves the manufacturer knows and approves the product data.
     * 
     * @return success Boolean indicating successful registration
     */
    function registerProduct(
        bytes32 _productHash,
        string memory _productId,
        string memory _productName,
        string memory _batchNumber
    ) public onlyAuthorizedManufacturer returns (bool) {
        // Validation: Product must not already exist
        require(
            products[_productHash].registrationTime == 0,
            "Product with this hash already registered"
        );

        // Validation: Require non-empty fields
        require(bytes(_productId).length > 0, "Product ID cannot be empty");
        require(bytes(_productName).length > 0, "Product name cannot be empty");

        // Store product on blockchain (permanently)
        products[_productHash] = Product({
            productId: _productId,
            productName: _productName,
            batchNumber: _batchNumber,
            productHash: _productHash,
            manufacturer: msg.sender,
            registrationTime: block.timestamp,
            isActive: true
        });

        // Add to list of all product hashes
        productHashes.push(_productHash);

        // Emit event (recorded in blockchain transaction log)
        emit ProductRegistered(
            _productHash,
            _productId,
            _productName,
            _batchNumber,
            msg.sender,
            block.timestamp,
            block.number
        );

        return true;
    }

    // ============================================================================
    // PRODUCT VERIFICATION FUNCTIONS
    // ============================================================================

    /**
     * @dev Verifies if a product is authentic by checking if its hash is registered on blockchain
     * 
     * VERIFICATION FLOW:
     * 1. Customer enters product information
     * 2. Frontend generates SHA-256 hash from same data
     * 3. Smart contract checks if this hash is registered
     * 4. If found AND active → AUTHENTIC
     * 5. If found AND inactive → DEACTIVATED
     * 6. If not found → NOT VERIFIED
     * 
     * BLOCKCHAIN CONCEPT - IMMUTABILITY:
     * Because blockchain is immutable, if a product hash is found,
     * we can be absolutely sure it was registered and hasn't been tampered with.
     * The manufacturer cannot change or delete it.
     * 
     * IMPORTANT LIMITATION:
     * This proves the product DATA was registered, NOT that the physical product is genuine.
     * A counterfeit manufacturer could register fake products too.
     * This system verifies "registered as authentic according to blockchain record",
     * not "physically genuine". This is an important distinction.
     * 
     * @param _productHash SHA-256 hash to verify
     * 
     * @return isAuthentic Boolean - true if product is registered and active
     * @return product The product struct if found
     * @return verificationMessage Human-readable result message
     */
    function verifyProduct(bytes32 _productHash)
        public
        returns (bool isAuthentic, Product memory product, string memory verificationMessage)
    {
        // Check if product exists on blockchain
        if (products[_productHash].registrationTime == 0) {
            // Product not found on blockchain
            emit ProductVerified(_productHash, false, block.timestamp, block.number);
            return (
                false,
                products[_productHash],
                "Product not found on blockchain - NOT VERIFIED"
            );
        }

        Product memory foundProduct = products[_productHash];

        // Check if product is active
        if (!foundProduct.isActive) {
            // Product found but has been deactivated
            emit ProductVerified(_productHash, false, block.timestamp, block.number);
            return (
                false,
                foundProduct,
                "Product has been deactivated - NOT VERIFIED"
            );
        }

        // Product found and active → AUTHENTIC
        emit ProductVerified(_productHash, true, block.timestamp, block.number);
        return (
            true,
            foundProduct,
            "Product verified - AUTHENTIC - Registered on blockchain"
        );
    }

    // ============================================================================
    // PRODUCT RETRIEVAL FUNCTIONS
    // ============================================================================

    /**
     * @dev Retrieves product information from blockchain by hash
     * 
     * This is a read-only operation (view function).
     * It doesn't modify blockchain state.
     * 
     * BLOCKCHAIN CONCEPT - PUBLIC DATA:
     * All data on blockchain is public and can be read by anyone.
     * This demonstrates transparency.
     * 
     * @param _productHash The product hash to look up
     * 
     * @return product The full Product struct if found
     * @return exists Boolean indicating if product was found
     */
    function getProduct(bytes32 _productHash)
        public
        view
        returns (Product memory product, bool exists)
    {
        bool found = products[_productHash].registrationTime != 0;
        return (products[_productHash], found);
    }

    /**
     * @dev Gets total number of products registered on blockchain
     * 
     * @return count Total products registered
     */
    function getProductCount() public view returns (uint256) {
        return productHashes.length;
    }

    /**
     * @dev Gets product hash at specific index
     * 
     * Useful for listing all products on the blockchain.
     * 
     * @param _index Index in the productHashes array
     * 
     * @return productHash The hash at that index
     */
    function getProductHashAt(uint256 _index) public view returns (bytes32) {
        require(_index < productHashes.length, "Index out of bounds");
        return productHashes[_index];
    }

    /**
     * @dev Checks if a manufacturer is authorized
     * 
     * @param _manufacturer Address to check
     * 
     * @return isAuthorized Boolean indicating authorization status
     */
    function isManufacturerAuthorized(address _manufacturer)
        public
        view
        returns (bool)
    {
        return authorizedManufacturers[_manufacturer];
    }

    // ============================================================================
    // PRODUCT DEACTIVATION FUNCTIONS
    // ============================================================================

    /**
     * @dev Deactivates a product (marks as no longer authentic)
     * 
     * USE CASE:
     * If a product is recalled or found to be counterfeit,
     * the manufacturer or owner can mark it as inactive.
     * It will no longer verify as authentic.
     * 
     * NOTE:
     * The blockchain record itself is never deleted (immutability).
     * We only change the isActive flag.
     * This maintains a complete history.
     * 
     * @param _productHash Hash of product to deactivate
     * 
     * BLOCKCHAIN CONCEPT:
     * This demonstrates how blockchain can handle state changes
     * while maintaining immutability of past transactions.
     */
    function deactivateProduct(bytes32 _productHash)
        public
        productExists(_productHash)
    {
        Product storage product = products[_productHash];

        // Only manufacturer who registered it or owner can deactivate
        require(
            msg.sender == product.manufacturer || msg.sender == owner,
            "Only manufacturer or owner can deactivate product"
        );

        // Ensure product is currently active
        require(product.isActive, "Product is already deactivated");

        // Deactivate product
        product.isActive = false;

        // Emit deactivation event
        emit ProductDeactivated(_productHash, msg.sender, block.timestamp, block.number);
    }

    // ============================================================================
    // FALLBACK FUNCTIONS
    // ============================================================================

    /**
     * @dev Fallback function - prevents accidental ETH transfers to this contract
     */
    receive() external payable {
        revert("This contract does not accept ETH transfers");
    }
}
