const { Command } = require("commander");
const { getAuthInstance } = require("../platform/firebase");

const command = new Command("designate-as-staff");

command.argument("<email>", "Email of the user to designate as staff").action(async (email) => {
    try {
        const user = await getAuthInstance().getUserByEmail(email);
        const uid = user.uid;

        await getAuthInstance().setCustomUserClaims(uid, { isStaff: true });
        console.log(`User with email ${email} (UID: ${uid}) set as staff successfully.`);
    } catch (error) {
        console.error(`Error setting user as staff: ${error}`);
    }
});

module.exports = command;
