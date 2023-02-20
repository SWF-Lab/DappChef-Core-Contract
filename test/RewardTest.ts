import { expect } from "chai"
import { ethers, run } from "hardhat";
import { config } from "../package.json"
import { Contract } from "ethers"
import utils from "./utils";

const ZERO_ADDRESS = ethers.constants.AddressZero;

describe("Reward Pressure Test - 4 User: ", () => {
  let RewardContract: any;
  let rewardContract: Contract;
  let solverContract: Contract;
  let provider: any;
  let signer: any;
  let deployer: any;
  let owner: any;
  let solver1: any;
  let solver2: any;
  let solver3: any;
  let solver4: any;

  // for solver 
  let solverAddr: string;
  let nobody: string;
  let problemNumber: number;
  let problemSolvedTimestamp: number;
  let approverKeyAddr: string;
  let approverIndex: number;
  let signature: any;
  let id: number = 0;
  let solvingStatus: any = {
    deployer: [],
    owner: [],
    solver1: [],
    solver2: [],
    solver3: [],
    solver4: [],
  }
  
  // get Contract instance
  before(async () => {
    RewardContract = await ethers.getContractFactory("Reward");
    //deploy the contract
    rewardContract = await RewardContract.deploy();
    await rewardContract.deployed();

    [provider, signer, deployer, owner, solver1, solver2, solver3, solver4] = await utils.setupProviderAndAccount();
  });

  describe("check correct deployer, name, symbol and totalNum", () => {
    // Returns name of Reward Contract NFT
    it("name(): should return `DappChefRewardNFTtest#1`", async () => {
      expect( await rewardContract.name()).to.equal("DappChefRewardNFTtest#1");
    });

    // Returns symbol of Reward Contract NFT
    it("symbol(): should return `DCR`", async () => {
      expect( await rewardContract.symbol()).to.equal("DCR");
    });

    it("deployer should be an owner member and be able to get nowTotal", async () => {
      expect( await rewardContract.getNowTotal() ).to.equal(ethers.BigNumber.from(101));
    });
  });
  
  describe("check minting function", () => {
    it('Can deployer start minting? (should be)', async () => {
      // deployer write a problem and start mint with the data sent from backend
      const problemSolverAddr = deployer.address;
      const problemNumber = 18;
      const problemSolvedTimestamp = await utils.getCurrentTimestamp(provider);    
      const approverKeyAddr = signer.address;
      
      const approverIndex = utils.getApproverIndex(signer.address);
      const signature = await utils.getSignature (
        signer,
        problemSolverAddr,
        problemNumber,
        problemSolvedTimestamp,
        approverKeyAddr,
        approverIndex,
      );

      // mint and emit Transfer with correct arguments
      await expect(  
        rewardContract.connect(deployer).mint(
          problemSolverAddr,
          problemNumber,
          problemSolvedTimestamp,
          approverKeyAddr,
          approverIndex,
          signature,
          utils.generateTokenUri(id)
      ))
        .to.emit(rewardContract, "Transfer")
        .withArgs(ZERO_ADDRESS, problemSolverAddr, id);
      solvingStatus.deployer.push([problemNumber, id]);
      await utils.checkAfterTransfer(
        0,
        rewardContract,
        id,
        deployer.address,
        solvingStatus
      );
      id++;
    });

  // Solver mints a Token
    it("Can anyone otherthan deployer start minting? (should be)", async () => {
      const problemNumber = 18;
      const problemSolvedTimestamp = await utils.getCurrentTimestamp(provider);
      const approverKeyAddr = signer.address;
      const approverIndex = utils.getApproverIndex(signer.address);
      const signature = utils.getSignature(
        signer,
        solver1.address,
        problemNumber,
        problemSolvedTimestamp,
        approverKeyAddr,
        approverIndex
      );

      await expect(  
        rewardContract.connect(solver1).mint(
          solver1.address,
          problemNumber,
          problemSolvedTimestamp,
          approverKeyAddr,
          approverIndex,
          signature,
          utils.generateTokenUri(id)
      ))
        .to.emit(rewardContract, "Transfer")
        .withArgs(ZERO_ADDRESS, solver1.address, id);
      solvingStatus.solver1.push([problemNumber, id]);

      
      id++;
    });

    it("Can the 4 selected solvers start minting the same problem? (should be) ", async () => {
      const data1 = await utils.generateMintingDataForOneProblem(provider, signer, solver1.address, signer.address);
      const data2 = await utils.generateMintingDataForOneProblem(provider, signer, solver2.address, signer.address);
      const data3 = await utils.generateMintingDataForOneProblem(provider, signer, solver3.address, signer.address);
      const data4 = await utils.generateMintingDataForOneProblem(provider, signer, solver4.address, signer.address);

      const solverData = [
        {data: data1, solver: solver1}, 
        {data: data2, solver: solver2}, 
        {data: data3, solver: solver3}, 
        {data: data4, solver: solver4}
      ];

      for (let i = 0; i < 4; i ++) {
        await expect(  
          rewardContract.connect(solverData[i].solver).mint(
            solverData[i].data.problemSolverAddr,
            solverData[i].data.problemNum,
            solverData[i].data.problemSolvedTimestamp,
            solverData[i].data.approverKeyAddr,
            solverData[i].data.approverIndex,
            solverData[i].data.signature,
            utils.generateTokenUri(id)
        ))
        .to.emit(rewardContract, "Transfer")
        .withArgs(ZERO_ADDRESS, solverData[i].data.problemSolverAddr, id);
  
        // balance
        let tokenNum: number;
        if (i == 0) tokenNum = 2;
        else tokenNum = 1;
        expect( await rewardContract.balanceOf(solverData[i].data.problemSolverAddr)).to.equal(tokenNum);
    
        // ownerOf
        expect( await rewardContract.ownerOf(id)).to.equal(solverData[i].data.problemSolverAddr);
        // check tokenUri
        expect( await rewardContract.tokenURI(id)).to.equal(utils.generateTokenUri(id));
        id++;
      }
    });

    it("Can the 4 selected solvers start minting different problems? (should be) ", async () => {
      const data1 = await utils.generateMintingDataForMultipleProblems(provider, signer, solver1.address, signer.address);
      const data2 = await utils.generateMintingDataForMultipleProblems(provider, signer, solver2.address, signer.address);
      const data3 = await utils.generateMintingDataForMultipleProblems(provider, signer, solver3.address, signer.address);
      const data4 = await utils.generateMintingDataForMultipleProblems(provider, signer, solver4.address, signer.address);

      const solverData = [
        {data: data1, solver: solver1}, 
        {data: data2, solver: solver2}, 
        {data: data3, solver: solver3}, 
        {data: data4, solver: solver4}
      ];

      for (let i = 0; i < 4; i ++) {
        await expect(  
          rewardContract.connect(solverData[i].solver).mint(
            solverData[i].data.problemSolverAddr,
            solverData[i].data.problemNum,
            solverData[i].data.problemSolvedTimestamp,
            solverData[i].data.approverKeyAddr,
            solverData[i].data.approverIndex,
            solverData[i].data.signature,
            utils.generateTokenUri(id)
        ))
        .to.emit(rewardContract, "Transfer")
        .withArgs(ZERO_ADDRESS, solverData[i].data.problemSolverAddr, id);
  
        // balance
        let tokenNum: number;
        if (i == 0) tokenNum = 3;
        else tokenNum = 2;
        expect( await rewardContract.balanceOf(solverData[i].data.problemSolverAddr)).to.equal(tokenNum);
    
        // ownerOf
        expect( await rewardContract.ownerOf(id)).to.equal(solverData[i].data.problemSolverAddr);
        // check tokenUri
        expect( await rewardContract.tokenURI(id)).to.equal(utils.generateTokenUri(id));
        id++;
      }
    });
  });

  describe("check transfer functions and only owner", async () => {
    it("transerFrom() is not accepted by default and token cannot be transferred if msg.sender != owner", async () => {
      await expect(
        rewardContract.connect(deployer).transferFrom(
          deployer.address,
          owner.address,
          0
        )
      ).to.revertedWith("you cannot transfer your Reward NFT");

      await expect(
        rewardContract.connect(deployer).transferFrom(
          solver1.address,
          owner.address,
          0
        )
      ).to.revertedWith("from != owner");
    });

    it("Only owners can set another owner into this mapping", async () => {
      await expect( rewardContract.connect(solver1).setOwner(owner.address)).to.revertedWith("not contract owners");
      await expect( rewardContract.connect(deployer).setOwner(owner.address))
        .to.emit(rewardContract, "SetOwner")
        .withArgs(deployer.address, owner.address);
    });

    it ("Only owners can convert the transferability of reward contract => make it transferable", async () => {
      await expect( rewardContract.connect(solver1).setIsAcceptedToTransfer(true)).to.rejectedWith("not contract owners");
      await expect( rewardContract.connect(owner).setIsAcceptedToTransfer(true))
        .to.emit(rewardContract, "TransferStatus")
        .withArgs(owner.address, true);
    });

    it ("The Token can be transfer now", async () => {
      await expect(
        rewardContract.connect(solver1).transferFrom(
          solver1.address,
          deployer.address,
          1
        )          
      )
        .to.emit(rewardContract, "Transfer")
        .withArgs(solver1.address, deployer.address, 1);
      expect( await rewardContract.balanceOf(solver1.address)).to.equal(2);
      expect( await rewardContract.balanceOf(deployer.address)).to.equal(2);
      // ownerOf
      expect( await rewardContract.ownerOf(1)).to.equal(deployer.address);
      // check tokenUri
      expect( await rewardContract.tokenURI(1)).to.equal(utils.generateTokenUri(1));
    });

    it ("Only owners can convert the transferability of reward contract => make it untransferable", async () => {
      await expect( rewardContract.connect(solver1).setIsAcceptedToTransfer(false)).to.rejectedWith("not contract owners");
      await expect( rewardContract.connect(owner).setIsAcceptedToTransfer(false))
        .to.emit(rewardContract, "TransferStatus")
        .withArgs(owner.address, false);
    });

    it ("The Token cannot be transfer now",async () => {
      await expect(
        rewardContract.connect(deployer).transferFrom(
          deployer.address,
          owner.address,
          0
        )
      ).to.revertedWith("you cannot transfer your Reward NFT");      
    })
  });

  describe("If a token is burned accidently, it cannot be minted again by the same solver address",async () => {
    it("Only token owner can burn the token",async () => {

      await expect(
        rewardContract.connect(solver1).burn(0)
      ).to.revertedWith("burn: not owner");
    });

    it("solver1 burned token: 2 by him/herself", async () => {
      await expect(
        rewardContract.connect(solver1).burn(2)
      )
        .to.emit(rewardContract, "Transfer")
        .withArgs(solver1.address, ZERO_ADDRESS, 2);      
    });

    it("solver1 cannot mint the token again",async () => {
      const data = await utils.generateMintingDataForMultipleProblems(provider, signer, solver1.address, signer.address);
      
      await expect(
        rewardContract.connect(solver1).mint(
          data.problemSolverAddr,
          data.problemNum,
          data.problemSolvedTimestamp,
          data.approverKeyAddr,
          data.approverIndex,
          data.signature,
          utils.generateTokenUri(id)
        )
      ).to.revertedWith("already minted the same token");      
    })
  })
})
