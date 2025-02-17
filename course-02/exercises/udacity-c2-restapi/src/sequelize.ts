import { Sequelize } from "sequelize-typescript";

let config = require("./config/config");

const c = config.development;

// Instantiate new Sequelize instance!
export const sequelize = new Sequelize({
  username: c.username,
  password: c.password,
  database: c.database,
  host: c.host,

  dialect: "postgres",
  storage: ":memory:",
});
