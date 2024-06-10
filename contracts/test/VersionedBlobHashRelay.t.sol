// SPDX-License-Identifier: GPL-3.0-only

pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";

import {IInputBox} from "@cartesi/rollups/contracts/inputs/IInputBox.sol";

import {VersionedBlobHashRelay} from "src/VersionedBlobHashRelay.sol";

contract TestWrapper is Test {
    uint256 private _addrCount;

    function _newAddr() internal returns (address) {
        return vm.addr(++_addrCount);
    }
}

contract VersionedBlobHashRelayTest is TestWrapper {
    address _alice;
    IInputBox _inputBox;
    address _appContract;
    VersionedBlobHashRelay _relay;

    function setUp() external {
        _alice = _newAddr();
        _inputBox = IInputBox(_newAddr());
        _appContract = _newAddr();
        _relay = new VersionedBlobHashRelay(_inputBox);
    }

    function testGetInputBox() external view {
        assertEq(address(_relay.getInputBox()), address(_inputBox));
    }

    function testRelayZero() external {
        bytes32[] memory versionedBlobHashes = new bytes32[](0);
        bytes memory input = _encodeInput(versionedBlobHashes);
        bytes memory addInputCall = _encodeAddInputCall(input);

        vm.mockCall(address(_inputBox), addInputCall, abi.encode(bytes32(0)));

        vm.expectCall(address(_inputBox), addInputCall, 1);

        vm.prank(_alice);
        _relay.relayVersionedBlobHashes(_appContract);
    }

    function testRelayOne(bytes32 versionedBlobHash) external {
        vm.assume(versionedBlobHash != bytes32(0));

        bytes32[] memory versionedBlobHashes = new bytes32[](1);
        versionedBlobHashes[0] = versionedBlobHash;

        vm.blobhashes(versionedBlobHashes);

        bytes memory input = _encodeInput(versionedBlobHashes);
        bytes memory addInputCall = _encodeAddInputCall(input);

        vm.mockCall(address(_inputBox), addInputCall, abi.encode(bytes32(0)));

        vm.expectCall(address(_inputBox), addInputCall, 1);

        vm.prank(_alice);
        _relay.relayVersionedBlobHashes(_appContract);
    }

    function testRelayTwo(bytes32 a, bytes32 b) external {
        vm.assume(a != bytes32(0));
        vm.assume(b != bytes32(0));

        bytes32[] memory versionedBlobHashes = new bytes32[](2);
        versionedBlobHashes[0] = a;
        versionedBlobHashes[1] = b;

        vm.blobhashes(versionedBlobHashes);

        bytes memory input = _encodeInput(versionedBlobHashes);
        bytes memory addInputCall = _encodeAddInputCall(input);

        vm.mockCall(address(_inputBox), addInputCall, abi.encode(bytes32(0)));

        vm.expectCall(address(_inputBox), addInputCall, 1);

        vm.prank(_alice);
        _relay.relayVersionedBlobHashes(_appContract);
    }

    function _encodeInput(
        bytes32[] memory versionedBlobHashes
    ) internal view returns (bytes memory) {
        return abi.encodePacked(_alice, versionedBlobHashes);
    }

    function _encodeAddInputCall(
        bytes memory input
    ) internal view returns (bytes memory) {
        return abi.encodeCall(IInputBox.addInput, (_appContract, input));
    }
}
