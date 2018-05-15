var app = {};

var chats = [];
var rooms = {};

app.init = function() {
  
};

handleData = function(chats) {
  console.log(chats);
  chats = chats.results;
  for (var i = 0; i < chats.length; i++) {
    
    if (!filterBadMessages(chats[i])) {
      continue;
      
    }
    if (!rooms.hasOwnProperty(chats[i].roomname)) {
      rooms[chats[i].roomname] = [];
    }
    rooms[chats[i].roomname].push(chats[i]);
  }

  _.each(rooms, function(value, key) {
    $option = $(`<option value="${key}" class="roomOption">${key}</option>`);
    $option.appendTo($('#rooms'));
  });
};

filterBadMessages = function(message) {
  if (typeof message !== 'object' || message === null || !message.hasOwnProperty('username') || !message.hasOwnProperty('text') || !message.hasOwnProperty('roomname') || message.roomname === null || message.text === null || message.username === null || message.roomname.includes('?') || message.roomname.includes('<') || message.roomname.includes('>') || message.text.includes('?') || message.text.includes('<') || message.text.includes('>') || message.username.includes('?') || message.username.includes('<') || message.username.includes('>')) {
    return false;
  }
  return true;
};

app.send = function(message) {
  $.ajax({
    url: 'http://127.0.0.1:3000/classes/messages',
    type: 'POST',
    data: JSON.stringify(message),
    contentType: 'application/json',
    success: function (data) {
      console.log('chatterbox: Message sent');
    },
    error: function (data) {
      // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
      console.error('chatterbox: Failed to send message', data);
    }
  });
};

app.fetch = function() {
  $.ajax({
    url: 'http://127.0.0.1:3000/classes/messages?order=-createdAt', //keys=username%2Ctext%2Croomname
    type: 'GET',
    contentType: 'application/json',
    success: function (data) {
      console.log('chatterbox: Message fetched');
      handleData(data);
    },
    error: function () {
      // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
      console.error('chatterbox: Failed to fetch message');
    }
  });
};

app.refresh = function() {
  chats = [];
  rooms = {};
  $.ajax({
    url: 'http://127.0.0.1:3000/classes/messages?order=-createdAt', //keys=username%2Ctext%2Croomname
    type: 'GET',
    contentType: 'application/json',
    success: function (data) {
      app.clearMessages();
      // console.log('chatterbox: Message fetched');
      var currentRoom = $('#rooms option:selected').val();
      $('.roomOption').remove();
      handleData(data);
      app.renderRoom(currentRoom);
      $('#rooms').val(currentRoom);
    },
    error: function () {
      // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
      console.error('chatterbox: Failed to fetch message');
    }
  });
};

app.clearMessages = function() {
  $('#chats').children().remove();
};

app.renderMessage = function(message) {
  if (message.username.includes('%20')) {
    message.username = message.username.replace('%20', '_');
  }
  
  var $chat = $(`<div class="chat"><div class="username ${message.username}">${message.username}</div> <div class="text">${message.text}</div> <div class="roomname">${message.roomname}</div></div>`);
  $chat.prependTo('#chats');
};

app.renderRoom = function(roomname) {
  if (rooms.hasOwnProperty(roomname)) {
    var room = rooms[roomname];
    for (var i = room.length - 1; i >= 0; i--) {
      this.renderMessage(room[i]);
    }
  }
};

app.server = 'http://127.0.0.1:3000/classes/messages';


$(document).ready(function() {
  $('#createRoom').show();
  $('#newRoom').show();
  $('#submit').hide();
  $('#message').hide();
  $('#refresh').hide();
  app.fetch();

  $('#submit').on('click', function(event) {
    var message = {};
    message.text = $('#message').val();
    message.roomname = $('#rooms option:selected').val();
    message.username = window.location.search.substr(10);
    app.send(message);
    app.renderMessage(message);
  });
  
  $('#createRoom').on('click', function(event) {
    newRoom = $('#newRoom').val();
    $option = $(`<option value="${newRoom}">${newRoom}</option>`);
    $option.appendTo($('#rooms'));
    $('#newRoom').val('');
  });

  $('#refresh').on('click', function() {
    app.refresh();
  });

  $('#rooms').change(function() {

    if ($('#rooms option:selected').val() === 'newRoom') {
      $('#createRoom').show();
      $('#newRoom').show();
      $('#submit').hide();
      $('#message').hide();
      $('#refresh').hide();
      app.clearMessages();
    } else {
      $('#createRoom').hide();
      $('#newRoom').hide();
      $('#submit').show();
      $('#message').show();
      $('#refresh').show();
      app.clearMessages();
      app.renderRoom($('#rooms option:selected').val());
    }

  });

  $('body').on('click', '.chat .username', function(event) {
    $chat = $(this);
    console.log($chat);
    var username = $chat.context.innerHTML; //
    $user = $(`.${username}`);
    $user.addClass('friend');
    
  });
  
});

