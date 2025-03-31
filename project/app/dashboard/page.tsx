"use client";

import { useState, useEffect } from "react";
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
  LogOut,
  Users,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { BubbleEffect } from "@/components/ui/bubble-effect";

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
  avatar?: string;
}

interface UserProfile {
  name: string;
  avatar: string;
  exists: boolean;
}

export default function Dashboard() {
  const router = useRouter();
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState("");
  const [accounts, setAccounts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [sentEmails, setSentEmails] = useState<Email[]>([]);
  const [receivedEmails, setReceivedEmails] = useState<Email[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [newEmail, setNewEmail] = useState({
    to: "",
    subject: "",
    content: "",
  });
  const [showCompose, setShowCompose] = useState(false);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("inbox");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [starredEmails, setStarredEmails] = useState<Email[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileAvatar, setProfileAvatar] = useState("");
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredEmails, setFilteredEmails] = useState<Email[]>([]);
  const [showContactsDialog, setShowContactsDialog] = useState(false);
  const [newContact, setNewContact] = useState({
    name: "",
    address: "",
    avatar: "",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    checkConnection();
  }, []);

  useEffect(() => {
    // Filter emails based on search query
    const allEmails = [...sentEmails, ...receivedEmails];
    const filtered = allEmails.filter((email) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        email.subject.toLowerCase().includes(searchLower) ||
        email.content.toLowerCase().includes(searchLower) ||
        email.from.toLowerCase().includes(searchLower) ||
        email.to.toLowerCase().includes(searchLower)
      );
    });
    setFilteredEmails(filtered);
  }, [searchQuery, sentEmails, receivedEmails]);

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
        } else {
          router.push("/");
        }
      } catch (error) {
        console.error("Error checking connection:", error);
        router.push("/");
      }
    } else {
      router.push("/");
    }
  };

  const handleDeleteEmail = async (index: number, isSent: boolean) => {
    try {
      setLoading(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = await getEmailContract(signer);
      await deleteEmail(signer, index, isSent);
      toast({
        title: "Success",
        description: "Email deleted successfully",
      });
      fetchEmails();
    } catch (error) {
      console.error("Error deleting email:", error);
      toast({
        title: "Error",
        description: "Failed to delete email",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStarEmail = async (index: number, isSent: boolean) => {
    try {
      setLoading(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = await getEmailContract(signer);
      await starEmail(signer, index, isSent);
      toast({
        title: "Success",
        description: "Email starred successfully",
      });
      fetchEmails();
    } catch (error) {
      console.error("Error starring email:", error);
      toast({
        title: "Error",
        description: "Failed to star email",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUnstarEmail = async (index: number, isSent: boolean) => {
    try {
      setLoading(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = await getEmailContract(signer);
      await unstarEmail(signer, index, isSent);
      toast({
        title: "Success",
        description: "Email unstarred successfully",
      });
      fetchEmails();
    } catch (error) {
      console.error("Error unstarring email:", error);
      toast({
        title: "Error",
        description: "Failed to unstar email",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    setConnected(false);
    setAddress("");
    setAccounts([]);
    router.push("/");
  };

  const fetchEmails = async () => {
    try {
      setLoading(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = await getEmailContract(signer);
      const [sent, received, starred] = await Promise.all([
        getSentEmails(signer),
        getReceivedEmails(signer),
        getStarredEmails(signer),
      ]);
      setSentEmails(sent);
      setReceivedEmails(received);
      setStarredEmails(starred);
    } catch (error) {
      console.error("Error fetching emails:", error);
      toast({
        title: "Error",
        description: "Failed to fetch emails",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async () => {
    try {
      setLoading(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = await getEmailContract(signer);

      // Validate inputs
      if (!newEmail.to || !newEmail.subject || !newEmail.content) {
        toast({
          title: "Error",
          description: "Please fill in all fields",
          variant: "destructive",
        });
        return;
      }

      // Send email
      await contract.sendEmail(newEmail.to, newEmail.subject, newEmail.content);

      toast({
        title: "Success",
        description: "Email sent successfully",
      });

      // Reset form and close dialog
      setNewEmail({ to: "", subject: "", content: "" });
      setShowCompose(false);

      // Refresh emails
      fetchEmails();
    } catch (error) {
      console.error("Error sending email:", error);
      toast({
        title: "Error",
        description: "Failed to send email",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      await updateProfile(signer, profileName, profileAvatar);

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });

      // Refresh profile
      const profile = await getProfile(signer, address);
      setUserProfile(profile);
      setProfileName(profile.name || "");
      setProfileAvatar(profile.avatar || "");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddContact = () => {
    if (!newContact.name || !newContact.address) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setContacts([...contacts, newContact]);
    setNewContact({ name: "", address: "", avatar: "" });
    setShowContactsDialog(false);
    toast({
      title: "Success",
      description: "Contact added successfully",
    });
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (connected) {
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          const profile = await getProfile(signer, address);
          setUserProfile(profile);
          setProfileName(profile.name || "");
          setProfileAvatar(profile.avatar || "");
        } catch (error) {
          console.error("Error fetching profile:", error);
        }
      }
    };
    fetchProfile();
  }, [connected, address]);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <BubbleEffect />
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-slate-600 dark:text-slate-300"
            >
              {sidebarOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
            <Link
              href="/"
              className="cursor-pointer flex items-center space-x-2"
            >
              <Mail className="h-8 w-8 text-blue-500" />
              <span
                className="text-2xl font-bold text-blue-500"
                style={{
                  textShadow: "0 0 10px rgba(59, 130, 246, 0.3)",
                }}
              >
                BlockMail
              </span>
            </Link>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-600 dark:text-slate-300"
              onClick={() => setShowProfileDialog(true)}
            >
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex h-screen pt-14 lg:pt-0">
        {/* Sidebar */}
        <div
          className={`fixed inset-y-0 left-0 z-40 w-64 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-r border-slate-200 dark:border-slate-700 transform transition-transform duration-200 ease-in-out ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0 lg:static`}
        >
          <div className="h-full flex flex-col">
            {/* Logo - Hidden on mobile */}
            <div className="hidden lg:flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
              <Link
                href="/"
                className="cursor-pointer flex items-center space-x-2"
              >
                <Mail className="h-8 w-8 text-blue-500" />
                <span
                  className="text-2xl font-bold text-blue-500"
                  style={{
                    textShadow: "0 0 10px rgba(59, 130, 246, 0.3)",
                  }}
                >
                  BlockMail
                </span>
              </Link>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              <Button
                variant={activeTab === "inbox" ? "secondary" : "ghost"}
                className="w-full justify-start text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                onClick={() => setActiveTab("inbox")}
              >
                <Inbox className="h-4 w-4 mr-2" />
                Inbox
              </Button>
              <Button
                variant={activeTab === "sent" ? "secondary" : "ghost"}
                className="w-full justify-start text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                onClick={() => setActiveTab("sent")}
              >
                <Send className="h-4 w-4 mr-2" />
                Sent
              </Button>
              <Button
                variant={activeTab === "starred" ? "secondary" : "ghost"}
                className="w-full justify-start text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                onClick={() => setActiveTab("starred")}
              >
                <Star className="h-4 w-4 mr-2" />
                Starred
              </Button>
              <Button
                variant={activeTab === "drafts" ? "secondary" : "ghost"}
                className="w-full justify-start text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                onClick={() => setActiveTab("drafts")}
              >
                <Folder className="h-4 w-4 mr-2" />
                Drafts
              </Button>
              <Button
                variant={activeTab === "trash" ? "secondary" : "ghost"}
                className="w-full justify-start text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                onClick={() => setActiveTab("trash")}
              >
                <Trash className="h-4 w-4 mr-2" />
                Trash
              </Button>
            </div>

            {/* Contacts Section */}
            <div className="flex-1 overflow-y-auto p-4 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Contacts
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => setShowContactsDialog(true)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {contacts.map((contact, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                    onClick={() => {
                      setNewEmail({ ...newEmail, to: contact.address });
                      setShowCompose(true);
                    }}
                  >
                    <div className="relative w-8 h-8 rounded-full overflow-hidden">
                      {contact.avatar ? (
                        <Image
                          src={contact.avatar}
                          alt={contact.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                        {contact.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {contact.address.slice(0, 6)}...
                        {contact.address.slice(-4)}
                      </p>
                    </div>
                  </div>
                ))}
                {contacts.length === 0 && (
                  <div className="text-center text-sm text-slate-500 dark:text-slate-400 py-2">
                    No contacts yet
                  </div>
                )}
              </div>
            </div>

            {/* User Profile */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-700">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="relative w-8 h-8 rounded-full overflow-hidden">
                        {userProfile?.avatar ? (
                          <Image
                            src={userProfile.avatar}
                            alt="Profile"
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                            <User className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                      <span className="truncate">
                        {userProfile?.name || "Profile"}
                      </span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-slate-200 dark:border-slate-700">
                  <DropdownMenuItem
                    className="text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                    onClick={() => setShowProfileDialog(true)}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                    onClick={handleDisconnect}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Disconnect
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-4 lg:p-8">
            {/* Search Bar */}
            <div className="flex items-center space-x-4 mb-8">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search emails..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-slate-200 dark:border-slate-700"
                />
              </div>
              <Dialog open={showCompose} onOpenChange={setShowCompose}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Compose
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-slate-200 dark:border-slate-700">
                  <DialogHeader>
                    <DialogTitle>Compose Email</DialogTitle>
                    <DialogDescription>
                      Send a new email to any Ethereum address
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        To (Ethereum Address)
                      </label>
                      <Input
                        placeholder="0x..."
                        value={newEmail.to}
                        onChange={(e) =>
                          setNewEmail({ ...newEmail, to: e.target.value })
                        }
                        className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-slate-200 dark:border-slate-700"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Subject
                      </label>
                      <Input
                        placeholder="Enter subject"
                        value={newEmail.subject}
                        onChange={(e) =>
                          setNewEmail({ ...newEmail, subject: e.target.value })
                        }
                        className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-slate-200 dark:border-slate-700"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Content
                      </label>
                      <Textarea
                        placeholder="Write your email content..."
                        value={newEmail.content}
                        onChange={(e) =>
                          setNewEmail({ ...newEmail, content: e.target.value })
                        }
                        className="min-h-[200px] bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-slate-200 dark:border-slate-700"
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setShowCompose(false)}
                        className="border-slate-200 dark:border-slate-700"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSendEmail}
                        disabled={loading}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                      >
                        {loading ? "Sending..." : "Send Email"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Content Area */}
            <div className="mt-4 lg:mt-0">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
                    {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                  </h1>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Main Content Area */}
                <div className="lg:col-span-4">
                  {searchQuery ? (
                    // Show search results
                    <div className="space-y-4">
                      {filteredEmails.map((email, index) => (
                        <Card
                          key={index}
                          className="p-4 hover:bg-slate-100 dark:hover:bg-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-slate-200 dark:border-slate-700"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="text-sm text-blue-500 font-mono">
                                {email.from === address
                                  ? `To: ${email.to.slice(
                                      0,
                                      6
                                    )}...${email.to.slice(-4)}`
                                  : `From: ${email.from.slice(
                                      0,
                                      6
                                    )}...${email.from.slice(-4)}`}
                              </div>
                              <div className="font-semibold mt-2 text-slate-800 dark:text-white">
                                {email.subject}
                              </div>
                              <div className="text-slate-600 dark:text-slate-300 mt-2">
                                {email.content}
                              </div>
                              <div className="text-sm text-slate-400 dark:text-slate-500 mt-2">
                                {new Date(
                                  email.timestamp * 1000
                                ).toLocaleString()}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  email.isStarred
                                    ? handleUnstarEmail(
                                        index,
                                        email.from === address
                                      )
                                    : handleStarEmail(
                                        index,
                                        email.from === address
                                      )
                                }
                                className="text-slate-600 dark:text-slate-300 hover:text-yellow-500"
                              >
                                <Star
                                  className={`h-4 w-4 ${
                                    email.isStarred
                                      ? "fill-yellow-500 text-yellow-500"
                                      : ""
                                  }`}
                                />
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-slate-600 dark:text-slate-300"
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-slate-200 dark:border-slate-700">
                                  <DropdownMenuItem
                                    className="text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                                    onClick={() =>
                                      handleDeleteEmail(
                                        index,
                                        email.from === address
                                      )
                                    }
                                  >
                                    <Trash className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </Card>
                      ))}
                      {filteredEmails.length === 0 && (
                        <div className="text-center text-slate-500 dark:text-slate-400 py-8">
                          No emails found matching your search
                        </div>
                      )}
                    </div>
                  ) : (
                    // Show regular tab content
                    <>
                      {activeTab === "inbox" && (
                        <div className="space-y-4">
                          {receivedEmails.map((email, index) => (
                            <Card
                              key={index}
                              className="p-4 hover:bg-slate-100 dark:hover:bg-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-slate-200 dark:border-slate-700"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="text-sm text-blue-500 font-mono">
                                    From: {email.from.slice(0, 6)}...
                                    {email.from.slice(-4)}
                                  </div>
                                  <div className="font-semibold mt-2 text-slate-800 dark:text-white">
                                    {email.subject}
                                  </div>
                                  <div className="text-slate-600 dark:text-slate-300 mt-2">
                                    {email.content}
                                  </div>
                                  <div className="text-sm text-slate-400 dark:text-slate-500 mt-2">
                                    {new Date(
                                      email.timestamp * 1000
                                    ).toLocaleString()}
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      email.isStarred
                                        ? handleUnstarEmail(index, false)
                                        : handleStarEmail(index, false)
                                    }
                                    className="text-slate-600 dark:text-slate-300 hover:text-yellow-500"
                                  >
                                    <Star
                                      className={`h-4 w-4 ${
                                        email.isStarred
                                          ? "fill-yellow-500 text-yellow-500"
                                          : ""
                                      }`}
                                    />
                                  </Button>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-slate-600 dark:text-slate-300"
                                      >
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-slate-200 dark:border-slate-700">
                                      <DropdownMenuItem
                                        className="text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                                        onClick={() =>
                                          handleDeleteEmail(index, false)
                                        }
                                      >
                                        <Trash className="h-4 w-4 mr-2" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </div>
                            </Card>
                          ))}
                          {receivedEmails.length === 0 && (
                            <div className="text-center text-slate-500 dark:text-slate-400 py-8">
                              No received emails
                            </div>
                          )}
                        </div>
                      )}

                      {activeTab === "sent" && (
                        <div className="space-y-4">
                          {sentEmails.map((email, index) => (
                            <Card
                              key={index}
                              className="p-4 hover:bg-slate-100 dark:hover:bg-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-slate-200 dark:border-slate-700"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="text-sm text-blue-500 font-mono">
                                    To: {email.to.slice(0, 6)}...
                                    {email.to.slice(-4)}
                                  </div>
                                  <div className="font-semibold mt-2 text-slate-800 dark:text-white">
                                    {email.subject}
                                  </div>
                                  <div className="text-slate-600 dark:text-slate-300 mt-2">
                                    {email.content}
                                  </div>
                                  <div className="text-sm text-slate-400 dark:text-slate-500 mt-2">
                                    {new Date(
                                      email.timestamp * 1000
                                    ).toLocaleString()}
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      email.isStarred
                                        ? handleUnstarEmail(index, true)
                                        : handleStarEmail(index, true)
                                    }
                                    className="text-slate-600 dark:text-slate-300 hover:text-yellow-500"
                                  >
                                    <Star
                                      className={`h-4 w-4 ${
                                        email.isStarred
                                          ? "fill-yellow-500 text-yellow-500"
                                          : ""
                                      }`}
                                    />
                                  </Button>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-slate-600 dark:text-slate-300"
                                      >
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-slate-200 dark:border-slate-700">
                                      <DropdownMenuItem
                                        className="text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                                        onClick={() =>
                                          handleDeleteEmail(index, true)
                                        }
                                      >
                                        <Trash className="h-4 w-4 mr-2" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </div>
                            </Card>
                          ))}
                          {sentEmails.length === 0 && (
                            <div className="text-center text-slate-500 dark:text-slate-400 py-8">
                              No sent emails
                            </div>
                          )}
                        </div>
                      )}

                      {activeTab === "starred" && (
                        <div className="space-y-4">
                          {starredEmails.map((email, index) => (
                            <Card key={index} className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="text-sm text-blue-500 font-mono">
                                    {email.from === address
                                      ? `To: ${email.to.slice(
                                          0,
                                          6
                                        )}...${email.to.slice(-4)}`
                                      : `From: ${email.from.slice(
                                          0,
                                          6
                                        )}...${email.from.slice(-4)}`}
                                  </div>
                                  <div className="font-semibold mt-2">
                                    {email.subject}
                                  </div>
                                  <div className="mt-2">{email.content}</div>
                                  <div className="text-sm text-slate-400 mt-2">
                                    {new Date(
                                      email.timestamp * 1000
                                    ).toLocaleString()}
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      email.isStarred
                                        ? handleUnstarEmail(
                                            index,
                                            email.from === address
                                          )
                                        : handleStarEmail(
                                            index,
                                            email.from === address
                                          )
                                    }
                                  >
                                    <Star
                                      className={`h-4 w-4 ${
                                        email.isStarred
                                          ? "fill-yellow-500 text-yellow-500"
                                          : ""
                                      }`}
                                    />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      handleDeleteEmail(
                                        index,
                                        email.from === address
                                      )
                                    }
                                  >
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </Card>
                          ))}
                          {starredEmails.length === 0 && (
                            <div className="text-center text-slate-500 dark:text-slate-400 py-8">
                              No starred emails
                            </div>
                          )}
                        </div>
                      )}

                      {activeTab === "drafts" && (
                        <div className="text-center text-slate-500 dark:text-slate-400 py-8">
                          Drafts coming soon
                        </div>
                      )}

                      {activeTab === "trash" && (
                        <div className="text-center text-slate-500 dark:text-slate-400 py-8">
                          Trash coming soon
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Dialog */}
      <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <DialogContent className="sm:max-w-[425px] bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-slate-200 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle>Profile Settings</DialogTitle>
            <DialogDescription>
              Update your profile information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-blue-500">
                {profileAvatar ? (
                  <Image
                    src={profileAvatar}
                    alt="Profile"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                    <User className="w-16 h-16 text-white" />
                  </div>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = "image/*";
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        setProfileAvatar(e.target?.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  };
                  input.click();
                }}
              >
                Change Profile Picture
              </Button>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Display Name
              </label>
              <Input
                placeholder="Enter your name"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-slate-200 dark:border-slate-700"
              />
            </div>
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="text-sm text-slate-600 dark:text-slate-400">
                <p className="font-medium mb-2">Project Information:</p>
                <p>BlockMail - Decentralized Email Platform</p>
                <a
                  href="https://github.com/RajuCodz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 mt-2 inline-block"
                >
                  GitHub: RajuCodz
                </a>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowProfileDialog(false)}
                className="border-slate-200 dark:border-slate-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateProfile}
                disabled={loading}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
              >
                {loading ? "Updating..." : "Update Profile"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Contacts Dialog */}
      <Dialog open={showContactsDialog} onOpenChange={setShowContactsDialog}>
        <DialogContent className="sm:max-w-[425px] bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-slate-200 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle>Manage Contacts</DialogTitle>
            <DialogDescription>Add and manage your contacts</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Contact Name
              </label>
              <Input
                placeholder="Enter contact name"
                value={newContact.name}
                onChange={(e) =>
                  setNewContact({ ...newContact, name: e.target.value })
                }
                className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-slate-200 dark:border-slate-700"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Ethereum Address
              </label>
              <Input
                placeholder="0x..."
                value={newContact.address}
                onChange={(e) =>
                  setNewContact({ ...newContact, address: e.target.value })
                }
                className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-slate-200 dark:border-slate-700"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Avatar URL (Optional)
              </label>
              <Input
                placeholder="Enter avatar URL"
                value={newContact.avatar}
                onChange={(e) =>
                  setNewContact({ ...newContact, avatar: e.target.value })
                }
                className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-slate-200 dark:border-slate-700"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowContactsDialog(false)}
                className="border-slate-200 dark:border-slate-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddContact}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
              >
                Add Contact
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
