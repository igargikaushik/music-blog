const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const { Pool } = require('pg');
const pool = new Pool();

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.get("/", (req, res) => {
  res.json({ message: "Root path." });
});

app.get("/api", async (req, res) => {
  const db_res = await pool
    .query('SELECT NOW()')
    .then(db_res => db_res.rows[0])
    .catch(e => console.error(e.stack));
  res.json({ message: "This is the API GET.", db_res: db_res });
});

app.get("/api/create_post", async (req, res) => {
  const insert_query = `INSERT INTO
    articles(title, slug, author, description, creation_time, content, category, tags, image)
    VALUES($1, $2, $3, $4, CURRENT_TIMESTAMP, $5, $6, $7, $8)
    RETURNING *;`;
  const values = [
    "What is a Sonata?",
    "what-sonata",
    "Henry Sloan",
    'Many of the most popular classical works are "Sonatas". Let\'s look at what that means, and how we can navigate this vast genre.',
    `[[toc]]

# Introduction
What do Mozart and Beethoven have in common? Well, among other things, they both have "sonatas" among their most famous works. I'll bet you've heard this piece by Mozart:

<audio controls="controls" src="https://upload.wikimedia.org/wikipedia/commons/3/38/Wolfgang_Amadeus_Mozart_-_sonata_no._16_in_c_major%2C_k.545_%27sonata_facile%27_-_i._allegro.ogg"></audio>

And this wild work of Beethoven:

<audio controls="controls" src="https://upload.wikimedia.org/wikipedia/commons/1/1d/Moonlight_Sonata_Presto.ogg"></audio>

These two pieces are about as different as you can get within the classical-era piano repertoire, but they have **two things** in common.
1. They're movements in "piano sonatas"
2. They're in sonata form

That's right, "sonata" means two different, but closely related, things. This might seem confusing, but learning the meanings of these two ideas will do wonders to open your ears to classical music. Let's look at the definitions of "sonata" and see how this abstract idea leads us through the past 400 years of musical evolution.

# Sonata vs. Sonata Form
What is the difference? There is a difference. What is it. It is.

# History of the Sonata
There is history. What is it? It is.

# Suggestions
Listen! To what? Well, listen, and I'll tell you! It is.`,
    'Article',
    ["Sonata", "Classical", "Romantic", "Baroque"],
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Wolfgang-amadeus-mozart_1.jpg/256px-Wolfgang-amadeus-mozart_1.jpg',
  ];

  const db_res = await pool
    .query(insert_query, values)
    .then(db_res => res.status(200).send(db_res.rows[0]))
    .catch(e => res.status(500).send(e.stack));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});