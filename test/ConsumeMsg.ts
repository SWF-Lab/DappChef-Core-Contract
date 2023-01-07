import { expect } from "chai"
import { formatBytes32String, solidityKeccak256 } from "ethers/lib/utils"
import { run } from "hardhat"
import { config } from "../package.json"

describe("ConsumeMsg", () => {
    let consumeMsgContract: any

    const users: any = []

    before(async () => {
        consumeMsgContract = await run("deploy", {})
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