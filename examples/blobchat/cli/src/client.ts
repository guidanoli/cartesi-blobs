import { createWalletClient, http, isHex } from "viem";
import { privateKeyToAccount, mnemonicToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";

function getAccount() {
    const mnemonic = process.env.MNEMONIC;
    const privateKey = process.env.PRIVATE_KEY;
    if (mnemonic !== undefined) {
        const accountIndex = process.env.ACCOUNT_INDEX
            ? Number(process.env.ACCOUNT_INDEX)
            : undefined;
        if (accountIndex !== undefined && isNaN(accountIndex)) {
            throw new Error(
                "Environment variable ACCOUNT_INDEX must be a valid number",
            );
        }
        return mnemonicToAccount(mnemonic, { accountIndex });
    } else if (privateKey !== undefined) {
        if (!isHex(privateKey)) {
            throw new Error(
                "Environment variable PRIVATE_KEY must be in hexstring format",
            );
        }
        return privateKeyToAccount(privateKey);
    } else {
        throw new Error(
            "Expected either environment variables MNEMONIC or PRIVATE_KEY to be set",
        );
    }
}

export const account = getAccount();

export const client = createWalletClient({
    account,
    chain: sepolia,
    transport: http(),
});
