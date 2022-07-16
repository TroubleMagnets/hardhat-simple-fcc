import { ethers } from "ethers";
import * as dotenv from "dotenv";
import * as fs from "fs-extra";

dotenv.config();

async function main() {
    const provider = new ethers.providers.JsonRpcProvider(
        process.env.RCP_PROVIDER
    );

    const encryptedJson = fs.readFileSync("./.encryptedKey.json", "utf8");
    let wallet = await ethers.Wallet.fromEncryptedJson(
        encryptedJson,
        process.env.PRIVATE_KEY_PASSWORD!
    );

    wallet = wallet.connect(provider);

    const abi = fs.readFileSync(
        "./SimpleStorage_sol_SimpleStorage.abi",
        "utf8"
    );
    const binary = fs.readFileSync(
        "./SimpleStorage_sol_SimpleStorage.bin",
        "utf8"
    );

    const contractFactory = new ethers.ContractFactory(abi, binary, wallet);
    console.log("Deploying, please wait...");
    const contract = await contractFactory.deploy();
    await contract.deployTransaction.wait(1);
    console.log(`Contract Address: ${contract.address}`);

    // Get number
    const currFavNum = await contract.retrieve();
    console.log(`Fav Number: ${currFavNum.toString()}`);

    const txResponse = await contract.store(12);
    const txReceipt = await txResponse.wait(1);
    const updatedFavNun = await contract.retrieve();
    console.log(`Updated Number: ${updatedFavNun.toString()}`);
}

main()
    .then(() => {
        process.exit(0);
    })
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
