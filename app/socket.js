import * as io from "socket.io-client";
import {showResult} from "./banner";
import {HOST} from "./config";
import {parseResult} from "./parse";
import {isWhiteOrientation} from "./utils";

let lastFen = "";
export const socket = io.connect(HOST);

socket.on("connection", () => {
  console.log("Connection:", socket.id);
});

socket.on("disconnected", () => {
  console.log("Disconnected", socket.id);
});

socket.on("on_result", (obj) => {
  if (obj.fen !== lastFen) {
    return;
  }
  // console.log(obj.fen);
  // console.log(obj.data);
  const result = parseResult(obj.data, obj.fen);

  if (result) {

    let str = "";
    result.forEach((multipv, index) => {

      if (multipv.mate) {
        str += `<b style="display: inline-block; min-width:40px;"> Mate: ${multipv.mate} move, </b>`
      } else {

        str += `<b style="display: inline-block; min-width:40px;">${multipv.score}, </b>`
      }

      // str += ` ${index + 1}. `;
      str += ` ${multipv.pv}, depth:${multipv.depth}  <br/>`;

      if (isVeryPositiveScoreForYou(multipv.score)) {
        str = `<div style="background-color: darkorange;">${str}</div>`;
      }
    });
    showResult(str);
  }
})

function isVeryPositiveScoreForYou(score) {
  if (isWhiteOrientation() && Number(score) > 3) {
    return true;
  }

  if (!isWhiteOrientation() && Number(score) < -3) {
    return true;
  }

  return false;
}

export function sendNewMove(fen, moves_str) {
  lastFen = fen;
  socket.emit("new_move", {
    FEN: fen,
    position: moves_str
  });
}