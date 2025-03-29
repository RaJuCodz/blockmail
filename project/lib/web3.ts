import { ethers } from "ethers";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export const emailABI = [
  "function sendEmail(address to, string subject, string content) public",
  "function getEmails(bool sentOnly) public view returns (tuple(address from, address to, string subject, string content, uint256 timestamp, bool isSent)[])",
  "event EmailSent(address indexed from, address indexed to, string subject, uint256 timestamp)",
];

export const EMAIL_CONTRACT_ADDRESS =
  "0x207b75D39e540b16E9A38b56aBe24e57B03DC11d"; // Copy your contract address from Remix and paste it here

export const connectWallet = async () => {
  if (typeof window.ethereum !== "undefined") {
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      return signer;
    } catch (error) {
      console.error("Error connecting to MetaMask:", error);
      throw error;
    }
  } else {
    throw new Error("Please install MetaMask!");
  }
};

export const getEmailContract = (signer: ethers.Signer) => {
  return new ethers.Contract(EMAIL_CONTRACT_ADDRESS, emailABI, signer);
};

export const getSentEmails = async (signer: ethers.Signer) => {
  const contract = getEmailContract(signer);
  return await contract.getEmails(true);
};

export const getReceivedEmails = async (signer: ethers.Signer) => {
  const contract = getEmailContract(signer);
  return await contract.getEmails(false);
};
