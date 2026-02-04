const runMigrations = require("./db/migrations");

runMigrations();
require("./bot");
