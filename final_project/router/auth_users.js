const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
  // Filter the users array for any user with the same username
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    // Return true if any user with the same username is found, otherwise false
    if (userswithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
}

const authenticatedUser = (username,password)=>{ //returns boolean
  // Filter the users array for any user with the same username and password
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    // Return true if any valid user is found, otherwise false
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
    const password = req.body.password;
    // Check if username or password is missing
    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }
    // Authenticate user
    if (authenticatedUser(username, password)) {
        // Generate JWT access token
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });
        // Store access token and username in session
        req.session.authorization = {
            accessToken, username
        }
        req.session.username = username;
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review;
    const username = req.session.username;
    if (!review || !username) {
        return res.json({ message: "Body Empty" });
      }
    
      if (!books[isbn]) {
        return res.status(404).json({ error: "Libro no encontrado" });
      }

      books[isbn].reviews[username] = review;

  return res.json({
    message: "Reseña agregada/modificada correctamente",
    reviews: books[isbn].reviews
  });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
  const username = req.session.username;

  // Validación obligatoria del lab
  if (!username) {
    return res.json({ message: "Body Empty." });
  }

  // Validar que el libro exista
  if (!books[isbn]) {
    return res.status(404).json({ error: "Libro no encontrado" });
  }

  // Validar que el usuario tenga reseña
  if (!books[isbn].reviews[username]) {
    return res.status(404).json({
      message: "No existe una reseña de este usuario para este libro"
    });
  }

  // Eliminar SOLO la reseña del usuario en sesión
  delete books[isbn].reviews[username];

  return res.json({
    message: "Review deleted successfully"
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
