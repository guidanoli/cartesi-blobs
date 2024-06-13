// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.24;

import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

import {IInputBox} from "@cartesi/rollups/contracts/inputs/IInputBox.sol";
import {Portal} from "@cartesi/rollups/contracts/portals/Portal.sol";

import {IVersionedBlobHashPortal} from "./IVersionedBlobHashPortal.sol";

contract VersionedBlobHashPortal is IVersionedBlobHashPortal, Portal {
    /// @notice Constructs the portal.
    /// @param inputBox The input box used by the portal
    constructor(IInputBox inputBox) Portal(inputBox) {}

    /// @inheritdoc IVersionedBlobHashPortal
    function sendVersionedBlobHashes(address appContract) external {
        bytes memory input = abi.encodePacked(msg.sender);

        for (uint256 i; ; ++i) {
            bytes32 versionedBlobHash = blobhash(i);
            if (versionedBlobHash == bytes32(0)) break;
            input = abi.encodePacked(input, versionedBlobHash);
        }

        _inputBox.addInput(appContract, input);
    }

    /// @inheritdoc IERC165
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(IERC165, Portal) returns (bool) {
        return
            interfaceId == type(IVersionedBlobHashPortal).interfaceId ||
            super.supportsInterface(interfaceId);
    }
}
