# nft_minter
Mint NFT from the given JSON, and store the content on Ethereum Swarm in Beeson

Usage (testing):

```
npx hardhat node (in a separated terminal)
```

Copy the private key to .env/OWNER_PRIVATE_KEY

```
yarn deploy
```

Copy the contract address to .env/CONTRACT_ADDRESS

```
yarn start
```

**Testing with CURL**

Minting NFT:

```
curl -X POST http://localhost:3000/mint -H "Content-Type: application/json" -d '{"to": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", "content": {"foo": "bar"}}'
```

Example result:

```json
{
    "message":"NFT minted successfully!",
    "tokenId":"4345dacc-9f8b-4eef-a01c-1ae7f37abd45",
    "swarmReference":"fffd122f99affd130ce792f693279474f90b1e38ddd8790c9738e2189fec2826"
}
```

Getting NFT metadata by NFT ID:

```
curl -X GET http://localhost:3000/metadata/4345dacc-9f8b-4eef-a01c-1ae7f37abd45
```

Example result:

```json
{
    "swarmReference":"fffd122f99affd130ce792f693279474f90b1e38ddd8790c9738e2189fec2826",
    "content":{"foo":"bar"}
}
```