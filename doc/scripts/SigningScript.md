# Signing Scripts

> We must think a good way to prevent signature replay attack for re-claiming the same NFT with a single server signatire.

## Usage

1. `$ yarn execute scripts/Signing.ts`
1. Check the log information is correct.

```bash
$ yarn execute scripts/Signing.ts
>
yarn run v1.22.19
$ node -r ts-node/register -r tsconfig-paths/register hardhatRunWithArgs.ts scripts/Signing.ts
Signer Key Address: 0xd8538ea74825080c0c80B9B175f57e91Ff885Cb4
    - Problem Solver Address  : 0xDEcf23CbB14972F2e9f91Ce30515ee955a124Cba
    - Problem Number is       : 997
    - Problem Solved Timestamp: 1673070083
    - Signature Approver Key  : 0xd8538ea74825080c0c80B9B175f57e91Ff885Cb4
    - Signature Approver Index: 3

getMessageHash: 0x6e06c902019533c0bfdfea500145e9be71be87b8e3d9d4ba0427d08d00d38eea
getEthSignedMessageHash: 0x22d97879a6ba578b27d7f35f19ef2659484e411f3b06aec649a32efd1810713d
Signature: 0xec90a77a85582bebb215c302717453a970a1c0149671ff8536d6b9b11303faae3d222c4cdb519e54ca2295223cb0c4668264fcc2c3b92383342f21dcca7bab651c

recoverSigner(0x22d97879a6ba578b27d7f35f19ef2659484e411f3b06aec649a32efd1810713d,0xec90a77a85582bebb215c302717453a970a1c0149671ff8536d6b9b11303faae3d222c4cdb519e54ca2295223cb0c4668264fcc2c3b92383342f21dcca7bab651c)

VerifySignature(0xDEcf23CbB14972F2e9f91Ce30515ee955a124Cba,997,1673070083,0xd8538ea74825080c0c80B9B175f57e91Ff885Cb4,0xec90a77a85582bebb215c302717453a970a1c0149671ff8536d6b9b11303faae3d222c4cdb519e54ca2295223cb0c4668264fcc2c3b92383342f21dcca7bab651c)

Check the Signature is...Approved!
✨  Done in 3.44s.
```

> Signing Script could use for three main way:
> 1. The main API Function of Back-End Signing Server
> 1. The Mock-Signature of Smart Contract VerifySignature Testing
> 1. Just using it to sign some msg.

