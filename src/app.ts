import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { JsonRpcProvider } from "@ethersproject/providers";
import { Wallet } from "@ethersproject/wallet";
import { Contract } from "@ethersproject/contracts";
import { Bee } from "@ethersphere/bee-js";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import keccak256 from "keccak";

type TokenHistory = {
    tokenId: string;
    hashes: string[];
}[];

dotenv.config();

const app = express();
const port = 3000;

app.use(bodyParser.json()).use(cors());

const contractABI: any[] = [
    "function safeMint(address to, uint256 tokenId, uint256 swarmHash)",
    "function metadata(uint256 tokenId) public view returns (uint256)",
    "event MetadataUpdated(address indexed owner, uint256 indexed tokenId, uint256 swarmHash)",
];
const contractAddress: string = process.env.CONTRACT_ADDRESS;

app.post("/mint", async (req: Request, res: Response) => {
    try {
        const provider = new JsonRpcProvider(process.env.JSON_RPC_PROVIDER);
        const wallet = new Wallet(
            process.env.OWNER_PRIVATE_KEY as string,
            provider
        );
        const contract = new Contract(contractAddress, contractABI, wallet);

        const bee = new Bee(process.env.SWARM_API_URL);

        const { to, content } = req.body;

        const tokenUUID = uuidv4();

        content._nftID =
            "0x" + keccak256("keccak256").update(tokenUUID).digest("hex");

        const result = await bee.uploadFile(
            process.env.POSTAGE_BATCH_ID,
            JSON.stringify(content),
            `${tokenUUID}.json`,
            { contentType: "application/json" }
        );

        const tokenId = BigInt(
            "0x" + keccak256("keccak256").update(tokenUUID).digest("hex")
        );
        console.log(tokenId.toString());

        const swarmHash = BigInt("0x" + result.reference);
        console.log(swarmHash.toString());

        contract.safeMint(to, tokenId, swarmHash);

        res.status(200).json({
            message: "NFT minted successfully!",
            tokenId: content._nftID,
            swarmReference: result.reference,
        });
    } catch (error) {
        console.error("Error minting NFT:", error);
        res.status(500).send("Error minting NFT");
    }
});

app.get("/metadata/:tokenId", async (req: Request, res: Response) => {
    try {
        const provider = new JsonRpcProvider(process.env.JSON_RPC_PROVIDER);
        const wallet = new Wallet(
            process.env.OWNER_PRIVATE_KEY as string,
            provider
        );
        const contract = new Contract(contractAddress, contractABI, wallet);

        const { tokenId } = req.params;

        const metadata = await contract.metadata(BigInt(tokenId));

        const bee = new Bee(process.env.SWARM_API_URL);
        const file = await bee.downloadFile(
            metadata.toHexString().substring(2)
        );

        res.status(200).json({
            swarmReference: metadata.toHexString().substring(2),
            content: file.data.json(),
        });
    } catch (error) {
        console.error("Error getting NFT metadata:", error);
        res.status(500).send("Error getting NFT metadata");
    }
});

app.get("/history/:address", async (req: Request, res: Response) => {
    try {
        const provider = new JsonRpcProvider(process.env.JSON_RPC_PROVIDER);
        const wallet = new Wallet(
            process.env.OWNER_PRIVATE_KEY as string,
            provider
        );
        const contract = new Contract(contractAddress, contractABI, wallet);

        const { address } = req.params;

        const events = await contract.queryFilter(
            contract.filters.MetadataUpdated(address)
        );

        let history: TokenHistory = [];

        for (let event of events) {
            const tokenId = event.args.tokenId.toHexString();
            console.log(tokenId);

            const hash = event.args.swarmHash.toHexString().substring(2);
            const found = history.find((x) => x.tokenId === tokenId);

            if (found === undefined) {
                history.push({ tokenId: tokenId, hashes: [hash] });
            } else {
                found.hashes.push(hash);
            }
        }

        res.status(200).json(history);
    } catch (error) {
        console.error("Error getting NFT list:", error);
        res.status(500).send("Error getting NFT list");
    }
});

app.get("/list", async (req: Request, res: Response) => {
    try {
        const provider = new JsonRpcProvider(process.env.JSON_RPC_PROVIDER);
        const wallet = new Wallet(
            process.env.OWNER_PRIVATE_KEY as string,
            provider
        );
        const contract = new Contract(contractAddress, contractABI, wallet);

        const events = await contract.queryFilter(
            contract.filters.MetadataUpdated()
        );

        let history: TokenHistory = [];

        for (let event of events) {
            const tokenId = event.args.tokenId.toHexString();
            console.log(tokenId);

            const hash = event.args.swarmHash.toHexString().substring(2);
            const found = history.find((x) => x.tokenId === tokenId);

            if (found === undefined) {
                history.push({ tokenId: tokenId, hashes: [hash] });
            } else {
                found.hashes.push(hash);
            }
        }

        res.status(200).json(history);
    } catch (error) {
        console.error("Error getting NFT list:", error);
        res.status(500).send("Error getting NFT list");
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
