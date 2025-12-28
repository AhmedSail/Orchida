// server.js
const next = require("next");
const { createServer } = require("http");

const app = next({ dev: false });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    handle(req, res);
  }).listen(3000, (err) => {
    if (err) throw err;
    console.log("🚀 Server ready on http://localhost:3000");
  });
});
