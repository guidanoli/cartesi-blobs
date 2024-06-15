import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { type ReactNode } from "react";

import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Blobchat",
    description: "Chat with peers using EIP-4844 blobs!",
    icons: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🫧</text></svg>",
};

export default function RootLayout(props: { children: ReactNode }) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <Providers>{props.children}</Providers>
            </body>
        </html>
    );
}
