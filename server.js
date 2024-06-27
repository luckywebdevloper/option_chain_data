const express = require("express");
const cors = require("cors");
const nse = require("./nse_lib");

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());

async function startServer() {
  try {
    await nse.loadCookies();
    console.log("Cookies loaded successfully");
    app.listen(port, () => console.log(`App listening on port ${port}!`));
  } catch (error) {
    console.error("Error loading cookies:", error);
  }
}

app.get("/", (req, res) => {
  res.json({ message: `backend running, ${res.statusCode}` });
});

app.get("/chain", async (req, res) => {
  try {
    const indexName = req.query.index;
    const symbolName = req.query.symbol;

    let resp = await nse.getOptionChain(
      indexName ?? symbolName,
      indexName ? "index" : "symbol"
    );
    console.log("indexOrSymbol :>> ", resp);
    res.json(resp);
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/symbols", async (req, res) => {
  try {
    let resp = await nse.getSymbols();
    console.log("symbols :>> ", resp);
    res.json(resp);
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Custom error handler for handling 404 errors
function notFoundHandler(req, res, next) {
  res.status(404).json({ error: "Resource not found" });
}

// Custom error handler for handling other types of errors
function errorHandler(err, req, res, next) {
  console.error("Error:", err);
  res.status(500).json({ error: "Internal Server Error" });
}

app.use(notFoundHandler);
app.use(errorHandler);

startServer();
