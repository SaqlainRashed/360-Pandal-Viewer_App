const express = require('express');
const app = express();
const path = require('path');
app.use(express.urlencoded({ extended: false }));
const csrf = require('csrf');
const tokens = new csrf();
const secret = tokens.secretSync();

// CSRF middleware: attach a token to every response and validate on state-changing requests
app.use((req, res, next) => {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        res.locals.csrfToken = tokens.create(secret);
        return next();
    }
    const token = (req.body && req.body._csrf) || req.headers['x-csrf-token'];
    if (!tokens.verify(secret, token)) {
        return res.status(403).send('Invalid CSRF token');
    }
    next();
});

app.use(express.static(path.join(__dirname, 'public'), {
    dotfiles: 'ignore',
    index: false,
    fallthrough: false
}));
app.use('/build/', express.static(path.join(__dirname, 'node_modules/three/build')));
app.use('/jsm/', express.static(path.join(__dirname, 'node_modules/three/examples/jsm')));

app.listen(3000, () =>{
    console.log("visit https://127.0.0.1:3000 (or configure HTTPS in production)");
});