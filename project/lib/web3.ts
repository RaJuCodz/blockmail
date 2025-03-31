import { ethers } from "ethers";
import { EMAIL_CONTRACT_ADDRESS, EMAIL_CONTRACT_ABI } from "./constants";

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

export const connectWallet = async () => {
  if (typeof window.ethereum !== "undefined") {
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      return provider.getSigner();
    } catch (error) {
      console.error("Error connecting wallet:", error);
      throw error;
    }
  } else {
    throw new Error("Please install MetaMask");
  }
};

export const getEmailContract = (signer: ethers.Signer) => {
  return new ethers.Contract(
    EMAIL_CONTRACT_ADDRESS,
    EMAIL_CONTRACT_ABI,
    signer
  );
};

export const getSentEmails = async (signer: ethers.Signer) => {
  try {
    const contract = getEmailContract(signer);
    const emails = await contract.getSentEmails();
    return emails
      .filter((email: any) => !email.isDeleted)
      .map((email: any) => ({
        ...email,
        isSent: true,
      }));
  } catch (error) {
    console.error("Error getting sent emails:", error);
    throw error;
  }
};

export const getReceivedEmails = async (signer: ethers.Signer) => {
  try {
    const contract = getEmailContract(signer);
    const emails = await contract.getReceivedEmails();
    return emails
      .filter((email: any) => !email.isDeleted)
      .map((email: any) => ({
        ...email,
        isSent: false,
      }));
  } catch (error) {
    console.error("Error getting received emails:", error);
    throw error;
  }
};

export const getStarredEmails = async (signer: ethers.Signer) => {
  try {
    const contract = getEmailContract(signer);
    return await contract.getStarredEmails();
  } catch (error) {
    console.error("Error getting starred emails:", error);
    throw error;
  }
};

export const starEmail = async (
  signer: ethers.Signer,
  emailIndex: number,
  isSent: boolean
) => {
  try {
    const contract = getEmailContract(signer);
    const tx = await contract.starEmail(emailIndex, isSent);
    await tx.wait();
    return true;
  } catch (error) {
    console.error("Error starring email:", error);
    throw error;
  }
};

export const unstarEmail = async (
  signer: ethers.Signer,
  emailIndex: number,
  isSent: boolean
) => {
  try {
    const contract = getEmailContract(signer);
    const tx = await contract.unstarEmail(emailIndex, isSent);
    await tx.wait();
    return true;
  } catch (error) {
    console.error("Error unstarring email:", error);
    throw error;
  }
};

export const deleteEmail = async (
  signer: ethers.Signer,
  emailIndex: number,
  isSent: boolean
) => {
  try {
    const contract = getEmailContract(signer);
    const tx = await contract.deleteEmail(emailIndex, isSent);
    await tx.wait();
    return true;
  } catch (error) {
    console.error("Error deleting email:", error);
    throw error;
  }
};

export const updateProfile = async (
  signer: ethers.Signer,
  name: string,
  avatar: string
) => {
  try {
    const contract = getEmailContract(signer);
    const tx = await contract.updateProfile(name, avatar);
    await tx.wait();
    return true;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};

export const getProfile = async (signer: ethers.Signer, address: string) => {
  try {
    const contract = getEmailContract(signer);
    return await contract.getProfile(address);
  } catch (error) {
    console.error("Error getting profile:", error);
    throw error;
  }
};
