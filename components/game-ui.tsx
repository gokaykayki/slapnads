"use client";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { ScrollArea } from "./ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { useEffect, useState } from "react";
import { useMonadService } from "@/app/services/monad";
import {
  Search,
  Zap,
  Trophy,
  Target,
  Wallet,
  Twitter,
  GamepadIcon,
  LogOut,
  Crown,
  Flame,
  Eye,
  ChevronRight,
  Sparkles,
  Shield,
  List,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
} from "lucide-react";
import Image from "next/image";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
interface SearchResult {
  id: string;
  username: string;
  displayName: string;
  nadId?: number;
  walletAddress?: string;
  isPlayer?: boolean;
  slapsGiven?: number;
  slapsReceived?: number;
  pp?: string;
}

interface NadData {
  walletAddress: string;
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

interface NadBatchItem {
  nadId: number;
  walletAddress: string;
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

interface LeaderboardItem {
  wallet: string;
  nadId: number;
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

export default function GameUI() {
  const {
    injectedWallet,
    user,
    ready,
    authenticated,
    logout,
    linkMonadWallet,
    monadWallet,
    monadUsername,
    linkTwitterAccount,
    twitterAccount,
    embeddedWallet,
    nad,
    registerGame,
    fundWallet,
    linkTwitterToNad,
    getNadByUsername,
    slapNad,
    getTopSlappers,
    getTopSlapped,
    getNadCount,
    getNadsBatch,
    exportWalletPrivy,
  } = useMonadService();

  const [username, setUsername] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedNad, setSelectedNad] = useState<SearchResult | null>(null);
  const [topSlappers, setTopSlappers] = useState<LeaderboardItem[]>([]);
  const [topSlapped, setTopSlapped] = useState<LeaderboardItem[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);

  // NAD List Modal states
  const [showNadList, setShowNadList] = useState(false);
  const [nadList, setNadList] = useState<SearchResult[]>([]);
  const [nadListLoading, setNadListLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalNads, setTotalNads] = useState(0);
  const nadsPerPage = 10;

  // X Search states
  const [isAddingToContract, setIsAddingToContract] = useState(false);

  // Load leaderboard data
  const loadLeaderboard = async () => {
    setLeaderboardLoading(true);
    try {
      const [slappers, slapped] = await Promise.all([getTopSlappers(), getTopSlapped()]);
      setTopSlappers((slappers as LeaderboardItem[]) || []);
      setTopSlapped((slapped as LeaderboardItem[]) || []);
    } catch (error) {
      console.error("Error loading leaderboard:", error);
    } finally {
      setLeaderboardLoading(false);
    }
  };

  // Load leaderboard on component mount
  useEffect(() => {
    if (ready && authenticated) {
      loadLeaderboard();
    }
  }, [ready, authenticated]);

  // Load NAD list
  const loadNadList = async (page: number = 1) => {
    setNadListLoading(true);
    try {
      // Get total count first
      const count = await getNadCount();
      setTotalNads(count);

      // Calculate start index (NAD IDs start from 1, not 0)
      const startId = (page - 1) * nadsPerPage + 1;

      // Get batch of NADs
      const nads = await getNadsBatch(startId, nadsPerPage);
      const formattedNads = nads
        .filter((nad): nad is NadBatchItem => nad !== null)
        .map((nad) => ({
          id: nad.nadId.toString(),
          username: nad.x.username,
          displayName: nad.x.displayName,
          nadId: nad.nadId,
          walletAddress: nad.walletAddress,
          isPlayer: nad.isPlayer,
          slapsGiven: nad.slapsGiven,
          slapsReceived: nad.slapsReceived,
          pp: nad.x.pp,
        }));
      setNadList(formattedNads);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error loading NAD list:", error);
    } finally {
      setNadListLoading(false);
    }
  };

  // Handle NAD selection from list
  const handleNadListSelection = (nad: SearchResult) => {
    setSelectedNad(nad);
    setUsername("");
    setShowNadList(false);
  };

