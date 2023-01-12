import { ethers } from "hardhat"

async function main() {

    // Prepare the provider & wallet(signer)
    const provider = ethers.provider
    const wallet = new ethers.Wallet(process.env.ETHEREUM_PRIVATE_KEY as any, provider)

    // The data to sign
    const problemSolverAddr = '0xDEcf23CbB14972F2e9f91Ce30515ee955a124Cba'
    const problemNumber = '997'
    const problemSolvedTimestamp = 1673070083
    const approverKeyAddr = process.env.DEV_KEY_1_ARRR as string

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
    const prefix = "\x19Ethereum Signed Message:\n";
    const msg = ethers.utils.solidityKeccak256(["string", "bytes32"], 
        [prefix, msgHash])
    console.log(msg);
    
    const messageHashBinary = "\x19Ethereum Signed Message:\n" + ethers.utils.arrayify(messageHash).length + ethers.utils.arrayify(messageHash)
    
    const signature = await wallet.signMessage("0x58c195d0cad5b5d8ffa9fa639cd04308203b86332f9fac3643d82498aa479f25")
    const verified = ethers.utils.verifyMessage(ethers.utils.hexlify("0x58c195d0cad5b5d8ffa9fa639cd04308203b86332f9fac3643d82498aa479f25"), signature)

    // const sig = ethers.utils.splitSignature(signature);
    // console.log(sig.v, sig.r, sig.s);
     
    console.log(`${verified}`);
    console.log(`\nSigning Hash: ${msgHash}`)
    console.log(`Signature: ${signature}`)

    // Check the Signature is Valid

    const valid = verified == approverKeyAddr;
    console.log(`\nCheck the Signature is...${valid ? "Approved!" : "Invalid!"}`)
    console.log(`${problemSolverAddr}, ${problemNumber}, ${problemSolvedTimestamp}, ${approverKeyAddr}, ${signature}`);
        
    // for(let i = 0; i < messageHashBinary.length; i++) console.log(messageHashBinary[i]);
    
    
}


main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })