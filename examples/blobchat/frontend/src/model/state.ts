import { Hex, Address } from "viem";

export interface Message {
    data: Hex;
    sender: Address;
    blockTimestamp: number;
}

export type AppState = Message[];
