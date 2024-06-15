import { createWalletClient, http } from "viem";
import { mnemonicToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";

const mnemonic = process.env.MNEMONIC;

if (mnemonic === undefined) {
    throw new Error("Expected environment variable MNEMONIC to be set");
}

export const account = mnemonicToAccount(mnemonic);

export const client = createWalletClient({
    account,
    chain: sepolia,
    transport: http(),
});
