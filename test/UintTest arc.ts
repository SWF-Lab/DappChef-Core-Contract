import { expect } from 'chai';
import { ethers } from 'hardhat';

const UnitTest = async () => {  

  context("ERC721 behavior", () => {
    describe("mint", async () => {  
        //deploy contract
        //mint token
    })
  
    context("token minted", async() => {
      before(() => {
        //deploy contract
        //mint token
      })
      describe("balanceOf", () => {
        //balanceOf()
      })
      describe("ownerOf", () => {
        //ownerOf()
      })
      describe("transfer", async () => {
        beforeEach(() => {
          //mint token
        })
        describe("via transferFrom", async () => {
          
        })
        describe("via safeTransferFrom", async () => {
      
        })
        describe("via safeTransferFrom (with data)", async() => {
      
        })
      })
      describe("approve", async () => {
        //approve()
        //can transferFrom
      })
      describe("getApproved", async () => {
        //getApproved()
        //can transferFrom
      })
      describe("setApprovalForAll", async () => {
        //setApprovalForAll()
        it("isApprovedForAll")
      })
    
      describe("burn", async () => {
        //burn
        //ownerOf
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
