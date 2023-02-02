import { expect } from "chai"
import { formatBytes32String, solidityKeccak256 } from "ethers/lib/utils"
import { run } from "hardhat"
import { config } from "../package.json"
import { ethers } from "hardhat"

describe("ConsumeMsg", () => {
    let consumeMsgContract: any

    const users: any = []

    before(async () => {
        const provider = ethers.provider
        const wallet = new ethers.Wallet(process.env.ETHEREUM_PRIVATE_KEY as any, provider)
        consumeMsgContract = await ethers
    })

    describe("", () => {
        it("", async () => { })

        it("", async () => { })
    })

    describe("", () => {
        it("", async () => { })

        it("", async () => { })
    })
})