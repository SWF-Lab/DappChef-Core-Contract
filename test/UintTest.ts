import { expect } from 'chai';
import { ethers } from 'hardhat';
import { Contract } from "ethers";

const checkApproverIndex = (address: any) => {
  if (address === process.env.SERVER_KEY_ADDR) return 0;
  else if (address === process.env.CHEF_KEY_ADDR) return 1;
  else if (address === process.env.LAB_KEY_ADDR) return 2;
  else if (address === process.env.DEV_KEY_1_ADDR) return 3;
  else if (address === process.env.DEV_KEY_2_ADDR) return 4;
  else return (-1);
}

//===== variables ========
//for reward contract
const ZERO_ADDR = '0x0000000000000000000000000000000000000000';
let rewardContract: any;
let solverContract: Contract;
let deployerAddr: string;
let solverAddr: string;
let nobody: string;

//for signing
let  ConsumeMsgContract: Contract;
const provider = ethers.provider;
const signer = new ethers.Wallet(process.env.ETHEREUM_PRIVATE_KEY as any, provider)

//for mint
const problemNumber = 123;
const timestamp = 1673070083;
const nonce = 0;
const signerAddr = signer.address;
const approverIndex = checkApproverIndex(signerAddr)
const tokenURI= "ipfs://<ipfsPrefix>/0";
const firstMintId = 0;
const nonExistTokenId = 1000;
let  signature: string;

const signing = async () => {
  let ConsumeMsg = await ethers.getContractFactory("ConsumeMsg");
  ConsumeMsgContract = await ConsumeMsg.deploy();
  await ConsumeMsgContract.deployed();

  //sign message
  const messageHash = ethers.utils.solidityKeccak256(
    ["address", "uint256", "uint256", "address", "uint8", "uint256"],
    [solverAddr, problemNumber, timestamp, signerAddr, approverIndex, nonce]
  )
  signature = await signer.signMessage(ethers.utils.arrayify(messageHash))
}

const deploy = async () => {
  const RewardContract = await ethers.getContractFactory("Reward");

  //deploy the contract
  rewardContract = await RewardContract.deploy();
  await rewardContract.deployed();

  // Get the deployer and solver address from `signers(): randomly created signers in ethers`
  let signers = await ethers.getSigners();
  deployerAddr = signers[0].address;
  solverAddr = signers[1].address;
  nobody = signers[2].address;

  // === solver as msg.sender
  solverContract = rewardContract.connect(signers[1]);
}

//===== TEST =====

describe("UnitTest",() => {  
  
  context("ERC721 behavior", () => {
    beforeEach(async () => {
      await deploy();
      await signing();
    })

    describe("mint", async () => {  
      it("reverts with a null destination address", () => {
        expect(rewardContract.mint(
          ZERO_ADDR, problemNumber, timestamp, signer, approverIndex, nonce, signature, tokenURI
        )).to.be.revertedWith("mint to zero address")
      })
    })
  
    context("token minted", async() => {
      beforeEach(async () => {
        //mint token
        await solverContract.mint(
          solverAddr, problemNumber, timestamp, signer, approverIndex, nonce, signature, tokenURI
        )
      })
      describe("balanceOf", () => {
        it("returns the amount of tokens owned by the given address", async () => {
          expect(await rewardContract.balanceOf(solverAddr)).to.be.equal(1);
        })

        it("returns 0 when the given address does not own any tokens", async () => {
          expect(await rewardContract.balanceOf(nobody)).to.be.equal(0);
        })

        it("reverts when given zero address", async () => {
          expect(await rewardContract.balanceOf(ZERO_ADDR)).to.be.revertedWith("owner = zero address")

      describe("ownerOf", () => {
        it("returns the owner of the given token ID", async () => {
          expect(await rewardContract.ownerOf(firstMintId)).to.be.equal(solverAddr);
        })

        it("reverts with not existed token", async () => {
          expect(await rewardContract.ownerOf(nonExistTokenId)).to.be.revertedWith("token doesn't exist")
        })
      })
      describe("transfer", async () => {
        describe("via transferFrom", async () => {
          it("", () => {

          })
        })
        describe("via safeTransferFrom", async () => {
          it("", () => {

          })
        })
        describe("via safeTransferFrom (with data)", async() => {
          it("", () => {

          })
        })
      })
      describe("approve", async () => {
        it("", () => {
          //approve()
          //can transferFrom
        })
      })
      describe("getApproved", async () => {
        it("", () => {
          //getApproved()
          //can transferFrom
        })
      })
      describe("setApprovalForAll", async () => {
        it("isApprovedForAll", () => {
          //setApprovalForAll()
        })
      })
    
      describe("burn", async () => {
        it("should burn", () => {
          //burn
          //ownerOf
        })
      })
    })
  })

  //=====

  context("ERC721 metadata",  () => {
    beforeEach(async () => {
      await deploy();
    })
    it("has a name", async () => {
      expect(await rewardContract.name()).to.be.equal("");
    })
    it("has a symbol", async () => {
      expect(await rewardContract.symbol()).to.be.equal("");
    })
    describe("tokenURI", async () => {
      it("should return tokenURI", async () => {
        //mint
        await signing();
        await rewardContract.mint(
          solverAddr, problemNumber, timestamp, signer, approverIndex, nonce, signature, tokenURI
        )
        //get tokenURI
        expect(await rewardContract.tokenURI(firstMintId)).to.be.equal(tokenURI);
      })
    })
  })
})
})
})
// module.exports = {
//   UnitTest
// }
