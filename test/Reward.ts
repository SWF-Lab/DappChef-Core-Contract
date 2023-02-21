import { expect } from "chai";
import { ethers, run } from "hardhat";
import { Contract } from "ethers";
import { config } from "../package.json";
import utils from "./utils";

const ZERO_ADDR = ethers.constants.AddressZero;

const checkSolvingStatus = async (
  solverIndex: number,
  rewardContract: any,
  address: string,
  solvingStatus: any,
  balance: any
) => {
  // check SolvingStatus
  const returnSolvingStatus = await rewardContract.getSolvingStatus(address);   
  const length = parseInt(returnSolvingStatus[0]._hex.toString());
  const arr = returnSolvingStatus[1];
  
  // check test solving status
  let len: any;
  let status: any;
  if (solverIndex == 0) {
    len = balance.deployer;
    status = solvingStatus.deployer;
  } else if (solverIndex == 1) {
    len = balance.owner;
    status = solvingStatus.owner;
  } else if (solverIndex == 2) {
    len = balance.solver1;
    status = solvingStatus.solver1;
  } else if (solverIndex == 3) {
    len = balance.solver2;
    status = solvingStatus.solver2;
  } else if (solverIndex == 4) {
    len = balance.solver3;
    status = solvingStatus.solver3;
  } else if (solverIndex == 5) {
    len = balance.solver4;
    status = solvingStatus.solver4;
  }
  expect( length ).to.equal(len);

  for (let i = 0; i < length; i++) {
    const returnId = await rewardContract.getTokenID(address, arr[i].toString());
    const sortedStatus = status[0].sort((x: number, y: number) => {
      return x - y;
    });    
    
    expect( returnId ).to.equal(status[1].get(parseInt(arr[i])));
    expect( arr[i].toString() ).to.equal(sortedStatus[i].toString());
  }
}

const checkAfterTransfer = async (
  rewardContract: any,
  id: number,
  address: string,
  balance: any
) => {
  // balance
  expect(await rewardContract.balanceOf(address)).to.equal(balance.toString());
  // ownerOf
  expect(await rewardContract.ownerOf(id)).to.equal(address);
  // check tokenUri
  expect(await rewardContract.tokenURI(id)).to.equal(utils.generateTokenUri(id));
}

