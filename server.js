require("dotenv").config();
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const mysql = require("mysql2");

const app = express();
const SECRET_KEY = process.env.JWT_SECRET;
const HOST = process.env.HOST;
const USER = process.env.USER;
const PASSWORD = process.env.PASSWORD;
const DATABASE = process.env.DATABASE;

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: HOST,
  user: USER,
  password: PASSWORD,
  database: DATABASE,
});

db.connect((err) => {
  if (err) throw err;
  console.log("Database connected");
});

// User Registration
app.post("/register", async (req, res) => {
  const { name, age, username, password } = req.body;

  if (!name || !age || !username || !password) {
    return res.status(400).json({ message: "All fields are required!" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  db.query(
    "INSERT INTO users (username, name, age, password) VALUES (?, ?, ?, ?)",
    [username, name, age, hashedPassword],
    (err) => {
      if (err) return res.status(500).json({ message: "User already exists!" });
      res.json({ message: "Registration successful!" });
    }
  );
});

// User Login
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE username = ?",
    [username],
    async (err, results) => {
      if (err || results.length === 0) {
        return res
          .status(401)
          .json({ message: "Invalid username or password!" });
      }

      const user = results[0];
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res
          .status(401)
          .json({ message: "Invalid username or password!" });
      }

      const token = jwt.sign({ username: user.username }, SECRET_KEY, {
        expiresIn: "1h",
      });
      res.json({ token });
    }
  );
});

// Endpoint to fetch user details based on username
app.get("/api/get-user-details", (req, res) => {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ message: "Username is required!" });
  }

  db.query(
    "SELECT name, age, score FROM users WHERE username = ?",
    [username],
    (err, results) => {
      if (err) {
        return res.status(500).json({ message: "Database error!" });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "User not found!" });
      }

      const user = results[0];
      res.json(user); // Return user details (name, age, score)
    }
  );
});

// Endpoint to get the scoreboard (all users' names and scores)
app.get("/api/get-scoreboard", (req, res) => {
  db.query(
    "SELECT name, score FROM users ORDER BY score DESC",
    (err, results) => {
      if (err) {
        return res.status(500).json({ message: "Error fetching scoreboard" });
      }

      res.json(results);
    }
  );
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
