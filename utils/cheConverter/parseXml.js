// From: https://www.npmjs.com/package/xml2js


var fs = require('fs'),
  xml2js = require('xml2js'),
  _ = require('underscore'),
  moment = require('moment');


function processBoards() {
  // 测试
  // var boardsInfoFile = __dirname + '/data/fupanSaveInfo_new';

  // 实用
  var boardsInfoFile = __dirname + '/weekly-data/fupanSaveInfo_new';

  var parser = new xml2js.Parser();


  fs.readFile(boardsInfoFile, function(err, data) {
    parser.parseString(data, function(err, result) {
      console.dir(result);
      extractBoards(result);
    });
  });
}


// 测试
processBoards()

function extractBoards(boardsData) {
  var boards = [];

  var boardContents = boardsData.plist.dict[0];
  for (var i = 0; i < boardContents.key.length; i++) {

    var myNameIndex = _.indexOf(boardContents.dict[i].key, 'MY_NAME');
    var myName = boardContents.dict[i].string[myNameIndex];

    var otherNameIndex = _.indexOf(boardContents.dict[i].key, 'OTHER_NAME');
    var otherName = boardContents.dict[i].string[otherNameIndex];

    var timeIndex = _.indexOf(boardContents.dict[i].key, 'TIME');
    var time = boardContents.dict[i].string[timeIndex];

    var resultStateIndex = _.indexOf(boardContents.dict[i].key, 'RESULT_STATE');
    var resultState = boardContents.dict[i].string[resultStateIndex];

    var stepCountIndex = _.indexOf(boardContents.dict[i].key, 'STEPCONUT');
    var stepCount = boardContents.dict[i].string[stepCountIndex];

    var myLevelIndex = _.indexOf(boardContents.dict[i].key, 'MY_LV');
    var myLevel = boardContents.dict[i].string[myLevelIndex];

    var otherLevelIndex = _.indexOf(boardContents.dict[i].key, 'OTHER_LV');
    var ohterLevel = boardContents.dict[i].string[otherLevelIndex];

    var chessColorIndex = _.indexOf(boardContents.dict[i].key, 'CHESS_COLOR');
    var chessColor = boardContents.dict[i].string[chessColorIndex];

    var boardTime = moment.utc(time * 1000).add(8, 'hours')

    var title = getTitle(myName, myLevel, otherName, ohterLevel, chessColor, resultState)
    //   console.log('title is: ', title, 'time is:', boardTime.format('YYYY-MM-DD hh:mm:ss'), 'content file is: ', boardContents.key[i])

    if (boardContents.key[i] == '86a922cf8d8f2561206053e3563959dc') {
      console.log('title is: ', title)
    }
    var board = {
      board_title: title,
      board_time: boardTime.format('YYYY-MM-DD HH:mm:ss'),
      board_site: '天天',
      board_red: myName,
      board_black: otherName,
      $board_comment_type: 'textarea',
      board_comment: '',
      board_content: '',
      board_content_file: boardContents.key[i],
      tags: '',
      published: true,
      steps: stepCount
    }

    generateDpMovesList(board, function(thisBoard, moveList) {
      if (moveList.length !== 0) {
        console.log('now move list: ', moveList)
        var indexOfNan = moveList.indexOf('NaN');
        if (indexOfNan > 0) {
          moveList = moveList.substring(0, indexOfNan);
        }
        console.log('after process,  move list: ', moveList)

        thisBoard.board_content = moveList;
        var json = JSON.stringify(thisBoard);
        // 有时，有乱尾；可能是由于注释造成


        fs.writeFile('output/' + thisBoard.board_content_file + ".js", json, 'utf8');
      }
    }); // Write out .js file for CMS

  }





}

