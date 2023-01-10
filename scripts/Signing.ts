import { ethers } from "hardhat"

async function main() {

    // Prepare the provider & wallet(signer)
    const provider = ethers.provider
    const wallet = new ethers.Wallet(process.env.ETHEREUM_PRIVATE_KEY as any, provider)

    // The data to sign
    const problemSolverAddr = '0xDEcf23CbB14972F2e9f91Ce30515ee955a124Cba'
    const problemNumber = '997'
    const problemSolvedTimestamp = 1673070083
    const approverKeyAddr = process.env.DEV_KEY_2_ARRR as string

    console.log(
        `Signer Key Address: ${wallet.address}`,
    )
    console.log(`    - Problem Solver Address  : ${problemSolverAddr}`)
    console.log(`    - Problem Number is       : ${problemNumber}`)
    console.log(`    - Problem Solved Timestamp: ${problemSolvedTimestamp}`)
    console.log(`    - Signature Approver Key  : ${approverKeyAddr}`)

    // Sign the Msg
    const encode = ethers.utils.solidityPack(
        ["address", "uint256", "uint256", "address"],
        [problemSolverAddr, problemNumber, problemSolvedTimestamp, approverKeyAddr]
    )
    const msgHash = ethers.utils.keccak256(encode)

    const messageHash = ethers.utils.solidityKeccak256(["address", "uint256", "uint256", "address"],
        [problemSolverAddr, problemNumber, problemSolvedTimestamp, approverKeyAddr])
    const messageHashBinary = "\x19Ethereum Signed Message:\n" + ethers.utils.arrayify(messageHash).length + ethers.utils.arrayify(messageHash)
    const signature = await wallet.signMessage(messageHashBinary)
    const verified = ethers.utils.verifyMessage(messageHashBinary, signature)


    console.log(`\nSigning Hash: ${msgHash}`)
    console.log(`Signature: ${signature}`)

    // Check the Signature is Valid

    const valid = verified == approverKeyAddr;
    console.log(`\nCheck the Signature is...${valid ? "Approved!" : "Invalid!"}`)
}


main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })