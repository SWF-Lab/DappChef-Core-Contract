# Signing Scripts

> We must think a good way to prevent signature replay attack for re-claiming the same NFT with a single server signatire.

## Usage

1. `$ yarn execute scripts/Signing.ts`
1. Check the log information is correct.

```bash
$ yarn execute scripts/Signing.ts
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

