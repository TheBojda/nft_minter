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

Testing with CURL:

```
curl -X POST http://localhost:3000/mint -H "Content-Type: application/json" -d '{"to": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", "uri": "http://example.com"}'
```