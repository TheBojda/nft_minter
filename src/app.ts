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
import jsonata from "jsonata";

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

app.post(
    "/mint",
    async (
        req: Request<{ to: string; content: any }>,
        res: Response<
            | {
                  message: string;
                  tokenId: string;
                  swarmReference: string;
              }
            | string
        >
    ) => {
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
                { contentType: "application/json", pin: true }
            );

            const tokenId = BigInt(
                "0x" + keccak256("keccak256").update(tokenUUID).digest("hex")
            );
            console.log(tokenId.toString());

            const swarmHash = BigInt("0x" + result.reference);
            console.log(swarmHash.toString());

            await contract.safeMint(to, tokenId, swarmHash);

            res.status(200).json({
                message: "NFT minted successfully!",
                tokenId: content._nftID,
                swarmReference: result.reference,
            });
        } catch (error) {
            console.error("Error minting NFT:", error);
            res.status(500).send("Error minting NFT");
        }
    }
);

app.get(
    "/metadata/:tokenId",
    async (
        req: Request<{ tokenId: string }>,
        res: Response<
            | {
                  swarmReference: string;
                  content: any;
              }
            | string
        >
    ) => {
        try {
            const provider = new JsonRpcProvider(process.env.JSON_RPC_PROVIDER);
            const wallet = new Wallet(
                process.env.OWNER_PRIVATE_KEY as string,
                provider
            );
            const contract = new Contract(contractAddress, contractABI, wallet);

            const { tokenId } = req.params;

            const { metadata, file } = await getTokenMetadata(
                contract,
                tokenId
            );

            res.status(200).json({
                swarmReference: metadata.toHexString().substring(2),
                content: file.data.json(),
            });
        } catch (error) {
            console.error("Error getting NFT metadata:", error);
            res.status(500).send("Error getting NFT metadata");
        }
    }
);

app.get(
    "/history/:address",
    async (
        req: Request<{ address: string }>,
        res: Response<TokenHistory | string>
    ) => {
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
    }
);

app.get(
    "/list",
    async (req: Request<void>, res: Response<TokenHistory | string>) => {
        try {
            const qfilter = req.query.filter || "true";

            if (typeof qfilter !== "string")
                throw new Error("filter must be a string");

            const filter = jsonata(qfilter);
            const matchedTokenIds: Map<string, boolean> = new Map();

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

                const hash = event.args.swarmHash.toHexString().substring(2);
                const found = history.find((x) => x.tokenId === tokenId);

                if (found === undefined) {
                    let match = matchedTokenIds.get(tokenId);
                    if (match === undefined) {
                        try {
                            const metadata = await getTokenMetadata(
                                contract,
                                tokenId
                            );
                            match = !!(await filter.evaluate(
                                metadata.file.data.json()
                            ));
                            matchedTokenIds.set(tokenId, match);
                        } catch (error) {
                            matchedTokenIds.set(tokenId, false);
                        }
                    }
                    if (match)
                        history.push({
                            tokenId: tokenId,
                            hashes: [hash],
                        });
                } else {
                    found.hashes.push(hash);
                }
            }

            res.status(200).json(history);
        } catch (error) {
            console.error("Error getting NFT list:", error);
            res.status(500).send("Error getting NFT list");
        }
    }
);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

async function getTokenMetadata(contract: Contract, tokenId: string) {
    const metadata = await contract.metadata(BigInt(tokenId));

    const file = await new Bee(process.env.SWARM_API_URL).downloadFile(
        metadata.toHexString().substring(2)
    );

    return { metadata, file };
}
