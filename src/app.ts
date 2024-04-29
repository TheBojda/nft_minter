import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import { JsonRpcProvider } from '@ethersproject/providers';
import { Wallet } from '@ethersproject/wallet';
import { Contract } from '@ethersproject/contracts';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Your smart contract ABI and address
const contractABI: any[] = [
    "function safeMint(address to, string memory uri)"
];
const contractAddress: string = process.env.CONTRACT_ADDRESS;

// POST endpoint to mint an NFT
app.post('/mint', async (req: Request, res: Response) => {
    try {
        // Connect to the Ethereum network
        const provider = new JsonRpcProvider(process.env.JSON_RPC_PROVIDER);

        // Setup a wallet; ideally from an environment variable or secure vault
        const wallet = new Wallet(process.env.OWNER_PRIVATE_KEY as string, provider);

        // Connect your wallet to the contract
        const contract = new Contract(contractAddress, contractABI, wallet);

        // Data from the request body
        const { to, uri } = req.body;

        // Call the safeMint function from your contract
        const tx = await contract.safeMint(to, uri);
        const receipt = await tx.wait();

        // Respond with transaction details
        res.status(200).json({
            message: 'NFT minted successfully!',
            transactionHash: receipt.transactionHash
        });
    } catch (error) {
        console.error('Error minting NFT:', error);
        res.status(500).send('Error minting NFT');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
