"use strict";

const express = require("express");
const favicon = require("serve-favicon");
const bodyParser = require("body-parser");
const session = require("express-session");
// const csrf = require("csurf");
const nunjucks = require("nunjucks");
// const helmet = require("helmet");
const MongoClient = require("mongodb").MongoClient;
const http = require("http");
// const marked = require("marked");
// const nosniff = require("dont-sniff-mimetype");

const app = express();
const routes = require("./app/routes");
const { port, db, cookieSecret } = require("./config/config");

/*
// Fix for A6 - Sensitive Data Exposure
// Load keys for establishing secure HTTPS connection
const fs = require("fs");
const https = require("https");
const path = require("path");

const httpsOptions = {
    key: fs.readFileSync(
        path.resolve(__dirname, "./artifacts/cert/server.key")
    ),
    cert: fs.readFileSync(
        path.resolve(__dirname, "./artifacts/cert/server.crt")
    )
};
*/

// Configure Swig templates.
// Automatic HTML escaping helps reduce XSS risk.
// swig.setDefaults({
//     autoescape: true
// });

// MongoDB connection
MongoClient.connect(db, (err, client) => {
    if (err) {
        console.log("Error: DB: connect");
        console.log(err);
        process.exit(1);
    }

    console.log("Connected to the database");

    // Get the database object from the MongoDB client.
    const database = client.db();

    /*
    // Fix for A5 - Security Misconfiguration
    // TODO: Review the rest of helmet options, like "xssFilter"
    // Remove default x-powered-by response header
    app.disable("x-powered-by");

    // Prevent opening page in frame or iframe to protect from clickjacking
    app.use(helmet.frameguard());

    // Prevents browser from caching and storing page
    app.use(helmet.noCache());

    // Allow loading resources only from white-listed domains
    app.use(helmet.contentSecurityPolicy());

    // Allow communication only on HTTPS
    app.use(helmet.hsts());

    // Enable XSS filter in IE (legacy option)
    // app.use(helmet.iexss());
    // app.use(helmet.xssFilter({ setOnOldIE: true }));

    // Force browsers to use the declared Content-Type
    app.use(nosniff());
    */

    // Add the favicon.
    app.use(favicon(__dirname + "/app/assets/favicon.ico"));

    // Express middleware to populate req.body.
    app.use(bodyParser.json());

    app.use(bodyParser.urlencoded({
        // Mandatory in Express 4.
        extended: false
    }));

    // Enable session management.
    app.use(session({
        secret: cookieSecret,
        saveUninitialized: true,
        resave: true

        /*
        // Fix for A5 - Security Misconfiguration
        // Use generic cookie name
        key: "sessionId",
        */

        /*
        // Fix for A3 - XSS
        // TODO: Add maxAge
        cookie: {
            httpOnly: true
            // Remember to start an HTTPS server to get this working
            // secure: true
        }
        */
    }));

    /*
    // Fix for A8 - CSRF
    // Enable Express CSRF protection
    app.use(csrf());

    // Make CSRF token available in templates
    app.use((req, res, next) => {
        res.locals.csrftoken = req.csrfToken();
        next();
    });
    */

    // Register the Swig templating engine with Express.
    // app.engine(".html", consolidate.swig);
    // app.set("view engine", "html");
    // app.set("views", `${__dirname}/app/views`);

    // Configure Nunjucks with automatic HTML escaping.
nunjucks.configure(`${__dirname}/app/views`, {
    autoescape: true,
    express: app
});

// Register Nunjucks as the HTML template engine.
app.engine("html", nunjucks.render);
app.set("view engine", "html");
app.set("views", `${__dirname}/app/views`);

    // Fix for A5 - Security Misconfiguration
    // TODO: Make sure assets are declared before app.use(session())
    app.use(express.static(`${__dirname}/app/assets`));

    /*
    // Initializing marked library
    // Fix for A9 - Insecure Dependencies
    // marked.setOptions({
    //     sanitize: true
    // });
    // app.locals.marked = marked;
    */

    // Application routes.
    // Pass the database object, not the MongoClient.
    routes(app, database);

    // Start the HTTP server.
    http.createServer(app).listen(port, () => {
        console.log(`Express HTTP server listening on port ${port}`);
    });

    /*
    // Fix for A6 - Sensitive Data Exposure
    // Use secure HTTPS protocol
    https.createServer(httpsOptions, app).listen(port, () => {
        console.log(`Express HTTPS server listening on port ${port}`);
    });
    */
});
