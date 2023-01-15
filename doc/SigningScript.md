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
    - Nonce                   : 0

getMessageHash: 0xa187319695fd085d10188e1f670dfc11965a403ee88df51295fa075c9edb9eb2
getEthSignedMessageHash: 0x224f89c9eaee87fcba2638fb1167c9f8dabf9e1b7c82798ee2f0a03018466fc9
Signature: 0x4684af4e2a5b5effbd1369d315f081d4324f08323f5cfb3bf4b6bebdf77f2fd83afbd6dd2e1492b4c9c432881faa60f533d5886ce31634afcb6a3372a38ced541c

recoverSigner(0x224f89c9eaee87fcba2638fb1167c9f8dabf9e1b7c82798ee2f0a03018466fc9,0x4684af4e2a5b5effbd1369d315f081d4324f08323f5cfb3bf4b6bebdf77f2fd83afbd6dd2e1492b4c9c432881faa60f533d5886ce31634afcb6a3372a38ced541c)

VerifySignature(0xDEcf23CbB14972F2e9f91Ce30515ee955a124Cba,997,1673070083,0xB42faBF7BCAE8bc5E368716B568a6f8Fdf3F84ec,0,0x4684af4e2a5b5effbd1369d315f081d4324f08323f5cfb3bf4b6bebdf77f2fd83afbd6dd2e1492b4c9c432881faa60f533d5886ce31634afcb6a3372a38ced541c)

Check the Signature is...Approved!
Done in 6.50s.
```

> Signing Script could use for three main way:
> 1. The main API Function of Back-End Signing Server
> 1. The Mock-Signature of Smart Contract VerifySignature Testing
> 1. Just using it to sign some msg.

