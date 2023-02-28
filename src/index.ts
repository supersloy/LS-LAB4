import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import fs from "fs-extra";

dotenv.config();

type History = {
  requests: { time: Date }[];
};
const app: Express = express();
const port = process.env.PORT || 8000;

async function updateHistory() {
  const now = new Date();
  const history: History = await fs
    .readJSON("./dist/data/history.json")
    .catch((e) => console.log(e));
  history.requests.push({ time: now });
  fs.writeJson("./data/history.json", history, (err) => {
    if (err) return console.error(err);
    console.log("History updated");
  });
}

app.get("/", async (req: Request, res: Response) => {
  await updateHistory();
  res.send(
    "HELLO\n There are different endpoints: \n/cats \n/history \npersistent"
  );
});

app.get("/cats", async (req: Request, res: Response) => {
  const url = `https://api.thecatapi.com/v1/images/search?limit=${
    process.env.CATS || 5
  }`;
  const api_key =
    "live_KtwzGVvDOb0rXC8qjaBMwAWjZBB9MXeoExVND18gzVPSLky2ZhSSo1slBxAgJ7Cu";
  const headers = new Headers({ "x-api-key": api_key });
  let response = await fetch(url, { method: "GET", headers: headers }).then(
    (res) => res.json()
  );
  await updateHistory();

  res.send(response);
});

app.get("/history", async (req: Request, res: Response) => {
  const history = await fs
    .readJSON("./data/history.json")
    .then((object) => object.requests)
    .catch((e) => console.log(e));
  res.send(history);
});

app.get("/persistent", async (req: Request, res: Response) => {
  await updateHistory();
  const persistentInfo = await fs
    .readJSON("./data/persistent.json")
    .catch((e) => console.log(e));
  res.send(persistentInfo);
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://HOST:${port}`);
});
