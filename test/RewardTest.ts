import { expect } from "chai"
import { ethers, run } from "hardhat";
import { config } from "../package.json"
import { Contract } from "ethers"
import { getSignature } from "./utils";

// to get approver index
const checkApproverIndex = (address) => {
  if (address === process.env.SERVER_KEY_ADDR) return 0;
  else if (address === process.env.CHEF_KEY_ADDR) return 1;
  else if (address === process.env.LAB_KEY_ADDR) return 2;
  else if (address === process.env.DEV_KEY_1_ADDR) return 3;
  else if (address === process.env.DEV_KEY_2_ADDR) return 4;
  else return (-1);
}

describe("RewardUniTest", () => {
  
  const users: any = []
  let RewardContract: any;
  let rewardContract: any;
  let solverContract: Contract;
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

  before(async () => {
    RewardContract = await ethers.getContractFactory("Reward");
  })

  beforeEach(async () => {
    //deploy the contract
    rewardContract = await RewardContract.deploy();
    await rewardContract.deployed();

    // Get the deployer and solver address from `signers(): randomly created signers in ethers`
    const signers = await ethers.getSigners();
    deployerAddr = signers[0].address;
    solverAddr = signers[1].address;
    nobody

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
  })

  // Returns name of Reward Contract
  it("name(): should return `DappChefRewardNFTtest#1`", async () => {
    expect( await rewardContract.name()).to.equal("DappChefRewardNFTtest#1");
  })

  // Returns symbol of Reward Contract
  it("symbol(): should return `DCR`", async () => {
    expect( await rewardContract.symbol()).to.equal("DCR");
  })

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
    const receipt = await tx.wait();
    const ownerOfCurrentId = await solverContract.ownerOf(id);
    
    expect( ownerOfCurrentId ).to.equal(solverAddr);
    expect( receipt.events[0].event ).to.equal("Transfer");
  })

  // if Solver wants to transfer a token, yet will be banned.
  it("transferFrom(): should revert", async () => {
    const ownerOfCurrentId = await rewardContract.ownerOf(id);
    console.log(ownerOfCurrentId);
    
    // await solverContract.transferFrom(
    //   solverAddr,
    //   deployerAddr,
    //   0
    // );
  })
})