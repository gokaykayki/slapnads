import {
  usePrivy,
  useCrossAppAccounts,
  useWallets,
  CrossAppAccountWithMetadata,
  WalletWithMetadata,
  useLinkAccount,
  TwitterOAuthWithMetadata,
  useSendTransaction,
  useFundWallet,
} from "@privy-io/react-auth";
import { createPublicClient, http, encodeFunctionData, type Abi } from "viem";
import { monadTestnet } from "viem/chains";
import { useEffect, useState } from "react";

const contractAddress = "0x3133c8319454707eC05D60B04c60D4db47b18815";
const abi = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "OwnableInvalidOwner",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "OwnableUnauthorizedAccount",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "nadId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "walletAddress",
        type: "address",
      },
    ],
    name: "CharacterClaimed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "nadId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "string",
        name: "xAccountId",
        type: "string",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "isPlayer",
        type: "bool",
      },
    ],
    name: "NadAdded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "nadId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "string",
        name: "xAccountId",
        type: "string",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "wasPlayer",
        type: "bool",
      },
    ],
    name: "OwnerXAccountUnlinked",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "slapper",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "nadId",
        type: "uint256",
      },
    ],
    name: "Slap",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "walletAddress",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "xAccountId",
        type: "string",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "nadId",
        type: "uint256",
      },
    ],
    name: "XAccountLinked",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "walletAddress",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "xAccountId",
        type: "string",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "nadId",
        type: "uint256",
      },
    ],
    name: "XAccountUnlinked",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_id",
        type: "string",
      },
      {
        internalType: "string",
        name: "_pp",
        type: "string",
      },
      {
        internalType: "string",
        name: "_username",
        type: "string",
      },
      {
        internalType: "string",
        name: "_displayName",
        type: "string",
      },
    ],
    name: "addCharacterNad",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_nadId",
        type: "uint256",
      },
    ],
    name: "canBeSlapped",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_contractAddress",
        type: "address",
      },
    ],
    name: "changeMonadGamesSC",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    name: "displayNameToNad",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_displayName",
        type: "string",
      },
    ],
    name: "getNadByDisplayName",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "walletAddress",
            type: "address",
          },
          {
            components: [
              {
                internalType: "string",
                name: "id",
                type: "string",
              },
              {
                internalType: "string",
                name: "pp",
                type: "string",
              },
              {
                internalType: "string",
                name: "username",
                type: "string",
              },
              {
                internalType: "string",
                name: "displayName",
                type: "string",
              },
            ],
            internalType: "struct SlapNads.X",
            name: "x",
            type: "tuple",
          },
          {
            internalType: "bool",
            name: "isPlayer",
            type: "bool",
          },
          {
            internalType: "uint256",
            name: "slapsGiven",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "slapsReceived",
            type: "uint256",
          },
        ],
        internalType: "struct SlapNads.Nad",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_wallet",
        type: "address",
      },
    ],
    name: "getNadByMonad",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "walletAddress",
            type: "address",
          },
          {
            components: [
              {
                internalType: "string",
                name: "id",
                type: "string",
              },
              {
                internalType: "string",
                name: "pp",
                type: "string",
              },
              {
                internalType: "string",
                name: "username",
                type: "string",
              },
              {
                internalType: "string",
                name: "displayName",
                type: "string",
              },
            ],
            internalType: "struct SlapNads.X",
            name: "x",
            type: "tuple",
          },
          {
            internalType: "bool",
            name: "isPlayer",
            type: "bool",
          },
          {
            internalType: "uint256",
            name: "slapsGiven",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "slapsReceived",
            type: "uint256",
          },
        ],
        internalType: "struct SlapNads.Nad",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_username",
        type: "string",
      },
    ],
    name: "getNadByUsername",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "walletAddress",
            type: "address",
          },
          {
            components: [
              {
                internalType: "string",
                name: "id",
                type: "string",
              },
              {
                internalType: "string",
                name: "pp",
                type: "string",
              },
              {
                internalType: "string",
                name: "username",
                type: "string",
              },
              {
                internalType: "string",
                name: "displayName",
                type: "string",
              },
            ],
            internalType: "struct SlapNads.X",
            name: "x",
            type: "tuple",
          },
          {
            internalType: "bool",
            name: "isPlayer",
            type: "bool",
          },
          {
            internalType: "uint256",
            name: "slapsGiven",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "slapsReceived",
            type: "uint256",
          },
        ],
        internalType: "struct SlapNads.Nad",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_wallet",
        type: "address",
      },
    ],
    name: "getNadByWallet",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "walletAddress",
            type: "address",
          },
          {
            components: [
              {
                internalType: "string",
                name: "id",
                type: "string",
              },
              {
                internalType: "string",
                name: "pp",
                type: "string",
              },
              {
                internalType: "string",
                name: "username",
                type: "string",
              },
              {
                internalType: "string",
                name: "displayName",
                type: "string",
              },
            ],
            internalType: "struct SlapNads.X",
            name: "x",
            type: "tuple",
          },
          {
            internalType: "bool",
            name: "isPlayer",
            type: "bool",
          },
          {
            internalType: "uint256",
            name: "slapsGiven",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "slapsReceived",
            type: "uint256",
          },
        ],
        internalType: "struct SlapNads.Nad",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_id",
        type: "string",
      },
    ],
    name: "getNadByXId",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "walletAddress",
            type: "address",
          },
          {
            components: [
              {
                internalType: "string",
                name: "id",
                type: "string",
              },
              {
                internalType: "string",
                name: "pp",
                type: "string",
              },
              {
                internalType: "string",
                name: "username",
                type: "string",
              },
              {
                internalType: "string",
                name: "displayName",
                type: "string",
              },
            ],
            internalType: "struct SlapNads.X",
            name: "x",
            type: "tuple",
          },
          {
            internalType: "bool",
            name: "isPlayer",
            type: "bool",
          },
          {
            internalType: "uint256",
            name: "slapsGiven",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "slapsReceived",
            type: "uint256",
          },
        ],
        internalType: "struct SlapNads.Nad",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_nadId",
        type: "uint256",
      },
    ],
    name: "getNadStats",
    outputs: [
      {
        internalType: "address",
        name: "walletAddress",
        type: "address",
      },
      {
        components: [
          {
            internalType: "string",
            name: "id",
            type: "string",
          },
          {
            internalType: "string",
            name: "pp",
            type: "string",
          },
          {
            internalType: "string",
            name: "username",
            type: "string",
          },
          {
            internalType: "string",
            name: "displayName",
            type: "string",
          },
        ],
        internalType: "struct SlapNads.X",
        name: "x",
        type: "tuple",
      },
      {
        internalType: "bool",
        name: "isPlayer",
        type: "bool",
      },
      {
        internalType: "uint256",
        name: "slapsGiven",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "slapsReceived",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getTopSlapped",
    outputs: [
      {
        internalType: "address[10]",
        name: "",
        type: "address[10]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getTopSlappers",
    outputs: [
      {
        internalType: "address[10]",
        name: "",
        type: "address[10]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_wallet",
        type: "address",
      },
    ],
    name: "linkMonadGames",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "id",
        type: "string",
      },
      {
        internalType: "string",
        name: "pp",
        type: "string",
      },
      {
        internalType: "string",
        name: "username",
        type: "string",
      },
      {
        internalType: "string",
        name: "displayName",
        type: "string",
      },
      {
        internalType: "address",
        name: "monadAddress",
        type: "address",
      },
    ],
    name: "linkXAccount",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "monadGamesSC",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "monadToNad",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "nadCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "nads",
    outputs: [
      {
        internalType: "address",
        name: "walletAddress",
        type: "address",
      },
      {
        components: [
          {
            internalType: "string",
            name: "id",
            type: "string",
          },
          {
            internalType: "string",
            name: "pp",
            type: "string",
          },
          {
            internalType: "string",
            name: "username",
            type: "string",
          },
          {
            internalType: "string",
            name: "displayName",
            type: "string",
          },
        ],
        internalType: "struct SlapNads.X",
        name: "x",
        type: "tuple",
      },
      {
        internalType: "bool",
        name: "isPlayer",
        type: "bool",
      },
      {
        internalType: "uint256",
        name: "slapsGiven",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "slapsReceived",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_nadId",
        type: "uint256",
      },
    ],
    name: "ownerUnlinkXAccount",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_nadId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "monadWallet",
        type: "address",
      },
    ],
    name: "slap",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "topSlapped",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "topSlappers",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "unlinkXAccount",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    name: "usernameToNad",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "walletToNad",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    name: "xAccountToNad",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

