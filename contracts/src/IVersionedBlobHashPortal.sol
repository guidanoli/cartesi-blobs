// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.24;

import {IPortal} from "@cartesi/rollups/contracts/portals/IPortal.sol";

/// @title Versioned Blob Hash Portal interface
interface IVersionedBlobHashPortal is IPortal {
    // Permissionless functions

    /// @notice Adds an input with the versioned hashes of all the
    /// blobs contained in the current transaction, obtained via the
    /// `BLOBHASH` opcode (introduced by EIP-4844).
    ///
    /// @param appContract The application contract address
    ///
    /// @dev The input format is the following:
    /// message sender address (20 bytes),
    /// followed by `n` versioned blob hashes (32 bytes each),
    /// in the same order as they appear in the transaction.
    function sendVersionedBlobHashes(address appContract) external;
}
