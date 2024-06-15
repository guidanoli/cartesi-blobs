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

const program = new Command();

program.name("blobchat-cli").version("0.0.0").description("BlobChat CLI");

const sendCommand = program.command("send");

sendCommand
    .description("Send a message")
    .requiredOption("--message <string>", "the message body")
    .requiredOption(
        "--app-contract <address>",
        "the application contract address",
        parseAddress,
    )
    .action(async (options) => {
        const { appContract, message } = options;
        const hash = await send(appContract, message);
        console.log(hash);
    });

program.parse();
