"use client";

import { ReactNode } from "react";
import { hexToString, fromHex, Address } from "viem";
import { formatDistanceToNowStrict } from "date-fns";

import { ReaderResult, useLatestAppState } from "../model/reader";
import { Message, AppState } from "../model/state";

interface ReaderResultComponentProps<T> {
    readerResult: ReaderResult<T>;
    responseComponent: (response: T) => ReactNode;
}

function ReaderResultComponent<T>({
    readerResult,
    responseComponent,
}: ReaderResultComponentProps<T>): ReactNode {
    switch (readerResult.kind) {
        case "loading":
            return <p>Loading...</p>;
        case "error":
            return <p>Error: {readerResult.message}</p>;
        case "success":
            return responseComponent(readerResult.response);
    }
}

interface MessageComponentProps {
    message: Message;
}

function addressToColor(address: Address): string {
    const hue = fromHex(address, "bigint") % BigInt(360);
    return `hsl(${hue},100%,75%)`;
}

function MessageComponent({ message }: MessageComponentProps): ReactNode {
    const date = new Date(message.blockTimestamp * 1000);
    const body = hexToString(message.data);
    return (
        <p>
            <span style={{ color: addressToColor(message.sender) }}>
                {message.sender}
            </span>
            {": "}
            {body}{" "}
            <span title={date.toLocaleString()} style={{ color: "#757575" }}>
                ({formatDistanceToNowStrict(date)} ago)
            </span>
        </p>
    );
}

function AppStateComponent(appState: AppState): ReactNode {
    return appState
        .sort((m1, m2) => m2.blockTimestamp - m1.blockTimestamp)
        .map((message) => <MessageComponent message={message} />);
}

function App(): ReactNode {
    const readerResult = useLatestAppState();
    return (
        <div>
            <h1>BlobChat 🫧 💬</h1>
            <ReaderResultComponent
                readerResult={readerResult}
                responseComponent={AppStateComponent}
            />
        </div>
    );
}

export default App;
