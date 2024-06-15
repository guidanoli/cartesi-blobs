import { createWalletClient, http } from "viem";
import { mnemonicToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";

const mnemonic = process.env.MNEMONIC;
const accountIndex = process.env.ACCOUNT_INDEX ? Number(process.env.ACCOUNT_INDEX) : undefined;

if (mnemonic === undefined) {
    throw new Error("Expected environment variable MNEMONIC to be set");
}

if (accountIndex !== undefined && isNaN(accountIndex)) {
    throw new Error("Environment variable ACCOUNT_INDEX must be a valid number");
}

export const account = mnemonicToAccount(mnemonic, { accountIndex });

export const client = createWalletClient({
    account,
    chain: sepolia,
    transport: http(),
});
