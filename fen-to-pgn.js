var fenToData = function (fen) {
  if (!fen)
    return;
  try {
    var fields = fen.split(' ');
    return {
      place: fields[0].replace(/[1-8]/g, n => ' '.repeat(n)).split('/'),
      color: fields[1],
      fullMoveNumber: +fields[5]
    };
  } catch (err) {
    throw new Error('Wrong fen:' + fen + '\nError:' + err);
  }
};
var fenToPgn = function (fens) {
  if (fens?.constructor !== Array)
    throw new Error('fens is not Array');
  if (fens.length < 2)
    return '';
  var pgn = fens[0] === 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1' ? '' : `[SetUp "1"]\n[FEN "${fens[0]}"]\n`;
  var previous = fenToData(fens.shift()), current;
  pgn += previous.fullMoveNumber + '.' + (previous.color === 'b' ? '.. ' : '');
  while (current = fenToData(fens.shift())) {
    var removes = {}, adds = {};
    for (var r = 0; r < 8; r++) {
      for (var f = 0; f < 8; f++) {
        if (previous.place[r][f] === current.place[r][f])
          continue;
        if (previous.place[r][f] !== ' ')
          removes[previous.place[r][f]] = {r, f};
        if (current.place[r][f] !== ' ')
          adds[current.place[r][f]] = {r, f};
      }
    }
    var pieces = Object.keys(adds), pieceName = pieces[0].toUpperCase(), capture = Object.keys(removes).length === 2;
    if (pieces.length === 2) {
      pgn += 'O-O' + ((adds['k'] || adds['K']).f === 1 ? '-O' : '');
    } else {
      var to;
      if (pieceName === 'P' || !removes[pieces[0]]) {
        to = capture ? 'abcdefgh'[(removes[pieces[0]] || removes[previous.color === 'w' ? 'P': 'p']).f] : '';
      } else {
        to = pieceName + 'abcdefgh'[removes[pieces[0]].f] + '87654321'[removes[pieces[0]].r];
      }
      pgn += to + (capture ? 'x' : '') + 'abcdefgh'[adds[pieces[0]].f] + '87654321'[adds[pieces[0]].r] + (removes[pieces[0]] ? '' : '=' + pieceName);
    }
    pgn += previous.fullMoveNumber === current.fullMoveNumber ? ' ' : '\n' + (fens.length ? current.fullMoveNumber + '.' : '');
    previous = current;
  }
  return pgn;
};
