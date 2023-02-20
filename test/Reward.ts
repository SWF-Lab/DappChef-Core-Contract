import { expect } from "chai"
import { ethers, run } from "hardhat";
import { config } from "../package.json"
import { Contract } from "ethers"
import utils from "./utils";

utils.deploy()
const ZERO_ADDR = ethers.constants.AddressZero;
const checkSolvingStatus = async (
  solverIndex: number,
  rewardContract: any,
  id: number,
  address: string,
  solvingStatus: any,
) => {
  // check SolvingStatus
  const returnSolvingStatus = await rewardContract.getSolvingStatus(address);   
  const length = parseInt(returnSolvingStatus[0]._hex, 16);

  // check test solving status
  let solver: any;
  if (solverIndex == 0) solver = solvingStatus.deployer;
  else if (solverIndex == 1) solver = solvingStatus.owner;
  else if (solverIndex == 2) solver = solvingStatus.solver1;
  else if (solverIndex == 3) solver = solvingStatus.solver2;
  else if (solverIndex == 4) solver = solvingStatus.solver3;
  else if (solverIndex == 5) solver = solvingStatus.solver4;
  
  expect( length ).to.equal(solver.length);

  for (let i = 0; i < solver.length; i++) {
    expect( parseInt(returnSolvingStatus[1][solver[i][0]]._hex.toString()) ).to.equal(solver[i][1]);
    // expect(  )
  }
}

const checkAfterTransfer = async (
  rewardContract: any,
  id: number,
  address: string,
) => {
  // balance
  expect( await rewardContract.balanceOf(address)).to.equal(1);

  // ownerOf
  expect( await rewardContract.ownerOf(id)).to.equal(address);

  // check tokenUri
  expect( await rewardContract.tokenURI(id)).to.equal(utils.generateTokenUri(id));

}

