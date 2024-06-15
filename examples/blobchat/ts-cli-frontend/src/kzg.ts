import * as cKzg from "c-kzg";
import { setupKzg } from "viem";

export const kzg = setupKzg(cKzg, __dirname + "/trusted-setups/mainnet.json");
