# Signing Scripts

1. `$ yarn execute scripts/Signing.ts --network <L1_network_name>`
1. Check the log information is correct.

```bash
$ yarn execute scripts/Signing.ts --network goerli
>
Signer Key Address: 0xB42faBF7BCAE8bc5E368716B568a6f8Fdf3F84ec
Signing Msg:
    - Problem Solver Address  : 0xDEcf23CbB14972F2e9f91Ce30515ee955a124Cba
    - Problem Number is       : 997
    - Problem Solved Timestamp: 1673070083
    - Signature Approver Key  : 0xB42faBF7BCAE8bc5E368716B568a6f8Fdf3F84ec
Signing Hash: ...
Signature:
    - r: ...
    - s: ...
    - v: ...

Check the Signature is Valid...Approved!
```

> Signing Script could use for three main way:
> 1. The main API Function of Back-End Signing Server
> 1. The Mock-Signature of Smart Contract VerifySignature Testing
> 1. Just using it to sign some msg.