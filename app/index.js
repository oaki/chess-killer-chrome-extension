import * as $ from "jquery";
import {$banner} from "./banner";
import {getFen} from "./chess";
import {getMoves} from "./getMoves";
import {sendNewMove} from "./socket";
import {isYourMove, stringify} from "./utils";

try {
  console.log("append banner");
  $("body").append($banner);

  let lastState = "";
  setInterval(() => {
    const moves = getMoves();
    const movesState = stringify(moves);
    if (movesState !== lastState && isYourMove(moves)) {
      console.log("New State:", movesState);
      const fenObj = getFen(moves);
      console.log("fenObj", fenObj);
      sendNewMove(fenObj.fen, fenObj.history);
      lastState = movesState;
    }
  }, 200);


} catch (err) {
  console.log(err);
}