describe("Reward Pressure Test - 4 User: ", () => {

  let rewardContract: Contract;
  let provider: any;
  let approver: any;
  let deployerAddr: string;
  let ownerAddr: string;
  let receiverAddr: string;
  let nobodyAddr: string;
  let operatorAddr: string;
  let solver1Addr: string;
  let solver2Addr: string;
  let solver3Addr: string;
  let solver4Addr: string;

  // contracts
  let deployerContract: Contract;
  let ownerContract: Contract;
  let receiverContract: Contract;
  let nobodyContract: Contract;
  let operatorContract: Contract;
  let solver1Contract: Contract;
  let solver2Contract: Contract;
  let solver3Contract: Contract;
  let solver4Contract: Contract;
  let id = 0;

  // solving status
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

    [
      provider, approver, rewardContract,
      deployerAddr, ownerAddr, receiverAddr, nobodyAddr, operatorAddr, solver1Addr, solver2Addr, solver3Addr, solver4Addr,
      deployerContract, ownerContract, receiverContract, nobodyContract, operatorContract,
      solver1Contract, solver2Contract, solver3Contract, solver4Contract
    ] = await utils.deploy();
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
      const problemSolverAddr = deployerAddr;
      const problemNumber = 18;
      const problemSolvedTimestamp = await utils.getCurrentTimestamp(provider);    
      const approverKeyAddr = approver.address;
      
      const approverIndex = utils.getApproverIndex(approver.address);
      const signature = await utils.getSignature (
        approver,
        problemSolverAddr,
        problemNumber,
        problemSolvedTimestamp,
        approverKeyAddr,
        approverIndex,
      );

      // mint and emit Transfer with correct arguments
      await expect(  
        deployerContract.mint(
          problemSolverAddr,
          problemNumber,
          problemSolvedTimestamp,
          approverKeyAddr,
          approverIndex,
          signature,
          utils.generateTokenUri(id)
      ))
        .to.emit(rewardContract, "Transfer")
        .withArgs(ZERO_ADDR, problemSolverAddr, id);
      solvingStatus.deployer.push([problemNumber, id]);
      await checkAfterTransfer(
        rewardContract,
        id,
        deployerAddr
      );
      id++;
    });

  // Solver mints a Token
    it("Can anyone otherthan deployer start minting? (should be)", async () => {
      const problemNumber = 18;
      const problemSolvedTimestamp = await utils.getCurrentTimestamp(provider);
      const approverKeyAddr = approver.address;
      const approverIndex = utils.getApproverIndex(approver.address);
      const signature = utils.getSignature(
        approver,
        solver1Addr,
        problemNumber,
        problemSolvedTimestamp,
        approverKeyAddr,
        approverIndex
      );

      await expect(  
        solver1Contract.mint(
          solver1Addr,
          problemNumber,
          problemSolvedTimestamp,
          approverKeyAddr,
          approverIndex,
          signature,
          utils.generateTokenUri(id)
      ))
        .to.emit(rewardContract, "Transfer")
        .withArgs(ZERO_ADDR, solver1Addr, id);

      solvingStatus.solver1.push([problemNumber, id]);

      await checkAfterTransfer(
        rewardContract,
        id,
        solver1Addr
      );

      await checkSolvingStatus(
        1, // SolverIndex
        receiverContract,
        id,
        solver1Addr,
        solvingStatus
      )
      id++;
    });

    describe ("Can the 4 selected solvers start minting the same problem? (should be) ", async () => {

      const data1 = await utils.generateMintingDataForOneProblem(provider, approver, solver1Addr, approver.address);
      const data2 = await utils.generateMintingDataForOneProblem(provider, approver, solver2Addr, approver.address);
      const data3 = await utils.generateMintingDataForOneProblem(provider, approver, solver3Addr, approver.address);
      const data4 = await utils.generateMintingDataForOneProblem(provider, approver, solver4Addr, approver.address);
      
      // id = 2
      it ("solver1 mint", async () => {
        await expect(  
          solver1Contract.mint(
            data1.problemSolverAddr,
            data1.problemNumber,
            data1.problemSolvedTimestamp,
            data1.approverKeyAddr,
            data1.approverIndex,
            data1.signature,
            utils.generateTokenUri(2)
        ))
          .to.emit(rewardContract, "Transfer")
          .withArgs(ZERO_ADDR, data1.problemSolverAddr, 2);
        await checkAfterTransfer(
          rewardContract,
          2,
          solver1Addr
        );
      });

      it ("solver1 get SolvingStatus", async () => {
        await checkSolvingStatus(
          1, // SolverIndex
          receiverContract,
          2,
          solver1Addr,
          solvingStatus
        );
      });
      
      // id = 3
      it ("solver2 mint", async () => {
        await expect(  
          solver1Contract.mint(
            data1.problemSolverAddr,
            data1.problemNumber,
            data1.problemSolvedTimestamp,
            data1.approverKeyAddr,
            data1.approverIndex,
            data1.signature,
            utils.generateTokenUri(3)
        ))
          .to.emit(rewardContract, "Transfer")
          .withArgs(ZERO_ADDR, data1.problemSolverAddr, 3);
        await checkAfterTransfer(
          rewardContract,
          3,
          solver1Addr
        );
      });

      // id = 4
      it ("solver3 mint", async () => {
        await expect(  
          solver1Contract.mint(
            data1.problemSolverAddr,
            data1.problemNumber,
            data1.problemSolvedTimestamp,
            data1.approverKeyAddr,
            data1.approverIndex,
            data1.signature,
            utils.generateTokenUri(4)
        ))
          .to.emit(rewardContract, "Transfer")
          .withArgs(ZERO_ADDR, data1.problemSolverAddr, 4);
        await checkAfterTransfer(
          rewardContract,
          4,
          solver1Addr
        );
      });

      it ("solver3 get SolvingStatus", async () => {
        await checkSolvingStatus(
          1, // SolverIndex
          receiverContract,
          4,
          solver1Addr,
          solvingStatus
        );
      });

      // id = 5
      it ("solver4 mint", async () => {
        await expect(  
          solver1Contract.mint(
            data1.problemSolverAddr,
            data1.problemNumber,
            data1.problemSolvedTimestamp,
            data1.approverKeyAddr,
            data1.approverIndex,
            data1.signature,
            utils.generateTokenUri(id)
        ))
          .to.emit(rewardContract, "Transfer")
          .withArgs(ZERO_ADDR, data1.problemSolverAddr, id);
        await checkAfterTransfer(
          rewardContract,
          id,
          solver1Addr
        );
        id++;
      });

      it ("solver4 get SolvingStatus", async () => {
        await checkSolvingStatus(
          1, // SolverIndex
          receiverContract,
          id,
          solver1Addr,
          solvingStatus
        );
      });

      it ("solver2 get SolvingStatus", async () => {
        await checkSolvingStatus(
          1, // SolverIndex
          receiverContract,
          id,
          solver1Addr,
          solvingStatus
        );
      });
    });

    // it("Can the 4 selected solvers start minting different problems? (should be) ", async () => {
    //   const data1 = await utils.generateMintingDataForMultipleProblems(provider, approver, solver1Addr, approver.address);
    //   const data2 = await utils.generateMintingDataForMultipleProblems(provider, approver, solver2Addr, approver.address);
    //   const data3 = await utils.generateMintingDataForMultipleProblems(provider, approver, solver3Addr, approver.address);
    //   const data4 = await utils.generateMintingDataForMultipleProblems(provider, approver, solver4Addr, approver.address);

    //   const solverData = [
    //     {data: data1, solver: solver1}, 
    //     {data: data2, solver: solver2}, 
    //     {data: data3, solver: solver3}, 
    //     {data: data4, solver: solver4}
    //   ];

    //   for (let i = 0; i < 4; i ++) {
    //     await expect(  
    //       rewardContract.connect(solverData[i].solver).mint(
    //         data.problemSolverAddr,
    //         data.problemNum,
    //         data.problemSolvedTimestamp,
    //         data.approverKeyAddr,
    //         data.approverIndex,
    //         data.signature,
    //         utils.generateTokenUri(id)
    //     ))
    //     .to.emit(rewardContract, "Transfer")
    //     .withArgs(ZERO_ADDR, data.problemSolverAddr, id);
  
    //     // balance
    //     let tokenNum: number;
    //     if (i == 0) tokenNum = 3;
    //     else tokenNum = 2;
    //     expect( await rewardContract.balanceOf(data.problemSolverAddr)).to.equal(tokenNum);
    
    //     // ownerOf
    //     expect( await rewardContract.ownerOf(id)).to.equal(data.problemSolverAddr);
    //     // check tokenUri
    //     expect( await rewardContract.tokenURI(id)).to.equal(utils.generateTokenUri(id));
    //     id++;
    //   }
    // });
  });

  describe("check transfer functions and only owner", async () => {
    it("transerFrom() is not accepted by default and token cannot be transferred if msg.sender != owner", async () => {
      await expect(
        deployerContract.transferFrom(
          deployerAddr,
          ownerAddr,
          0
        )
      ).to.revertedWith("you cannot transfer your Reward NFT");

      await expect(
        deployerContract.transferFrom(
          solver1Addr,
          ownerAddr,
          0
        )
      ).to.revertedWith("from != owner");
    });

    it("Only owners can set another owner into this mapping", async () => {
      await expect( solver1Contract.setOwner(ownerAddr)).to.revertedWith("not contract owners");
      await expect( deployerContract.setOwner(ownerAddr))
        .to.emit(rewardContract, "SetOwner")
        .withArgs(deployerAddr, ownerAddr);
    });

    it ("Only owners can convert the transferability of reward contract => make it transferable", async () => {
      await expect( solver1Contract.setIsAcceptedToTransfer(true)).to.rejectedWith("not contract owners");
      await expect( ownerContract.setIsAcceptedToTransfer(true))
        .to.emit(rewardContract, "TransferStatus")
        .withArgs(ownerAddr, true);
    });

    it ("The Token can be transfer now", async () => {
      await expect(
        solver1Contract.transferFrom(
          solver1Addr,
          deployerAddr,
          1
        )          
      )
        .to.emit(rewardContract, "Transfer")
        .withArgs(solver1Addr, deployerAddr, 1);
      
      expect( await rewardContract.balanceOf(solver1Addr)).to.equal(2);
      expect( await rewardContract.balanceOf(deployerAddr)).to.equal(2);
      // ownerOf
      expect( await rewardContract.ownerOf(1)).to.equal(deployerAddr);
      // check tokenUri
      expect( await rewardContract.tokenURI(1)).to.equal(utils.generateTokenUri(1));
    });

    it ("Only owners can convert the transferability of reward contract => make it untransferable", async () => {
      await expect( solver1Contract.setIsAcceptedToTransfer(false)).to.rejectedWith("not contract owners");
      await expect( ownerContract.setIsAcceptedToTransfer(false))
        .to.emit(rewardContract, "TransferStatus")
        .withArgs(ownerAddr, false);
    });

    it ("The Token cannot be transfer now",async () => {
      await expect(
        deployerContract.transferFrom(
          deployerAddr,
          ownerAddr,
          0
        )
      ).to.revertedWith("you cannot transfer your Reward NFT");      
    })
  });

  // describe("If a token is burned accidently, it cannot be minted again by the same solver address",async () => {
  //   it("Only token owner can burn the token",async () => {

  //     await expect(
  //       solver1Contract.burn(0)
  //     ).to.revertedWith("burn: not owner");
  //   });

  //   it("solver1 burned token: 2 by him/herself", async () => {
  //     await expect(
  //       solver1Contract.burn(2)
  //     )
  //       .to.emit(rewardContract, "Transfer")
  //       .withArgs(solver1Addr, ZERO_ADDR, 2);      
  //   });

  //   it("solver1 cannot mint the token again",async () => {
  //     const data = await utils.generateMintingDataForMultipleProblems(provider, approver, solver1Addr, approver.address);
      
  //     await expect(
  //       solver1Contract.mint(
  //         data.problemSolverAddr,
  //         data.problemNum,
  //         data.problemSolvedTimestamp,
  //         data.approverKeyAddr,
  //         data.approverIndex,
  //         data.signature,
  //         utils.generateTokenUri(id)
  //       )
  //     ).to.revertedWith("already minted the same token");      
  //   });
  // });
})
