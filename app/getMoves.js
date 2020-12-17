import * as $ from "jquery";

export function getMoves() {
  const moves = $("u8t");

  const newMoves = [];

  moves.each((index, el) => {
    let move = el.innerText;
    move = move.replace("х", "x");
    newMoves.push(move);
  });
  return newMoves;
}