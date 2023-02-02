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
    const msgHash = ethers.utils.solidityKeccak256(["bytes"], [encode]);

    // const prefix = "\x19Ethereum Signed Message:\n32";
    // const msg = ethers.utils.solidityKeccak256(["string", "bytes32"], 
        // [prefix, msgHash])
    // console.log(msg);
    
    const messageHashBinary = "\x19Ethereum Signed Message:\n" + ethers.utils.arrayify(msgHash).length + ethers.utils.arrayify(msgHash)
    
    const signature = await wallet.signMessage(msgHash)
    const verified = ethers.utils.verifyMessage(msgHash, signature)
      
    console.log(`${verified}`);
    console.log(`\nSigning Hash: ${msgHash}`)
    console.log(`Signature: ${signature}`)

    // Check the Signature is Valid

    const valid = verified == approverKeyAddr;
    console.log(`\nCheck the Signature is...${valid ? "Approved!" : "Invalid!"}`)
    console.log(`${problemSolverAddr}, ${problemNumber}, ${problemSolvedTimestamp}, ${approverKeyAddr}, ${signature}`);
        
    // for(let i = 0; i < messageHashBinary.length; i++) console.log(messageHashBinary[i]);
    console.log("\n==============================================================\n");
    const mh = ethers.utils.id("Hello World");
    const mhb = ethers.utils.arrayify(mh)
    console.log(ethers.utils.hexlify(mhb));
    const sg = await wallet.signMessage(mhb)
    const recovered = ethers.utils.verifyMessage(mhb, sg)
    console.log(sg);
    console.log(recovered);
    
    
    
}


main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })