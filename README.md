# nft_minter
Mint NFT from the given JSON, and store the content on Ethereum Swarm in Beeson

Usage (testing):

```
yarn blockchain (in a separated terminal)
```

Copy the private key to .env/OWNER_PRIVATE_KEY

```
yarn bee (in a separated terminal)
```

```
curl -X http://localhost:1633/stamps/10000000/18
```

Copy the postage batch ID to .env/POSTAGE_BATCH_ID

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
    "message": "NFT minted successfully!",
    "tokenId": "0xafad2547ea3a4e18e86638b6b72120f55889f97c65699d54af735ac60f729f25",
    "swarmReference": "8a9486899faa8bb0b4f9256cc276b6fbe738c0ab9c2b55c490bbb8fc6a1f0c1e"
}
```

Getting NFT metadata by NFT ID:

```
curl -X GET http://localhost:3000/metadata/0xafad2547ea3a4e18e86638b6b72120f55889f97c65699d54af735ac60f729f25
```

Example result:

```json
{
    "swarmReference": "8a9486899faa8bb0b4f9256cc276b6fbe738c0ab9c2b55c490bbb8fc6a1f0c1e",
    "content": {
        "foo": "bar",
        "_nftID": "0xafad2547ea3a4e18e86638b6b72120f55889f97c65699d54af735ac60f729f25"
    }
}
```

Getting NFT history by owner address:

```
curl -X GET http://localhost:3000/history/0x70997970C51812dc3A010C7d01b50e0d17dc79C8
```

Example result:

```json
{
    "0x064798ccbb56c1677162fbde30e0e3ec247d59f7c9861cd6e33bc59bfd469011": [
        "69f734d9e38c95115b873a7e4225973a7b813fe5ae49de7440149c3bf9af51cb"
    ],
    "0xafad2547ea3a4e18e86638b6b72120f55889f97c65699d54af735ac60f729f25": [
        "8a9486899faa8bb0b4f9256cc276b6fbe738c0ab9c2b55c490bbb8fc6a1f0c1e"
    ]
}
```

Every key is an NFT ID, and the value is an array of Swarm hases generated from the MetadataUpdated events.