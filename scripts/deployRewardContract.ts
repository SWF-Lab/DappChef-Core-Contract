import { ethers } from "hardhat";

async function main() {

  // Get the contract owner
  const contractOwner = await ethers.getSigners();
  console.log(`Deploying contract from: ${contractOwner[0].address}`);

  // Hardhat helper to get the ethers contractFactory object
  const Reward = await ethers.getContractFactory('Reward');

  // Deploy the contract
  console.log('Deploying Reward.sol...');
  const rewardContract = await Reward.deploy();
  await rewardContract.deployed();
  console.log(`RewardContract deployed to: ${rewardContract.address}`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });