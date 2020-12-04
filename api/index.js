const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

/* var corsOptions = {
  origin: "http://localhost:8081"
};

app.use(cors(corsOptions)); */

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to bezkoder application." });
});

app.get("/api", (req, res) => {
  res.json({ message: "This is the API GET." });
});

app.get("/api/", (req, res) => {
  res.json({ message: "This is the OTHER API GET." });
});

// set port, listen for requests
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});