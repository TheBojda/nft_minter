import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import { JsonRpcProvider } from '@ethersproject/providers';
import { Wallet } from '@ethersproject/wallet';
import { Contract } from '@ethersproject/contracts';
import { Bee } from "@ethersphere/bee-js"
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import keccak256 from 'keccak';

dotenv.config();

const app = express();
const port = 3000;

app.use(bodyParser.json());

const contractABI: any[] = [
    "function safeMint(address to, uint256 tokenId, uint256 swarmHash)",
    "function metadata(uint256 tokenId) public view returns (uint256)"
];
const contractAddress: string = process.env.CONTRACT_ADDRESS;

app.post('/mint', async (req: Request, res: Response) => {
    try {
        const provider = new JsonRpcProvider(process.env.JSON_RPC_PROVIDER);
        const wallet = new Wallet(process.env.OWNER_PRIVATE_KEY as string, provider);
        const contract = new Contract(contractAddress, contractABI, wallet);

        const bee = new Bee(process.env.SWARM_API_URL);

        const { to, content } = req.body;

        const tokenUUID = uuidv4();
        console.log(tokenUUID)

        const result = await bee.uploadFile(process.env.POSTAGE_BATCH_ID, JSON.stringify(content), `${tokenUUID}.json`, { contentType: 'application/json' });
        console.log(result);

        // Generate the tokenId as a BigNumber
        const tokenId = BigInt('0x' + keccak256('keccak256').update(tokenUUID).digest('hex'));
        console.log(tokenId.toString());

        // Assuming result.reference is a valid hex string that can be converted to BigNumber
        const swarmHash = BigInt('0x' + result.reference);
        console.log(swarmHash.toString());

        const tx = await contract.safeMint(to, tokenId, swarmHash);
        // const receipt = await tx.wait();

        res.status(200).json({
            message: 'NFT minted successfully!',
            tokenId: tokenUUID,
            swarmReference: result.reference
        });
    } catch (error) {
        console.error('Error minting NFT:', error);
        res.status(500).send('Error minting NFT');
    }
});

app.get('/metadata/:tokenUUID', async (req: Request, res: Response) => {
    try {
        const provider = new JsonRpcProvider(process.env.JSON_RPC_PROVIDER);
        const wallet = new Wallet(process.env.OWNER_PRIVATE_KEY as string, provider);
        const contract = new Contract(contractAddress, contractABI, wallet);

        const { tokenUUID } = req.params;
        const tokenId = BigInt('0x' + keccak256('keccak256').update(tokenUUID).digest('hex'));

        const metadata = await contract.metadata(tokenId);

        const bee = new Bee(process.env.SWARM_API_URL);
        const file = await bee.downloadFile(metadata.toHexString().substring(2))

        res.status(200).json({
            swarmReference: metadata.toHexString().substring(2),
            content: file.data.json()
        });
    } catch (error) {
        console.error('Error getting NFT metadata:', error);
        res.status(500).send('Error getting NFT metadata');
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
