<p align="center">
    <h1 align="center">
        DappChef Contract
    </h1>
</p>

| The repository is divided into two components: [Reward Contract](./contracts/Reward.sol) and [ConsumeMsg Contract](./contracts/ConsumeMsg.sol). The contracts allows users to mint their reward NFT after solving the problems, and contract will validate the signed msg to check it is approved by our server or not. |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |




## Requirements

### ConsumeMsg Contract
1. Store [5 Signing key](https://docs.google.com/spreadsheets/d/1JHpkHeemQ1i-WCXACzaRqulWoGvU9uJ2xneoW05S42A/edit#gid=781027229).
1. Could verify the Signature which is sent from User(who has solved the problem in the DappChef and want to mint the Reward NFT).
1. The params of signing msg is described in the [Signing Script documentation](./doc/SigningScript.md).
1. The signed-msg(signature) should be signed by the private key stored in our back-end server(or even one of other 4 keys).
1. Normally, the signature produced from the Server Key, but in some special cases, who may change the main signing key to other 4 keys.

### Reward Contract

1. Inherite the `ConsumeMsgContract`
1. NFT Contract
1. When user want to mint NFT, we should use the `VerifySignature()` in the `ConsumeMsgContract` to check whether he/she is approved by our server or not.
1. We colud use the `balanceOf()` and `parseMetadata` to check the Users' Answer Status.
1. We could use the `tokenURI()` to find the information of User's solved problems.

> `tokenID` will not be the number of problem, it is the number which means the sequence of being minted.

## 🛠 Start Your Journey

### Start the App

1. Clone the repository:

```bash
$ git clone https://github.com/SWF-Lab/DappChef-Core-Contract.git
```

2. Install the dependencies:

```bash
$ cd DappChef-Core-Contract && yarn
```

3. Compile the Contracts

```bash
$ yarn compile
```

4. Run the tests
```
$ yarn test
```

> Make sure the `.env` arguments are same as your image.

### Start the Development

1. Create new branch, reference with [SWF-Lab/github_practice](https://github.com/SWF-Lab/github_practice):

```bash
$ git checkout main # Change to the main branch
$ git pull # Make sure the local code is same with the remote
$ git checkout -b add-my-context # Create new branch
```

2. Write your code...
3. Push the code to remote repo

```bash
$ git add .
$ git commit -m "add a new funcationality"
$ git push
```