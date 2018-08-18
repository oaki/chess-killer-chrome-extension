import * as $ from "jquery";
import * as io from "socket.io-client";
const Chess = require('chess.js');
// const HOST = 'https://chess-analysis.ddns.net:5000/';
const HOST = 'https://localhost:5000/';
const MULTI_VP = 3;
const $banner = $('<div style="position: absolute;top:0;left:0;background-color: beige;"></div>');

console.log('Loading...');
const socket = io.connect(HOST);

const showResult = (text) => {
  $banner.html(text);
};

const getMoves = () => {
  return $('.moves').find('move');
};


function pairValues(name, str) {
  const tmp = str.split(' ');

  const namePosition = tmp.indexOf(name);

  // for(let i = 0; i< tmp.length; i+=2){
  //     result[tmp[i]] = tmp[i+1];
  // }
  if (namePosition === -1) {
    return false;
  }

  if (name === 'pv') {
    const tmpArr = tmp.splice(namePosition + 1);
    return tmpArr.join(" ");
  }
  return tmp[namePosition + 1];

}

function parseLine(lineStr) {
  const mate = pairValues('mate', lineStr);
  const score = parseFloat(pairValues('cp', lineStr)) / 100;
  const depth = pairValues('depth', lineStr);
  const pv = pairValues('pv', lineStr);
  const multipv = pairValues('multipv', lineStr);

  return {
    mate,
    score,
    depth,
    pv,
    multipv
  }
}


const parseResult = (result, fen) => {

  if (result.indexOf('info') === -1) {
    return false;
  }
  let lines = result.split('\n');
  lines = lines.filter((line) => line.indexOf('info') !== -1 && line.indexOf('pv') !== -1);
  if (lines.length < 1) {
    return false;
  }

  let output = [];

  lines.forEach((line) => {
    const r = parseLine(line);
    output[parseInt(r.multipv) - 1] = r;
  });

  return output;
}


const parseResultOld = (result, fen) => {

  if (result.indexOf('info') === -1) {
    return false;
  }
  let lines = result.split('\n');
  lines = lines.filter((line) => result.indexOf('info') !== -1);
  if (lines.length < 1) {
    return false;
  }


  lines.forEach((line) => {
    const r = parseLine(line);
    console.log(r);
  });

  const tmp = result.split(' pv ');
  if (tmp.length < 2) {
    return false;
  }
  const l = tmp.length;
  const bestconstiantLine = tmp[l - 2];

  if (bestconstiantLine) {
    const bestconstiantWithDepthArr = bestconstiantLine.split('info ');
    const bestconstiant = bestconstiantWithDepthArr[0];
    const info = bestconstiantWithDepthArr[1];
    const mate = pairValues('mate', info);
    const score = parseFloat(pairValues('cp', info)) / 100;
    const depth = pairValues('depth', info);
    const moves = bestconstiant.split(' ');
    const chessNewconstiant = new Chess(fen);

    $.each(moves, (index, move) => {
      if (move !== '') {
        const from = move.substr(0, 2);
        const to = move.substr(2, 4);

        chessNewconstiant.move({
          from,
          to
        });
      }

    });

    const fullPGN = chessNewconstiant.pgn({newline_char: "__SEP__"});
    const notation = fullPGN.split("__SEP__");

    let result = '';
    if (mate) {
      result += `mate: ${mate} `;
    } else {
      result += `score: ${score} `;
    }
    result += `${notation[3]}, depth: ${depth}`;
    showResult(result);
  }
}

socket.on('on_result', (obj) => {
  console.log(obj.fen);
  console.log(obj.data);
  const result = parseResult(obj.data, obj.fen);

  if (result) {

    let str = '';
    result.forEach((multipv, index) => {

      if (multipv.mate) {
        str += `<b style="display: inline-block; min-width:40px;"> Mate: ${multipv.mate} move, </b>`
      } else {
        str += `<b style="display: inline-block; min-width:40px;">${multipv.score}, </b>`
      }

      // str += ` ${index + 1}. `;
      str += ` ${multipv.pv}, depth:${multipv.depth}  <br/>`;

    });
    showResult(str);
  }

})


try {
  $('body').append($banner);

  const init = () => {
    const chess = new Chess();

    getMoves().each((index, el) => {
      let move = el.innerText;
      move = move.replace('х', 'x');
      chess.move(move);
    });

    let fen = chess.fen();

    console.log(['-----------------------']);
    console.log(['-------Init----------']);
    console.log(['-----------------------']);
    console.log(chess.ascii());
    console.log(chess.pgn());

    socket.emit('new_move', {FEN: fen});
  };


  setTimeout(()=>{
    const target = document.querySelector('.moves');

    if (target) {
      // create an observer instance
      const observer = new MutationObserver(function (mutations) {
        init();
      });

      // configuration of the observer:
      const config = {attributes: false, childList: true, characterData: false}

      // pass in the target node, as well as the observer options
      observer.observe(target, config);
    }
  },2000)


} catch (err) {
  console.log(err);
}