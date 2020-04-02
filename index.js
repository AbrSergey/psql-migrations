const { createDb, migrate } = require("./src");
const { psqlMigrationLogger } = require("../../helpers/logger");
 
module.exports.migratePostgres = async (host, port, user, password, database) => {
  const dbConfig = { database, user, password, host, port };

  psqlMigrationLogger.info("Start migration...");
  console.log("\x1b[33m%s\x1b[0m", "[postgres-migrate-module]: Start migration...");
 
  const createDbInfo = await createDb(database, {
    ...dbConfig,
    defaultDatabase: "postgres"
  });

  psqlMigrationLogger.info(`createDbInfo: ${createDbInfo}`);

  await migrate(dbConfig, `${__dirname}/migrations`).catch(err => {
    psqlMigrationLogger.error(err);
  });

  psqlMigrationLogger.info("Migrated!");
  console.log("\x1b[33m%s\x1b[0m", "[postgres-migrate-module]: Migrated!");
};

//TODOs add await asyncronius function
//TODOs add logging instead of console.logs 