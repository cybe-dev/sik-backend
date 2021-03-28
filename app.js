require("dotenv").config();

const express = require("express");
const app = express();
const server = require("http").Server(app);
const port = process.env.PORT || 8080;
const cors = require("cors");
const bodyParser = require("body-parser");

const auth = require("./routers/auth");
const classification = require("./routers/classification");
const transaction = require("./routers/transaction");
const monthlyBalance = require("./routers/monthly-balance");
const exportRouter = require("./routers/export");
const authentication = require("./middlewares/authentication");
const recap = require("./controllers/recap");
const stats = require("./controllers/stats");

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use("/auth", auth);
app.use("/classification", classification);
app.use("/transaction", transaction);
app.use("/export", exportRouter);
app.use("/balance", monthlyBalance);
app.get("/recap", authentication, recap);
app.get("/stats", authentication, stats);

server.listen(port);
