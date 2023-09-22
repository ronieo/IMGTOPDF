const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

// express-session 모듈 호출
const session = require("express-session");

const indexRouter = require("./routes/index");
// const usersRouter = require("./routes/users");

const app = express();

// view engine 설정
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
// express.js 미들웨어 활성화
app.use(session({ secret: "YOUR_SECRET" }));

app.use("/", indexRouter);
// app.use("/users", usersRouter);

// 404를 캐치하여 에러 핸들러에 전달
app.use(function (req, res, next) {
  next(createError(404));
});

// 에러 핸들러
app.use(function (err, req, res, next) {
  // 개발 모드의 오류만 제공하도록 로컬 설정
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // 오류가 발생시 오류 페이지 렌더링
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
