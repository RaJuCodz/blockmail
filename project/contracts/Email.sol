// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;  // Set a compatible version

contract Email {
    struct EmailData {
        address from;
        address to;
        string subject;
        string content;
        uint256 timestamp;
        bool isSent;  // true for sent emails, false for received emails
    }

    mapping(address => EmailData[]) private userEmails;

    event EmailSent(
        address indexed from,
        address indexed to,
        string subject,
        uint256 timestamp
    );

    function sendEmail(
        address to,
        string calldata subject,
        string calldata content
    ) external {
        require(to != address(0), "Invalid recipient address");
        require(userEmails[to].length < 100, "Recipient inbox full"); // Limit to prevent storage spam
        require(userEmails[msg.sender].length < 100, "Sender outbox full");

        // Store for recipient
        userEmails[to].push(EmailData({
            from: msg.sender,
            to: to,
            subject: subject,
            content: content,
            timestamp: block.timestamp,
            isSent: false
        }));

        // Store for sender
        userEmails[msg.sender].push(EmailData({
            from: msg.sender,
            to: to,
            subject: subject,
            content: content,
            timestamp: block.timestamp,
            isSent: true
        }));

        emit EmailSent(msg.sender, to, subject, block.timestamp);
    }

    function getEmails(bool sentOnly) external view returns (EmailData[] memory) {
        EmailData[] memory allEmails = userEmails[msg.sender];
        uint256 count = 0;
        
        // Count matching emails
        for(uint i = 0; i < allEmails.length; i++) {
            if(allEmails[i].isSent == sentOnly) {
                count++;
            }
        }
        
        // Create filtered array
        EmailData[] memory filteredEmails = new EmailData[](count);
        uint256 index = 0;
        
        // Fill filtered array
        for(uint i = 0; i < allEmails.length; i++) {
            if(allEmails[i].isSent == sentOnly) {
                filteredEmails[index] = allEmails[i];
                index++;
            }
        }
        
        return filteredEmails;
    }
}
