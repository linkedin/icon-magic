import * as express from "express";

const app = express();
const PORT = process.env.PORT || 9354;

app.get('/', (_req, res) => res.send('Hello World!'));

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`));

export { app };