import { expect } from "chai"
import { ethers } from "hardhat"
import { Contract } from "ethers";

// to get approver index
const checkApproverIndex = (address: any) => {
    if (address === process.env.SERVER_KEY_ADDR) return 0;
    else if (address === process.env.CHEF_KEY_ADDR) return 1;
    else if (address === process.env.LAB_KEY_ADDR) return 2;
    else if (address === process.env.DEV_KEY_1_ADDR) return 3;
    else if (address === process.env.DEV_KEY_2_ADDR) return 4;
    else return (-1);
}

describe("ConsumeMsg", () => {
    let ConsumeMsgContract: Contract;
    let users:  any[] = [];
    const provider = ethers.provider;
    const signer = new ethers.Wallet(process.env.ETHEREUM_PRIVATE_KEY as any, provider);

     // solver info ( data need to be signed)
    const problemSolverAddr = '0xDEcf23CbB14972F2e9f91Ce30515ee955a124Cba';
    const problemNumber = '997';
    const problemSolvedTimestamp = 1673070083;
    const approverKeyAddr = signer.address;
    const approverIndex = checkApproverIndex(signer.address);
    const nonce = 0;


    beforeEach(async () => {
        let ConsumeMsg = await ethers.getContractFactory("ConsumeMsg");
        ConsumeMsgContract = await ConsumeMsg.deploy();
        await ConsumeMsgContract.deployed();
    })

    describe("verifySignature", () => {
        it("should verify signature", async () => {
            const hash = await ConsumeMsgContract.getMessageHash(
                problemSolverAddr,
                problemNumber,
                problemSolvedTimestamp,
                approverKeyAddr,
                approverIndex,
                nonce
            )
            
            const sig = await signer.signMessage(ethers.utils.arrayify(hash));

            // logging solver entire signature infomation 
            console.log(`      Solver and Signer Infomation:`);
            console.log(`      - solver:           ${problemSolverAddr}`);
            console.log(`      - problem number:   ${problemNumber}`);
            console.log(`      - timestamp:        ${problemSolvedTimestamp}`);
            console.log(`      - approver address: ${approverKeyAddr}`);
            console.log(`      - approver index:   ${approverIndex}`);
            console.log(`      - nonce:            ${nonce}`);
            console.log(`      - signature:        ${sig}\n`)
            
            // console.log("      recovered approver: ", await ConsumeMsgContract.recoverSigner(ethHash, sig));

            // should return true
            expect(
                  await ConsumeMsgContract.VerifySignature(
                        problemSolverAddr,
                        problemNumber,
                        problemSolvedTimestamp,
                        approverKeyAddr,
                        approverIndex,
                        nonce,
                        sig
                  )  
            ).to.equal(true);

            // wrong approverKeyAddr => should return false
            expect(
              await ConsumeMsgContract.VerifySignature(
                  problemSolverAddr,
                  problemNumber,
                  problemSolvedTimestamp,
                  ethers.constants.AddressZero, // zero address
                  approverIndex,
                  nonce,
                  sig
              )
            ).to.equal(false);
        })
    })
})
