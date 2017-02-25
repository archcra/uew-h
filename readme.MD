uew-h -> UCCI Engine Wrapper with HTTP 
一个简单的UCCI 引擎的HTTP封装。
=====


这个实际上是跨平台的，客户端使用HTTP Post调用即可。

# 配置参数：
使用文件.env来配置参数， 内容如下：
```
UCCI_ENGINE_LOCATION=/Users/papa/ucci/eleeye/eleeye/ELEEYE.EXE
SERVER_PORT=3000
```
前者是引擎的可执行文件位置；

第二个参数是服务的HTTP端口号。

注：经本人测试，使用旋风引擎（cyclone）的速度快，棋力强。尤其旋风可以发挥服务器的潜能，有配置好的服务器，
其棋力应该会更强。当然，对于这个引擎的参数配置我也不熟悉，所以目前其棋力（我测试的是4.0版本），我尚不清楚。
只是粗略地测试，在天天象棋上，应强于业6。应该具有职业棋手的水平。

# 使用方法:
本人使用的是Angular调用，参考代码如下：
```
(function() {
  'use strict';

  angular.module('pep.services')
    .service('engineService', engineService);

  engineService.$inject = ['$http', '$q'];

  function engineService($http, $q) {

    var factory = {
      restart: restart,
      init: init,
      isReady: isReady,
      getBestMove: getBestMove,
      setStyle: setStyle,
      setHash: setHash,
      stop: stop
    };


    var commandId = "";

    function restart(callback) {
      callEngine('restart-ucci', function(error, data) {
        // No such command for ucci speficication,
        // now can cause some engines restarted 
        callback(error, data);
      });
    }

    function init(callback) {
      callEngine('ucci', function(error, data) {
        callback(error, data);
      });
    }

    function isReady(callback) {
      callEngine('isready', function(error, data) {
        callback(error, data);
      });
    }

    function setHash(hashsize, callback) {
      // Default is 16, test 1024
      callEngine('setoption hashsize ' + hashsize, function(error, data) {
        callback(error, data);
      });
    }


    function setStyle(style, callback) {
      // such as: setoption style risky
      callEngine('setoption style ' + style, function(error, data) {
        callback(error, data);
      });
    }

    function stop(commandId, callback) {
      // 停止引擎，前端需要处理commandId,以将以往的指令返回置为无效
      callEngineWithId('stop', commandId, function(error, data) {
        callback(error, data);
      });
    }

    function getBestMove(fen, color, moveStyle, commandId, callback) {
      // ref: rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1
      var colorChar;
      if (color == 'red') {
        colorChar = 'w';
      } else {
        colorChar = 'b';
      }
      var fenStr = fen + ' ' + colorChar + " - - 0 1"
      callEngine('position fen ' + fenStr, function(error, data) {
        callEngineWithId(moveStyle, commandId, function(error, data) {
          callback(error, data);
        });
      });
    }

    function callEngine(command, callback) {
      callEngineWithId(command, '', callback);

    }

    function callEngineWithId(command, commandId, callback) {
      $http({
        method: 'POST',
        url: 'http://localhost:3000', // UEW-H服务地址
        data: {
          command: command,
          commandId: commandId
        },
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(function successCallback(response) {
        callback(null, response.data);
      }, function errorCallback(response) {
        callback(response, null);
      });

    }

    return factory;
  }
})();

```

# 测试

$ curl -d '{"command":"ucci", "commandId":""}' -H 'content-type:application/json' "http://localhost:3000/"
id name ElephantEye
id version 3.31
id copyright 2004-2016 www.xqbase.com
id author ElephantEye Development Team
id user ElephantEye Test Team
option usemillisec type check default true
option promotion type check default false
option batch type check default false
option debug type check default false

$ curl -d '{"command":"isready", "commandId":""}' -H 'content-type:application/json' "http://localhost:3000/"
readyok

curl -d '{"command":"option newgame", "commandId":""}' -H 'content-type:application/json' "http://localhost:3000/"
这个无返回

curl -d '{"command":"position fen rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1", "commandId":""}' -H 'content-type:application/json' "http://localhost:3000/"

这个无返回

curl -d '{"command":"go time 10000", "commandId":"1487994278556"}' -H 'content-type:application/json' "http://localhost:3000/"

这个会返回最佳招法。





