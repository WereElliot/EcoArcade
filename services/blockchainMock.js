// EcoArcade Mock Blockchain / Web3 Service
// Simulates NFT minting and EcoToken transfers.

class BlockchainMock {
    constructor() {
        this.tokenRate = 100; // 100 EcoPoints = 1 EcoToken
        this.networkName = 'EcoTestnet';
    }

    /**
     * Simulates minting an NFT to an imaginary blockchain.
     * @param {string} description description of the action
     * @returns {Promise<string>} fake transaction hash
     */
    async mintNFT(description) {
        console.log(`[Blockchain] Starting mint process for: ${description}...`);
        return new Promise((resolve) => {
            setTimeout(() => {
                const randomHex = Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('');
                const txHash = `0x${randomHex}`;
                console.log(`[Blockchain] NFT Minted! TxHash: ${txHash}`);
                resolve(txHash);
            }, 1500); // simulate network latency
        });
    }

    /**
     * Converts points to EcoTokens and stores in local storage balance.
     * @param {number} points
     * @returns {Promise<{tokens: number, txHash: string}>}
     */
    async convertToTokens(points) {
        const tokensToMint = Math.floor(points / this.tokenRate);
        if (tokensToMint <= 0) {
            throw new Error('Not enough points to convert.');
        }
        
        return new Promise((resolve) => {
            setTimeout(() => {
                const txHash = `0x${Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('')}`;
                resolve({
                    tokens: tokensToMint,
                    txHash
                });
            }, 1000); // simulate conversion latency
        });
    }

    /**
     * Simulates a smart contract donation to an eco-project
     * @param {string} projectId 
     * @param {number} tokenAmount 
     * @returns {Promise<string>}
     */
    async donateTokens(projectId, tokenAmount) {
        console.log(`[Blockchain] Donating ${tokenAmount} EcoTokens to project ${projectId}...`);
        return new Promise((resolve) => {
            setTimeout(() => {
                const receiptId = `0xreceipt_${Array.from({length: 32}, () => Math.floor(Math.random()*16).toString(16)).join('')}`;
                console.log(`[Blockchain] Donation successful! Receipt: ${receiptId}`);
                resolve(receiptId);
            }, 2000);
        });
    }
}

// Make accessible globally
window.blockchainMock = new BlockchainMock();
