// EcoArcade real Web3 integration.
// Requires deployed contract addresses in chrome.storage.local:
// ecoTokenAddress, stewardshipAddress, climateProjectAddress

class Web3Integration {
    constructor() {
        this.tokenRate = 100;
        this.provider = null;
        this.signer = null;
        this.userAddress = null;
        this.supportedChainIds = new Set([137, 8453]);
        this.ecoTokenABI = [
            'function buyTokens() payable',
            'function convertPointsToTokens(address to, uint256 amount)',
            'function donate(address project, uint256 amount)',
            'function balanceOf(address owner) view returns (uint256)'
        ];
        this.stewardshipABI = [
            'function mintAction(address to, string uri) returns (uint256)',
            'function usedActionURIs(string uri) view returns (bool)'
        ];
    }

    async getConfig() {
        const data = await chrome.storage.local.get([
            'ecoTokenAddress',
            'stewardshipAddress',
            'climateProjectAddress'
        ]);

        return {
            ecoTokenAddress: data.ecoTokenAddress || '',
            stewardshipAddress: data.stewardshipAddress || '',
            climateProjectAddress: data.climateProjectAddress || ''
        };
    }

    async getConfigStatus() {
        const config = await this.getConfig();
        return {
            tokenConfigured: Boolean(config.ecoTokenAddress),
            nftConfigured: Boolean(config.stewardshipAddress),
            projectConfigured: Boolean(config.climateProjectAddress)
        };
    }

    async connectWallet() {
        if (!window.ethereum) {
            throw new Error('No compatible wallet detected. Install MetaMask or another EVM wallet.');
        }

        this.provider = new ethers.BrowserProvider(window.ethereum);
        const network = await this.provider.getNetwork();
        const chainId = Number(network.chainId);

        if (!this.supportedChainIds.has(chainId)) {
            throw new Error('Switch your wallet to Polygon or Base before continuing.');
        }

        await this.provider.send('eth_requestAccounts', []);
        this.signer = await this.provider.getSigner();
        this.userAddress = await this.signer.getAddress();
        return this.userAddress;
    }

    async ensureConnection() {
        if (!this.signer || !this.userAddress) {
            await this.connectWallet();
        }
    }

    async getTokenContract() {
        const { ecoTokenAddress } = await this.getConfig();
        if (!ecoTokenAddress) {
            throw new Error('ecoTokenAddress is not configured.');
        }

        await this.ensureConnection();
        return new ethers.Contract(ecoTokenAddress, this.ecoTokenABI, this.signer);
    }

    async getNftContract() {
        const { stewardshipAddress } = await this.getConfig();
        if (!stewardshipAddress) {
            throw new Error('stewardshipAddress is not configured.');
        }

        await this.ensureConnection();
        return new ethers.Contract(stewardshipAddress, this.stewardshipABI, this.signer);
    }

    async getTokenBalance() {
        const contract = await this.getTokenContract();
        const balance = await contract.balanceOf(this.userAddress);
        return Number(balance);
    }

    async mintNFT(uri) {
        const contract = await this.getNftContract();

        const alreadyUsed = await contract.usedActionURIs(uri);
        if (alreadyUsed) {
            throw new Error('This action proof has already been minted. Resubmission is blocked.');
        }

        const tx = await contract.mintAction(this.userAddress, uri);
        const receipt = await tx.wait();
        return receipt.hash;
    }

    async convertToTokens(points) {
        const tokensToMint = Math.floor(points / this.tokenRate);
        if (tokensToMint <= 0) {
            throw new Error(`You need at least ${this.tokenRate} Eco Points to convert.`);
        }

        const contract = await this.getTokenContract();
        const tx = await contract.convertPointsToTokens(this.userAddress, tokensToMint);
        const receipt = await tx.wait();

        return {
            tokens: tokensToMint,
            txHash: receipt.hash
        };
    }

    async donateTokens(tokenAmount) {
        const { climateProjectAddress } = await this.getConfig();
        if (!climateProjectAddress) {
            throw new Error('climateProjectAddress is not configured.');
        }

        const contract = await this.getTokenContract();
        const tx = await contract.donate(climateProjectAddress, tokenAmount);
        const receipt = await tx.wait();
        return receipt.hash;
    }

    async buyTokensWithCrypto(amountStringInEther) {
        if (!amountStringInEther || Number(amountStringInEther) <= 0) {
            throw new Error('Enter a valid amount of native crypto.');
        }

        const contract = await this.getTokenContract();
        const tx = await contract.buyTokens({
            value: ethers.parseEther(amountStringInEther)
        });
        const receipt = await tx.wait();
        return receipt.hash;
    }
}

window.blockchainReal = new Web3Integration();
