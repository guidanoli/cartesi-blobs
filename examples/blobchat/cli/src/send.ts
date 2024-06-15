import { stringToHex, toBlobs, Address } from "viem";
import { client } from "./client";
import { kzg } from "./kzg";
import { versionedBlobHashPortal } from "./contracts";

interface SendOptions {
    message: string;
    appContract: Address;
    maxFeePerBlobGas: bigint;
}

export const send = async (options: SendOptions) => {
    const { message, appContract, maxFeePerBlobGas } = options;

    const { abi, address } = versionedBlobHashPortal;

    const blobs = toBlobs({ data: stringToHex(message) });

    const hash = await client.writeContract({
        address,
        abi,
        functionName: "sendVersionedBlobHashes",
        args: [appContract],
        blobs,
        kzg,
        maxFeePerBlobGas,
    });

    return hash;
};
