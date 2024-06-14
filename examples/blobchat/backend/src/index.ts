import createClient from "openapi-fetch";
import { components, paths } from "./schema";
import { Address, Hex, slice, size, isAddressEqual } from "viem";

type AdvanceRequestData = components["schemas"]["Advance"];
type InspectRequestData = components["schemas"]["Inspect"];
type RequestHandlerResult = components["schemas"]["Finish"]["status"];
type RollupsRequest = components["schemas"]["RollupRequest"];
type InspectRequestHandler = (data: InspectRequestData) => Promise<void>;
type AdvanceRequestHandler = (
    data: AdvanceRequestData,
) => Promise<RequestHandlerResult>;

const VERSIONED_BLOB_HASH_PORTAL: Address =
    "0x03CBe3B3A870CCFBDb810DC790C1634037b8Cb82";

const rollupServer = process.env.ROLLUP_HTTP_SERVER_URL;
console.log("HTTP rollup_server url is " + rollupServer);

// Uses continuation-passing style
const split = <T>(hex: Hex, at: number, k: (before: Hex, after: Hex) => T): T => {
    return k(slice(hex, 0, at), at < size(hex) ? slice(hex, at) : "0x");
}

const handleAdvanceFromVersionedBlobHashPortal: AdvanceRequestHandler = async ({ payload }) => {
    const [sender, versionedBlobHashes] = split(payload, 20, (sender, payload) => {
        const versionedBlobHashes: Hex[] = [];
        while (size(payload) > 0) {
            payload = split(payload, 32, (versionedBlobHash, payload) => {
                versionedBlobHashes.push(versionedBlobHash);
                return payload;
            });
        }
        return [sender, versionedBlobHashes];
    });
    console.log(`Received ${versionedBlobHashes.length} blobs from ${sender}:`);
    versionedBlobHashes.forEach((versionedblobHash, i) => {
        console.log();
        console.log(`Blob at index ${i}:`)
        console.log(versionedblobHash);
    });
    return "accept";
}

const handleAdvance: AdvanceRequestHandler = async (data) => {
    console.log("Received advance request data " + JSON.stringify(data));
    if (isAddressEqual(data.metadata.msg_sender, VERSIONED_BLOB_HASH_PORTAL)) {
        return handleAdvanceFromVersionedBlobHashPortal(data);
    }
    return "accept";
};

const handleInspect: InspectRequestHandler = async (data) => {
    console.log("Received inspect request data " + JSON.stringify(data));
};

const main = async () => {
    const { POST } = createClient<paths>({ baseUrl: rollupServer });
    let status: RequestHandlerResult = "accept";
    while (true) {
        const { response } = await POST("/finish", {
            body: { status },
            parseAs: "text",
        });

        if (response.status === 200) {
            const data = (await response.json()) as RollupsRequest;
            switch (data.request_type) {
                case "advance_state":
                    status = await handleAdvance(
                        data.data as AdvanceRequestData,
                    );
                    break;
                case "inspect_state":
                    await handleInspect(data.data as InspectRequestData);
                    break;
            }
        } else if (response.status === 202) {
            console.log(await response.text());
        }
    }
};

main().catch((e) => {
    console.log(e);
    process.exit(1);
});
