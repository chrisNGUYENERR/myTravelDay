const express = require("express");
const app = express();
const session = require("express-session");
const cookieParser = require("cookie-parser");
const es6Renderer = require("express-es6-template-engine");
const axios = require("axios");
const pgp = require("pg-promise")();
const cn = {
  host: "ec2-18-204-142-254.compute-1.amazonaws.com",
  port: 5432,
  database: "db5s64ngf57vv2",
  user: "tgdddrapevzbcr",
  password: "2ba4e48d7f53370170370b991078555b93bc9bd0f2e83fe63d07f1f5b3fe9ab0",
  ssl: { rejectUnauthorized: false },
};
const db = pgp(cn);
const bcrypt = require("bcrypt");
const PORT = 4320;

app.engine("html", es6Renderer);
app.set("views", "templates");
app.set("view engine", "html");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  console.log(`Path: ${req.path}`);
  next();
});

app.use(cookieParser());
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
      maxAge: 2592000,
    },
  })
);

//GET TABLES
app.get("/getusertodos/", async (req, res) => {
  try {
    let { username } = req.session.user[0];
    let flightInfo = await db.any(
      `SELECT users.username, flightinfo.airline, flightinfo.dep_time, flightinfo.dep_port, flightinfo.arr_port, flightinfo.arr_gate FROM users LEFT JOIN flightinfo ON users.id = flightinfo.user_id WHERE users.username = '${username}'`
    );
    let response = await db.any(
      `SELECT users.username, tasks.todo FROM users LEFT JOIN tasks ON users.id = tasks.user_id WHERE users.username = '${username}'`
    );
    res.render("userTodos", {
      locals: {
        data: response,
        flight: flightInfo,
      },
      partials: {
        bootstrap: "./templates/partials/bootstrap.html",
        styles: "./templates/partials/styles.html",
      },
    });
  } catch (error) {
    res.send({
      error,
      msg: "Failed to retrieve user and todos",
    });
  }
});

//LOGIN
app.get("/login", (req, res) => {
  res.render("login", {
    locals: {
      error: null,
    },
    partials: {
      bootstrap: "./templates/partials/bootstrap.html",
      styles: "./templates/partials/styles.html",
    },
  });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  db.any(
    `SELECT username, password FROM users WHERE username = '${username}'`
  ).then((data) => {
    bcrypt.compare(password, data[0].password, (err, match) => {
      if (match) {
        req.session.user = data;
        res.redirect(`/addflightinfo`);
      } else {
        res.render("login", {
          locals: {
            error: "Incorrect username or password",
          },
          partials: {
            bootstrap: "./templates/partials/bootstrap.html",
          },
        });
      }
    });
  });
});

//REGISTER
app.get("/register", (req, res) => {
  res.render("register", {
    locals: {
      error: null,
    },
    partials: {
      bootstrap: "./templates/partials/bootstrap.html",
      styles: "./templates/partials/styles.html",
    },
  });
});

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  bcrypt.hash(password, 10, (err, hash) => {
    db.none(`INSERT INTO users (username, password) VALUES ($1, $2)`, [
      username,
      hash,
    ]).then((result) => {
      return res.redirect("/login");
    });
  });
});

//ADD USERS + TASKS
app.post("/insertuser", (req, res) => {
  const { name } = req.body;
  db.none(`INSERT INTO users (name) VALUES ($1)`, [name]);
  console.log(req.body);
  res.send(req.body);
});

app.post("/inserttask", async (req, res) => {
  const { todo } = req.body;
  let { username } = req.session.user[0];
  let user_id = await db.any(
    `SELECT id FROM users WHERE username = '${username}'`
  );
  await db.none(`INSERT INTO tasks (todo, user_id) VALUES ($1, $2)`, [
    todo,
    user_id[0].id,
  ]);
  res.redirect("/getusertodos");
});

//DELETE USERS + TASKS
app.delete("/deleteuser", (req, res) => {
  const { name } = req.body;
  db.none(`DELETE FROM users WHERE name = '${name}'`);
  res.send(req.body);
});

app.delete("/deletetask", (req, res) => {
  const { todo } = req.body;
  db.none(`DELETE FROM tasks WHERE todo = '${todo}'`);
  res.send(req.body);
});

//FETCH API
app.get("/addflightinfo", (req, res) => {
  res.render("flightinfo", {
    locals: {
      error: null,
    },
    partials: {
      bootstrap: "./templates/partials/bootstrap.html",
      styles: "./templates/partials/styles.html",
    },
  });
});

app.post("/addflightinfo", async (req, res) => {
  const { flightNumber } = req.body;
  const params = {
    access_key: "100cc2dce35bc5f107fb190518b0a281",
    flight_iata: `${flightNumber}`,
  };
  await axios
    .get("http://api.aviationstack.com/v1/flights?", { params })
    .then((response) => {
      req.session.api = response.data.data[0];
    });
  let { username } = req.session.user[0];
  let user_id = await db.any(
    `SELECT id FROM users WHERE username = '${username}'`
  );
  let { airline, departure, arrival } = req.session.api;
  db.none(
    `INSERT INTO flightinfo (airline, dep_time, dep_port, arr_port, arr_gate, user_id) VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      `${airline.name}`,
      `${departure.scheduled}`,
      `${departure.airport}`,
      `${arrival.airport}`,
      `${arrival.gate}`,
      user_id[0].id,
    ]
  );
  res.redirect("/getusertodos");
});

app.listen(PORT, () => {
  console.log("Server listening on port " + PORT);
});
