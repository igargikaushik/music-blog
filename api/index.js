const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.get("/", (req, res) => {
  res.json({ message: "Root path." });
});

app.get("/api", (req, res) => {
  res.json({ message: "This is the API GET." });
});

app.get("/api/", (req, res) => {
  res.json({ message: "This is the OTHER API GET." });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});