  // Username search function (NAD search)
  const handleUsernameSearch = async (searchTerm: string) => {
    if (searchTerm.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);
    try {
      const { nadId, nad } = await getNadByUsername(searchTerm);
      if (nadId && Number(nadId) > 0) {
        const nadData = nad as NadData;
        const searchResult: SearchResult = {
          id: nadId.toString(),
          username: nadData.x.username,
          displayName: nadData.x.displayName,
          nadId: Number(nadId),
          walletAddress: nadData.walletAddress,
          isPlayer: nadData.isPlayer,
          slapsGiven: nadData.slapsGiven,
          slapsReceived: nadData.slapsReceived,
          pp: nadData.x.pp,
        };
        setSearchResults([searchResult]);
        setShowDropdown(true);
      } else {
        setSearchResults([]);
        setShowDropdown(true);
      }
    } catch (error) {
      console.error("NAD search error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Search on username change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleUsernameSearch(username);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [username]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowDropdown(false);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Handle NAD selection
  const handleNadSelection = (result: SearchResult) => {
    setUsername(result.displayName);
    setShowDropdown(false);
    setSelectedNad(result);
  };

  if (!ready) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Card className="w-96 bg-white/5 border-white/10 backdrop-blur-xl">
          <CardContent className="p-8 text-center">
            <div className="relative mb-6">
              <div className="w-16 h-16 border-4 border-slate-500/30 border-t-slate-400 rounded-full animate-spin mx-auto"></div>
              <div
                className="absolute inset-0 w-16 h-16 border-4 border-slate-600/30 border-b-slate-500 rounded-full animate-spin mx-auto"
                style={{ animationDelay: "0.15s" }}
              ></div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Loading SlapNads</h2>
            <p className="text-slate-400">Preparing your slapping arena...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <Card className="max-w-md bg-white/5 border-white/10 backdrop-blur-xl">
          <CardHeader className="text-center pb-4">
            <div className="w-20 h-20 mx-auto mb-4 bg-slate-500/20 rounded-full flex items-center justify-center">
              <Shield className="w-10 h-10 text-slate-400" />
            </div>
            <CardTitle className="text-3xl font-bold text-white">Welcome to SlapNads</CardTitle>
            <CardDescription className="text-slate-300 text-lg">
              Authentication required to enter the arena
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="h-1 bg-gradient-to-r from-slate-500 to-slate-400 rounded-full animate-pulse"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <Card className="max-w-md bg-white/5 border-white/10 backdrop-blur-xl">
          <CardHeader className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-slate-500/20 rounded-full flex items-center justify-center">
              <Eye className="w-10 h-10 text-slate-400" />
            </div>
            <CardTitle className="text-3xl font-bold text-white">User Not Found</CardTitle>
            <CardDescription className="text-slate-300">Unable to load user data</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Flow scenario states
  const hasMonadWallet = !!monadWallet;
  const hasTwitterAccount = !!twitterAccount;
  const hasNad = !!nad;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-slate-500 rounded-xl flex items-center justify-center">
                <Image src="/logo.png" alt="SlapNads" className="h-6 w-6" height={24} width={24} />
              </div>
              <div>
                <h1 className="text-3xl font-black text-white">SlapNads</h1>
                <p className="text-slate-400 text-sm">The Ultimate Fully On-Chain Slapping Arena</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-slate-500/20 text-slate-300 border-slate-500/30">
                <Sparkles className="w-3 h-3 mr-1" />
                Live
              </Badge>
              <Button variant="ghost" size="sm" onClick={() => logout()} className="text-slate-400 hover:text-white">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Left Sidebar - Leaderboard */}
          <div className="xl:col-span-1">
            <Card className="bg-white/5 border-white/10 backdrop-blur-xl sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <Trophy className="w-5 h-5 text-slate-400" />
                  <span>Leaderboard</span>
                </CardTitle>
              </CardHeader>
              {/* TODO: update leaderboard to show unclaimed nads */}
              <CardContent className="space-y-6">
                {/* Top Slappers */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center">
                    <Flame className="w-4 h-4 mr-2" />
                    Top Slappers
                  </h3>
                  <ScrollArea className="h-48">
                    {leaderboardLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="w-6 h-6 border-2 border-slate-500/30 border-t-slate-400 rounded-full animate-spin"></div>
                      </div>
                    ) : topSlappers.length > 0 ? (
                      <div className="space-y-2">
                        {topSlappers.map((slapper: LeaderboardItem, index: number) => {
                          const getRankStyle = (rank: number) => {
                            if (rank === 1)
                              return {
                                bg: "bg-yellow-500/10 border-yellow-500/30 hover:bg-yellow-500/20",
                                badge: "bg-gradient-to-br from-yellow-400 to-yellow-600 text-yellow-900",
                              };
                            if (rank === 2)
                              return {
                                bg: "bg-gray-400/10 border-gray-400/30 hover:bg-gray-400/20",
                                badge: "bg-gradient-to-br from-gray-300 to-gray-500 text-gray-900",
                              };
                            if (rank === 3)
                              return {
                                bg: "bg-orange-600/10 border-orange-600/30 hover:bg-orange-600/20",
                                badge: "bg-gradient-to-br from-orange-400 to-orange-600 text-orange-900",
                              };
                            return {
                              bg: "bg-slate-500/10 border-slate-500/20 hover:bg-slate-500/20",
                              badge: "bg-slate-500 text-white",
                            };
                          };

                          const style = getRankStyle(index + 1);

                          return (
                            <div
                              key={slapper.nadId}
                              className={`flex items-center space-x-3 p-3 rounded-lg ${style.bg} transition-colors cursor-pointer`}
                              onClick={() =>
                                handleNadListSelection({
                                  id: slapper.nadId.toString(),
                                  username: slapper.x.username,
                                  displayName: slapper.x.displayName,
                                  nadId: slapper.nadId,
                                  walletAddress: slapper.wallet,
                                  isPlayer: slapper.isPlayer,
                                  slapsGiven: slapper.slapsGiven,
                                  slapsReceived: slapper.slapsReceived,
                                  pp: slapper.x.pp,
                                })
                              }
                            >
                              <Badge
                                variant="secondary"
                                className={`w-6 h-6 p-0 flex items-center justify-center ${style.badge} text-xs font-bold`}
                              >
                                {index + 1}
                              </Badge>
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={slapper.x.pp} />
                                <AvatarFallback className="bg-slate-500 text-white text-xs">
                                  {slapper.x.displayName
                                    ? slapper.x.displayName.charAt(0)
                                    : slapper.wallet.slice(2, 4).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-200 truncate">
                                  {slapper.x.displayName ||
                                    `${slapper.wallet.slice(0, 6)}...${slapper.wallet.slice(-4)}`}
                                </p>
                                <p className="text-xs text-slate-400 truncate">
                                  {slapper.x.username ? `@${slapper.x.username}` : `NAD #${slapper.nadId}`}
                                </p>
                              </div>
                              <div className="text-right">
                                <Badge
                                  variant="outline"
                                  className="text-emerald-400 border-emerald-400 bg-emerald-500/10 text-xs"
                                >
                                  {slapper.slapsGiven}
                                </Badge>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-slate-500">
                        <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No slappers yet</p>
                      </div>
                    )}
                  </ScrollArea>
                </div>

                <Separator className="bg-white/10" />

                {/* Top Slapped */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center">
                    <Zap className="w-4 h-4 mr-2" />
                    Most Slapped
                  </h3>
                  <ScrollArea className="h-48">
                    {leaderboardLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="w-6 h-6 border-2 border-slate-500/30 border-t-slate-400 rounded-full animate-spin"></div>
                      </div>
                    ) : topSlapped.length > 0 ? (
                      <div className="space-y-2">
                        {topSlapped.map((victim: LeaderboardItem, index: number) => {
                          const getRankStyle = (rank: number) => {
                            if (rank === 1)
                              return {
                                bg: "bg-yellow-500/10 border-yellow-500/30 hover:bg-yellow-500/20",
                                badge: "bg-gradient-to-br from-yellow-400 to-yellow-600 text-yellow-900",
                              };
                            if (rank === 2)
                              return {
                                bg: "bg-gray-400/10 border-gray-400/30 hover:bg-gray-400/20",
                                badge: "bg-gradient-to-br from-gray-300 to-gray-500 text-gray-900",
                              };
                            if (rank === 3)
                              return {
                                bg: "bg-orange-600/10 border-orange-600/30 hover:bg-orange-600/20",
                                badge: "bg-gradient-to-br from-orange-400 to-orange-600 text-orange-900",
                              };
                            return {
                              bg: "bg-slate-600/10 border-slate-600/20 hover:bg-slate-600/20",
                              badge: "bg-slate-600 text-white",
                            };
                          };

                          const style = getRankStyle(index + 1);

                          return (
                            <div
                              key={victim.nadId}
                              className={`flex items-center space-x-3 p-3 rounded-lg ${style.bg} transition-colors cursor-pointer`}
                              onClick={() =>
                                handleNadListSelection({
                                  id: victim.nadId.toString(),
                                  username: victim.x.username,
                                  displayName: victim.x.displayName,
                                  nadId: victim.nadId,
                                  walletAddress: victim.wallet,
                                  isPlayer: victim.isPlayer,
                                  slapsGiven: victim.slapsGiven,
                                  slapsReceived: victim.slapsReceived,
                                  pp: victim.x.pp,
                                })
                              }
                            >
                              <Badge
                                variant="secondary"
                                className={`w-6 h-6 p-0 flex items-center justify-center ${style.badge} text-xs font-bold`}
                              >
                                {index + 1}
                              </Badge>
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={victim.x.pp} />
                                <AvatarFallback className="bg-slate-500 text-white text-xs">
                                  {victim.x.displayName
                                    ? victim.x.displayName.charAt(0)
                                    : victim.wallet.slice(2, 4).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-200 truncate">
                                  {victim.x.displayName || `${victim.wallet.slice(0, 6)}...${victim.wallet.slice(-4)}`}
                                </p>
                                <p className="text-xs text-slate-400 truncate">
                                  {victim.x.username ? `@${victim.x.username}` : `NAD #${victim.nadId}`}
                                </p>
                              </div>
                              <div className="text-right">
                                <Badge variant="outline" className="text-red-400 border-red-400 bg-red-500/10 text-xs">
                                  {victim.slapsReceived}
                                </Badge>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-slate-500">
                        <Shield className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No victims yet</p>
                      </div>
                    )}
                  </ScrollArea>
                </div>

                <Button
                  onClick={loadLeaderboard}
                  disabled={leaderboardLoading}
                  size="sm"
                  className="w-full bg-slate-600 hover:bg-slate-700"
                >
                  Refresh
                </Button>
              </CardContent>
              <CardFooter>
                <p className="text-xs text-slate-400">PS: Unclaimed nads are not listed. The issue has been noted.</p>
              </CardFooter>
            </Card>
          </div>

          {/* Main Content */}
          <div className="xl:col-span-2 space-y-6">
            {/* Search Section */}
            <Card className="bg-white/5 border-white/10 backdrop-blur-xl relative z-10">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <Search className="w-5 h-5 text-slate-400" />
                  <span>Find Target</span>
                </CardTitle>
                <CardDescription>Search for NADs to challenge in the arena</CardDescription>
              </CardHeader>
              <CardContent className="relative">
                {/* Search Mode Toggle */}
                <div className="flex items-center space-x-2 mb-4">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => {
                      setUsername("");
                      setShowDropdown(false);
                    }}
                    className="text-xs"
                  >
                    🎯 NAD Search
                  </Button>
                </div>

                <div className="relative">
                  <Search className="absolute top-3 left-3  my-auto w-4 text-slate-400" />
                  <Input
                    placeholder="Search X username (Please write exact username)..."
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleUsernameSearch(username);
                      }
                    }}
                    className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-slate-400 focus:border-slate-400 h-12"
                    onFocus={() => username.length >= 2 && setShowDropdown(true)}
                  />
                  {/* TODO: add search mode toggle and implement x search with auto add to contract if not found*/}
                  <p className="text-xs text-slate-400">
                    PS: You can use NAD List to search for NADs. Only fully linked users or manually added to the
                    contract are listed. This issue has been noted.
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-slate-400">Search existing on-chain registered X usernames.</p>
                    <Dialog open={showNadList} onOpenChange={setShowNadList}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-xs h-6 px-2" onClick={() => loadNadList(1)}>
                          <List className="w-3 h-3 mr-1" />
                          Browse NADs
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <List className="w-5 h-5" />
                            All NAD Characters
                          </DialogTitle>
                          <DialogDescription>
                            Browse and select NAD characters to slap. Total: {totalNads} NADs
                          </DialogDescription>
                        </DialogHeader>

                        <div className="flex flex-col h-full">
                          {nadListLoading ? (
                            <div className="flex justify-center items-center h-64">
                              <div className="w-8 h-8 border-2 border-slate-500/30 border-t-slate-400 rounded-full animate-spin"></div>
                            </div>
                          ) : (
                            <>
                              <ScrollArea className="flex-1">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead className="w-16">ID</TableHead>
                                      <TableHead>Avatar</TableHead>
                                      <TableHead>Display Name</TableHead>
                                      <TableHead>Username</TableHead>
                                      <TableHead className="text-center">Slaps Given</TableHead>
                                      <TableHead className="text-center">Slaps Received</TableHead>
                                      <TableHead className="w-24">Action</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {nadList.map((nad) => {
                                      const isSelected = selectedNad?.nadId === nad.nadId;
                                      return (
                                        <TableRow
                                          key={nad.nadId}
                                          className={`cursor-pointer hover:bg-slate-50 ${
                                            isSelected ? "bg-blue-50 border-blue-200" : ""
                                          }`}
                                          onClick={() => handleNadListSelection(nad)}
                                        >
                                          <TableCell className="font-mono text-xs">#{nad.nadId}</TableCell>
                                          <TableCell>
                                            <Avatar className="w-8 h-8">
                                              <AvatarImage src={nad.pp} />
                                              <AvatarFallback className="bg-slate-500 text-white text-xs">
                                                {nad.displayName.charAt(0)}
                                              </AvatarFallback>
                                            </Avatar>
                                          </TableCell>
                                          <TableCell className="font-semibold">{nad.displayName}</TableCell>
                                          <TableCell className="text-slate-600">@{nad.username}</TableCell>
                                          <TableCell className="text-center">
                                            <Badge
                                              variant="outline"
                                              className="text-emerald-600 border-emerald-600 bg-emerald-50"
                                            >
                                              {nad.slapsGiven}
                                            </Badge>
                                          </TableCell>
                                          <TableCell className="text-center">
                                            <Badge variant="outline" className="text-red-600 border-red-600 bg-red-50">
                                              {nad.slapsReceived}
                                            </Badge>
                                          </TableCell>
                                          <TableCell>
                                            {isSelected ? (
                                              <Badge
                                                variant="default"
                                                className="bg-blue-600 text-white h-7 px-2 text-xs"
                                                onClick={(e) => e.stopPropagation()}
                                              >
                                                Selected
                                              </Badge>
                                            ) : (
                                              <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleNadListSelection(nad);
                                                }}
                                                className="h-7 px-2 text-xs"
                                              >
                                                Select
                                              </Button>
                                            )}
                                          </TableCell>
                                        </TableRow>
                                      );
                                    })}
                                  </TableBody>
                                </Table>
                              </ScrollArea>

                              {/* Pagination */}
                              <div className="flex items-center justify-between border-t pt-4 mt-4">
                                <div className="text-sm text-slate-600">
                                  Showing {(currentPage - 1) * nadsPerPage + 1} to{" "}
                                  {Math.min(currentPage * nadsPerPage, totalNads)} of {totalNads} NADs
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => loadNadList(currentPage - 1)}
                                    disabled={currentPage <= 1 || nadListLoading}
                                  >
                                    <ChevronLeft className="w-4 h-4" />
                                    Previous
                                  </Button>
                                  <span className="text-sm text-slate-600">
                                    Page {currentPage} of {Math.ceil(totalNads / nadsPerPage)}
                                  </span>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => loadNadList(currentPage + 1)}
                                    disabled={currentPage >= Math.ceil(totalNads / nadsPerPage) || nadListLoading}
                                  >
                                    Next
                                    <ChevronRightIcon className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  {isSearching && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-slate-500/30 border-t-slate-400 rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>

                {/* Search Results */}
                {showDropdown && (
                  <Card className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl z-[100]">
                    <CardContent className="p-0">
                      {/* NAD Search Results */}
                      {searchResults.length > 0 ? (
                        <div className="max-h-64 overflow-y-auto">
                          {searchResults.map((result) => {
                            const isSelected = selectedNad?.nadId === result.nadId;
                            return (
                              <div
                                key={result.id}
                                className={`flex items-center justify-between p-4 hover:bg-slate-100 cursor-pointer border-b border-slate-200 last:border-b-0 ${
                                  isSelected ? "bg-blue-50 border-blue-200" : ""
                                }`}
                                onClick={() => handleNadSelection(result)}
                              >
                                <div className="flex items-center space-x-3">
                                  <Avatar className="w-10 h-10">
                                    <AvatarImage src={result.pp} />
                                    <AvatarFallback className="bg-slate-500 text-white font-bold">
                                      {result.displayName.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-semibold text-slate-900">{result.displayName}</p>
                                    <p className="text-sm text-slate-600">@{result.username}</p>
                                    {result.nadId && (
                                      <Badge variant="secondary" className="text-xs mt-1">
                                        NAD #{result.nadId}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Badge
                                    variant="outline"
                                    className="text-emerald-600 border-emerald-600 bg-emerald-50"
                                  >
                                    ⚡ {result.slapsGiven || 0}
                                  </Badge>
                                  <Badge variant="outline" className="text-red-600 border-red-600 bg-red-50">
                                    💥 {result.slapsReceived || 0}
                                  </Badge>
                                  {isSelected ? (
                                    <Badge variant="default" className="bg-blue-600 text-white text-xs ml-2">
                                      Selected
                                    </Badge>
                                  ) : (
                                    <ChevronRight className="w-4 h-4 text-slate-400" />
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : /* No Results */
                      username.length >= 2 && !isSearching ? (
                        <div className="p-8 text-center">
                          <Search className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                          <p className="text-slate-600 font-medium">No NAD found</p>
                          <p className="text-slate-500 text-sm">Try a different username</p>
                        </div>
                      ) : null}
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>

            {/* Selected NAD */}
            {selectedNad && (
              <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-white">
                    <Target className="w-5 h-5 text-slate-400" />
                    <span>Target Acquired</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start space-x-6">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={selectedNad.pp} />
                      <AvatarFallback className="bg-gradient-to-br from-slate-600 to-slate-500 text-white text-2xl font-bold">
                        {selectedNad.displayName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-1">{selectedNad.displayName}</h3>
                      <p className="text-slate-400 mb-4">@{selectedNad.username}</p>

                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="text-center p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                          <div className="text-2xl font-bold text-emerald-400">{selectedNad.slapsGiven || 0}</div>
                          <div className="text-sm text-emerald-300">Slaps Given</div>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                          <div className="text-2xl font-bold text-red-400">{selectedNad.slapsReceived || 0}</div>
                          <div className="text-sm text-red-300">Slaps Received</div>
                        </div>
                      </div>

                      <Button
                        onClick={async () => {
                          if (selectedNad.nadId) {
                            try {
                              await slapNad(selectedNad.nadId);

                              // Selected NAD verisini tekrar çek
                              const { nadId, nad } = await getNadByUsername(selectedNad.username);
                              if (nadId && Number(nadId) > 0) {
                                const nadData = nad as NadData;
                                const updatedNad: SearchResult = {
                                  id: nadId.toString(),
                                  username: nadData.x.username,
                                  displayName: nadData.x.displayName,
                                  nadId: Number(nadId),
                                  walletAddress: nadData.walletAddress,
                                  isPlayer: nadData.isPlayer,
                                  slapsGiven: nadData.slapsGiven,
                                  slapsReceived: nadData.slapsReceived,
                                };
                                setSelectedNad(updatedNad);
                              }

                              // Leaderboard'ı da yenile
                              await loadLeaderboard();
                            } catch (error) {
                              console.error("Slap failed:", error);
                            }
                          }
                        }}
                        size="lg"
                        className="w-full  text-white font-bold h-12"
                        variant="destructive"
                      >
                        <Zap className="w-5 h-5 mr-2" />
                        SLAP THIS NAD!
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Sidebar - Profile */}
          <div className="xl:col-span-1">
            <Card className="bg-white/5 border-white/10 backdrop-blur-xl sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <Avatar className="w-6 h-6">
                    <AvatarFallback className="bg-slate-500 text-white text-xs">U</AvatarFallback>
                  </Avatar>
                  <span>Profile</span>
                  <Popover>
                    <PopoverTrigger>
                      {" "}
                      <Badge variant="outline" className="border-green-300 text-green-300 text-xs cursor-pointer">
                        ?
                      </Badge>
                    </PopoverTrigger>
                    <PopoverContent>
                      To start playing, you must have linked your Monad Games ID and created your username.
                      <b>
                        For the best experience, you should also link your X account to your game account and complete
                        your on-chain registration.
                      </b>
                    </PopoverContent>
                  </Popover>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Wallet Info */}
                {(injectedWallet || embeddedWallet) && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-slate-300 flex items-center">
                      <Wallet className="w-4 h-4 mr-2" />
                      Wallets
                    </h3>

                    {injectedWallet && (
                      <div className="p-3 rounded-lg bg-slate-500/10 border border-slate-500/20">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-300">Main Wallet</span>
                          <Badge variant="secondary" className="bg-slate-500/20 text-slate-300 text-xs">
                            Connected
                          </Badge>
                        </div>
                        <p className="font-mono text-sm text-slate-300 mt-1">
                          {injectedWallet.slice(0, 6)}...{injectedWallet.slice(-4)}
                        </p>
                      </div>
                    )}

                    {embeddedWallet && (
                      <div className="p-3 rounded-lg bg-slate-600/10 border border-slate-600/20">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-slate-300">Game Wallet</span>
                          <Badge variant="secondary" className="bg-slate-600/20 text-slate-300 text-xs">
                            Active
                          </Badge>
                        </div>
                        <p className="font-mono text-sm text-slate-300 mb-3">
                          {embeddedWallet.slice(0, 6)}...{embeddedWallet.slice(-4)}
                        </p>
                        <Button onClick={fundWallet} size="sm" variant="secondary" className="w-full  mb-2">
                          Fund Wallet
                        </Button>
                        <Button onClick={exportWalletPrivy} size="sm" variant="outline" className="w-full ">
                          Export Wallet
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                <Separator className="bg-white/10" />

                {/* Setup Progress */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-slate-300">Setup Progress</h3>

                  {/* Step 1: Monad Games ID */}
                  <div
                    className={`p-4 rounded-lg border ${
                      hasMonadWallet ? "bg-slate-500/10 border-slate-500/20" : "bg-slate-600/10 border-slate-600/20"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <GamepadIcon className="w-4 h-4" />
                        <span className="text-sm font-medium text-white">Monad Games ID</span>
                      </div>
                      {hasMonadWallet ? (
                        <Badge className="bg-slate-500 text-white">✓</Badge>
                      ) : (
                        <Badge variant="outline" className="border-slate-500 text-slate-400">
                          1
                        </Badge>
                      )}
                    </div>
                    {!hasMonadWallet ? (
                      <Button onClick={linkMonadWallet} size="sm" className="w-full bg-slate-600 hover:bg-slate-700">
                        Connect Monad ID
                      </Button>
                    ) : (
                      <div>
                        {monadWallet ? (
                          <>
                            <p className="text-xs text-slate-300 font-mono">
                              {monadWallet.slice(0, 6)}...{monadWallet.slice(-4)}
                            </p>
                            {monadUsername ? (
                              <p className="text-xs text-slate-400 mt-1">@{monadUsername}</p>
                            ) : (
                              <div className="mt-2">
                                <p className="text-xs text-slate-400 mb-2">No username found</p>
                                <Button
                                  onClick={() => window.open("https://monad-games-id-site.vercel.app/", "_blank")}
                                  size="sm"
                                  variant="outline"
                                  className="w-full border-slate-500/50 text-slate-300 hover:bg-slate-500/20 text-xs py-1 h-7"
                                >
                                  🔗 Set Username
                                </Button>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="mt-2">
                            <p className="text-xs text-slate-400 mb-2">Wallet address not found</p>
                            <Button
                              onClick={() => window.open("https://monad-games-id-site.vercel.app/", "_blank")}
                              size="sm"
                              variant="outline"
                              className="w-full border-slate-500/50 text-slate-300 hover:bg-slate-500/20 text-xs py-1 h-7"
                            >
                              🔗 Complete Setup
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Step 2: Twitter */}
                  {hasMonadWallet && (
                    <div
                      className={`p-4 rounded-lg border ${
                        hasTwitterAccount
                          ? "bg-slate-500/10 border-slate-500/20"
                          : "bg-slate-600/10 border-slate-600/20"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Twitter className="w-4 h-4" />
                          <span className="text-sm font-medium text-white">Twitter Account</span>
                        </div>
                        {hasTwitterAccount ? (
                          <Badge className="bg-slate-500 text-white">✓</Badge>
                        ) : (
                          <Badge variant="outline" className="border-slate-500 text-slate-400">
                            2
                          </Badge>
                        )}
                      </div>
                      {!hasTwitterAccount ? (
                        <Button
                          onClick={linkTwitterAccount}
                          size="sm"
                          className="w-full bg-slate-600 hover:bg-slate-700"
                        >
                          Connect Twitter
                        </Button>
                      ) : (
                        <p className="text-xs text-slate-400">@{twitterAccount.username}</p>
                      )}
                    </div>
                  )}

                  {/* Step 3: Register Game */}
                  {hasMonadWallet && hasTwitterAccount && !hasNad && (
                    <div className="p-4 rounded-lg border bg-slate-600/10 border-slate-600/20">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Target className="w-4 h-4" />
                          <span className="text-sm font-medium text-white">Create NAD</span>
                        </div>
                        <Badge variant="outline" className="border-slate-500 text-slate-400">
                          3
                        </Badge>
                      </div>
                      <Button onClick={registerGame} size="sm" className="w-full bg-slate-600 hover:bg-slate-700">
                        Register Character
                      </Button>
                    </div>
                  )}

                  {/* NAD Character */}
                  {hasNad && (
                    <div className="p-4 rounded-lg border bg-slate-500/10 border-slate-500/20">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <Crown className="w-4 h-4 text-slate-400" />
                          <span className="text-sm font-medium text-white">Your NAD</span>
                        </div>
                        <Badge className="bg-slate-500 text-white">Active</Badge>
                      </div>

                      <div className="space-y-2 mb-3">
                        <p className="text-sm font-semibold text-white">{nad.x.displayName}</p>
                        <div className="flex space-x-2">
                          <Badge
                            variant="outline"
                            className="text-emerald-400 border-emerald-400 bg-emerald-500/10 text-xs"
                          >
                            ⚡ {nad.slapsGiven}
                          </Badge>
                          <Badge variant="outline" className="text-red-400 border-red-400 bg-red-500/10 text-xs">
                            💥 {nad.slapsReceived}
                          </Badge>
                        </div>
                      </div>

                      {!nad.x.id && (
                        <Button
                          onClick={linkTwitterToNad}
                          size="sm"
                          variant="outline"
                          className="w-full border-slate-500/50 text-slate-300 hover:bg-slate-500/20"
                        >
                          Link Twitter to NAD
                        </Button>
                      )}

                      {nad.x.id && (
                        <div className="text-center py-2">
                          <Badge className="bg-gradient-to-r from-slate-500 to-slate-600 text-white">
                            <Sparkles className="w-3 h-3 mr-1" />
                            Fully Linked!
                          </Badge>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
