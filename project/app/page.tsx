"use client";

import { useState, useEffect, useRef } from "react";
import {
  Mail,
  Send,
  Inbox,
  LogIn,
  ChevronDown,
  Plus,
  BookOpen,
  Shield,
  User,
  Settings,
  Bell,
  Star,
  Trash,
  Folder,
  Search,
  Menu,
  X,
  MoreVertical,
  Moon,
  Sun,
  Github,
  Twitter,
  Lock,
  Globe,
  Users,
  Zap,
  LogOut,
  Key,
  Rocket,
  Wallet,
  Link2,
  MessageSquare,
  Paperclip,
  Database,
  Network,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  connectWallet,
  getEmailContract,
  getSentEmails,
  getReceivedEmails,
  getStarredEmails,
  starEmail,
  unstarEmail,
  deleteEmail,
  getProfile,
  updateProfile,
} from "@/lib/web3";
import { ethers } from "ethers";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BubbleEffect } from "@/components/ui/bubble-effect";
import { Card3D } from "@/components/ui/3d-card";
import Image from "next/image";
import { ImageCard3D } from "@/components/ui/3d-image-card";

interface Email {
  from: string;
  to: string;
  subject: string;
  content: string;
  timestamp: number;
  isSent: boolean;
  isStarred: boolean;
}

interface Contact {
  name: string;
  address: string;
}

interface UserProfile {
  name: string;
  avatar: string;
  exists: boolean;
}

