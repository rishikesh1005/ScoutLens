const dns = require("dns");

if (process.env.NODE_ENV !== "production") {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
}

const express = require("express");
const app = express();
const connectDB = require("./config/database");
const PORT = process.env.PORT || 7474;
const cookieParser = require("cookie-parser")

require('dotenv').config()

app.use(express.json());
app.use(cookieParser());

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const videoRouter = require("./routes/videoRoutes");
const playerRouter = require("./routes/playerRoutes");

app.use("/" , authRouter);
app.use("/" , profileRouter);
app.use("/" , videoRouter);
app.use("/" , playerRouter);

connectDB()
.then(() =>{
        console.log("DB connected succesfully")

        app.listen(PORT , () => {
            console.log("server is listening at port 7474")
        })
})
.catch(
    (err) => {
       console.log("DB is not connected!!!");
       console.error(err);
    } 
)
