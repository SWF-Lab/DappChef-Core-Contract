# ConsumeMsgTest

> The ConsumeMsg contract must be tested before any launching version. This test can be improved in the future.

## Usage

1. `cp .env.example .env`
2. Open your .env file and copy your "approver private key" into ETHEREUM_PRIVATE_KEY
3. Turn on a terminal, make sure your working directory is under ./DappChef-Core-Contract and type `yarn test-consumeMsg` in it.

## Expected Result
(under ./DappChef-Core-Contract)
```bash
$ yarn test 
>
yarn run v1.22.18
$ node -r ts-node/register -r tsconfig-paths/register hardhatRunWithArgs.ts scripts/Signing.ts
Signer Key Address: 0xB42faBF7BCAE8bc5E368716B568a6f8Fdf3F84ec
    - Problem Solver Address  : 0xDEcf23CbB14972F2e9f91Ce30515ee955a124Cba
    - Problem Number is       : 997
    - Problem Solved Timestamp: 1673070083
    - Signature Approver Key  : 0xB42faBF7BCAE8bc5E368716B568a6f8Fdf3F84ec

Signing Hash: 0xfc27d62914c7b824a0c526c1b23fa720d8e7ae5d65895f66266bfacf4c8e5bee
Signature: 0xe87dc483dc4169c103a74127743778767a5802281958c163f4232d9cd46f0bf72fe194c0e0b4425fb7c4c203839c7c98d14eed02d214c5239e55836540915aa81c

Check the Signature is Valid...Invalid!
Done in 4.42s.
```

> Signing Script could use for three main way:
> 1. The main API Function of Back-End Signing Server
> 1. The Mock-Signature of Smart Contract VerifySignature Testing
> 1. Just using it to sign some msg.