export default function LandingPage() {
  const router = useRouter();
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      cardRefs.current.forEach((card) => {
        if (!card) return;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        card.style.setProperty("--mouse-x", `${x}px`);
        card.style.setProperty("--mouse-y", `${y}px`);
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const steps = [
    {
      step: "1",
      mainIcon: <Lock key="lock-main" className="w-16 h-16" />,
      title: "Connect Wallet",
      description: "Connect your Ethereum wallet to get started.",
      gradient: "from-blue-500/20 to-cyan-500/20",
      textGradient: "from-blue-500 to-cyan-500",
      additionalIcons: [
        <Wallet key="wallet" className="w-8 h-8" />,
        <Link2 key="link" className="w-8 h-8" />,
      ],
    },
    {
      step: "2",
      mainIcon: <Send key="send-main" className="w-16 h-16" />,
      title: "Send Messages",
      description: "Send encrypted messages to other users.",
      gradient: "from-green-500/20 to-emerald-500/20",
      textGradient: "from-green-500 to-emerald-500",
      additionalIcons: [
        <MessageSquare key="message" className="w-8 h-8" />,
        <Paperclip key="paperclip" className="w-8 h-8" />,
      ],
    },
    {
      step: "3",
      mainIcon: <Database key="database-main" className="w-16 h-16" />,
      title: "Store Data",
      description: "Your data is stored securely on the blockchain.",
      gradient: "from-purple-500/20 to-pink-500/20",
      textGradient: "from-purple-500 to-pink-500",
      additionalIcons: [
        <Database key="database" className="w-8 h-8" />,
        <Lock key="lock" className="w-8 h-8" />,
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 relative overflow-hidden">
      <BubbleEffect />

      {/* Hero Section */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-left space-y-8">
            <h1 className="text-6xl font-bold text-slate-900 dark:text-white relative">
              <span className="relative inline-block">
                BlockMail
                <span className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-blue-600/20 blur-lg rounded-lg"></span>
              </span>
            </h1>
            <div className="space-y-4">
              <p className="text-xl text-slate-600 dark:text-slate-300">
                Secure, decentralized email communication powered by blockchain
                technology. Experience the future of digital communication.
              </p>
              <p className="text-lg text-slate-500 dark:text-slate-400">
                Built on Ethereum, BlockMail ensures your messages are
                encrypted, tamper-proof, and truly private. No central servers,
                no data collection, just pure peer-to-peer communication.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white transform hover:scale-105 transition-all duration-200"
                onClick={() => router.push("/dashboard")}
              >
                Get Started
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                onClick={() => router.push("/dashboard")}
              >
                Learn More
              </Button>
            </div>
          </div>
          <div className="relative h-[500px] w-full">
            <ImageCard3D
              src="/dashboard_img.png"
              alt="BlockMail Dashboard"
              className="w-full h-full"
            />
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Why Choose BlockMail?
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            Experience the next generation of email communication with our
            unique features and security measures.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              mainIcon: <Shield key="shield-main" className="w-24 h-24" />,
              title: "Secure Communication",
              description:
                "End-to-end encryption and blockchain-based security for your messages.",
              features: [
                "Military-grade encryption",
                "Zero-knowledge proof system",
                "Immutable message history",
                "Secure key management",
              ],
              gradient: "from-green-500/20 to-blue-500/20",
              textGradient: "from-green-500 to-blue-500",
              additionalIcons: [
                <Lock key="lock" className="w-12 h-12" />,
                <Shield key="shield" className="w-12 h-12" />,
                <Key key="key" className="w-12 h-12" />,
              ],
            },
            {
              mainIcon: <Send key="send-main" className="w-24 h-24" />,
              title: "Instant Delivery",
              description:
                "Lightning-fast message delivery powered by blockchain technology.",
              features: [
                "Real-time message processing",
                "Smart contract automation",
                "Optimized network routing",
                "Instant notifications",
              ],
              gradient: "from-blue-500/20 to-purple-500/20",
              textGradient: "from-blue-500 to-purple-500",
              additionalIcons: [
                <Zap key="zap" className="w-12 h-12" />,
                <Send key="send" className="w-12 h-12" />,
                <Rocket key="rocket" className="w-12 h-12" />,
              ],
            },
            {
              mainIcon: <BookOpen key="book-main" className="w-24 h-24" />,
              title: "Decentralized",
              description:
                "No central authority, ensuring true privacy and control.",
              features: [
                "Peer-to-peer architecture",
                "Distributed storage",
                "Community governance",
                "No data collection",
              ],
              gradient: "from-purple-500/20 to-pink-500/20",
              textGradient: "from-purple-500 to-pink-500",
              additionalIcons: [
                <Globe key="globe" className="w-12 h-12" />,
                <Network key="network" className="w-12 h-12" />,
                <Users key="users" className="w-12 h-12" />,
              ],
            },
          ].map((feature, index) => (
            <Card3D
              key={index}
              className="p-8 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500/50 dark:hover:border-blue-400/50"
            >
              <div className="relative h-48 w-full mb-6 flex flex-col items-center justify-center">
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} rounded-xl opacity-20 blur-xl`}
                />
                <div className="relative z-10 text-center">
                  <div
                    className={`text-transparent bg-clip-text bg-gradient-to-r ${feature.textGradient} mb-4`}
                  >
                    {feature.mainIcon}
                  </div>
                  <h3
                    className={`text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${feature.textGradient}`}
                  >
                    {feature.title}
                  </h3>
                </div>
                <div className="absolute bottom-0 left-0 right-0 flex justify-center space-x-4 opacity-50">
                  {feature.additionalIcons.map((icon, i) => (
                    <div
                      key={i}
                      className={`text-transparent bg-clip-text bg-gradient-to-r ${feature.textGradient}`}
                    >
                      {icon}
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-center mb-6">
                {feature.description}
              </p>
              <ul className="space-y-2 text-left">
                {feature.features.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-center text-slate-600 dark:text-slate-300"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2"></span>
                    {item}
                  </li>
                ))}
              </ul>
            </Card3D>
          ))}
        </div>
      </div>

      {/* How It Works Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            How It Works
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            Get started with BlockMail in three simple steps. Our intuitive
            process makes secure communication accessible to everyone.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <Card3D
              key={index}
              className="relative p-6 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500/50 dark:hover:border-blue-400/50"
            >
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                {step.step}
              </div>
              <div className="mt-8 text-center">
                <div
                  className={`text-transparent bg-clip-text bg-gradient-to-r ${step.textGradient} mb-4`}
                >
                  {step.mainIcon}
                </div>
                <h3
                  className={`text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r ${step.textGradient} mb-2`}
                >
                  {step.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  {step.description}
                </p>
                <div className="flex justify-center space-x-4 opacity-50">
                  {step.additionalIcons.map((icon, i) => (
                    <div
                      key={i}
                      className={`text-transparent bg-clip-text bg-gradient-to-r ${step.textGradient}`}
                    >
                      {icon}
                    </div>
                  ))}
                </div>
              </div>
            </Card3D>
          ))}
        </div>
      </div>

      {/* Developer Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center space-y-8">
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white">
            About the Project
          </h2>
          <div className="max-w-2xl mx-auto">
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-6">
              BlockMail is an open-source project developed by blockchain
              enthusiasts committed to revolutionizing digital communication.
              Built with modern web technologies and blockchain innovation.
            </p>
            <div className="flex flex-col items-center space-y-4">
              <a
                href="https://github.com/RajuCodz"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 mt-4 inline-flex items-center space-x-2"
              >
                <Github className="w-5 h-5" />
                <span>GitHub: RajuCodz</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
