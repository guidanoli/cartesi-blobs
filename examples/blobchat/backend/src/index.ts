import createClient from "openapi-fetch";
import { components, paths } from "./schema";
import { Address, Hex, slice, size, isAddressEqual } from "viem";

type PostMethod = ReturnType<typeof createClient<paths>>["POST"];
type AdvanceRequestData = components["schemas"]["Advance"];
type InspectRequestData = components["schemas"]["Inspect"];
type RequestHandlerResult = components["schemas"]["Finish"]["status"];
type RollupsRequest = components["schemas"]["RollupRequest"];
type GioResponse = components["schemas"]["GioResponseRollup"];
type InspectRequestHandler = (data: InspectRequestData) => Promise<void>;
type AdvanceRequestHandler = (
    data: AdvanceRequestData,
    POST: PostMethod,
) => Promise<RequestHandlerResult>;

const VERSIONED_BLOB_HASH_PORTAL: Address =
    "0x03CBe3B3A870CCFBDb810DC790C1634037b8Cb82";

const rollupServer = process.env.ROLLUP_HTTP_SERVER_URL;
console.log("HTTP rollup_server url is " + rollupServer);

// Uses continuation-passing style
const split = <T>(
    hex: Hex,
    at: number,
    k: (before: Hex, after: Hex) => T,
): T => {
    return k(slice(hex, 0, at), at < size(hex) ? slice(hex, at) : "0x");
};

const handleAdvanceFromVersionedBlobHashPortal: AdvanceRequestHandler = async (
    { payload },
    POST,
) => {
    const [sender, versionedBlobHashes] = split(
        payload,
        20,
        (sender, payload) => {
            const versionedBlobHashes: Hex[] = [];
            while (size(payload) > 0) {
                payload = split(payload, 32, (versionedBlobHash, payload) => {
                    versionedBlobHashes.push(versionedBlobHash);
                    return payload;
                });
            }
            return [sender, versionedBlobHashes];
        },
    );
    console.log(`Received ${versionedBlobHashes.length} blobs from ${sender}:`);
    for (const versionedBlobHash of versionedBlobHashes) {
        console.log(`Retrieving blob from versioned hash ${versionedBlobHash}`);
        const { response } = await POST("/gio", {
            body: {
                domain: 4844,
                id: versionedBlobHash,
            },
            parseAs: "text",
        });

        if (response.status == 200) {
            const data = (await response.json()) as GioResponse;
            if (data.code == 42) {
                const blob = data.data;
                console.log(`Blob retrieved: ${blob}`);
            } else {
                console.log(
                    `GIO request failed with code ${data.code}: ${data.data}`,
                );
                return "reject";
            }
        } else {
            const data = await response.text();
            console.log(
                `HTTP request failed with status ${response.status}: ${data}`,
            );
            return "reject";
        }
    }
    return "accept";
};

const handleAdvance: AdvanceRequestHandler = async (data, POST) => {
    console.log("Received advance request data " + JSON.stringify(data));
    if (isAddressEqual(data.metadata.msg_sender, VERSIONED_BLOB_HASH_PORTAL)) {
        return handleAdvanceFromVersionedBlobHashPortal(data, POST);
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
                        POST,
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
