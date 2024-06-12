// SPDX-License-Identifier: GPL-3.0-only

pragma solidity ^0.8.24;

import {IInputBox} from "@cartesi/rollups/contracts/inputs/IInputBox.sol";
import {InputRelay} from "@cartesi/rollups/contracts/inputs/InputRelay.sol";

contract VersionedBlobHashRelay is InputRelay {
    /// @notice Constructs the portal.
    /// @param inputBox The input box used by the portal
    constructor(IInputBox inputBox) InputRelay(inputBox) {}

    /// @notice Adds an input with the versioned hashes of all the
    /// blobs contained in the current transaction, obtained via the
    /// `BLOBHASH` opcode (introduced by EIP-4844).
    /// @param appContract The application contract address
    /// @dev The input format is the following:
    /// message sender address (20 bytes),
    /// followed by `n` versioned blob hashes (32 bytes each),
    /// in the same order as in the transaction.
    function relayVersionedBlobHashes(address appContract) external {
        bytes memory input = abi.encodePacked(msg.sender);

        for (uint256 i; ; ++i) {
            bytes32 versionedBlobHash = blobhash(i);
            if (versionedBlobHash == bytes32(0)) break;
            input = abi.encodePacked(input, versionedBlobHash);
        }

        inputBox.addInput(appContract, input);
    }
}
