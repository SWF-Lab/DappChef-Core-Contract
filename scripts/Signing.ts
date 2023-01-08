import { ethers } from "hardhat"

async function main() {

    // Prepare the provider & wallet(signer)
    const provider = ethers.provider
    const walletMnemonic = ethers.Wallet.fromMnemonic(process.env.ETHEREUM_PRIVATE_KEY as string)
    const wallet = new ethers.Wallet(walletMnemonic.privateKey, provider)

    // The data to sign
    const problemSolverAddr = '0xDEcf23CbB14972F2e9f91Ce30515ee955a124Cba'
    const problemNumber = '997'
    const problemSolvedTimestamp = 1673070083
    const approverKey = '0xB42faBF7BCAE8bc5E368716B568a6f8Fdf3F84ec'

    console.log(
        `Signer Key Address: ${ethers.utils.computeAddress(wallet.privateKey)}`,
    )
    console.log(`    - Problem Solver Address  : ${problemSolverAddr}`)
    console.log(`    - Problem Number is       : ${problemNumber}`)
    console.log(`    - Problem Solved Timestamp: ${problemSolvedTimestamp}`)
    console.log(`    - Signature Approver Key  : ${approverKey}`)

    // Sign the Msg
    const encode = ethers.utils.solidityPack(
        ["address", "uint256", "uint256", "address"],
        [problemSolverAddr, problemNumber, problemSolvedTimestamp, approverKey]
    )
    const msgHash = ethers.utils.keccak256(encode)
    console.log(`\nSigning Hash: ${msgHash}`)
    const signature = await wallet.signMessage(msgHash);
    console.log(`Signature: ${signature}`)

    // Check the Signature is Valid
    const valid = ethers.utils.recoverAddress(msgHash, signature) == approverKey;
    console.log(`\nCheck the Signature is Valid...${valid ? "Approved!" : "Invalid!"}`)
}


main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })