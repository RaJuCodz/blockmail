"use client";

import { useState, useEffect } from "react";
import { Mail, Send, Inbox, LogIn, ChevronDown } from "lucide-react";
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
} from "@/lib/web3";
import { ethers } from "ethers";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Email {
  from: string;
  to: string;
  subject: string;
  content: string;
  timestamp: number;
  isSent: boolean;
}

export default function Home() {
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState("");
  const [accounts, setAccounts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [sentEmails, setSentEmails] = useState<Email[]>([]);
  const [receivedEmails, setReceivedEmails] = useState<Email[]>([]);
  const [newEmail, setNewEmail] = useState({
    to: "",
    subject: "",
    content: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        if (accounts.length > 0) {
          setConnected(true);
          setAddress(accounts[0]);
          setAccounts(accounts);
          fetchEmails();
        }
      } catch (error) {
        console.error("Error checking connection:", error);
      }
    }
  };

  const handleConnect = async () => {
    try {
      const signer = await connectWallet();
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setConnected(true);
      setAddress(accounts[0]);
      setAccounts(accounts);
      fetchEmails();
      toast({
        title: "Connected!",
        description: "Successfully connected to MetaMask",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect to MetaMask",
        variant: "destructive",
      });
    }
  };

  const handleAccountChange = async (newAddress: string) => {
    try {
      setAddress(newAddress);
      await fetchEmails();
      toast({
        title: "Account Changed",
        description: "Successfully switched account",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to switch account",
        variant: "destructive",
      });
    }
  };

  const fetchEmails = async () => {
    try {
      const signer = await connectWallet();
      const [sent, received] = await Promise.all([
        getSentEmails(signer),
        getReceivedEmails(signer),
      ]);
      setSentEmails(sent);
      setReceivedEmails(received);
    } catch (error) {
      console.error("Error fetching emails:", error);
    }
  };

  const sendEmail = async () => {
    try {
      setLoading(true);
      const signer = await connectWallet();
      const contract = getEmailContract(signer);
      const tx = await contract.sendEmail(
        newEmail.to,
        newEmail.subject,
        newEmail.content
      );
      await tx.wait();
      toast({
        title: "Success!",
        description: "Email sent successfully",
      });
      setNewEmail({ to: "", subject: "", content: "" });
      fetchEmails();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send email",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-2">
            <Mail className="h-8 w-8" />
            <h1 className="text-2xl font-bold">Blockchain Email</h1>
          </div>
          {!connected ? (
            <Button
              onClick={handleConnect}
              className="flex items-center space-x-2"
            >
              <LogIn className="h-4 w-4" />
              <span>Connect Wallet</span>
            </Button>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <span>
                    {address.slice(0, 6)}...{address.slice(-4)}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-gray-800 border-gray-700">
                {accounts.map((account) => (
                  <DropdownMenuItem
                    key={account}
                    onClick={() => handleAccountChange(account)}
                    className="text-white hover:bg-gray-700 cursor-pointer"
                  >
                    {account.slice(0, 6)}...{account.slice(-4)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {connected && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-6 bg-gray-800 border-gray-700">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Send className="h-5 w-5 mr-2" />
                New Email
              </h2>
              <div className="space-y-4">
                <Input
                  placeholder="Recipient Address (0x...)"
                  value={newEmail.to}
                  onChange={(e) =>
                    setNewEmail({ ...newEmail, to: e.target.value })
                  }
                  className="bg-gray-700 border-gray-600"
                />
                <Input
                  placeholder="Subject"
                  value={newEmail.subject}
                  onChange={(e) =>
                    setNewEmail({ ...newEmail, subject: e.target.value })
                  }
                  className="bg-gray-700 border-gray-600"
                />
                <Textarea
                  placeholder="Content"
                  value={newEmail.content}
                  onChange={(e) =>
                    setNewEmail({ ...newEmail, content: e.target.value })
                  }
                  className="bg-gray-700 border-gray-600 min-h-[150px]"
                />
                <Button
                  onClick={sendEmail}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? "Sending..." : "Send Email"}
                </Button>
              </div>
            </Card>

            <div className="space-y-8">
              <Card className="p-6 bg-gray-800 border-gray-700">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Inbox className="h-5 w-5 mr-2" />
                  Inbox
                </h2>
                <div className="space-y-4">
                  {receivedEmails.map((email, index) => (
                    <Card
                      key={index}
                      className="p-4 bg-gray-700 border-gray-600"
                    >
                      <div className="text-sm text-gray-300">
                        From: {email.from.slice(0, 6)}...{email.from.slice(-4)}
                      </div>
                      <div className="font-semibold mt-2">{email.subject}</div>
                      <div className="text-gray-300 mt-2">{email.content}</div>
                      <div className="text-sm text-gray-400 mt-2">
                        {new Date(email.timestamp * 1000).toLocaleString()}
                      </div>
                    </Card>
                  ))}
                  {receivedEmails.length === 0 && (
                    <div className="text-center text-gray-400">
                      No received emails
                    </div>
                  )}
                </div>
              </Card>

              <Card className="p-6 bg-gray-800 border-gray-700">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Send className="h-5 w-5 mr-2" />
                  Sent Emails
                </h2>
                <div className="space-y-4">
                  {sentEmails.map((email, index) => (
                    <Card
                      key={index}
                      className="p-4 bg-gray-700 border-gray-600"
                    >
                      <div className="text-sm text-gray-300">
                        To: {email.to.slice(0, 6)}...{email.to.slice(-4)}
                      </div>
                      <div className="font-semibold mt-2">{email.subject}</div>
                      <div className="text-gray-300 mt-2">{email.content}</div>
                      <div className="text-sm text-gray-400 mt-2">
                        {new Date(email.timestamp * 1000).toLocaleString()}
                      </div>
                    </Card>
                  ))}
                  {sentEmails.length === 0 && (
                    <div className="text-center text-gray-400">
                      No sent emails
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
