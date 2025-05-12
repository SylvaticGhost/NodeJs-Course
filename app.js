const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const notesRouter = require("./routes/notes");
const notesApiRouter = require("./routes/notes-api");
const authRouter = require("./routes/auth");

console.log("starting app.js");
const app = express();

app.set("trust proxy", 1);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(
    cors({
        origin: "http://localhost",
        methods: ["GET", "POST", "PUT", "PATCH"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true
    })
);

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/note", notesRouter);
app.use("/api/note", notesApiRouter);
app.use("/api", authRouter);

app.use(function (req, res, next) {
    next(createError(404));
});

app.use(function (err, req, res, next) {
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};
    res.status(err.status || 500);
    res.render("error");
});

module.exports = app;
