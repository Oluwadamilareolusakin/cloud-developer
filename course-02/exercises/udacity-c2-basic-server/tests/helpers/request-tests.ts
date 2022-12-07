import "chai-http";

import { request, expect } from "chai";

var chai = require("chai"),
  chaiHttp = require("chai-http");

chai.use(chaiHttp);
chai.should();

export { request, expect };
