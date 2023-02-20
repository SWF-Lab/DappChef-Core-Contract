import { expect } from 'chai';
import { ethers } from 'hardhat';
import { Contract } from "ethers";
import utils from "./utils"

const ZERO_ADDR = ethers.constants.AddressZero;

//===== TEST =======

describe("Reward", () => {
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
          await expect(
            await rewardContract.getTokenID(solver1Addr, firstMintId))
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
          
          expect(await rewardContract.getTokenID(solver1Addr, firstMintId)).to.be.equal(0);
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
            // console.log(solver1Addr);
            //   console.log(receiverAddr);
            //   console.log(tokenId);
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
})
