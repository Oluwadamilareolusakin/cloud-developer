require("./helpers/test-helpers");

import { request, expect } from "./helpers/request-tests";

import "mocha";
import server from "../src/server";
import { Car, cars as cars_list } from "../src/cars";

let cars: Car[] = cars_list;

afterEach(() => {
  // stop the server after every suite
  server.close();
});

describe("GET /cars/:id", () => {
  describe("when a car with the id exists", () => {
    it("returns a 200 status code and the car", () => {
      request(server)
        .get("/cars/2")
        .end((err, res) => {
          res.should.have.status(200);
          expect(JSON.parse(res.text).id).to.equal(2);
        });
    });
  });

  describe("when no car with the id exists", () => {
    it("returns a 404", () => {
      request(server)
        .get("/cars/24")
        .end((err, res) => {
          res.should.have.status(404);
        });
    });
  });
});

describe("POST /cars", () => {
  describe("when a car with the id exists", () => {
    it("returns a 200 status code and the car", () => {
      request(server)
        .get("/cars/2")
        .end((err, res) => {
          res.should.have.status(200);
          expect(JSON.parse(res.text).id).to.equal(2);
        });
    });
  });

  describe("when no car with the id exists", () => {
    it("returns a 404", () => {
      request(server)
        .get("/cars/24")
        .end((err, res) => {
          res.should.have.status(404);
        });
    });
  });
});

describe("GET /cars", () => {
  describe("without any filters", () => {
    it("returns a list of all cars", (done) => {
      request(server)
        .get("/cars")
        .end((err, res) => {
          res.should.have.status(200);

          let response = JSON.parse(res.text);
          response.should.be.a("array");

          response.should.be.eql(cars);

          done();
        });
    });
  });

  describe("filtering by make", () => {
    it("returns a list of all cars that match the make", (done) => {
      request(server)
        .get("/cars?filters[make]=toyota")
        .end((err, res) => {
          res.should.have.status(200);

          let response = JSON.parse(res.text);
          response.should.be.a("array");

          response.length.should.be.eql(1);

          // hardcoded because our datapoints are hardcoded
          response.should.be.eql([
            {
              make: "toyota",
              type: "sedan",
              model: "prius",
              cost: 22,
              id: 2,
            },
          ]);

          done();
        });
    });
  });
});
