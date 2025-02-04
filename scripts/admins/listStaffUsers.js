const { Command } = require("commander");
const { getAuthInstance } = require("../platform/firebase");

const command = new Command("list-staff-users");

command.action(async () => {
    try {
        const listUsersResult = await getAuthInstance().listUsers();
        // print all users
        const staffUsers = listUsersResult.users.filter(
            (user) => user.customClaims && user.customClaims.isStaff === true,
        );

        if (staffUsers.length === 0) {
            console.log("No staff users found.");
        } else {
            console.log("staff users:");
            staffUsers.forEach((user) => {
                console.log(`- ${user.email} (UID: ${user.uid})`);
            });
        }
    } catch (error) {
        console.error("Error listing staff users:", error);
    }
});

module.exports = command;
