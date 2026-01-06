const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

let get_books = new Promise((resolve,reject) => {
    setTimeout(() => {
      resolve(books)
    },100)});

function getBookIsbn(isbn) {
    return new Promise((resolve, reject) => {
        const book = books[isbn];
    
        if (book) {
          resolve(book);
        } else {
          reject("Libro no encontrado");
        }
    });
}

function getBookFilter(author, title){
    return new Promise((resolve, reject) => {
        let book_filter = null;
        if(author){
            book_filter = Object.values(books)
            .filter(book => book.author === author);
        }else {
            book_filter = Object.values(books)
            .filter(book => book.title === title);
        }
        
        if (book_filter) {
          resolve(book_filter);
        } else {
          reject("Libro no encontrado");
        }
    });
  
}


public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
    if (!username){
        return res.status(404).json({message: "Username is required"});
    }
    if (!password){
        return res.status(404).json({message: "Password is required"});
    }
    // Check if both username and password are provided
    if (username && password) {
        // Check if the user does not already exist
        if (!doesExist(username)) {
            // Add the new user to the users array
            users.push({"username": username, "password": password});
            return res.status(200).json({message: "User successfully registered. Now you can login"});
        } else {
            return res.status(404).json({message: "User already exists!"});
        }
    }
    // Return error if username or password is missing
    return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
    get_books.then((books) => {
        res.send(JSON.stringify({books}, null, 4));
    });
   
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
 const isbn = req.params.isbn;
 return getBookIsbn(isbn).then(book=>res.send(JSON.stringify({book}, null, 4)))
 .catch(err=>res.status(404).json({ error: ''+err })); 
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;
  return getBookFilter(author).then(book=> res.send(JSON.stringify({book}, null, 4)))
  .catch(err=>res.status(404).json({ error: ''+err }));
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const title = req.params.title;
    return getBookFilter(null,title).then(book=> res.send(JSON.stringify({book}, null, 4)))
    .catch(err=>res.status(404).json({ error: ''+err }));
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;

    const book = books[isbn];
  
    if (!book) {
      return res.status(404).json({ error: "Libro no encontrado" });
    }
  
    return res.json(book.reviews);
});

const doesExist = (username) => {
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
module.exports.general = public_users;
