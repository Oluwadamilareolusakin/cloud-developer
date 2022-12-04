let path;

if (process.env.NODE_ENV == "test") {
  path = "./.env.test";
} else {
  path = "./.env";
}

require("dotenv").config({ path });
