"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { monadTestnet } from "viem/chains";

export default function ClientProvider({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId="cmev45u5e0044l20bb1oqedmi"
      config={{
        embeddedWallets: {
          ethereum: {
            createOnLogin: "all-users",
          },
        },
        defaultChain: monadTestnet,
        supportedChains: [monadTestnet],
        appearance: {
          theme: "dark",
          accentColor: "#8B5CF6",
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