//===== TEST =======
describe("Reward", () => {
  //===== UNIT TEST =======
  describe("Unit test",() => {  
    //===== variables ==========
    //for reward contract
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
  
    // solving status
    let solvingStatus: any = {
      deployer: [],
      owner: [],
      solver1: [],
      solver2: [],
      solver3: [],
      solver4: [],
    }
    
    //for mint
    const problemNumber = 5;
    const timestamp = 1673070083;
    let approverAddr: string;
    let approverIndex: number;
  
    const tokenURI= "ipfs://<ipfsPrefix>/0";
    const firstMintId = 0;
    const nonExistTokenId = 1000;
    let signature: string;
  
    
    context("ERC721 behavior", () => {
      beforeEach(async () => {
        [
          provider, approver, rewardContract,
          deployerAddr, ownerAddr, receiverAddr, nobodyAddr, operatorAddr, solver1Addr, solver2Addr, solver3Addr, solver4Addr,
          deployerContract, ownerContract, receiverContract, nobodyContract, operatorContract,
          solver1Contract, solver2Contract, solver3Contract, solver4Contract
        ] = await utils.deploy();
  
        approverAddr = approver.address;
        approverIndex = utils.getApproverIndex(approverAddr)
  
        signature = await utils.getSignature(approver, solver1Addr, problemNumber, timestamp, approverAddr, approverIndex)
      })
  
      context("token not minted", async () => {
        describe("getSolvingStatus", () => {
          let returnValue: any;
          let length: number;
          let arr: number[];
          it("should get solving status", async() => {
            returnValue = await rewardContract.getSolvingStatus(solver1Addr);
            length = returnValue[0];
            arr = returnValue[1];
            expect(length).to.be.equal(0);
          })
        })
  
        describe("getTokenId", async() => {
          it("should revert", async() => {
            await expect(rewardContract.getTokenID(solver1Addr, problemNumber))
            .to.be.revertedWith("haven't answered this problem correctly")
          })
        })
  
        describe("mint", async () => {  
          it("reverts with a null destination address", async () => {
            await expect(solver1Contract.mint(
              ZERO_ADDR, 
              problemNumber, 
              timestamp, 
              approverAddr, 
              approverIndex, 
              signature, 
              tokenURI
            )).to.be.revertedWith('mint to zero address')
          })
        })
      })
  
      context("token minted", async() => {
        beforeEach(async () => {
          signature = await utils.getSignature(approver, solver1Addr, problemNumber, timestamp, approverAddr, approverIndex)
          await solver1Contract
            .mint(
            solver1Addr, problemNumber, timestamp, approverAddr, approverIndex, signature, tokenURI
          )
        })
  
        describe("getSolvingStatus", () => {
          let returnValue: any;
          let length: number;
          let arr: number[];
          it("should get solving status", async() => {
            returnValue = await rewardContract.getSolvingStatus(solver1Addr);
            length = returnValue[0].toString();
            arr = returnValue[1];
            expect(length).to.be.equal('1');
            expect(arr[0]).to.be.equal(5);
          })
        })
  
        describe("getTokenID", () => {
          it("should return tokenId", async() => {
            expect(
              await rewardContract.ownerOf(firstMintId)
            ).to.be.equal(solver1Addr);
  
            expect(
              await rewardContract.balanceOf(solver1Addr)
            ).to.be.equal(1);
            
            expect(await rewardContract.getTokenID(solver1Addr, problemNumber)).to.be.equal(0);
          })
        })
  
        describe("balanceOf()", () => {
          it("returns the amount of tokens owned by the given address", async () => {
            expect(
              await rewardContract.balanceOf(solver1Addr)
            ).to.be.equal(1);
          })
  
          it("returns 0 when the given address does not own any tokens", async () => {
            expect(
              await rewardContract.balanceOf(receiverAddr)
            ).to.be.equal(0);
          })
  
          it("reverts when given zero address", async () => {
            await expect(
              rewardContract.balanceOf(ZERO_ADDR)
            ).to.be.revertedWith("owner = zero address")
          })
        })
  
        describe("ownerOf()", () => {
          it("returns the owner of the given token ID", async () => {
            expect(
              await rewardContract.ownerOf(firstMintId)
            ).to.be.equal(solver1Addr);
          })
  
          it("reverts with not existed token", async () => {
            await expect(
              rewardContract.ownerOf(nonExistTokenId)
            ).to.be.revertedWith("token doesn't exist")
          })
        })
  
        describe("transfers", async () => {
          const tokenId = firstMintId;
          const data = '0x42';
  
          beforeEach(async () => {
            await solver1Contract.approve(receiverAddr, firstMintId);
            await solver1Contract.setApprovalForAll(receiverAddr, true);
          })
  
          
          // ====== test ========
          context("while not allowed to transfer",async () => {
            
            describe("via transferFrom()", async () => {
              it("should revert", async () => {
                await expect(
                  solver1Contract.transferFrom(solver1Addr, receiverAddr, tokenId)
                )
                .to.be.revertedWith("you cannot transfer your Reward NFT")
              })
            })
  
            describe("via safeTransferFrom()", async () => {
              it("should revert", async () => {
                await expect(
                  solver1Contract['safeTransferFrom(address,address,uint256)'](solver1Addr, receiverAddr, tokenId)
                )
                .to.be.revertedWith("you cannot transfer your Reward NFT")
              })
            })
  
            describe("via safeTransferFrom (with data)", async() => {
              it("should revert", async () => {
                await expect(
                  solver1Contract['safeTransferFrom(address,address,uint256,bytes)'](solver1Addr, receiverAddr, tokenId, data)
                )
                .to.be.revertedWith("you cannot transfer your Reward NFT")
              })  
            })
  
          })
  
        })
  
        describe("approve()", async () => {
          const tokenId = firstMintId;
          let receipt = null;
  
          const itClearsApproval = () => {
            it('clears approval for the token', async () => {
              expect(
                await rewardContract.getApproved(tokenId)
              ).
              to.be.equal(ZERO_ADDR);
            });
          };
  
          context('when clearing approval', function () {
  
            context('when there was no prior approval', () => {
              
              it("emit Approval", async () => {
                await expect(
                  await solver1Contract.approve(ZERO_ADDR, tokenId)
                ).to
                .emit(solver1Contract, "Approval")
                .withArgs(solver1Addr, ZERO_ADDR, tokenId)
              })
  
              itClearsApproval();
            });
    
            context('when there was a prior approval', () => {
              
              it("emit Approval", async () => {
                await solver1Contract.approve(receiverAddr, tokenId);
                await expect(
                  await solver1Contract.approve(ZERO_ADDR, tokenId)
                ).to
                .emit(solver1Contract, "Approval")
                .withArgs(solver1Addr, ZERO_ADDR, tokenId)
              })
  
              itClearsApproval();
            });
  
          });
  
          context('when approving a non-zero address', () => {
            
            context('when there was no prior approval', () => {
              it('sets the approval for the target address', async () => {
                await solver1Contract.approve(receiverAddr, tokenId);
                expect(
                  await rewardContract.getApproved(tokenId)
                )
                .to.be.equal(receiverAddr);
              });
  
              it('emit Approval', async () => {
                await expect(
                  await solver1Contract.approve(receiverAddr, tokenId)
                )
                .to.emit(solver1Contract, "Approval")
                .withArgs(solver1Addr, receiverAddr, tokenId)
              })
            });
    
            context('when there was a prior approval to the same address', function () {  
              it('sets the approval for the target address', async function () {
                await solver1Contract.approve(receiverAddr, tokenId);
                await solver1Contract.approve(receiverAddr, tokenId);
                expect(
                  await rewardContract.getApproved(tokenId)
                ).to.be.equal(receiverAddr);
              });
  
              it('emit Approval', async () => {
                await solver1Contract.approve(receiverAddr, tokenId);
                await expect(
                  await solver1Contract.approve(receiverAddr, tokenId)
                )
                .to.emit(solver1Contract, "Approval")
                .withArgs(solver1Addr, receiverAddr, tokenId)
              })
            });
    
            context('when there was a prior approval to a different address', () => {
              it('sets the approval for the target address', async () => {
                await solver1Contract.approve(nobodyAddr, tokenId);
                await solver1Contract.approve(nobodyAddr, tokenId);
                expect(
                  await rewardContract.getApproved(tokenId)
                )
                .to.be.equal(nobodyAddr);
              });
  
              it('emit Approval', async () => {
                await solver1Contract.approve(nobodyAddr, tokenId);
                await expect(
                  await solver1Contract.approve(nobodyAddr, tokenId)
                )
                .to.emit(solver1Contract, "Approval")
                .withArgs(solver1Addr, nobodyAddr, tokenId)
              })
            });
  
          });
  
          context('when the address that receives the approval is the owner', function () {
            it('reverts', async function () {
              await expect(
                solver1Contract.approve(solver1Addr, tokenId)
              )
              .to.be.revertedWith('approve to owner')
            });
          });
  
          context('when the sender does not own the given token ID', function () {
            it('reverts', async function () {
              await expect(
                nobodyContract.approve(receiverAddr, tokenId)
              )
              .to.be.revertedWith('not authorized')
            });
          });
  
          context('when the given token ID does not exist', function () {
            it('reverts', async function () {
              await expect(
                deployerContract.approve(receiverAddr, nonExistTokenId)
              )
              .to.be.revertedWith('token not exist')
            });
          });
  
        })
  
  
        describe("setApprovalForAll", async () => {
          context('when the operator willing to approve is not the owner', function () {
            
            context('when there is no operator approval set by the sender', function () {
              it('approves the operator', async function () {
                await solver1Contract.setApprovalForAll(operatorAddr, true);
                expect(
                  await rewardContract.isApprovedForAll(solver1Addr, operatorAddr)
                ).to.equal(true);
              });
    
              it('emits an approval event', async function () {
                await expect(
                  await solver1Contract.setApprovalForAll(operatorAddr, true)
                )
                .to.emit(solver1Contract, "ApprovalForAll")
                .withArgs(solver1Addr, operatorAddr, true)
              });
            });
  
            context('when the operator was set as not approved', function () {
              beforeEach(async function () {
                await solver1Contract.setApprovalForAll(operatorAddr, false);
              });
    
              it('approves the operator', async function () {
                await solver1Contract.setApprovalForAll(operatorAddr, true);
                expect(
                  await rewardContract.isApprovedForAll(solver1Addr, operatorAddr)
                ).to.equal(true);
              });
    
              it('emits an approval event', async function () {
                await expect(
                  await solver1Contract.setApprovalForAll(operatorAddr, true)
                )
                .to.emit(solver1Contract, "ApprovalForAll")
                .withArgs(solver1Addr, operatorAddr, true)
              });
    
              it('can unset the operator approval', async function () {
                await solver1Contract.setApprovalForAll(operatorAddr, false);
                expect(
                  await rewardContract.isApprovedForAll(solver1Addr, operatorAddr)
                ).to.equal(false);
              });
            });
  
            context('when the operator was already approved', function () {
    
              it('keeps the approval to the given address', async function () {
                await solver1Contract.setApprovalForAll(operatorAddr, true);
                await solver1Contract.setApprovalForAll(operatorAddr, true);
    
                expect(
                  await rewardContract.isApprovedForAll(solver1Addr, operatorAddr)
                ).to.equal(true);
              });
    
              it('emits an approval event', async function () {
                await expect(
                  await solver1Contract.setApprovalForAll(operatorAddr, true)
                )
                .to.emit(solver1Contract, "ApprovalForAll")
                .withArgs(solver1Addr, operatorAddr, true)
              });
            });
  
          })
  
          context('when the operator is the owner', function () {
            it('reverts', async function () {
              await expect(
                solver1Contract.setApprovalForAll(solver1Addr, true)
              )
              .to.be.revertedWith('approve to owner') 
            });
          });
  
        })
  
        describe("getApproved", async () => {
          
          context('when token is not minted', async function () {
            it('reverts', async function () {
              await expect(
                rewardContract.getApproved(nonExistTokenId)
              )
              .to.be.revertedWith('token doesn\'t exist')
            });
          });
  
          context('when token has been minted ', async function () {
            it('should return the zero address', async function () {
              expect(
                await rewardContract.getApproved(firstMintId)
              ).to.be.equal(ZERO_ADDR);
            });
    
            context('when account has been approved', async function () {
              beforeEach(async function () {
                await solver1Contract.approve(receiverAddr, firstMintId);
              });
    
              it('returns approved account', async function () {
                expect(
                  await rewardContract.getApproved(firstMintId)
                ).to.be.equal(receiverAddr);
              });
            });
          });
  
        })
  
      
        describe("burn", async () => {
  
          it('reverts when burning a non-existent token id', async () => {
            await expect(
              solver1Contract.burn(nonExistTokenId)
            ).to.be.revertedWith('token doesn\'t exist');
          });
  
          context('with burnt token', function () {
            it('emits a Transfer event', async () => {
              await expect(
                await solver1Contract.burn(firstMintId)
              )
              .to.emit(solver1Contract,'Transfer')
              .withArgs(solver1Addr, ZERO_ADDR, firstMintId)
            });
    
            it('deletes the token', async function () {
              await solver1Contract.burn(firstMintId);
              expect(
                await rewardContract.balanceOf(solver1Addr)
              )
              .to.be.equal(0);
  
              await expect(
                rewardContract.ownerOf(firstMintId)
              ).to.be.revertedWith('token doesn\'t exist');
            });
    
            it('reverts when burning a token id that has been deleted', async function () {
              await solver1Contract.burn(firstMintId);
              await expect(
                solver1Contract.burn(firstMintId)
              ).to.be.revertedWith('token doesn\'t exist');
            });
          });
        });
      });
    });
  
    //===== Metadata ========
  
    context("ERC721 metadata",  () => {
      beforeEach(async () => {
        [
          provider, approver, rewardContract,
          deployerAddr, ownerAddr, receiverAddr, nobodyAddr, operatorAddr, solver1Addr, solver2Addr, solver3Addr, solver4Addr,
          deployerContract, ownerContract, receiverContract, nobodyContract, operatorContract,
          solver1Contract, solver2Contract, solver3Contract, solver4Contract
        ] = await utils.deploy();
  
        approverAddr = approver.address;
        approverIndex = utils.getApproverIndex(approverAddr)
      });
  
      it("has a name", async () => {
        expect(await rewardContract.name()).to.be.equal("DappChefRewardNFTtest#1");
      });
  
      it("has a symbol", async () => {
        expect(await rewardContract.symbol()).to.be.equal("DCR");
      });
  
      describe("tokenURI", async () => {
        it("should return tokenURI", async () => {
          //mint
          signature = await utils.getSignature(approver, solver1Addr, problemNumber, timestamp, approverAddr, approverIndex)
  
          await solver1Contract.mint(
            solver1Addr, problemNumber, timestamp, approverAddr, approverIndex, signature, tokenURI
          );
          //get tokenURI
          expect(await solver1Contract.tokenURI(firstMintId)).to.be.equal(tokenURI);
        });
      });
    });
  });

  //===== Pressure Test ========
  describe("Pressure Test", () => {

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
    let balance: any = {
      deployer: 0,
      owner: 0,
      solver1: 0,
      solver2: 0,
      solver3: 0,
      solver4: 0,
    };
    
    // solving status
    let solvingStatus: any = {
      deployer: [[], new Map()],
      owner: [[], new Map()],
      solver1: [[], new Map()],
      solver2: [[], new Map()],
      solver3: [[], new Map()],
      solver4: [[], new Map()],
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
      
      // getNowTotal
      it("deployer should be an owner member and be able to get nowTotal", async () => {
        expect( await rewardContract.getNowTotal() ).to.equal(ethers.BigNumber.from(101));
      });

      it("deployer should be an owner member and be able to set nowTotal", async () => {
        await deployerContract.setNowTotal(102);
        expect( await rewardContract.getNowTotal() ).to.equal(ethers.BigNumber.from(102));
        await deployerContract.setNowTotal(101);
        expect( await rewardContract.getNowTotal() ).to.equal(ethers.BigNumber.from(101));
      })
    });
    
    describe("check minting function", () => {
      // id = 0
      describe("Can deployer start minting? (should be)", () => {
        it("deployer should be able to mint", async () => {
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
              utils.generateTokenUri(0)
          ))
            .to.emit(rewardContract, "Transfer")
            .withArgs(ZERO_ADDR, problemSolverAddr, 0);
          balance.deployer += 1;
          solvingStatus.deployer[0].push(problemNumber);
          solvingStatus.deployer[1].set(problemNumber, 0);
  
          await checkAfterTransfer(
            rewardContract,
            0,
            deployerAddr,
            balance.deployer
          );
          });
      });
    
      describe("Can solver1 start minting? (should be)", () => {
        // id = 1
        it("solver1 should be able to mint", async () => {
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
              utils.generateTokenUri(1)
          ))
            .to.emit(rewardContract, "Transfer")
            .withArgs(ZERO_ADDR, solver1Addr, 1);

          balance.solver1 += 1;
          solvingStatus.solver1[0].push(problemNumber);
          solvingStatus.solver1[1].set(problemNumber, 1);
    
          await checkAfterTransfer(
            rewardContract,
            1, // id
            solver1Addr,
            balance.solver1
          );
    
          await checkSolvingStatus(
            2, // SolverIndex
            receiverContract,
            solver1Addr,
            solvingStatus,
            balance
          )
        });
      });

      describe ("Can the 4 selected solvers start minting Multiple the same problems? (should be) ", async () => {
        // solver1 mint
        // solver1 get
        // solver2 mint
        // solver3 mint
        // solver3 get
        // solver4 mint
        // solver4 get
        // solver2 get
      
        let data1: any;
        let data2: any;
        let data3: any;
        let data4: any;

        before(async () => {
          data1 = await utils.generateMintingDataForOneProblem(provider, approver, solver1Addr, approver.address);
          data2 = await utils.generateMintingDataForOneProblem(provider, approver, solver2Addr, approver.address);
          data3 = await utils.generateMintingDataForOneProblem(provider, approver, solver3Addr, approver.address);
          data4 = await utils.generateMintingDataForOneProblem(provider, approver, solver4Addr, approver.address);
        });

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
          
            balance.solver1 += 1;
            solvingStatus.solver1[0].push(data1.problemNumber);
            solvingStatus.solver1[1].set(data1.problemNumber, 2);
      
            await checkAfterTransfer(
              rewardContract,
              2, // id
              solver1Addr,
              balance.solver1
            );
        });
  
        it ("solver1 get SolvingStatus", async () => {
          await checkSolvingStatus(
            2, // SolverIndex
            rewardContract,
            solver1Addr,
            solvingStatus,
            balance
          );
        });
        
        // id = 3
        it ("solver2 mint", async () => {
          await expect(  
            solver2Contract.mint(
              data2.problemSolverAddr,
              data2.problemNumber,
              data2.problemSolvedTimestamp,
              data2.approverKeyAddr,
              data2.approverIndex,
              data2.signature,
              utils.generateTokenUri(3)
          ))
            .to.emit(rewardContract, "Transfer")
            .withArgs(ZERO_ADDR, data2.problemSolverAddr, 3);

          balance.solver2 += 1;
          solvingStatus.solver2[0].push(data2.problemNumber);
          solvingStatus.solver2[1].set(data2.problemNumber, 3);
    
          await checkAfterTransfer(
            rewardContract,
            3, // id
            solver2Addr,
            balance.solver2
          );
        });
  
        // id = 4
        it ("solver3 mint", async () => {
          await expect(  
            solver3Contract.mint(
              data3.problemSolverAddr,
              data3.problemNumber,
              data3.problemSolvedTimestamp,
              data3.approverKeyAddr,
              data3.approverIndex,
              data3.signature,
              utils.generateTokenUri(4)
          ))
            .to.emit(rewardContract, "Transfer")
            .withArgs(ZERO_ADDR, data3.problemSolverAddr, 4);
          
          balance.solver3 += 1;
          solvingStatus.solver3[0].push(data3.problemNumber);
          solvingStatus.solver3[1].set(data3.problemNumber, 4);
    
          await checkAfterTransfer(
            rewardContract,
            4, // id
            solver3Addr,
            balance.solver3
          );
        });
  
        it ("solver3 get SolvingStatus", async () => {
          await checkSolvingStatus(
            4, // SolverIndex
            rewardContract,
            solver3Addr,
            solvingStatus,
            balance
          );
        });
  
        // id = 5
        it ("solver4 mint", async () => {
          await expect(  
            solver4Contract.mint(
              data4.problemSolverAddr,
              data4.problemNumber,
              data4.problemSolvedTimestamp,
              data4.approverKeyAddr,
              data4.approverIndex,
              data4.signature,
              utils.generateTokenUri(5)
          ))
            .to.emit(rewardContract, "Transfer")
            .withArgs(ZERO_ADDR, data4.problemSolverAddr, 5);

          balance.solver4 += 1;
          solvingStatus.solver4[0].push(data4.problemNumber);
          solvingStatus.solver4[1].set(data4.problemNumber, 5);
    
          await checkAfterTransfer(
            rewardContract,
            5, // id
            solver4Addr,
            balance.solver4
          );
        });
  
        it ("solver4 get SolvingStatus", async () => {
          await checkSolvingStatus(
            5, // SolverIndex
            rewardContract,
            solver4Addr,
            solvingStatus,
            balance
          );
        });
  
        it ("solver2 get SolvingStatus", async () => {
          await checkSolvingStatus(
            3, // SolverIndex
            rewardContract,
            solver2Addr,
            solvingStatus,
            balance
          );
        });
      });

      describe ("Can the 4 selected solvers start minting different problems? (should be) ", async () => {
        // solver1 mint
        // solver1 get
        // solver2 mint
        // solver3 mint
        // solver3 get
        // solver4 mint
        // solver4 get
        // solver2 get
      
        let data1: any;
        let data2: any;
        let data3: any;
        let data4: any;

        before(async () => {
          data1 = await utils.generateMintingDataForMultipleProblems(provider, approver, solver1Addr, approver.address);
          data2 = await utils.generateMintingDataForMultipleProblems(provider, approver, solver2Addr, approver.address);
          data3 = await utils.generateMintingDataForMultipleProblems(provider, approver, solver3Addr, approver.address);
          data4 = await utils.generateMintingDataForMultipleProblems(provider, approver, solver4Addr, approver.address);
        });

        // id = 6
        it ("solver1 mint", async () => {
          await expect(  
            solver1Contract.mint(
              data1.problemSolverAddr,
              data1.problemNumber,
              data1.problemSolvedTimestamp,
              data1.approverKeyAddr,
              data1.approverIndex,
              data1.signature,
              utils.generateTokenUri(6)
          ))
            .to.emit(rewardContract, "Transfer")
            .withArgs(ZERO_ADDR, data1.problemSolverAddr, 6);
          
            balance.solver1 += 1;
            solvingStatus.solver1[0].push(data1.problemNumber);
            solvingStatus.solver1[1].set(data1.problemNumber, 6);
      
            await checkAfterTransfer(
              rewardContract,
              6, // id
              solver1Addr,
              balance.solver1
            );
        });
  
        it ("solver1 get SolvingStatus", async () => {
          await checkSolvingStatus(
            2, // SolverIndex
            rewardContract,
            solver1Addr,
            solvingStatus,
            balance
          );
        });
        
        // id = 7
        it ("solver2 mint", async () => {
          await expect(  
            solver2Contract.mint(
              data2.problemSolverAddr,
              data2.problemNumber,
              data2.problemSolvedTimestamp,
              data2.approverKeyAddr,
              data2.approverIndex,
              data2.signature,
              utils.generateTokenUri(7)
          ))
            .to.emit(rewardContract, "Transfer")
            .withArgs(ZERO_ADDR, data2.problemSolverAddr, 7);

          balance.solver2 += 1;
          solvingStatus.solver2[0].push(data2.problemNumber);
          solvingStatus.solver2[1].set(data2.problemNumber, 7);
    
          await checkAfterTransfer(
            rewardContract,
            7, // id
            solver2Addr,
            balance.solver2
          );
        });
  
        // id = 8
        it ("solver3 mint", async () => {
          await expect(  
            solver3Contract.mint(
              data3.problemSolverAddr,
              data3.problemNumber,
              data3.problemSolvedTimestamp,
              data3.approverKeyAddr,
              data3.approverIndex,
              data3.signature,
              utils.generateTokenUri(8)
          ))
            .to.emit(rewardContract, "Transfer")
            .withArgs(ZERO_ADDR, data3.problemSolverAddr, 8);
          
          balance.solver3 += 1;
          solvingStatus.solver3[0].push(data3.problemNumber);
          solvingStatus.solver3[1].set(data3.problemNumber, 8);
    
          await checkAfterTransfer(
            rewardContract,
            8, // id
            solver3Addr,
            balance.solver3
          );
        });
  
        it ("solver3 get SolvingStatus", async () => {
          await checkSolvingStatus(
            4, // SolverIndex
            rewardContract,
            solver3Addr,
            solvingStatus,
            balance
          );
        });
  
        // id = 9
        it ("solver4 mint", async () => {
          await expect(  
            solver4Contract.mint(
              data4.problemSolverAddr,
              data4.problemNumber,
              data4.problemSolvedTimestamp,
              data4.approverKeyAddr,
              data4.approverIndex,
              data4.signature,
              utils.generateTokenUri(9)
          ))
            .to.emit(rewardContract, "Transfer")
            .withArgs(ZERO_ADDR, data4.problemSolverAddr, 9);

          balance.solver4 += 1;
          solvingStatus.solver4[0].push(data4.problemNumber);
          solvingStatus.solver4[1].set(data4.problemNumber, 9);
    
          await checkAfterTransfer(
            rewardContract,
            9, // id
            solver4Addr,
            balance.solver4
          );
        });
  
        it ("solver4 get SolvingStatus", async () => {
          await checkSolvingStatus(
            5, // SolverIndex
            rewardContract,
            solver4Addr,
            solvingStatus,
            balance
          );
        });
  
        it ("solver2 get SolvingStatus", async () => {
          await checkSolvingStatus(
            3, // SolverIndex
            rewardContract,
            solver2Addr,
            solvingStatus,
            balance
          );
        });
      });
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
  
    describe("If a token is burned accidently, it cannot be minted again by the same solver address",async () => {
      it("Only token owner can burn the token",async () => {
  
        await expect(
          solver1Contract.burn(0)
        ).to.revertedWith("not owner");
      });
  
      it("solver1 burned token: 2 by him/herself", async () => {
        await expect(
          solver1Contract.burn(2)
        )
          .to.emit(rewardContract, "Transfer")
          .withArgs(solver1Addr, ZERO_ADDR, 2);
      });
  
      it("solver1 cannot mint the token again",async () => {
        const data = await utils.generateMintingDataForOneProblem(provider, approver, solver1Addr, approver.address);
        
        await expect(
          solver1Contract.mint(
            data.problemSolverAddr,
            data.problemNumber,
            data.problemSolvedTimestamp,
            data.approverKeyAddr,
            data.approverIndex,
            data.signature,
            utils.generateTokenUri(10)
          )
        ).to.revertedWith("already minted the same token");      
      });
    });
  });
})

  