function generateDpMovesList(board, callback) {
  // console.log('che file is: ', cheFile)
  var cheFile = board.board_content_file;
  var chePath = __dirname + '/weekly-data/savefupan_new/'
  // cheFile = 'data/86a922cf8d8f2561206053e3563959dc' // 测试
  cheFile = chePath + cheFile
  var moveList = '';
  fs.readFile(cheFile, "utf8", function(err, data) {
    // console.log('fileContent is: ', data)
    if (!err) {
      moveList = parseChe(data);
    }

    callback(board, moveList);
  });

}

function parseChe(data) {
  var moves = data.split(' ')
  var movesList = ''
  moves.splice(0, 3);

  var repeats = Math.floor(moves.length / 10)
  var remainder = moves.length % 10
  for (var i = 0; i < repeats; i++) {
    // 32 1 3 8 3 5 0 1 0 -1
    // 32 1 10 8 8 7 0 2 0 -1  -> 7062
    // 3 8 3 5  -> 炮二平五  -> -> 7747
    // 10 8 8 7 ->  马8进7 -> 7062
    var from = convertTt2Dp(moves[10 * i + 2], moves[10 * i + 3]);
    var to = convertTt2Dp(moves[10 * i + 4], moves[10 * i + 5])
    movesList += from.x.toString() + from.y.toString() + to.x.toString() + to.y.toString();

  }
  return movesList;
}


function convertTt2Dp(y, x) {
  // console.log('now x,y : ', x, y)
  // 天天中，坐标为从下左到上右，下左角为(1,1)，左下角为 ( 9   , 10)
  // 这个好像是评测中的存储，对于个人对局，即与电脑对局，还有另一个存储
  // 坐标为从右上到左下，右上角为(3,3)，左下角为 ( 11   , 12)
  // 东萍中，坐标为左上到右下，(0,0) -> (8,9)
  //   // 3 8 3 5  -> 炮二平五    -> 7 7 4 7

  var x1, y1;
  y1 = 9 - y + 1;
  x1 = x - 1;
  if (x1 < 0 || y1 < 0) {
    console.log(' now ... x,y is: ', x, y)
  }
  return {
    x: x1,
    y: y1
  };

}

function getTitle(myName, myLevel, otherName, ohterLevel, chessColor, resultState) {
  var result;
  switch (resultState) {
    case '0':
      result = '胜';
      break;
    case '1':
      result = '负';
      break;

    case '2':
      result = '和'
      break;

    default:
      result = '不知' + resultState + '道'
      break;
  }

  var pos = ''
  if (chessColor == '0') {
    pos = '先'
  } else {
    pos = '后'
  }

  return myName + '[' + getLevel(myLevel) + ']' + pos + result + otherName + '[' + getLevel(ohterLevel) + ']'
}


function getLevel(levelNumber) {
  var level = ''
  var x = parseInt(levelNumber);
  switch (true) {
    case (x < 240):
      level = '小于业5-1';
      break;
    case (x >= 244 && x < 290):
      level = '业5-1';
      break;
    case (x >= 290 && x < 340):
      level = '业5-2';
      break;
    case (x >= 340 && x < 400):
      level = '业5-3';
      break;
    case (x >= 400 && x < 460):
      level = '业6-1';
      break;
    case (x >= 460 && x < 530):
      level = '业6-2';
      break;
    case (x >= 530 && x < 600):
      level = '业6-3';
      break;
    case (x >= 600 && x < 680):
      level = '业7-1';
      break;
    case (x >= 680 && x < 760):
      level = '业7-2';
      break;
    case (x >= 760 && x < 850):
      level = '业7-3';
      break;
    case (x >= 850 && x < 960):
      level = '业8-1';
      break;
    case (x >= 960 && x < 1080):
      level = '业8-2';
      break;
    case (x >= 1080 && x < 1200):
      level = '业8-3';
      break;
    case (x >= 1200 && x < 2000):
      level = '业9-1';
      break;
    case (x >= 2000 && x < 3000):
      level = '业9-2';
      break;
    case (x >= 3000 && x < 1000000):
      level = '业9-3';
      break;
    default:
      level = "未知级别";
      break;
  }

  return level;
}
