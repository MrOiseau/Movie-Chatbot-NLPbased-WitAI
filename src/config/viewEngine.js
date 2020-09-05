const express = require('express');
/*
Config view engine for node app

This function will tell Node.js where to look for static files (images, css, js)
Set ejs as default view engine. 
Folder to save .ejs files - views
 */

let configViewEngine = (app) => {
    app.use(express.static("./src/public"));
    app.set("view engine", "ejs");
    app.set("views","./src/views");
};

//Export to use in in entry point - server.js
module.exports = configViewEngine;