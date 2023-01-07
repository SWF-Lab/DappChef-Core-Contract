<p align="center">
    <h1 align="center">
        DappChef Contract
    </h1>
</p>

| The repository is divided into two components: [Reward Contract](./) and [ConsumeMsg Contract](./). The contracts allows users to mint their reward NFT after solving the problems, and contract will validate the signed msg to check it is approved by our server or not. |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |


## Requirements

### ConsumeMsgContract
1. Store 5 Signing key.
1. Could verify the Signature which is sent from User(who has solved the problem in the DappChef and want to mint the Reward NFT).
1. The signed-msg(signature) should be signed by the private key stored in our back-end server(or even one of other 4 keys).
1. Normally, the signature produced from the Server Key, but in some special cases, who may change the main signing key to other 4 keys.

### Reward Contract

1. Inherite the `ConsumeMsg Contract`
1. NFT Contract
1. When user want to mint NFT, we should use the `VerifySignature()` in the `ConsumeMsg Contract` to check whether he/she is approved by our server or not.
1. We colud use the `balanceOf()` to check the Users' Answer Status. (`tokenID`: Number of Problem).
1. We could use the `tokenURI()` to find the information of User's solved problems.