// ref: http://stackoverflow.com/questions/27554707/node-js-child-spawn-stdin-stdout-exe-communication


var spawn, posProc, callback;
var resultBuffer = '';
const INFO = "info";
const NO_BEST_MOVE = "nobestmove";
const BEST_MOVE = "bestmove";
const POSITION = "position";
const UCCI = "ucci";
const IS_READY = "isready";
const GO = "go";
const STOP = "stop";

const RESTART_COMMAND = "restart-ucci";

var IN_GO_WAITING = false;

function connect(delayed) {
  if (!delayed) {
    console.log('Waiting for 3 seconds ...');
    setTimeout(connect, 3000, true);
  }
  posProc.stdin.setEncoding = 'utf-8';
  console.log('UCCI Engine started.')
}

function init() {
  console.log('In init ...', process.env.UCCI_ENGINE_LOCATION)

  spawn = require('child_process').spawn;
  posProc = spawn(process.env.UCCI_ENGINE_LOCATION, []);

  posProc.stdout.once('data', function(data) {
    var textChunk = data.toString('utf8');
    console.log('data once received from engine: ', textChunk)

  });

  posProc.on('exit', function(code) {
    console.log('Closed with code: ', code);
    init(); // Restart ...
    callback(null, 'Restarted ...');
  });

  posProc.stdout.on('data', function(data) {
    var textChunk = data.toString('utf8');
    resultBuffer += textChunk;
    console.log('Buffered message received: ', resultBuffer, textChunk);
    // 普通返回，不知道有多少行，收到即返回；很可能丢东西，即返回长短不确定。
    // 但不影响总的功能，因为不需要程序处理
    // INFO 的返回，需要一直等待bestmove...

    // 如果不是整行，则收满整行；否则，是个状态机

    var lastChar = textChunk.substring(textChunk.length - 1);

    if (lastChar !== '\n') {
      // need buffer this
      return; // 不callback，继续接
    }

    switch (true) {
      // 如果含nobestmove，则为结束
      case resultBuffer.indexOf(NO_BEST_MOVE) !== -1:
        IN_GO_WAITING = false;
        resultBuffer += textChunk;
        callback(null, resultBuffer);
        resultBuffer = ''; // 清空缓存
        break;

        // 如果含bestmove，则为结束
      case resultBuffer.indexOf(BEST_MOVE) !== -1:
        IN_GO_WAITING = false;
        resultBuffer += textChunk;
        callback(null, resultBuffer);
        resultBuffer = ''; // 清空缓存
        break;

        // 如果含INFO，则将信息buffer后继续，不callback，继续接
      case resultBuffer.indexOf(INFO) !== -1:
        resultBuffer += textChunk;
        break;

      default:
        if (!IN_GO_WAITING) {
          // 又没有bestmove,又没有info，则是其它指令，直接返回吧。
          if (callback) { // When first startup, if there is console response,
            // then callback is null. Might cause error.
            callback(null, textChunk);
          }
        } else {
          // 还是INFO的等待返回中，必须继续等
          resultBuffer += textChunk;
        }
        break;

    }

  });


  connect(false);
}


init();

function send(command, callbackFun) {
  if (command === RESTART_COMMAND) {
    IN_GO_WAITING = false;
    callbackFun(null, 'Server might be restared.')
    return;
  }
  callback = callbackFun;
  posProc.stdin.write(command + '\n');
  // console.log('callback is: ', callback)

  switch (true) {
    case command.indexOf(UCCI) !== -1:
      break;
    case command.indexOf(IS_READY) !== -1:
      break;
    case command.indexOf(GO) !== -1:
      IN_GO_WAITING = true;
      break;
    case command.indexOf(STOP) !== -1:
      // This must have an imediate bestmove response, so do not callback now.
      console.log('Calculation stops ....')
      IN_GO_WAITING = false;
      break;

    default:
      // When command with no resonpse, such as position,
      // send http response instead, to prevent forever waiting
      callback(null, "There is no reponse.");
      break;
  }
}

module.exports = {
  init: init,
  send: send
}