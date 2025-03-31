// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Email {
    struct EmailData {
        address from;
        address to;
        string subject;
        string content;
        uint256 timestamp;
        bool isStarred;
        bool isDeleted;
    }

    struct UserProfile {
        string name;
        string avatar;
        bool exists;
    }

    mapping(address => EmailData[]) public sentEmails;
    mapping(address => EmailData[]) public receivedEmails;
    mapping(address => UserProfile) public userProfiles;
    mapping(address => mapping(uint256 => bool)) public starredEmails;

    event EmailSent(
        address indexed from,
        address indexed to,
        string subject,
        string content,
        uint256 timestamp
    );

    event EmailStarred(address indexed user, uint256 emailIndex);
    event EmailUnstarred(address indexed user, uint256 emailIndex);
    event ProfileUpdated(address indexed user, string name, string avatar);

    function sendEmail(
        address to,
        string memory subject,
        string memory content
    ) public {
        require(to != address(0), "Invalid recipient address");
        require(bytes(subject).length > 0, "Subject cannot be empty");
        require(bytes(content).length > 0, "Content cannot be empty");

        EmailData memory newEmail = EmailData({
            from: msg.sender,
            to: to,
            subject: subject,
            content: content,
            timestamp: block.timestamp,
            isStarred: false,
            isDeleted: false
        });

        sentEmails[msg.sender].push(newEmail);
        receivedEmails[to].push(newEmail);

        emit EmailSent(msg.sender, to, subject, content, block.timestamp);
    }

    function getSentEmails() public view returns (EmailData[] memory) {
        return sentEmails[msg.sender];
    }

    function getReceivedEmails() public view returns (EmailData[] memory) {
        return receivedEmails[msg.sender];
    }

    function getStarredEmails() public view returns (EmailData[] memory) {
        EmailData[] memory allEmails = new EmailData[](sentEmails[msg.sender].length + receivedEmails[msg.sender].length);
        uint256 count = 0;

        // Add starred sent emails
        for (uint256 i = 0; i < sentEmails[msg.sender].length; i++) {
            if (starredEmails[msg.sender][i] && !sentEmails[msg.sender][i].isDeleted) {
                allEmails[count] = sentEmails[msg.sender][i];
                count++;
            }
        }

        // Add starred received emails
        for (uint256 i = 0; i < receivedEmails[msg.sender].length; i++) {
            if (starredEmails[msg.sender][i + sentEmails[msg.sender].length] && !receivedEmails[msg.sender][i].isDeleted) {
                allEmails[count] = receivedEmails[msg.sender][i];
                count++;
            }
        }

        // Resize array to actual count
        EmailData[] memory result = new EmailData[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = allEmails[i];
        }
        return result;
    }

    function starEmail(uint256 emailIndex, bool isSent) public {
        require(
            emailIndex < (isSent ? sentEmails[msg.sender].length : receivedEmails[msg.sender].length),
            "Invalid email index"
        );

        uint256 globalIndex = isSent ? emailIndex : emailIndex + sentEmails[msg.sender].length;
        starredEmails[msg.sender][globalIndex] = true;

        if (isSent) {
            sentEmails[msg.sender][emailIndex].isStarred = true;
        } else {
            receivedEmails[msg.sender][emailIndex].isStarred = true;
        }

        emit EmailStarred(msg.sender, globalIndex);
    }

    function unstarEmail(uint256 emailIndex, bool isSent) public {
        require(
            emailIndex < (isSent ? sentEmails[msg.sender].length : receivedEmails[msg.sender].length),
            "Invalid email index"
        );

        uint256 globalIndex = isSent ? emailIndex : emailIndex + sentEmails[msg.sender].length;
        starredEmails[msg.sender][globalIndex] = false;

        if (isSent) {
            sentEmails[msg.sender][emailIndex].isStarred = false;
        } else {
            receivedEmails[msg.sender][emailIndex].isStarred = false;
        }

        emit EmailUnstarred(msg.sender, globalIndex);
    }

    function deleteEmail(uint256 emailIndex, bool isSent) public {
        require(
            emailIndex < (isSent ? sentEmails[msg.sender].length : receivedEmails[msg.sender].length),
            "Invalid email index"
        );

        if (isSent) {
            sentEmails[msg.sender][emailIndex].isDeleted = true;
        } else {
            receivedEmails[msg.sender][emailIndex].isDeleted = true;
        }
    }

    function updateProfile(string memory name, string memory avatar) public {
        userProfiles[msg.sender] = UserProfile({
            name: name,
            avatar: avatar,
            exists: true
        });
        emit ProfileUpdated(msg.sender, name, avatar);
    }

    function getProfile(address user) public view returns (UserProfile memory) {
        return userProfiles[user];
    }
}
