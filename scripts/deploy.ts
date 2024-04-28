import { ethers } from "hardhat";

async function main() {
    const signers = await ethers.getSigners()
    const NFTContract = await ethers.getContractFactory("NFTContract");
    const nft_contract = await NFTContract.deploy(signers[0].address);
    console.log(`NFTContract address: ${await nft_contract.getAddress()}`)
}  

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});