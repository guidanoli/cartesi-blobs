import { parseAbi, Address } from "viem";

const versionedBlobHashPortalAddress: Address =
    "0x03CBe3B3A870CCFBDb810DC790C1634037b8Cb82";

const versionedBlobHashPortalAbi = parseAbi([
    "function sendVersionedBlobHashes(address appContract) external",
]);

export const versionedBlobHashPortal = {
    address: versionedBlobHashPortalAddress,
    abi: versionedBlobHashPortalAbi,
};
