import { expect } from 'chai';
import { ethers } from 'hardhat';
import { Contract } from "ethers";

const UnitTest = async () => {  

  let RewardContract: any;
  let rewardContract: any;
  let solverContract: Contract;



  context("ERC721 behavior", () => {
    beforeEach(() => {
      //deploy contract
    })

    describe("mint", async () => {  
        it("", () => {
          //mint token
        })
    })
  
    context("token minted", async() => {
      beforeEach(() => {
        //mint token
      })
      describe("balanceOf", () => {
        it("", () => {
          //balanceOf()          
        })
      })
      describe("ownerOf", () => {
        it("", () => {
          //ownerOf()          
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

  context("ERC721 metadata", () => {
    before(() => {
      //deploy contract
    })
    describe("has a name", () => {
      //name()
    })
    describe("has a symbol", () => {
      //symbol()
    })
    describe("tokenURI", () => {
      //mint
      //get tokenURI
    })
  })
}

module.exports = {
  UnitTest
}
