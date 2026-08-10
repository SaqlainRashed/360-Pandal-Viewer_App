const express = require('express');
const app = express();
const path = require('path');

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