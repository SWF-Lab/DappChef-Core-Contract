import { ethers } from "hardhat";

const main = async () => {

    const signers = await ethers.getSigners();
    const contractOwner =  signers[0];

    //get signature
    const provider = ethers.provider
    const wallet = new ethers.Wallet(process.env.ETHEREUM_PRIVATE_KEY as any, provider)

    const problemSolver = signers[1]
    const problemSolverAddr = problemSolver.address
    console.log(problemSolverAddr);
    
    const problemNumber = 100
    const problemSolvedTimestamp = 1673070083
    const approverKeyAddr = process.env.DEV_KEY_2_ADDR as string
    const approverIndex = 4
    const nonce = 1

    const messageHash = ethers.utils.solidityKeccak256(["address", "uint256", "uint256", "address", "uint8", "uint256"],
      [problemSolverAddr, problemNumber, problemSolvedTimestamp, approverKeyAddr, approverIndex, nonce])

    const signature = await wallet.signMessage(ethers.utils.arrayify(messageHash))
    console.log(`\nreward mint approved with signature\n: ${signature}.\n`)
    const verified = ethers.utils.verifyMessage(ethers.utils.arrayify(messageHash), signature)
    const valid = verified.toLowerCase() == approverKeyAddr.toLowerCase();
    console.log(`Check the Signature is...${valid ? "Approved!" : "Invalid!"}`)

    //get reward contract
    console.log('Getting the Reward contract...\n');
    //contractAddress
    const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
    const rewardContract = await ethers.getContractAt('Reward', contractAddress);
    

    //name(), symbol()
    const name = await rewardContract.name();
    const symbol = await rewardContract.symbol();
    console.log(`reward collection name: ${name}`);
    console.log(`reward collection symbol: ${symbol}\n`);

    //mint()
    const tokenId = 100;
    const tokenURI = await rewardContract.tokenURI(tokenId);
    console.log(`Minting new rewardNFT...`);
    // let mint = await rewardContract.connect(problemSolver).mint(
    //   problemSolverAddr, 
    //   problemNumber, 
    //   problemSolvedTimestamp, 
    //   approverKeyAddr, 
    //   approverIndex, 
    //   nonce, 
    //   signature,
    //   tokenURI
    // )
    // await mint.wait();
    // console.log(`${symbol} with tokenId: ${tokenId} are minted to ${problemSolverAddr}\n`);
    //problemSolver now have one reward NFT

    //ownerOf()
    const ownerOfToken = await rewardContract.ownerOf(tokenId)
    console.log(`Owner of tokenId ${tokenId}: ${ownerOfToken}`)

    //balanceOf()
    const balanceOfSolver = await rewardContract.balanceOf(problemSolverAddr)
    console.log(`Balance Of address ${problemSolverAddr}: ${balanceOfSolver}`);

    //burn()
    console.log(`\nBurning reward NFT id: ${tokenId}...`)
    const burn = await rewardContract.connect(problemSolver).burn(tokenId);
    await burn.wait();
    console.log(`Reward NFT ${tokenId} burnt`);

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    });