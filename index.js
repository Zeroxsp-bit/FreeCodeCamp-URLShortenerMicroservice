require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const { MongoClient } = require("mongodb");
const urlparser = require("url");
const dns = require("dns");

const cliente = new MongoClient(process.env.DATA);
const datab = cliente.db("urlshotener");
const URLs = datab.collection("urls");

// Basic Configuration
const port = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.post("/api/shorturl", function (req, res) {
  console.log(req.body);
  const url = req.body.url;
  const dnslookup = dns.lookup(
    urlparser.parse(url).hostname,
    async (err, adress) => {
      if (!adress) {
        res.json({ error: "Invalid URL" });
      } else {
        const resultado = await URLs.countDocuments({});
        const urlDocu = {
          url,
          short_url: resultado,
        };

        const result = await URLs.insertOne(urlDocu);
        console.log(result);
        res.json({ original_url: url, short_url: resultado });
      }
    },
  );
});

app.get("/api/shorturl/:short_url", async (req, res) => {
  const shorturl = req.params.short_url;
  const urlDocu = await URLs.findOne({ short_url: +shorturl });
  res.redirect(urlDocu.url);
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
