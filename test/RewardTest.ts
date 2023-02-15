import { expect } from "chai"
import { ethers, run } from "hardhat";
import { config } from "../package.json"
import { Contract } from "ethers"
import { getSignature } from "./utils";

// to get approver index
const checkApproverIndex = (address: string) => {
  if (address === process.env.SERVER_KEY_ADDR) return 0;
  else if (address === process.env.CHEF_KEY_ADDR) return 1;
  else if (address === process.env.LAB_KEY_ADDR) return 2;
  else if (address === process.env.DEV_KEY_1_ADDR) return 3;
  else if (address === process.env.DEV_KEY_2_ADDR) return 4;
  else return (-1);
}

describe("RewardUniTest", () => {
  
  const users: any[] = []
  let RewardContract: any;
  let rewardContract: any;
  let solverContract: Contract;
  let signers
  let deployerAddr: string;

  // for solver 
  let solverAddr: string;
  let nobody: string;
  let problemNumber: string;
  let problemSolvedTimestamp: number;
  let approverKeyAddr: string;
  let approverIndex: number;
  let signature: any;
  let id: number = 0;

  // get Contract instance
  before(async () => {
    RewardContract = await ethers.getContractFactory("Reward");
    //deploy the contract
    rewardContract = await RewardContract.deploy();
    await rewardContract.deployed();

    // Get the deployer and solver address from `signers(): randomly created signers in ethers`
    signers = await ethers.getSigners();
    deployerAddr = signers[0].address;
    solverAddr = signers[1].address;
    nobody = signers[2].address;

    // === solver as msg.sender
    solverContract = rewardContract.connect(signers[1]);

    // Mock of a person's minting data when the one solves a problem
    // solverAddr 
    const provider = ethers.provider;
    const signer = new ethers.Wallet(process.env.ETHEREUM_PRIVATE_KEY as any, provider);
    problemNumber = '183';
    problemSolvedTimestamp = 1673070023;
    approverKeyAddr = signer.address;
    approverIndex = checkApproverIndex(signer.address);
    signature = getSignature(
      signer,
      solverAddr,
      problemNumber,
      problemSolvedTimestamp,
      approverKeyAddr,
      approverIndex
    );
  });

  // Returns name of Reward Contract NFT
  it("name(): should return `DappChefRewardNFTtest#1`", async () => {
    expect( await rewardContract.name()).to.equal("DappChefRewardNFTtest#1");
  });

  // Returns symbol of Reward Contract NFT
  it("symbol(): should return `DCR`", async () => {
    expect( await rewardContract.symbol()).to.equal("DCR");
  });

  // Returns nowTotal of Reward Contract NFT
  it("symbol(): should return `101`", async () => {
    expect( String(await rewardContract.nowTotal())).to.equal("101");
  });

  // Solver mints a Token
  it("mint(): should succuessfully mint and emit a Transfer event", async () => {
    // expect()
    const tx = 
      await solverContract.mint(
        solverAddr,
        problemNumber,
        problemSolvedTimestamp,
        approverKeyAddr,
        approverIndex,
        signature,
        "tokenURI_0"
      )  
    const receipt = await tx.wait(); // wait to avoid nonce issue
    const ownerOfCurrentId = await solverContract.ownerOf(id);
    
    expect( ownerOfCurrentId ).to.equal(solverAddr);
    expect( receipt.events[0].event ).to.equal("Transfer");
  });

  // change isAcceptedToTransfer into true
  it("setIsAcceptedToTransfer(): converts isAcceptedToTransfer to true", async () => {    
    await rewardContract.setIsAcceptedToTransfer(true);
  });

  it ("transferFrom(): NFTs should be transferable now", async () => {
    await solverContract.transferFrom(
      solverAddr,
      nobody,
      0
    );
  });

  it ("safeTransferFrom(): NFTs should also be able to transfer via this", async () => {
    // nobody as the 
    const nobodyContract = rewardContract.connect(signers[2])
    await nobodyContract.transferFrom(
      nobody,
      solverAddr,
      0
    );
  });

  // setOwner
  it("setOwner: an owner member should be able to add a owner member", async () => {
    await rewardContract.setOwner(nobody);
  });

  // the nobody should be able to change isAcceptedToTransfer
  it("setIsAcceptedToTransfer(): the new owner should be able to change isAcceptedToTransfer", async () => {    
    await rewardContract.setIsAcceptedToTransfer(false);
  });
})