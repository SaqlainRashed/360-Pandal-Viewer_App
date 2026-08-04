const express = require('express');
const app = express();
const path = require('path');

const publicDir = path.resolve(__dirname, 'public');
const threeDir = path.resolve(__dirname, 'node_modules/three/build');
const jsmDir = path.resolve(__dirname, 'node_modules/three/examples/jsm');

app.use(express.static(publicDir, { dotfiles: 'deny', fallthrough: false }));
app.use('/build/', express.static(threeDir, { dotfiles: 'deny', fallthrough: false }));
app.use('/jsm/', express.static(jsmDir, { dotfiles: 'deny', fallthrough: false }));

app.use((err, req, res, next) => {
  if (err) {
    res.status(403).send('Forbidden');
  } else {
    next();
  }
});

app.listen(3000, () =>{
    console.log("visit http://127.0.0.1:3000");
});