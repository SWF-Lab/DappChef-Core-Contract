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

//===== variables ==========
//for reward contract
const ZERO_ADDR = '0x0000000000000000000000000000000000000000';
let rewardContract: Contract;
let deployerContract: Contract;
let solverContract: Contract;
let receiverContract: Contract;
let nobodyContract: Contract;
let operatorContract: Contract;

let deployerAddr: string;
let solverAddr: string;
let receiverAddr: string;
let nobodyAddr: string;
let operatorAddr: string;

//for signing
let  ConsumeMsgContract: Contract;
const provider = ethers.provider;
const approver = new ethers.Wallet(process.env.ETHEREUM_PRIVATE_KEY as any, provider)

//for mint
const problemNumber = 123;
const timestamp = 1673070083;
const nonce = 1;
const approverAddr = approver.address;
const approverIndex = checkApproverIndex(approverAddr)
const tokenURI= "ipfs://<ipfsPrefix>/0";
const firstMintId = 0;
const nonExistTokenId = 1000;
let signature: string;

const signing = async () => {
  let ConsumeMsg = await ethers.getContractFactory("ConsumeMsg");
  ConsumeMsgContract = await ConsumeMsg.deploy();
  await ConsumeMsgContract.deployed();

  //sign message
  const messageHash = ethers.utils.solidityKeccak256
  (
    ["address", "uint256", "uint256", "address", "uint8"],
    [solverAddr, problemNumber, timestamp, approverAddr, approverIndex]
  )
  signature = await approver.signMessage(ethers.utils.arrayify(messageHash))

}

const deploy = async () => {
  const RewardContract = await ethers.getContractFactory("Reward");
  
  rewardContract = await RewardContract.deploy();
  await rewardContract.deployed();

  let signers = await ethers.getSigners();
  deployerAddr = signers[0].address;
  solverAddr = signers[1].address;
  receiverAddr = signers[2].address;
  nobodyAddr = signers[3].address;
  operatorAddr = signers[4].address;

  deployerContract = rewardContract.connect(signers[0]);
  solverContract = rewardContract.connect(signers[1]);
  receiverContract = rewardContract.connect(signers[2]);
  nobodyContract = rewardContract.connect(signers[3]);
  operatorContract = rewardContract.connect(signers[4]);
}

//===== TEST =======

