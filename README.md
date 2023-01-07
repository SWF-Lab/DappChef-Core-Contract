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
