import * as $ from "jquery";
import {$banner} from "./banner";
import {getFen} from "./chess";
import {getMoves} from "./getMoves";
import {getSocket} from "./socket";
import {stringify} from "./utils";

const LOCALSTORAGE_HOST = "chess-killer_host";
const LOCALSTORAGE_TOKEN = "chess-killer_token";
const LOCALSTORAGE_MULTI_PV = "chess-killer_multi_pv";
try {
  let host = localStorage.getItem(LOCALSTORAGE_HOST);
  if (!host) {
    host = prompt("Please enter host", "https://api.chess-analysis.com");
    localStorage.setItem(LOCALSTORAGE_HOST, host);
  }

  let token = localStorage.getItem(LOCALSTORAGE_TOKEN);
  if (!token) {
    token = prompt("Please enter token", "");
    localStorage.setItem(LOCALSTORAGE_TOKEN, token);
  }

  let multiPv = localStorage.getItem(LOCALSTORAGE_MULTI_PV);
  if (!multiPv) {
    multiPv = prompt("Please enter multiPv", "1");
    localStorage.setItem(LOCALSTORAGE_MULTI_PV, multiPv);
  }

  $("body").append($banner);

  let lastState = "";

  const socket = getSocket(host, token, multiPv);
  setInterval(() => {
    const moves = getMoves();
    const movesState = stringify(moves);
    if (movesState !== lastState /* && isYourMove(moves) */) {
      // console.log("New State:", movesState);
      const fenObj = getFen(moves);
      // console.log("fenObj", fenObj);
      const lastMove = fenObj.history.split(" ").pop();
      socket.sendNewMove(fenObj.fen, lastMove, fenObj.history);
      lastState = movesState;
    }
  }, 20);


} catch (err) {
  console.log(err);
}