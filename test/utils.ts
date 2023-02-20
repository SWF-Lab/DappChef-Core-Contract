import { ethers } from "hardhat";
import { network } from "hardhat";
import { expect } from "chai";

const getSignature = async (
    signer: any,
    problemSolverAddr: string,
    problemNumber: number,
    problemSolvedTimestamp: number,
    approverKeyAddr: string,
    approverIndex: number
) => {
    // Sign the Msg
    const messageHash = ethers.utils.solidityKeccak256(["address", "uint256", "uint256", "address", "uint8"],
        [problemSolverAddr, problemNumber, problemSolvedTimestamp, approverKeyAddr, approverIndex])
    const signature = await signer.signMessage(ethers.utils.arrayify(messageHash))

    return signature;
}

const getApproverIndex = (address: string) => {
    if (address === process.env.SERVER_KEY_ADDR) return 0;
    else if (address === process.env.CHEF_KEY_ADDR) return 1;
    else if (address === process.env.LAB_KEY_ADDR) return 2;
    else if (address === process.env.DEV_KEY_1_ADDR) return 3;
    else if (address === process.env.DEV_KEY_2_ADDR) return 4;
    else return (-1);
}

const getMsgHash = (
    problemSolverAddr: string, 
    problemNumber: number, 
    problemSolvedTimestamp: number, 
    approverKeyAddr: string, 
    approverIndex: number
) => {
    const messageHash = ethers.utils.solidityKeccak256(
        ["address", "uint256", "uint256", "address", "uint8"],
        [problemSolverAddr, problemNumber, problemSolvedTimestamp, approverKeyAddr, approverIndex]
    );
    return messageHash;
}

const getEthMsgHash = (
    problemSolverAddr: string, 
    problemNumber: number, 
    problemSolvedTimestamp: number, 
    approverKeyAddr: string, 
    approverIndex: number
) => {
    const messageHash = getMsgHash(
        problemSolverAddr, 
        problemNumber, 
        problemSolvedTimestamp, 
        approverKeyAddr, 
        approverIndex
    );
    const signingHash = ethers.utils.solidityKeccak256(["string", "bytes32"], ["\x19Ethereum Signed Message:\n32", messageHash]);
    return signingHash;
}

const setupProviderAndAccount = async () => {
    let provider: any;

    if (network.name === "hardhat" || network.name === "localhost") provider = ethers.provider;
    // else provider = new ethers.providers.JsonRpcProvider(network.config);

    const signer = new ethers.Wallet(process.env.ETHEREUM_PRIVATE_KEY as any, provider); // signer in backend

    const signers = await ethers.getSigners();
    const deployer = signers[0]; // deployer
    const owner = signers[1] // an owner that will be added in the owners group
    const solver1 = signers[2]; // solver
    const solver2 = signers[3];
    const solver3 = signers[4];
    const solver4 = signers[5]

    return [provider, signer, deployer, owner, solver1, solver2, solver3, solver4];
}

const getCurrentTimestamp = async (provider: any) => {
    const currentBlockNum = await provider.getBlockNumber();
    const block = await provider.getBlock(currentBlockNum);
    return block.timestamp;
}

const getRandomProblemNum = () => {
  const min = Math.ceil(0);
  const max = Math.floor(100);
  return Math.floor(Math.random() * (max - min) + min);
}

const generateMintingDataForOneProblem = async(
    provider: any,
    signer: any,
    problemSolverAddr: string,
    approverKeyAddr: string,
) => {
    const problemSolvedTimestamp = await getCurrentTimestamp(provider);
    const approverIndex = getApproverIndex(approverKeyAddr);
    const problemNum = 10;
    const signature = await getSignature(
        signer,
        problemSolverAddr,
        problemNum,
        problemSolvedTimestamp,
        approverKeyAddr,
        approverIndex);
    return {
        problemSolverAddr, 
        problemNum, 
        problemSolvedTimestamp, 
        approverKeyAddr, 
        approverIndex, 
        signature
    };
}

const generateMintingDataForMultipleProblems = async(
    provider: any,
    signer: any,
    problemSolverAddr: string,
    approverKeyAddr: string,
) => {
    const problemSolvedTimestamp = await getCurrentTimestamp(provider);
    const approverIndex = getApproverIndex(approverKeyAddr);
    const problemNum = getRandomProblemNum();
    const signature = await getSignature(
        signer,
        problemSolverAddr,
        problemNum,
        problemSolvedTimestamp,
        approverKeyAddr,
        approverIndex);
    return {
        problemSolverAddr, 
        problemNum, 
        problemSolvedTimestamp, 
        approverKeyAddr, 
        approverIndex, 
        signature
    };
}

const generateTokenUri = (id: number) => {
    return `http://<IPFS_prefix>/TOKEN#${id}`
}

const checkAfterTransfer = async (
    signersIndex: number,
    rewardContract: any,
    id: number,
    address: string,
    solvingStatus: any,
) => {
    // balance
    expect( await rewardContract.balanceOf(address)).to.equal(1);

    // ownerOf
    expect( await rewardContract.ownerOf(id)).to.equal(address);

    // check tokenUri
    expect( await rewardContract.tokenURI(id)).to.equal(generateTokenUri(id));

    // check SolvingStatus
    const SolvingStatus = await rewardContract.getSolvingStatus(address);   
    const length = parseInt(SolvingStatus[0]._hex, 16);
    let solver: any;
    if (signersIndex == 0) solver = solvingStatus.deployer;
    else if (signersIndex == 1) solver = solvingStatus.owner;
    else if (signersIndex == 2) solver = solvingStatus.solver1;
    else if (signersIndex == 3) solver = solvingStatus.solver2;
    else if (signersIndex == 4) solver = solvingStatus.solver3;
    else if (signersIndex == 5) solver = solvingStatus.solver4;
    console.log(SolvingStatus[1]);
    console.log(solver);
    
    expect( length ).to.equal(solver.length);
    for (let i = 0; i < solver.length; i++) {
      expect( parseInt(SolvingStatus[1][solver[i][0]]._hex, 16) ).to.equal(solver[i][1]);
    }
}
export default{ 
    getSignature, 
    getMsgHash, 
    getEthMsgHash,
    getCurrentTimestamp, 
    getApproverIndex, 
    setupProviderAndAccount,
    generateMintingDataForOneProblem,
    generateMintingDataForMultipleProblems,
    generateTokenUri,
    checkAfterTransfer
}