const express = require('express');

const app = express();
const port = 5000;

app.get('/', (res, req) =>
   req.send('Hello'))

app.listen(port)

console.log(`[app]: http://localhost:${port}`)
