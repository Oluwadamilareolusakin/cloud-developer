const path = require("path");

let config_path;

if (process.env.NODE_ENV === "test") {
  config_path = path.resolve(".env.test");
}

require("dotenv").config({ path: config_path });
