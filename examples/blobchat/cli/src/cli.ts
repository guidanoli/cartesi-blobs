import { Command, InvalidArgumentError } from "@commander-js/extra-typings";
import { Address, isAddress } from "viem";

import { send } from "./send";

const parseAddress = (value: string): Address => {
    if (isAddress(value)) {
        return value;
    } else {
        throw new InvalidArgumentError(`Not an address: ${value}`);
    }
};

const parseBigInt = (value: string): bigint => {
    try {
        return BigInt(value);
    } catch (e) {
        if (e instanceof SyntaxError) {
            throw new InvalidArgumentError(`Not an integer: ${value}`);
        } else {
            throw e;
        }
    }
};

const program = new Command();

program.name("blobchat-cli").version("0.0.0").description("Blobchat CLI");

const sendCommand = program.command("send");

sendCommand
    .description("Send a message")
    .requiredOption("--message <string>", "the message body")
    .requiredOption(
        "--app-contract <address>",
        "the application contract address",
        parseAddress,
    )
    .requiredOption(
        "--max-fee-per-blob-gas <bigint>",
        "Maximum total fee per gas sender is willing to pay for blob gas (in Wei)",
        parseBigInt,
    )
    .action(async (options) => {
        const hash = await send(options);
        console.log(`Transaction hash: ${hash}`);
    });

program.parse();
