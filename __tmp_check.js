const { sequelize, User } = require('./models');

async function checkUsers() {
    try {
        await sequelize.authenticate();
        console.log('Database connection OK');
        const users = await User.findAll({ raw: true });
        console.log('Users in DB:');
        users.forEach(u => console.log(`- ${u.email} (${u.role})`));
    } catch (err) {
        console.error('Check failed:', err);
    } finally {
        process.exit();
    }
}

checkUsers();
