import { ethers } from "ethers";

const getSignature = async (
    wallet: any,
    problemSolverAddr: string,
    problemNumber: string,
    problemSolvedTimestamp: number,
    approverKeyAddr: string,
    approverIndex: number
) => {
    // Sign the Msg
    const encode = ethers.utils.solidityPack(
        ["address", "uint256", "uint256", "address", "uint8"],
        [problemSolverAddr, problemNumber, problemSolvedTimestamp, approverKeyAddr, approverIndex]
    )
    const msgHash = ethers.utils.keccak256(encode)

    const messageHash = ethers.utils.solidityKeccak256(["address", "uint256", "uint256", "address", "uint8"],
        [problemSolverAddr, problemNumber, problemSolvedTimestamp, approverKeyAddr, approverIndex])
    const signingHash = ethers.utils.solidityKeccak256(["string", "bytes32"], ["\x19Ethereum Signed Message:\n32", messageHash])
    const signature = await wallet.signMessage(ethers.utils.arrayify(messageHash))

    return signature;
}

const checkApproverIndex = (address: string) => {
    if (address === process.env.SERVER_KEY_ADDR) return 0;
    else if (address === process.env.CHEF_KEY_ADDR) return 1;
    else if (address === process.env.LAB_KEY_ADDR) return 2;
    else if (address === process.env.DEV_KEY_1_ADDR) return 3;
    else if (address === process.env.DEV_KEY_2_ADDR) return 4;
    else return (-1);
}

const getMsgHash = (
    problemSolverAddr: string, 
    problemNumber: string, 
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
    problemNumber: string, 
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

export { getSignature, getMsgHash, getEthMsgHash, checkApproverIndex }