import hardhat from "hardhat"
import { ethers } from "hardhat"

async function main() {
    const provider = ethers.provider

    const walletMnemonic = ethers.Wallet.fromMnemonic(process.env.L1_MNEMONIC as string)
    const walletPrivateKey = new ethers.Wallet(walletMnemonic.privateKey)

    const accountInfo = {
        l1AccountAddr: walletPrivateKey.address,
        l2AccountAddr: process.env.L2_ADDRESS,
        l1Key: walletMnemonic.privateKey,
    }
    const wallet = new ethers.Wallet(accountInfo.l1Key, provider)

    // ------------------------------------------
    // Step 1: Call The Deposit Function on L1
    // ------------------------------------------

    console.log(
        `\nL1 Transaction on ${hardhat.network.name}: Call The Deposit Function on L1 StarkGate:`,
    )
    const L1BridgeContract = await ethers.getContractAt(
        ABI,
        ADDR,
        wallet,
    )
    const l1Bal = await provider.getBalance(accountInfo.l1AccountAddr)
    console.log(
        `    L1 Account Address ${accountInfo.l1AccountAddr
        } has a balance of: ${ethers.utils.formatEther(l1Bal.toString() as string)} ETH`,
    )

    console.log(`    Trying to transfer ${amount} ETH:`)
    console.log(`        from ${accountInfo.l1AccountAddr} (L1 FaucetAccount)`)
    console.log(`        to ${contractInfo.l1BridgeAddr} (L1 StarkGate)`)
    const tx = await L1BridgeContract.deposit(accountInfo.l2AccountAddr, {
        value: ethers.utils.parseUnits(amount, "ether"),
    })
    const receipt = await tx.wait()
    console.log(`    Tx successful with hash: ${receipt.transactionHash}`)

}


main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })