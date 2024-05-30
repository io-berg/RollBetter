// ==UserScript==
// @name         Roll Better
// @namespace    http://tampermonkey.net/
// @version      0.1337
// @description  Do a big kickflip
// @author       Kebappi
// @match        https://app.roll20.net/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=roll20.net
// @run-at       document-start
// @noframes
// ==/UserScript==

"use strict";
(function () {
  var OrigWebSocket = window.WebSocket;
  var callWebSocket = OrigWebSocket.apply.bind(OrigWebSocket);
  var wsAddListener = OrigWebSocket.prototype.addEventListener;
  wsAddListener = wsAddListener.call.bind(wsAddListener);
  window.WebSocket = function WebSocket(url, protocols) {
    var ws;
    if (!(this instanceof WebSocket)) {
      // Called without 'new' (browsers will throw an error).
      ws = callWebSocket(this, arguments);
    } else if (arguments.length === 1) {
      ws = new OrigWebSocket(url);
    } else if (arguments.length >= 2) {
      ws = new OrigWebSocket(url, protocols);
    } else {
      // No arguments (browsers will throw an error)
      ws = new OrigWebSocket();
    }

    wsAddListener(ws, "message", function (event) {
      // TODO: Do something with event.data (received data) if you wish.
    });
    return ws;
  }.bind();
  window.WebSocket.prototype = OrigWebSocket.prototype;
  window.WebSocket.prototype.constructor = window.WebSocket;

  var wsSend = OrigWebSocket.prototype.send;
  wsSend = wsSend.apply.bind(wsSend);
  OrigWebSocket.prototype.send = function (data) {
    try {
      data = JSON.parse(data);
      if (data.d?.b?.d?.type === "rollresult") {
        let content = JSON.parse(data.d.b.d.content);
        let averageRoll =
          content.rolls.reduce(
            (acc, roll) =>
              acc + roll.results.reduce((acc, result) => acc + result.v, 0),
            0
          ) / content.rolls.length;

        if (averageRoll < 10) {
            if (confirm(`Your average roll is ${averageRoll}, Would you like to reroll?`)) {
                // TODO: Add reroll logic here
                return 
            } else {
                return wsSend(this, arguments);
            }
        }
      }
    } catch (_) {
        return wsSend(this, arguments);    
    }
    return wsSend(this, arguments);
  };
})();