interface Nad {
  walletAddress: `0x${string}`;
  x: {
    id: string;
    pp: string;
    username: string;
    displayName: string;
  };
  isPlayer: boolean;
  slapsGiven: number;
  slapsReceived: number;
}

// Monad Service Hook
export function useMonadService() {
  const { user, ready, authenticated, logout, login, exportWallet: exportWalletPrivy } = usePrivy();
  const { linkTwitter } = useLinkAccount();
  const { linkCrossAppAccount } = useCrossAppAccounts();
  const { fundWallet: fundWalletPrivy } = useFundWallet();
  const { sendTransaction: sendTransactionPrivy } = useSendTransaction();
  const { wallets } = useWallets();
  const [monadWallet, setMonadWallet] = useState<`0x${string}` | null>(null);
  const [monadUsername, setMonadUsername] = useState<string | null>(null);
  const [embeddedWallet, setEmbeddedWallet] = useState<`0x${string}` | null>(null);
  const [injectedWallet, setInjectedWallet] = useState<`0x${string}` | null>(null);
  const [twitterAccount, setTwitterAccount] = useState<{
    subject: string;
    username: string;
    name: string;
    profilePictureUrl: string;
  } | null>(null);
  const [nad, setNad] = useState<Nad | null>(null);
  // Viem client for Monad testnet
  const publicClient = createPublicClient({
    chain: monadTestnet,
    transport: http(),
  });

  useEffect(() => {
    if (ready && authenticated && user && wallets) {
      const fetchData = async () => {
        if (ready && authenticated && user) {
          await getMonadWallet();
          await checkUsername();
          await getEmbeddedWallet();
          await getInjectedWallet();
          await getTwitterAccount();
        }
      };
      fetchData();
    }
  }, [ready, authenticated, user, wallets]);

  useEffect(() => {
    if (monadWallet && ready && authenticated && user) {
      getNad();
    }
  }, [monadWallet, ready, authenticated, user]);

  // Get Monad wallet from cross-app account
  const getMonadWallet = () => {
    const providerAppId = "cmd8euall0037le0my79qpz42";
    const crossAppAccount: CrossAppAccountWithMetadata | undefined = user?.linkedAccounts.find(
      (account) => account.type === "cross_app" && account.providerApp.id === providerAppId
    ) as CrossAppAccountWithMetadata | undefined;
    if (crossAppAccount) {
      setMonadWallet(crossAppAccount?.embeddedWallets[0].address as `0x${string}`);
    } else {
      setMonadWallet(null);
    }
  };

  const getEmbeddedWallet = () => {
    const embedded: WalletWithMetadata | undefined = wallets?.find((wallet) => wallet.walletClientType === "privy") as
      | WalletWithMetadata
      | undefined;
    if (embedded) {
      setEmbeddedWallet(embedded?.address as `0x${string}`);
    } else {
      setEmbeddedWallet(null);
    }
  };
  const getInjectedWallet = () => {
    const injectedWallet: WalletWithMetadata | undefined = user?.linkedAccounts?.find(
      (wallet) => wallet.type === "wallet" && wallet.connectorType === "injected"
    ) as WalletWithMetadata | undefined;
    if (injectedWallet) {
      setInjectedWallet(injectedWallet?.address as `0x${string}`);
    } else {
      setInjectedWallet(null);
    }
  };

  // Check username on Monad Games ID
  const checkUsername = async () => {
    try {
      const response = await fetch(`https://monad-games-id-site.vercel.app/api/check-wallet?wallet=${monadWallet}`);
      const data = await response.json();
      setMonadUsername(data.user?.username);
    } catch (error) {
      setMonadUsername(null);
      console.error("Error checking username:", error);
    }
  };

  // Link Monad wallet
  const linkMonadWallet = async () => {
    try {
      await linkCrossAppAccount({ appId: "cmd8euall0037le0my79qpz42" });
      return true;
    } catch (error) {
      console.error("Error linking Monad wallet:", error);
      return false;
    }
  };

  const linkTwitterAccount = async () => {
    try {
      await linkTwitter();
    } catch (error) {
      console.error("Error linking Twitter account:", error);
    }
  };

  const getTwitterAccount = () => {
    const twitterAccount: TwitterOAuthWithMetadata | undefined = user?.linkedAccounts?.find(
      (account) => account.type === "twitter_oauth"
    ) as TwitterOAuthWithMetadata | undefined;
    if (twitterAccount) {
      setTwitterAccount({
        subject: twitterAccount.subject,
        username: twitterAccount.username || "",
        name: twitterAccount.name || "",
        profilePictureUrl: twitterAccount.profilePictureUrl || "",
      });
    } else {
      setTwitterAccount(null);
    }
  };

  const getNad = async () => {
    try {
      const nadId = await publicClient.readContract({
        address: contractAddress,
        abi: abi,
        functionName: "monadToNad",
        args: [monadWallet],
      });

      if (nadId && Number(nadId) > 0) {
        const nadStats: [
          string,
          { id: string; pp: string; username: string; displayName: string },
          boolean,
          bigint,
          bigint
        ] = (await publicClient.readContract({
          address: contractAddress,
          abi: abi,
          functionName: "getNadStats",
          args: [nadId],
        })) as [string, { id: string; pp: string; username: string; displayName: string }, boolean, bigint, bigint];

        const nadData = {
          walletAddress: monadWallet as `0x${string}`,
          x: {
            id: (nadStats[1]?.id as string) || "",
            pp: (nadStats[1]?.pp as string) || "",
            username: (nadStats[1]?.username as string) || "",
            displayName: (nadStats[1]?.displayName as string) || "",
          },
          isPlayer: nadStats[2],
          slapsGiven: Number(nadStats[3]),
          slapsReceived: Number(nadStats[4]),
        };

        setNad(nadData);
      } else {
        setNad(null);
      }
    } catch (error) {
      console.error("🚨 Error getting NAD:", error);
      setNad(null);
    }
  };

  const registerGame = async () => {
    if (!twitterAccount || !monadWallet || !embeddedWallet) return;
    const tx = await sendTransactionPrivy(
      {
        chainId: monadTestnet.id,
        to: contractAddress,
        data: encodeFunctionData({
          abi: abi,
          functionName: "linkMonadGames",
          args: [monadWallet],
        }),
      },
      { address: embeddedWallet as `0x${string}` }
    );

    // Fetch NAD data after transaction
    await getNad();
  };

  const fundWallet = async () => {
    const tx = await fundWalletPrivy(embeddedWallet as `0x${string}`, {
      amount: "0.05",
      chain: monadTestnet,
    });
  };

  const linkTwitterToNad = async () => {
    if (!twitterAccount || !monadWallet || !embeddedWallet) return;
    const tx = await sendTransactionPrivy(
      {
        chainId: monadTestnet.id,
        to: contractAddress,
        data: encodeFunctionData({
          abi: abi,
          functionName: "linkXAccount",
          args: [
            twitterAccount.subject,
            twitterAccount.profilePictureUrl,
            twitterAccount.username,
            twitterAccount.name,
            monadWallet,
          ],
        }),
      },
      { address: embeddedWallet as `0x${string}` }
    );

    // Fetch NAD data after transaction
    await getNad();
  };

  const getNadByUsername = async (username: string) => {
    const nad = await publicClient.readContract({
      address: contractAddress,
      abi: abi,
      functionName: "getNadByUsername",
      args: [username],
    });
    const nadId = await publicClient.readContract({
      address: contractAddress,
      abi: abi,
      functionName: "usernameToNad",
      args: [username],
    });
    return { nadId, nad };
  };

  // Get top slappers (most active slappers) with NAD details
  const getTopSlappers = async () => {
    try {
      const topSlappersWallets = await publicClient.readContract({
        address: contractAddress,
        abi: abi,
        functionName: "getTopSlappers",
        args: [],
      });

      if (!topSlappersWallets || !Array.isArray(topSlappersWallets) || topSlappersWallets.length === 0) {
        return [];
      }

      // Filter out zero addresses and create multicall contracts
      const validWallets = (topSlappersWallets as string[]).filter(
        (wallet: string) => wallet && wallet !== "0x0000000000000000000000000000000000000000"
      );

      if (validWallets.length === 0) {
        return [];
      }

      // Create contracts array for multicall to get NAD IDs
      const nadIdContracts = validWallets.map((wallet: string) => ({
        address: contractAddress as `0x${string}`,
        abi: abi as Abi,
        functionName: "monadToNad",
        args: [wallet],
      }));

      // Get NAD IDs for all wallets
      const nadIdResults = await publicClient.multicall({ contracts: nadIdContracts });

      // Filter valid NAD IDs and create contracts for getNadStats
      const validNadIds: Array<{ wallet: string; nadId: bigint }> = [];
      nadIdResults.forEach((result, index) => {
        if (result.status === "success" && result.result && Number(result.result) > 0) {
          validNadIds.push({
            wallet: validWallets[index],
            nadId: result.result as bigint,
          });
        }
      });

      if (validNadIds.length === 0) {
        return [];
      }

      // Create contracts array for multicall to get NAD stats
      const nadStatsContracts = validNadIds.map(({ nadId }) => ({
        address: contractAddress as `0x${string}`,
        abi: abi as Abi,
        functionName: "getNadStats",
        args: [nadId],
      }));

      // Get NAD stats for all valid NADs
      const nadStatsResults = await publicClient.multicall({ contracts: nadStatsContracts });

      // Build the final result with NAD details
      const topSlappersWithDetails = validNadIds
        .map(({ wallet }, index) => {
          const statsResult = nadStatsResults[index];
          if (statsResult.status === "success" && statsResult.result) {
            const nadStats = statsResult.result as [
              string,
              { id: string; pp: string; username: string; displayName: string },
              boolean,
              bigint,
              bigint
            ];

            return {
              wallet,
              nadId: Number(validNadIds[index].nadId),
              x: {
                id: nadStats[1]?.id || "",
                pp: nadStats[1]?.pp || "",
                username: nadStats[1]?.username || "",
                displayName: nadStats[1]?.displayName || "",
              },
              isPlayer: nadStats[2],
              slapsGiven: Number(nadStats[3]),
              slapsReceived: Number(nadStats[4]),
            };
          }
          return null;
        })
        .filter((item) => item !== null); // Return all valid NADs

      return topSlappersWithDetails;
    } catch (error) {
      console.error("Error getting top slappers:", error);
      return [];
    }
  };

  // Get top slapped (most slapped users) with NAD details
  const getTopSlapped = async () => {
    try {
      const topSlappedWallets = await publicClient.readContract({
        address: contractAddress,
        abi: abi,
        functionName: "getTopSlapped",
        args: [],
      });

      if (!topSlappedWallets || !Array.isArray(topSlappedWallets) || topSlappedWallets.length === 0) {
        return [];
      }

      // Filter out zero addresses and create multicall contracts
      const validWallets = (topSlappedWallets as string[]).filter(
        (wallet: string) => wallet && wallet !== "0x0000000000000000000000000000000000000000"
      );

      if (validWallets.length === 0) {
        return [];
      }

      // Create contracts array for multicall to get NAD IDs
      const nadIdContracts = validWallets.map((wallet: string) => ({
        address: contractAddress as `0x${string}`,
        abi: abi as Abi,
        functionName: "monadToNad",
        args: [wallet],
      }));

      // Get NAD IDs for all wallets
      const nadIdResults = await publicClient.multicall({ contracts: nadIdContracts });

      // Filter valid NAD IDs and create contracts for getNadStats
      const validNadIds: Array<{ wallet: string; nadId: bigint }> = [];
      nadIdResults.forEach((result, index) => {
        if (result.status === "success" && result.result && Number(result.result) > 0) {
          validNadIds.push({
            wallet: validWallets[index],
            nadId: result.result as bigint,
          });
        }
      });

      if (validNadIds.length === 0) {
        return [];
      }

      // Create contracts array for multicall to get NAD stats
      const nadStatsContracts = validNadIds.map(({ nadId }) => ({
        address: contractAddress as `0x${string}`,
        abi: abi as Abi,
        functionName: "getNadStats",
        args: [nadId],
      }));

      // Get NAD stats for all valid NADs
      const nadStatsResults = await publicClient.multicall({ contracts: nadStatsContracts });

      // Build the final result with NAD details
      const topSlappedWithDetails = validNadIds
        .map(({ wallet }, index) => {
          const statsResult = nadStatsResults[index];
          if (statsResult.status === "success" && statsResult.result) {
            const nadStats = statsResult.result as [
              string,
              { id: string; pp: string; username: string; displayName: string },
              boolean,
              bigint,
              bigint
            ];

            return {
              wallet,
              nadId: Number(validNadIds[index].nadId),
              x: {
                id: nadStats[1]?.id || "",
                pp: nadStats[1]?.pp || "",
                username: nadStats[1]?.username || "",
                displayName: nadStats[1]?.displayName || "",
              },
              isPlayer: nadStats[2],
              slapsGiven: Number(nadStats[3]),
              slapsReceived: Number(nadStats[4]),
            };
          }
          return null;
        })
        .filter((item) => item !== null); // Return all valid NADs

      return topSlappedWithDetails;
    } catch (error) {
      console.error("Error getting top slapped:", error);
      return [];
    }
  };

  // Get NAD stats by wallet address
  const getNadStatsByWallet = async (walletAddress: string) => {
    try {
      const nadId = await publicClient.readContract({
        address: contractAddress,
        abi: abi,
        functionName: "walletToNad",
        args: [walletAddress],
      });

      if (nadId && Number(nadId) > 0) {
        const nadStats = await publicClient.readContract({
          address: contractAddress,
          abi: abi,
          functionName: "getNadStats",
          args: [nadId],
        });
        return { nadId, nadStats };
      }
      return null;
    } catch (error) {
      console.error("Error getting NAD stats by wallet:", error);
      return null;
    }
  };

  // Get total NAD count
  const getNadCount = async () => {
    try {
      const count = await publicClient.readContract({
        address: contractAddress,
        abi: abi,
        functionName: "nadCount",
        args: [],
      });
      return Number(count);
    } catch (error) {
      console.error("Error getting NAD count:", error);
      return 0;
    }
  };

  // Get NADs in batch (10 at a time) using multicall
  const getNadsBatch = async (startId: number, count: number) => {
    try {
      // Create contracts array for multicall
      const contracts = [];
      for (let i = startId; i < startId + count; i++) {
        contracts.push({
          address: contractAddress as `0x${string}`,
          abi: abi as Abi,
          functionName: "nads",
          args: [BigInt(i)],
        });
      }

      // Use multicall for efficient batch reading
      const results = await publicClient.multicall({ contracts });

      const nads = results
        .map((result, index) => {
          if (result.status === "success" && result.result) {
            const nadData = result.result as [
              string,
              { id: string; pp: string; username: string; displayName: string },
              boolean,
              bigint,
              bigint
            ];
            return {
              nadId: startId + index,
              walletAddress: nadData[0],
              x: {
                id: nadData[1].id,
                pp: nadData[1].pp,
                username: nadData[1].username,
                displayName: nadData[1].displayName,
              },
              isPlayer: nadData[2],
              slapsGiven: Number(nadData[3]),
              slapsReceived: Number(nadData[4]),
            };
          }
          return null;
        })
        .filter((nad) => nad !== null && nad.x.username); // Only return NADs with usernames

      return nads;
    } catch (error) {
      console.error("Error getting NADs batch:", error);
      return [];
    }
  };

  const slapNad = async (nadId: number) => {
    if (!monadWallet || !embeddedWallet) return;
    try {
      const tx = await sendTransactionPrivy(
        {
          chainId: monadTestnet.id,
          to: contractAddress,
          data: encodeFunctionData({
            abi: abi,
            functionName: "slap",
            args: [BigInt(nadId), monadWallet],
          }),
        },
        { address: embeddedWallet as `0x${string}` }
      );

      // Slap başarılı olduktan sonra kullanıcının kendi NAD verilerini güncelle
      if (nad) {
        setNad((prevNad) =>
          prevNad
            ? {
                ...prevNad,
                slapsGiven: prevNad.slapsGiven + 1,
              }
            : null
        );
      }

      return tx;
    } catch (error) {
      console.error("Error slapping NAD:", error);
      throw error;
    }
  };

  return {
    // Privy states
    user,
    ready,
    authenticated,
    logout,
    login,
    embeddedWallet,
    injectedWallet,
    linkTwitterAccount,
    twitterAccount,
    nad,
    registerGame,
    exportWalletPrivy,
    // Monad specific
    linkMonadWallet,
    monadWallet,
    monadUsername,
    fundWallet,
    linkTwitterToNad,
    // Search functions
    getNadByUsername,
    slapNad,
    getTopSlappers,
    getTopSlapped,
    getNadStatsByWallet,
    getNadCount,
    getNadsBatch,
    // X API functions
  };
}
