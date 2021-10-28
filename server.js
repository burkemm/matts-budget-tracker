const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");
const compression = require("compression");
require ("dotenv").config()

// Changing this to process the environment port, or 3000 if nothing is listed.
const PORT = (process.env.port || 5001);

const app = express();

app.use(logger("dev"));

app.use(compression());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"));

mongoose.connect(
  // This has mongoose connect to the process environment mongo DB URI or mongodb://localhost/budget if no URI exists.
  process.env.MONGODB_URI || "mongodb://localhost/budget", 
  {
    // Adding useUnifiedTopoly to constantly test the status of the connection.
    // Adding useCreateIndex to ensure there is an index, and if one doesn't exist, then one will be created.
    useUnifiedTopology: true,
    useCreateIndex: true,
    useNewUrlParser: true,
    useFindAndModify: false
  }
);


// routes
app.use(require("./routes/api.js"));

app.listen(PORT, () => {
  console.log(`App running on port ${PORT}!`);
});