"use client";

import GameUI from "@/components/game-ui";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePrivy } from "@privy-io/react-auth";
import { Zap, Shield, Target, Crown, Sparkles, ArrowRight } from "lucide-react";
import Image from "next/image";

export default function Home() {
  const { login, ready, user, authenticated } = usePrivy();

  // Loading state
  if (!ready) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Card className="w-96 bg-white/5 border-white/10 backdrop-blur-xl">
          <CardContent className="p-8 text-center">
            <div className="relative mb-6">
              <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto"></div>
              <div
                className="absolute inset-0 w-16 h-16 border-4 border-blue-500/30 border-b-blue-500 rounded-full animate-spin mx-auto"
                style={{ animationDelay: "0.15s" }}
              ></div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Loading SlapNads</h2>
            <p className="text-slate-400">Initializing the arena...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // User not authenticated
  if (!authenticated || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl transform -translate-x-1/2 -translate-y-1/2"></div>
        </div>

        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <div className="max-w-4xl mx-auto text-center">
            {/* Hero Section */}
            <div className="mb-12">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mr-4 shadow-2xl">
                  <Image src="/logo.png" alt="SlapNads" className="h-8 w-8" height={32} width={32} />
                </div>
                <h1 className="text-6xl md:text-7xl font-black text-white">
                  Slap
                  <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Nads
                  </span>
                </h1>
              </div>

              <div className="mb-8">
                <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 mb-4 px-4 py-2 text-lg">
                  <Sparkles className="w-4 h-4 mr-2" />
                  The Ultimate Slapping Arena
                </Badge>

                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Tired of crypto shitposters?</h2>
                <p className="text-xl text-slate-300 mb-6 max-w-2xl mx-auto leading-relaxed">
                  Join the arena, slap the noise makers, and climb to the top of the leaderboard. Clean up the community
                  one slap at a time!
                </p>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-3xl mx-auto">
                <Card className="bg-white/5 border-white/10 backdrop-blur-xl hover:bg-white/10 transition-all duration-300 transform hover:scale-105">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Zap className="w-6 h-6 text-red-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Instant Slaps</h3>
                    <p className="text-slate-400 text-sm">Lightning-fast slapping with blockchain verification</p>
                  </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10 backdrop-blur-xl hover:bg-white/10 transition-all duration-300 transform hover:scale-105">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Crown className="w-6 h-6 text-yellow-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Leaderboards</h3>
                    <p className="text-slate-400 text-sm">Compete for the top slapper position</p>
                  </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10 backdrop-blur-xl hover:bg-white/10 transition-all duration-300 transform hover:scale-105">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Target className="w-6 h-6 text-green-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">NAD Characters</h3>
                    <p className="text-slate-400 text-sm">Create your unique slapping character</p>
                  </CardContent>
                </Card>
              </div>

              {/* CTA Section */}
              <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 backdrop-blur-xl max-w-2xl mx-auto">
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                    <Shield className="w-6 h-6 text-purple-400" />
                    Ready to Clean Up?
                  </CardTitle>
                  <CardDescription className="text-slate-300 text-lg">
                    Connect your wallet and start your anti-shitposting journey
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center pb-8">
                  <Button
                    onClick={() => login()}
                    size="lg"
                    className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 text-white font-bold py-4 px-8 text-xl rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 active:scale-95 group"
                  >
                    <Zap className="w-6 h-6 mr-3 group-hover:animate-bounce" />
                    Enter the Arena
                    <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
                  </Button>

                  <div className="mt-6 flex items-center justify-center gap-4">
                    <Badge variant="outline" className="border-purple-500/50 text-purple-300">
                      <Shield className="w-3 h-3 mr-1" />
                      Secure Login
                    </Badge>
                    <Badge variant="outline" className="border-blue-500/50 text-blue-300">
                      <Target className="w-3 h-3 mr-1" />
                      Monad Games ID
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Stats Preview */}
              <div className="mt-12 flex justify-center gap-8 text-center">
                <div>
                  <div className="text-3xl font-black text-purple-400 mb-1">∞</div>
                  <div className="text-sm text-slate-400">Slaps Delivered</div>
                </div>
                <div>
                  <div className="text-3xl font-black text-blue-400 mb-1">24/7</div>
                  <div className="text-sm text-slate-400">Arena Active</div>
                </div>
                <div>
                  <div className="text-3xl font-black text-pink-400 mb-1">∅</div>
                  <div className="text-sm text-slate-400">Tolerance for Shit</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // User authenticated - show game
  return <GameUI />;
}
