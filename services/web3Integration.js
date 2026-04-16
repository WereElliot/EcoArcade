// EcoArcade Real Web3 Service
// Implements real ethers.js blockchain logic
class Web3Integration {
    constructor() {
        this.tokenRate = 100; // 100 EcoPoints = 1 EcoToken
        // Hardcoded dummy ABIs and Placeholder Addresses
        // Users must deploy their contracts via Hardhat and update these values
        this.ecoTokenAddress = "0x0000000000000000000000000000000000Token"; // Update post-deploy
        this.stewardshipAddress = "0x00000000000000000000000000000000Steward"; // Update post-deploy
        
        this.ecoTokenABI = [
            "function buyTokens() public payable",
            "function convertPointsToTokens(address to, uint256 amount) public",
            "function donate(address project, uint256 amount) public",
            "function balanceOf(address owner) view returns (uint256)"
        ];
        
        this.stewardshipABI = [
            "function mintAction(address to, string memory uri) public returns (uint256)",
            "function usedActionURIs(string uri) view returns (bool)"
        ];

        this.provider = null;
        this.signer = null;
        this.userAddress = null;
    }

    async connectWallet() {
        if (!window.ethereum) {
            throw new Error("No Web3 wallet attached. Please install MetaMask to use blockchain features.");
        }
        
        // Ethers v6 Usage
        this.provider = new ethers.BrowserProvider(window.ethereum);
        await this.provider.send("eth_requestAccounts", []);
        this.signer = await this.provider.getSigner();
        this.userAddress = await this.signer.getAddress();
        
        console.log("Wallet connected:", this.userAddress);
        return this.userAddress;
    }

    /**
     * Call the actual smart contract to mint an ERC-721 NFT for the action.
     * @param {string} uri IPFS or structured URI containing EXIF and image location
     * @returns {Promise<string>} transaction hash
     */
    async mintNFT(uri) {
        if (!this.signer) await this.connectWallet();
        
        // Check if placeholder addresses are still being used safely
        if (this.stewardshipAddress.includes("00000")) {
            console.warn("Using placeholder Stewardship contract address. Update web3Integration.js with real deployed contract to execute real transactions.");
            return `0xMOCK_HASH_BECAUSE_PLACEHOLDER_ADDRESS_${Date.now()}`;
        }

        const contract = new ethers.Contract(this.stewardshipAddress, this.stewardshipABI, this.signer);
        
        try {
            console.log(`[Web3] Minting NFT with URI: ${uri}`);
            const tx = await contract.mintAction(this.userAddress, uri);
            const receipt = await tx.wait();
            return receipt.hash;
        } catch (error) {
            console.error("NFT Minting failed:", error);
            throw new Error(`NFT Mint failed: ${error.message}`);
        }
    }

    /**
     * Call actual Smart Contract to Mint EcoTokens from converted points
     * @param {number} points
     * @returns {Promise<{tokens: number, txHash: string}>}
     */
    async convertToTokens(points) {
        if (!this.signer) await this.connectWallet();
        
        const tokensToMint = Math.floor(points / this.tokenRate);
        if (tokensToMint <= 0) {
            throw new Error('Not enough points to convert.');
        }

        if (this.ecoTokenAddress.includes("00000")) {
            console.warn("Using placeholder EcoToken contract address.");
            return { tokens: tokensToMint, txHash: `0xMOCK_HASH_BECAUSE_PLACEHOLDER_ADDRESS_${Date.now()}` };
        }

        const contract = new ethers.Contract(this.ecoTokenAddress, this.ecoTokenABI, this.signer);
        
        try {
            console.log(`[Web3] Converting points to ${tokensToMint} Tokens...`);
            const tx = await contract.convertPointsToTokens(this.userAddress, tokensToMint);
            const receipt = await tx.wait();
            return {
                tokens: tokensToMint,
                txHash: receipt.hash
            };
        } catch (error) {
            console.error("Token conversion failed:", error);
            throw new Error(`Token conversion failed: ${error.message}`);
        }
    }

    /**
     * Send tokens to a real project address
     * @param {string} projectId Target hex address
     * @param {number} tokenAmount 
     * @returns {Promise<string>}
     */
    async donateTokens(projectId, tokenAmount) {
        if (!this.signer) await this.connectWallet();
        
        if (this.ecoTokenAddress.includes("00000")) {
            console.warn("Using placeholder EcoToken contract address.");
            return `0xMOCK_HASH_BECAUSE_PLACEHOLDER_ADDRESS_${Date.now()}`;
        }

        const contract = new ethers.Contract(this.ecoTokenAddress, this.ecoTokenABI, this.signer);
        try {
            console.log(`[Web3] Donating ${tokenAmount} Tokens...`);
            const tx = await contract.donate(projectId, tokenAmount);
            const receipt = await tx.wait();
            return receipt.hash;
        } catch(error) {
            console.error("Donation failed", error);
            throw new Error(`Donation failed: ${error.message}`);
        }
    }

    /**
     * Trigger buy tokens flow Native Crypto -> EcoToken.
     * Mpesa-like flows require fiat-onramps. Since we are dealing directly with the contract:
     * users can send MATIC or ETH directly as `msg.value`
     */
    async buyTokensWithCrypto(amountStringInEther) {
        if (!this.signer) await this.connectWallet();
        
        if (this.ecoTokenAddress.includes("00000")) {
            throw new Error("Cannot simulate Crypto-to-Token buy without a real deployed contract and value injection.");
        }

        const contract = new ethers.Contract(this.ecoTokenAddress, this.ecoTokenABI, this.signer);
        try {
            const ethValue = ethers.parseEther(amountStringInEther);
            console.log(`[Web3] Buying tokens with ${amountStringInEther} native currency...`);
            const tx = await contract.buyTokens({ value: ethValue });
            const receipt = await tx.wait();
            return receipt.hash;
        } catch (error) {
            console.error("Buy tokens failed:", error);
            throw new Error(`Buy tokens failed: ${error.message}`);
        }
    }
}

// Make accessible globally
window.blockchainReal = new Web3Integration();