describe("Reward", () => {
describe("Unit test",() => {  

  context("ERC721 behavior", () => {
    beforeEach(async () => {
      await deploy();
      await signing();
    })

    context("token not minted", async () => {
      describe("getSolvingStatus", () => {
        let returnValue: any;
        let length: number;
        let arr: number[];
        it("should get solving status", async() => {
          returnValue = await rewardContract.getSolvingStatus(solverAddr);
          length = returnValue[0];
          arr = returnValue[1];
          expect(length).to.be.equal(0);
        })
      })

      describe("getTokenId", async() => {
        it("should revert", async() => {
          await expect(await rewardContract.getTokenID(solverAddr, firstMintId)).to.be.revertedWith("haven't answered this problem correctly")
        })
      })

      describe("mint", async () => {  
        it("reverts with a null destination address", async () => {
          await expect(solverContract.mint(
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
        await solverContract
          .mint(
          solverAddr, problemNumber, timestamp, approverAddr, approverIndex, signature, tokenURI
        )
      })

      describe("getSolvingStatus", () => {
        let returnValue: any;
        let length: number;
        let arr: number[];
        it("should get solving status", async() => {
          returnValue = await rewardContract.getSolvingStatus(solverAddr);
          length = returnValue[0].toString();
          arr = returnValue[1];
          expect(length).to.be.equal(1);
        })
      })

      describe("getTokenID", () => {
        it("should return tokenId", async() => {
          expect(await rewardContract.getTokenID(solverAddr, firstMintId)).to.be.equal(0);
        })
      })

      describe("balanceOf()", () => {
        it("returns the amount of tokens owned by the given address", async () => {
          expect(
            await rewardContract.balanceOf(solverAddr)
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
          ).to.be.equal(solverAddr);
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
        let receipt = null;

        beforeEach(async () => {
          await solverContract.approve(receiverAddr, firstMintId);
          await solverContract.setApprovalForAll(receiverAddr, true);
        })

        
        // ====== test ========
        context("while not allowed to transfer",async () => {
          
          describe("via transferFrom()", async () => {
            it("should revert", async () => {
              await expect(
                solverContract.transferFrom(solverAddr, receiverAddr, tokenId)
              )
              .to.be.revertedWith("you cannot transfer your Reward NFT")
            })
          })

          describe("via safeTransferFrom()", async () => {
            it("should revert", async () => {
              await expect(
                solverContract['safeTransferFrom(address,address,uint256)'](solverAddr, receiverAddr, tokenId)
              )
              .to.be.revertedWith("you cannot transfer your Reward NFT")
            })
          })

          describe("via safeTransferFrom (with data)", async() => {
            it("should revert", async () => {
              await expect(
                solverContract['safeTransferFrom(address,address,uint256,bytes)'](solverAddr, receiverAddr, tokenId, data)
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
                await solverContract.approve(ZERO_ADDR, tokenId)
              ).to
              .emit(solverContract, "Approval")
              .withArgs(solverAddr, ZERO_ADDR, tokenId)
            })

            itClearsApproval();
          });
  
          context('when there was a prior approval', () => {
            
            it("emit Approval", async () => {
              await solverContract.approve(receiverAddr, tokenId);
              await expect(
                await solverContract.approve(ZERO_ADDR, tokenId)
              ).to
              .emit(solverContract, "Approval")
              .withArgs(solverAddr, ZERO_ADDR, tokenId)
            })

            itClearsApproval();
          });

        });

        context('when approving a non-zero address', () => {
          
          context('when there was no prior approval', () => {
            it('sets the approval for the target address', async () => {
              await solverContract.approve(receiverAddr, tokenId);
              expect(
                await rewardContract.getApproved(tokenId)
              )
              .to.be.equal(receiverAddr);
            });

            it('emit Approval', async () => {
              await expect(
                await solverContract.approve(receiverAddr, tokenId)
              )
              .to.emit(solverContract, "Approval")
              .withArgs(solverAddr, receiverAddr, tokenId)
            })
          });
  
          context('when there was a prior approval to the same address', function () {  
            it('sets the approval for the target address', async function () {
              await solverContract.approve(receiverAddr, tokenId);
              await solverContract.approve(receiverAddr, tokenId);
              expect(
                await rewardContract.getApproved(tokenId)
              ).to.be.equal(receiverAddr);
            });

            it('emit Approval', async () => {
              await solverContract.approve(receiverAddr, tokenId);
              await expect(
                await solverContract.approve(receiverAddr, tokenId)
              )
              .to.emit(solverContract, "Approval")
              .withArgs(solverAddr, receiverAddr, tokenId)
            })
          });
  
          context('when there was a prior approval to a different address', () => {
            it('sets the approval for the target address', async () => {
              await solverContract.approve(nobodyAddr, tokenId);
              await solverContract.approve(nobodyAddr, tokenId);
              expect(
                await rewardContract.getApproved(tokenId)
              )
              .to.be.equal(nobodyAddr);
            });

            it('emit Approval', async () => {
              await solverContract.approve(nobodyAddr, tokenId);
              await expect(
                await solverContract.approve(nobodyAddr, tokenId)
              )
              .to.emit(solverContract, "Approval")
              .withArgs(solverAddr, nobodyAddr, tokenId)
            })
          });

        });

        context('when the address that receives the approval is the owner', function () {
          it('reverts', async function () {
            await expect(
              solverContract.approve(solverAddr, tokenId)
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
              await solverContract.setApprovalForAll(operatorAddr, true);
              expect(
                await rewardContract.isApprovedForAll(solverAddr, operatorAddr)
              ).to.equal(true);
            });
  
            it('emits an approval event', async function () {
              await expect(
                await solverContract.setApprovalForAll(operatorAddr, true)
              )
              .to.emit(solverContract, "ApprovalForAll")
              .withArgs(solverAddr, operatorAddr, true)
            });
          });

          context('when the operator was set as not approved', function () {
            beforeEach(async function () {
              await solverContract.setApprovalForAll(operatorAddr, false);
            });
  
            it('approves the operator', async function () {
              await solverContract.setApprovalForAll(operatorAddr, true);
              expect(
                await rewardContract.isApprovedForAll(solverAddr, operatorAddr)
              ).to.equal(true);
            });
  
            it('emits an approval event', async function () {
              await expect(
                await solverContract.setApprovalForAll(operatorAddr, true)
              )
              .to.emit(solverContract, "ApprovalForAll")
              .withArgs(solverAddr, operatorAddr, true)
            });
  
            it('can unset the operator approval', async function () {
              await solverContract.setApprovalForAll(operatorAddr, false);
              expect(
                await rewardContract.isApprovedForAll(solverAddr, operatorAddr)
              ).to.equal(false);
            });
          });

          context('when the operator was already approved', function () {
  
            it('keeps the approval to the given address', async function () {
              await solverContract.setApprovalForAll(operatorAddr, true);
              await solverContract.setApprovalForAll(operatorAddr, true);
  
              expect(
                await rewardContract.isApprovedForAll(solverAddr, operatorAddr)
              ).to.equal(true);
            });
  
            it('emits an approval event', async function () {
              await expect(
                await solverContract.setApprovalForAll(operatorAddr, true)
              )
              .to.emit(solverContract, "ApprovalForAll")
              .withArgs(solverAddr, operatorAddr, true)
            });
          });

        })

        context('when the operator is the owner', function () {
          it('reverts', async function () {
            await expect(
              solverContract.setApprovalForAll(solverAddr, true)
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
              await solverContract.approve(receiverAddr, firstMintId);
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
            solverContract.burn(nonExistTokenId)
          ).to.be.revertedWith('token doesn\'t exist');
        });

        context('with burnt token', function () {
          it('emits a Transfer event', async () => {
            await expect(
              await solverContract.burn(firstMintId)
            )
            .to.emit(solverContract,'Transfer')
            .withArgs(solverAddr, ZERO_ADDR, firstMintId)
          });
  
          it('deletes the token', async function () {
            await solverContract.burn(firstMintId);
            expect(
              await rewardContract.balanceOf(solverAddr)
            )
            .to.be.equal(0);

            await expect(
              rewardContract.ownerOf(firstMintId)
            ).to.be.revertedWith('token doesn\'t exist');
          });
  
          it('reverts when burning a token id that has been deleted', async function () {
            await solverContract.burn(firstMintId);
            await expect(
              solverContract.burn(firstMintId)
            ).to.be.revertedWith('token doesn\'t exist');
          });
        });
      });
    });
  });

  //===== Metadata ========

  context("ERC721 metadata",  () => {
    beforeEach(async () => {
      await deploy();
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
        await signing();
        await solverContract.mint(
          solverAddr, problemNumber, timestamp, approverAddr, approverIndex, signature, tokenURI
        );
        //get tokenURI
        expect(await solverContract.tokenURI(firstMintId)).to.be.equal(tokenURI);
      });
    });
  });

});
})
