// import {io} from "socket.io";
import {io} from "socket.io-client";
import {showResult} from "./banner";
import {PATH} from "./config";
import {isWhiteOrientation} from "./utils";

let lastKey = "";
let lastSocket = "";

export function getSocket(host, token) {
  let lastFen = "";
  if (`${host}_${token}` === lastKey) {
    return lastSocket;
  }
  const socket = io(host, {
    path: PATH,
    query: {
      token: token,
      type: "user"
    },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 99999
  });
  lastKey = `${host}_${token}`;
  lastSocket = socket;

  socket.on("connection", () => {
    console.log("Connection:", socket.id);
  });

  socket.on("disconnected", () => {
    console.log("Disconnected", socket.id);
  });

  socket.on("workerEvaluation", (result) => {
    const arr = JSON.parse(result);

    const results = arr.filter((data) => data.fen === lastFen);
    if (results && results.length > 0) {

      let str = "";
      results.forEach((multipv) => {

        if (multipv.m) {
          str += `<b style="display: inline-block; min-width:40px;"> Mate: ${multipv.mate} move, </b>`
        } else {

          str += `<b style="display: inline-block; min-width:40px;">${multipv.s}, </b>`
        }

        str += ` ${multipv.p}, depth:${multipv.d}  <br/>`;

        if (isVeryPositiveScoreForYou(multipv.s)) {
          str = `<div style="background-color: darkorange;">${str}</div>`;
        }
      });
      showResult(str);
    }
  });

  return {
    sendNewMove: function (fen, move, moves_str) {
      lastFen = fen;
      const newPosition = {
        move,
        FEN: fen,
        mode: "engine",
        multiPv: 3,
        moves: moves_str
      };
      console.log("newPosition", newPosition);
      socket.emit("setNewPosition", newPosition);
    }
  }
}

function isVeryPositiveScoreForYou(score) {
  if (isWhiteOrientation() && Number(score) > 3) {
    return true;
  }

  if (!isWhiteOrientation() && Number(score) < -3) {
    return true;
  }

  return false;
}
