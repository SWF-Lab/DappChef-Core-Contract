// SPDX-License-Identifier: Apache License
pragma solidity ^0.8.17;

/* Signature Verification

How to Sign and Verify
# Signing
1. Create message to sign
2. Hash the message
3. Sign the hash (off chain, keep your private key secret)

# Verify
1. Recreate hash from the original message
2. Recover signer from signature and hash
3. Compare recovered signer to claimed signer
*/

contract ConsumeMsg {
    address[] signingKey = [
        0xB42faBF7BCAE8bc5E368716B568a6f8Fdf3F84ec,
        0xB42faBF7BCAE8bc5E368716B568a6f8Fdf3F84ec,
        0xB42faBF7BCAE8bc5E368716B568a6f8Fdf3F84ec,
        0xB42faBF7BCAE8bc5E368716B568a6f8Fdf3F84ec,
        0xB42faBF7BCAE8bc5E368716B568a6f8Fdf3F84ec
    ];

    function getMessageHash(
        address _solver,
        uint256 _problemNumber,
        uint256 _timestamp,
        address _approverKeyAddr
    ) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(_solver, _problemNumber, _timestamp, _approverKeyAddr));
    }

    function getEthSignedMessageHash(bytes32 _messageHash)
        public
        pure
        returns (bytes32)
    {
        /*
        Signature is produced by signing a keccak256 hash with the following format:
        "\x19Ethereum Signed Message\n" + len(msg) + msg
        */
        return
            keccak256(
                abi.encodePacked(
                    "\x19Ethereum Signed Message:\n32",
                    _messageHash
                )
            );
    }

    function getHash(uint _input) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(_input));
    }

    function VerifySignature(
        address _solver,
        uint256 _problemNumber,
        uint256 _timestamp,
        address _approverKeyAddr,
        bytes memory signature
    ) public view returns (bool) {
        bytes32 messageHash = getMessageHash(_solver, _problemNumber, _timestamp, _approverKeyAddr);
        bytes32 ethSignedMessageHash = getEthSignedMessageHash(messageHash);


        return (recoverSigner(ethSignedMessageHash, signature) == signingKey[0]
        || recoverSigner(ethSignedMessageHash, signature) == signingKey[1]
        || recoverSigner(ethSignedMessageHash, signature) == signingKey[2]
        || recoverSigner(ethSignedMessageHash, signature) == signingKey[3]
        || recoverSigner(ethSignedMessageHash, signature) == signingKey[4]);
    }

    function recoverSigner(
        bytes32 _ethSignedMessageHash,
        bytes memory _signature
    ) public pure returns (address) {
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(_signature);

        return ecrecover(_ethSignedMessageHash, v, r, s);
    }

    function splitSignature(bytes memory sig)
        public
        pure
        returns (
            bytes32 r,
            bytes32 s,
            uint8 v
        )
    {
        require(sig.length == 65, "invalid signature length");

        assembly {
            /*
            First 32 bytes stores the length of the signature

            add(sig, 32) = pointer of sig + 32
            effectively, skips first 32 bytes of signature

            mload(p) loads next 32 bytes starting at the memory address p into memory
            */

            // first 32 bytes, after the length prefix
            r := mload(add(sig, 32))
            // second 32 bytes
            s := mload(add(sig, 64))
            // final byte (first byte of the next 32 bytes)
            v := byte(0, mload(add(sig, 96)))
        }

        // implicitly return (r, s, v)
    }
}
