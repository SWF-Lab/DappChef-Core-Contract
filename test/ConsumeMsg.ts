import { expect } from "chai"
import { ethers } from "hardhat"

// to get approver index
const checkApproverIndex = (address) => {
    if (address === process.env.SERVER_KEY_ADDR) return 0;
    else if (address === process.env.CHEF_KEY_ADDR) return 1;
    else if (address === process.env.LAB_KEY_ADDR) return 2;
    else if (address === process.env.DEV_KEY_1_ADDR) return 3;
    else if (address === process.env.DEV_KEY_2_ADDR) return 4;
    else return (-1);
}

describe("ConsumeMsg", () => {
    let consumeMsgContract: any

    const users: any = []

    before(async () => {
        
    })

    describe("verifySignature", () => {
        it("should verify signature", async () => {
            // signer
            const provider = ethers.provider;
            const signer = new ethers.Wallet(process.env.ETHEREUM_PRIVATE_KEY as any, provider);

            // contract deployment
            const ConsumeMsg = await ethers.getContractFactory("ConsumeMsg");
            const ConsumeMsgContract = await ConsumeMsg.deploy();
            await ConsumeMsgContract.deployed();

            // solver info ( data need to be signed)
            const problemSolverAddr = '0xDEcf23CbB14972F2e9f91Ce30515ee955a124Cba';
            const problemNumber = '997';
            const problemSolvedTimestamp = 1673070083;
            const approverKeyAddr = signer.address;
            const approverIndex = checkApproverIndex(signer.address);

            const hash = await ConsumeMsgContract.getMessageHash(
                problemSolverAddr,
                problemNumber,
                problemSolvedTimestamp,
                approverKeyAddr,
                approverIndex,
            )

            const sig = await signer.signMessage(ethers.utils.arrayify(hash));
            const ethHash = await ConsumeMsgContract.getEthSignedMessageHash(hash);

            // logging solver entire signature infomation 
            console.log(`      Solver and Signer Infomation:`);
            console.log(`      - solver:           ${problemSolverAddr}`);
            console.log(`      - problem number:   ${problemNumber}`);
            console.log(`      - timestamp:        ${problemSolvedTimestamp}`);
            console.log(`      - approver address: ${approverKeyAddr}`);
            console.log(`      - approver index:   ${approverIndex}`);
            console.log(`      - signature:        ${sig}\n`)
            
            // console.log("      recovered approver: ", await ConsumeMsgContract.recoverSigner(ethHash, sig));

            // should return true
            expect(
                console.log(
                    "      Sending Above as Inputs, It will return ... " +
                    await ConsumeMsgContract.VerifySignature(
                        problemSolverAddr,
                        problemNumber,
                        problemSolvedTimestamp,
                        approverKeyAddr,
                        approverIndex,
                        sig
                    )
                )
            )

            // wrong approverKeyAddr => should return false
            expect(
                console.log(
                    "      Converting Approver Address into Zero Address, It will return ... " +
                    await ConsumeMsgContract.VerifySignature(
                        problemSolverAddr,
                        problemNumber,
                        problemSolvedTimestamp,
                        ethers.constants.AddressZero, // zero address
                        approverIndex,
                        sig
                    )
                )
            )
        })  
    })
})