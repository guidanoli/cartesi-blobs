# Blobchat CLI

This CLI was created to interact with Blobchat.
It uses `viem` to sign EIP-4844 transactions.

## Setup

```sh
pnpm i
```

## Help

```sh
pnpm cli --help
```

## Example

Here, use a mnemonic of an account with some Ether, so you can send transactions.

```sh
export MNEMONIC="test test test test test test test test test test test junk"
pnpm cli send \
    --app-contract 0xab7528bb862fb57e8a2bcd567a2e929a0be56a5e \
    --message "Hello, World!"
```

You can also use a private key instead.

```sh
export PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
pnpm cli send \
    --app-contract 0xab7528bb862fb57e8a2bcd567a2e929a0be56a5e \
    --message "Hello, World!"
```

If successful, the CLI should print out the transaction hash, which you can use on Etherscan and Blobscan.
