import * as express from "express";
import { Server } from "net";

const app = express();
const PORT = process.env.PORT || 9354;

app.get('/', (_req, res) => res.send('Hello World!'));

let server: Server | undefined;

function start () {
  server = app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`));
}

function stop() {
  console.log(`Stopping server on port ${PORT}.`);
  return new Promise((resolve, reject) => {
    server ? server.close((err: Error) => err ? reject(err) : resolve()) : resolve();
  }).then(() => {
    console.log(`Server stopped on port ${PORT}.`);
  });
}

export { app, start, stop };