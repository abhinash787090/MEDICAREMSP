const { sequelize } = require('../models');

async function checkSchema() {
    try {
        const [results, metadata] = await sequelize.query("PRAGMA table_info(Labs)");
        console.log("Labs Table Schema:");
        console.table(results);
        process.exit(0);
    } catch (err) {
        console.error("Error checking schema:", err);
        process.exit(1);
    }
}

checkSchema();
