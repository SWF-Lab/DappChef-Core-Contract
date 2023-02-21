import { expect } from "chai"
import { ethers } from "hardhat"
import utils from "./utils";

describe("ConsumeMsg", () => {
  let provider: any;
  let signer: any;
  let signers: any;
  let consumeMsgContract: any;
  let ConsumeMsgContract: any;
  let problemSolverAddr: string;
  let problemNumber: number;
  let problemSolvedTimestamp: number;
  let approverKeyAddr: string;
  let approverIndex: number;
  let signature: string;

  describe("Unit test",async () => {
    beforeEach( async () => {
      // signer
      provider = ethers.provider;
      signer = new ethers.Wallet(process.env.ETHEREUM_PRIVATE_KEY as any, provider);
      approverKeyAddr = signer.address;

      // contract deployment
      ConsumeMsgContract = await ethers.getContractFactory("ConsumeMsg");
      consumeMsgContract = await ConsumeMsgContract.deploy();
      await consumeMsgContract.deployed();

      // solver info ( data need to be signed)
      signers = await ethers.getSigners()
      problemSolverAddr = signers[0].address;
      
      const data = await utils.generateMintingDataForOneProblem(
          provider, signer, problemSolverAddr, approverKeyAddr
      );
      problemSolverAddr = data.problemSolverAddr; 
      problemNumber = data.problemNumber;
      problemSolvedTimestamp = data.problemSolvedTimestamp; 
      approverKeyAddr = data.approverKeyAddr; 
      approverIndex = data.approverIndex; 
      signature = data.signature;
      
    });
    
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
        utils.getMsgHash(
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
        utils.getEthMsgHash(
          problemSolverAddr, 
          problemNumber,
          problemSolvedTimestamp,
          approverKeyAddr,
          approverIndex
        )
      );
    });

    it("should correctly split signature", async () => {
        const signature = await utils.getSignature(
          signer,
          problemSolverAddr, 
          problemNumber,
          problemSolvedTimestamp,
          approverKeyAddr,
          approverIndex
        )
        const {r, s, v} = ethers.utils.splitSignature(signature);

        const split = await consumeMsgContract.splitSignature(signature)
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
        
        expect(
          await consumeMsgContract.recoverSigner(
            ethMsgHash,
            signature
          )
        ).to.equal(approverKeyAddr);
    });

    it("should correctly verifySignature", async () => {

      expect(
        await consumeMsgContract.VerifySignature(
          problemSolverAddr,
          problemNumber,
          problemSolvedTimestamp,
          approverKeyAddr,
          approverIndex,
          signature
        )
      ).to.equal(true);
    });
});
    
})
