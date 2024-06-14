import createClient from "openapi-fetch";
import { components, paths } from "./schema";
import {
    Address,
    Hex,
    slice,
    size,
    isAddressEqual,
    Hash,
    fromBlobs,
    stringToHex,
} from "viem";

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

interface Message {
    data: Hex;
    sender: Address;
    blockTimestamp: number;
}

const messages: Message[] = [];

// Uses continuation-passing style
const split = <T>(
    hex: Hex,
    at: number,
    k: (before: Hex, after: Hex) => T,
): T => {
    return k(slice(hex, 0, at), at < size(hex) ? slice(hex, at) : "0x");
};

const toBlob = async (versionedBlobHash: Hash, POST: PostMethod) => {
    console.log(
        `Sending GIO request for blob with versioned hash ${versionedBlobHash}`,
    );
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
            return data.data;
        } else {
            console.log(
                `GIO request for blob failed with code ${data.code}: ${data.data}`,
            );
        }
    } else {
        const data = await response.text();
        console.log(
            `HTTP request for blob failed with status ${response.status}: ${data}`,
        );
    }
};

const emitReportWithMessages = async (POST: PostMethod) => {
    const { response } = await POST("/report", {
        body: {
            payload: stringToHex(JSON.stringify(messages)),
        },
        parseAs: "text",
    });

    if (response.status >= 200 && response.status < 300) {
        return true;
    } else {
        const data = await response.text();
        console.log(
            `HTTP request for emitting report failed with status ${response.status}: ${data}`,
        );
        return false;
    }
};

const handleAdvanceFromVersionedBlobHashPortal: AdvanceRequestHandler = async (
    { payload, metadata: { block_timestamp: blockTimestamp } },
    POST,
) => {
    const [sender, versionedBlobHashes] = split(
        payload,
        20,
        (sender, payload) => {
            const versionedBlobHashes: Hash[] = [];
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

    const blobs: Hash[] = [];
    for (const versionedBlobHash of versionedBlobHashes) {
        const blob = await toBlob(versionedBlobHash, POST);
        if (blob === undefined) {
            return "reject";
        }
        blobs.push(blob);
    }

    const data = fromBlobs({ blobs });

    const message: Message = {
        data,
        sender,
        blockTimestamp,
    };

    messages.push(message);

    const emitted = await emitReportWithMessages(POST);

    if (!emitted) {
        return "reject";
    }

    return "accept";
};

const handleAdvance: AdvanceRequestHandler = async (data, POST) => {
    console.log("Received advance request data " + JSON.stringify(data));
    if (isAddressEqual(data.metadata.msg_sender, VERSIONED_BLOB_HASH_PORTAL)) {
        return handleAdvanceFromVersionedBlobHashPortal(data, POST);
    } else {
        console.log("Unauthorized sender");
        return "reject";
    }
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
