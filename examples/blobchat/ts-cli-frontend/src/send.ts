import { parseGwei, stringToHex, toBlobs, Address } from "viem";
import { client } from "./client";
import { kzg } from "./kzg";
import { versionedBlobHashPortal } from "./contracts";

export const send = async (appContract: Address, message: string) => {
    const { abi, address } = versionedBlobHashPortal;

    const blobs = toBlobs({ data: stringToHex(message) });

    const hash = await client.writeContract({
        address,
        abi,
        functionName: "sendVersionedBlobHashes",
        args: [appContract],
        blobs,
        kzg,
        maxFeePerBlobGas: parseGwei("30"),
    });

    return hash;
};
