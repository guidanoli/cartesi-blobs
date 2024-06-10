# Cartesi Rollups + EIP-4844 "blobs"

As of now, the `InputBox` contract accepts input payloads received as transaction `calldata`, which are then emitted through `InputAdded` events, to be fetched by reader nodes later.
For large payloads, this might be an expensive operation.
To counter the abuse of `calldata`, EIP-4844 introduced blob-carrying transactions. Different from `calldata`, blobs are transient, in the sense that Ethereum nodes have no obligation (past some time frame) to keep and serve them to clients, allowing them to be a cheaper DA alternative to `calldata`.
During the execution of contract code, the versioned hashes of these blobs can be accessed via the newly-added EVM instruction known as `BLOBHASH`.

This project aims to create a contract whose sole job is to send to some application an input whose payload contains the versioned hashes of all the blobs included in the transaction. Inside the machine, these hashes can be converted to their pre-images through a Generic I/O request. We believe a demo version of this "driver" can be bootstrapped using NoNodo.
During disputes, the response could be proved through the KZG commitments and proofs that are included in the transaction, which can be much shorter than the blobs themselves, and be passed as `calldata` to a `MerkleProvider` contract. This part is being left out of the scope of this project intentionally, and left as future work.

## References

- [EIP-4844 spec](https://eips.ethereum.org/EIPS/eip-4844)
- [EIP-4844 website](https://www.eip4844.com/)
- [EIP-4844 L2 TX usage & blob lifetime](https://hackmd.io/@protolambda/blobs_l2_tx_usage)
- [EIP-4844 dev usage](https://github.com/colinlyguo/EIP-4844-dev-usage)
