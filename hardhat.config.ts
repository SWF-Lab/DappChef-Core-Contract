import "@nomiclabs/hardhat-ethers"
import "@nomicfoundation/hardhat-chai-matchers"
import { config as dotenvConfig } from "dotenv"
import { HardhatUserConfig } from "hardhat/config"
import { NetworksUserConfig } from "hardhat/types"
import { resolve } from "path"
import { config } from "./package.json"
import "./tasks/deploy"

dotenvConfig({ path: resolve(__dirname, "../../.env") })

function getNetworks(): NetworksUserConfig {
  if (process.env.ETHEREUM_URL && process.env.ETHEREUM_PRIVATE_KEY) {
    const accounts = [`0x${process.env.ETHEREUM_PRIVATE_KEY}`]

    return {
      goerli: {
        url: process.env.ETHEREUM_URL,
        chainId: 5,
        accounts
      }
    }
  }

  return {}
}

const hardhatConfig: HardhatUserConfig = {
  solidity: config.solidity,
  paths: {
    sources: config.paths.contracts,
    tests: config.paths.tests,
    cache: config.paths.cache,
    artifacts: config.paths.build.contracts
  },
  networks: {
    hardhat: {
      chainId: 1337
    },
    ...getNetworks()
  }
}

export default hardhatConfig
