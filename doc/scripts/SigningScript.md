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
    - Signature Approver Index: 0
    - Nonce                   : 0

getMessageHash: 0x02fa9a34b8f1f4b190735c13f7ec9458a410d3c9976f1e589bdd2ded24689771
getEthSignedMessageHash: 0xccbf500d2194338efef923c7fe17b0e2b84c76132306e8f2bf5ec3b749373541
Signature: 0xf48090ed731d9b3c956b9ee9843fd96d845879fc22763be659f2fb6f8229b52c245e72e3fb3540e969970333d52fa307b80cb3a04d088364f26c527c4767cb681b

recoverSigner(0xccbf500d2194338efef923c7fe17b0e2b84c76132306e8f2bf5ec3b749373541,0xf48090ed731d9b3c956b9ee9843fd96d845879fc22763be659f2fb6f8229b52c245e72e3fb3540e969970333d52fa307b80cb3a04d088364f26c527c4767cb681b)

VerifySignature(0xDEcf23CbB14972F2e9f91Ce30515ee955a124Cba,997,1673070083,0xB42faBF7BCAE8bc5E368716B568a6f8Fdf3F84ec,0,0xf48090ed731d9b3c956b9ee9843fd96d845879fc22763be659f2fb6f8229b52c245e72e3fb3540e969970333d52fa307b80cb3a04d088364f26c527c4767cb681b)

Check the Signature is...Approved!
Done in 6.77s.
```

> Signing Script could use for three main way:
> 1. The main API Function of Back-End Signing Server
> 1. The Mock-Signature of Smart Contract VerifySignature Testing
> 1. Just using it to sign some msg.

