// App/server/hashPasswords.js

const bcrypt = require('bcryptjs');

const adminPassword = 'K33p0ut'; // Replace with your desired admin password
const userPasswords = ['12pmclass', '3pmclass']; // Replace with desired user passwords

const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    return hash;
};

const main = async () => {
    const hashedAdmin = await hashPassword(adminPassword);
    console.log('ADMIN_PASSWORD_HASH=' + hashedAdmin);

    const hashedUsers = await Promise.all(userPasswords.map(hashPassword));
    console.log('USER_PASSWORD_HASHES=' + hashedUsers.join(','));
};

main();
