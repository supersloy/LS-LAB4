import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import fs from "fs-extra";

dotenv.config();

type History = {
  requests: { time: Date }[];
};

const app: Express = express();
const port = process.env.PORT || 8080;
const HISTORY_PATH = "./data/history.json";

async function updateHistory() {
  const now = new Date();
  // If file does not exist
  await fs.ensureFile(HISTORY_PATH);
  const data = await fs.readFile(HISTORY_PATH, "utf8");
  if (data === "")
    await fs.writeJson(HISTORY_PATH, {
      requests: [],
    });

  const history: History = await fs
    .readJSON(HISTORY_PATH)
    .catch((e) => console.log(e));
  history.requests.push({ time: now });
  fs.writeJson(HISTORY_PATH, history, (err) => {
    if (err) return console.error(err);
    console.log("History updated");
  });
}

app.get("/", async (req: Request, res: Response) => {
  await updateHistory();
  res.send("HELLO\n There are different endpoints: \n/cats \n/history");
});

app.get("/cats", async (req: Request, res: Response) => {
  const url = `https://api.thecatapi.com/v1/images/search?limit=${
    process.env.CATS || "5"
  }`;
  const api_key = process.env.API_KEY || "";
  const headers = new Headers({ "x-api-key": api_key });
  let response = await fetch(url, { method: "GET", headers: headers })
    .then((res) => res.json())
    .catch((err) => console.log(err));
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

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running with port: ${port}`);
});
