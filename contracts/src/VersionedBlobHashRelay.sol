// SPDX-License-Identifier: GPL-3.0-only

pragma solidity ^0.8.24;

import {IInputBox} from "@cartesi/rollups/contracts/inputs/IInputBox.sol";
import {InputRelay} from "@cartesi/rollups/contracts/inputs/InputRelay.sol";

contract VersionedBlobHashRelay is InputRelay {
    constructor(IInputBox _inputBox) InputRelay(_inputBox) {}

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
