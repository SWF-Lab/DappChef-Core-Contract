# ConsumeMsgTest

> The ConsumeMsg contract must be tested before any launching version. 

## Intro
This test mainly focuses on sending one valid and one invalid data into `verifySignature`, which should return `true` and `false` respectively.

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
$ hardhat test ./test/ConsumeMsg.ts


  ConsumeMsg
    verifySignature
      Solver and Signer Infomation:
      - solver:           0xDEcf23CbB14972F2e9f91Ce30515ee955a124Cba
      - problem number:   997
      - timestamp:        1673070083
      - approver address: 0xd8538ea74825080c0c80B9B175f57e91Ff885Cb4
      - approver index:   3
      - signature:        0xec90a77a85582bebb215c302717453a970a1c0149671ff8536d6b9b11303faae3d222c4cdb519e54ca2295223cb0c4668264fcc2c3b92383342f21dcca7bab651c

      Sending Above as Inputs, It will return ... true
      Converting Approver Address into Zero Address, It will return ... false
      ✔ should verify signature (970ms)


  1 passing (973ms)

✨  Done in 1.50s.
```

> Signing Script could use for three main way:
> 1. The main API Function of Back-End Signing Server
> 2. The Mock-Signature of Smart Contract VerifySignature Testing
> 3. Just using it to sign some msg.