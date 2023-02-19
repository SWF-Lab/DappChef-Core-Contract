# ConsumeMsgTest

> The ConsumeMsg contract must be tested before any launching version. 

## Intro
This test mainly focuses on sending one valid and one invalid data into `verifySignature`, which should return `true` and `false` respectively.
## Unitest
There is only an unitest in `ConsumeMsgTest.ts` to check if every function in `ConsumeMsg.sol` works correctly.
- `getMessageHash()`: returns a hash value of aligned elements.
- `getEthSignedMessageHash()`: returns a hash value with the prefix and input hash.
- `splitSignature()`: split signature into bytes32, bytes32 and an uint8.
- `recoverSigner()`: recover the signer from EthSignedMsg and Signature.
- `VerifySignature()`: Verify the correct signer. 

## Usage

1. `cp .env.example .env`
2. Open your .env file and copy your "approver private key" into ETHEREUM_PRIVATE_KEY
3. Turn on a terminal, make sure your working directory is under ./DappChef-Core-Contract and type `yarn test-consumeMsg`.

## Expected Result
(under ./DappChef-Core-Contract)
```bash
$ yarn test-consumeMsg
>
yarn run v1.22.19
$ hardhat test ./test/ConsumeMsgTest.ts


  ConsumeMsg: Unitest
    ✔ should correctly get messageHash
    ✔ should correctly get EthSignedMessageHash
    ✔ should correctly split signature
    ✔ should recover correct signer
    ✔ should correctly verifySignature


  5 passing (985ms)

✨  Done in 1.62s.
```