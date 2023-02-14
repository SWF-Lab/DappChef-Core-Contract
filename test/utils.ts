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

export { getSignature }