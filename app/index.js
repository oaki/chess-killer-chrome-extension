import * as $ from "jquery";
import {$banner} from "./banner";
import {getFen} from "./chess";
import {getMoves} from "./getMoves";
import {getSocket} from "./socket";
import {isYourMove, stringify} from "./utils";

const LOCALSTORAGE_HOST = "chess-killer_host";
const LOCALSTORAGE_TOKEN = "chess-killer_token";
try {
  let host = localStorage.getItem(LOCALSTORAGE_HOST);
  if (!host) {
    host = prompt("Please enter host", "https://api.chess-analysis.com");
  }

  let token = localStorage.getItem(LOCALSTORAGE_TOKEN);
  if (!token) {
    token = prompt("Please enter token", "");
  }

  $("body").append($banner);

  let lastState = "";

  const socket = getSocket(host, token);
  setInterval(() => {
    const moves = getMoves();
    const movesState = stringify(moves);
    if (movesState !== lastState && isYourMove(moves)) {
      console.log("New State:", movesState);
      const fenObj = getFen(moves);
      console.log("fenObj", fenObj);
      const lastMove = fenObj.history.split(" ").pop();
      socket.sendNewMove(fenObj.fen, lastMove, fenObj.history);
      lastState = movesState;
    }
  }, 200);


} catch (err) {
  console.log(err);
}