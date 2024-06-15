"use client";

import { type ReactNode } from "react";
import GraphQLProvider from "../providers/graphqlProvider";

export function Providers(props: { children: ReactNode }) {
    return <GraphQLProvider>{props.children}</GraphQLProvider>;
}
