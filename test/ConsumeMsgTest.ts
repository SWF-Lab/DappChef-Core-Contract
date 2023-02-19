import { expect } from "chai"
import { ethers } from "hardhat"
import { checkApproverIndex, getMsgHash, getEthMsgHash, getSignature } from "./utils";

describe("ConsumeMsg: Unitest", () => {
    let provider: any;
    let signer: any;
    let consumeMsgContract: any;
    let ConsumeMsgContract: any;
    let problemSolverAddr: string;
    let problemNumber: string;
    let problemSolvedTimestamp: number;
    let approverKeyAddr: string;
    let approverIndex: number;

    beforeEach( async () => {
        // signer
        provider = ethers.provider;
        signer = new ethers.Wallet(process.env.ETHEREUM_PRIVATE_KEY as any, provider);

        // contract deployment
        ConsumeMsgContract = await ethers.getContractFactory("ConsumeMsg");
        consumeMsgContract = await ConsumeMsgContract.deploy();
        await consumeMsgContract.deployed();

        // solver info ( data need to be signed)
        problemSolverAddr = '0xDEcf23CbB14972F2e9f91Ce30515ee955a124Cba';
        problemNumber = '997';
        problemSolvedTimestamp = 1673070083;
        approverKeyAddr = signer.address;
        approverIndex = checkApproverIndex(signer.address);
    })
    

    it("should correctly get messageHash", async () => {
        expect(
            await consumeMsgContract.getMessageHash(
                problemSolverAddr, 
                problemNumber,
                problemSolvedTimestamp,
                approverKeyAddr,
                approverIndex
            )
        ).to.equal(
            getMsgHash(
                problemSolverAddr, 
                problemNumber,
                problemSolvedTimestamp,
                approverKeyAddr,
                approverIndex
            )
        );
    });
    
    it("should correctly get EthSignedMessageHash", async () => {
        const msgHash = await consumeMsgContract.getMessageHash(
            problemSolverAddr, 
            problemNumber,
            problemSolvedTimestamp,
            approverKeyAddr,
            approverIndex
        );
        expect(
            await consumeMsgContract.getEthSignedMessageHash(msgHash)
        ).to.equal(
            getEthMsgHash(
                problemSolverAddr, 
                problemNumber,
                problemSolvedTimestamp,
                approverKeyAddr,
                approverIndex
            )
        );
    });

    it("should correctly split signature", async () => {
        const sig = await getSignature(
            signer,
            problemSolverAddr, 
            problemNumber,
            problemSolvedTimestamp,
            approverKeyAddr,
            approverIndex
        )
        const r = sig.substring(0, 66);
        const s = "0x" + sig.substring(66, 130);
        const rawV = sig.substring(130, 132); // last two hex
        const v = parseInt(rawV, 16);

        const split = await consumeMsgContract.splitSignature(sig)
        expect(split[0]).to.equal(r);
        expect(split[1]).to.equal(s);
        expect(split[2]).to.equal(v);
    });

    it("should recover correct signer", async () => {
        const msgHash = await consumeMsgContract.getMessageHash(
            problemSolverAddr, 
            problemNumber,
            problemSolvedTimestamp,
            approverKeyAddr,
            approverIndex
        );
        const ethMsgHash = await consumeMsgContract.getEthSignedMessageHash(msgHash);

        const sig = await getSignature(
            signer,
            problemSolverAddr, 
            problemNumber,
            problemSolvedTimestamp,
            approverKeyAddr,
            approverIndex
        );
        
        expect(
            await consumeMsgContract.recoverSigner(
                ethMsgHash,
                sig
            )
        ).to.equal(approverKeyAddr);
    });

    it("should correctly verifySignature", async () => {
        const sig = getSignature(
            signer,
            problemSolverAddr, 
            problemNumber,
            problemSolvedTimestamp,
            approverKeyAddr,
            approverIndex
        );
        expect(
            await consumeMsgContract.VerifySignature(
                problemSolverAddr,
                problemNumber,
                problemSolvedTimestamp,
                approverKeyAddr,
                approverIndex,
                sig
            )
        ).to.equal(true)
    });
})