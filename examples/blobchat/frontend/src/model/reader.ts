import { useState, useEffect } from "react";
import { Hex, isHex, hexToString, isAddress } from "viem";

import { useQuery } from "@apollo/client";

import { gql } from "./__generated__/gql";
import { AppState, Message } from "./state";

type ReaderLoadingResult = {
    kind: "loading";
};

type ReaderErrorResult = {
    kind: "error";
    message: string;
};

type ReaderSuccessResult<T> = {
    kind: "success";
    response: T;
};

export type ReaderResult<T> =
    | ReaderLoadingResult
    | ReaderErrorResult
    | ReaderSuccessResult<T>;

const GET_LAST_REPORTS = gql(/* GraphQL */ `
    query getLastReports {
        reports(last: 1000) {
            edges {
                node {
                    payload
                }
            }
        }
    }
`);

const POLL_INTERVAL = 2000; // ms

// Create a stateful variable for a reader result
function useReaderResult<T>() {
    return useState<ReaderResult<T>>({ kind: "loading" });
}

export const parseHexAsJson = (hex: Hex) => {
    const str = hexToString(hex);
    try {
        return JSON.parse(str);
    } catch (e) {}
};

export const parseStringAsJson = (str: string) => {
    if (isHex(str)) {
        return parseHexAsJson(str);
    }
};

function isMessage(message: any): message is Message {
    return (
        isHex(message.data) &&
        isAddress(message.sender) &&
        typeof message.blockTimestamp == "number"
    );
}

function and(a: boolean, b: boolean): boolean {
    return a && b;
}

function isAppState(state: any): state is AppState {
    return Array.isArray(state) && state.map(isMessage).reduce(and, true);
}

export const useLatestAppState = () => {
    const [result, setResult] = useReaderResult<AppState>();
    const { data, loading, error } = useQuery(GET_LAST_REPORTS, {
        pollInterval: POLL_INTERVAL,
    });

    useEffect(() => {
        if (loading) {
            setResult({ kind: "loading" });
        } else if (error !== undefined) {
            setResult({ kind: "error", message: error.message });
        } else if (data !== undefined) {
            const lastEdge = data.reports.edges.findLast((edge) => {
                const state = parseStringAsJson(edge.node.payload);
                return isAppState(state);
            });
            if (lastEdge === undefined) {
                const initialAppState: AppState = [];
                setResult({ kind: "success", response: initialAppState });
            } else {
                const state = parseStringAsJson(lastEdge.node.payload);
                if (isAppState(state)) {
                    setResult({ kind: "success", response: state });
                }
            }
        }
    }, [data, loading, error, setResult]);

    return result;
};
