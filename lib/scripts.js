const Message = require('./message');
const Chatroom = require('./chatroom')
const BotResponse = require('./bot-response')

var $messageInput = $('#message-input');
var $sendButton = $('#send-button');

var chatroom = new Chatroom({});

function makeUserMessageObject() {
  return new Message({
    id: makeMessageId(),
    user: 'user',
    content: getMessageInput()
  });
}

function renderAllMessages() {
  $('article').remove();
  chatroom.getMessagesFromStorage();
  chatroom.orderMessages();
  for (var i = 0; i < chatroom.messages.length; i++) {
    if (chatroom.messages[i].user === 'user') {addUserMessageElementToDom(chatroom.messages[i]); }
    if (chatroom.messages[i].user === 'robot') { addBotMessagetoDom(chatroom.messages[i]); }
  }
}

function makeBotMessageObject(userMessage) {
  var botResponse = new BotResponse(userMessage.content);
  botResponse.generateResponseDependingOnUserMessage();
  return new Message({
    id: makeMessageId(),
    user: 'robot',
    content: botResponse.botMessageContent
  });
}

function populateDom() {
 var storedMessages = chatroom.getMessagesFromStorage();
 if (storedMessages) {
 chatroom.messages = storedMessages;
 chatroom.orderMessages();
    if (chatroom.messages.length > 11) {
     for (var i = chatroom.messages.length - 10; i < chatroom.messages.length; i++) {
       if (chatroom.messages[i].user === 'user') {addUserMessageElementToDom(chatroom.messages[i]); }
       if (chatroom.messages[i].user === 'robot') { addBotMessagetoDom(chatroom.messages[i]); }
     }
    }
    if (chatroom.messages.length < 11) {
      for (var i = 0; i<chatroom.messages.length; i++) {
        if (chatroom.messages[i].user === 'user') {addUserMessageElementToDom(chatroom.messages[i]); }
        if (chatroom.messages[i].user === 'robot') { addBotMessagetoDom(chatroom.messages[i]); }
      }
    }
  }
}

populateDom();

function makeMessageId() {
  return Date.now();
}

function getMessageInput() {
  return $messageInput.val();
}

function clearInput() {
  $messageInput.val('');
}

function enableSendButton() {
  $sendButton.attr('disabled', false);
}

function disableSendButton() {
  $sendButton.attr('disabled', true);
}

function showMenuOption() {
  $('.show-menu-options').hide();
  $('.menu-options').show();
}

function hideMenuOptions() {
  $('.menu-options').hide();
  $('.show-menu-options').show();
}

function deleteMessageFromDomAndStorage() {
  var idToBeDeleted = $(this).closest('article').attr('id');
  $(this).closest('article').remove();
  chatroom.deleteMessageFromStorage(idToBeDeleted);
  $('article').remove();
  populateDom();
}

function updateSendButton() {
  var messageInput = getMessageInput();
  if (messageInput === '') { disableSendButton(); }
  if (messageInput !== '') { enableSendButton(); }
}

function addOlderMessagesToDom(arr) {
  for (var i = 0; i < arr.length; i++)  {
     if (arr[i].user === 'robot') {renderOldBotMessage(arr[i]); }
     else if (arr[i].user === 'user') {renderOldUserMessage(arr[i]); }
   }
}

function renderOldUserMessage(message) {
 $('#messages-container').prepend(`
   <article class="message user-message" id=" ${ message.id }">
     <p class="user-icon"></p>
     <p class="user-message-text" contenteditable="true"> ${ message.content } </p>
     <button class="delete-button"></button>
     <p class="user-user-name">brett</p>
   </article>
   `);
}

function renderOldBotMessage(message) {
 $('#messages-container').prepend(`
   <article class="message bot-message" id="${ message.id }">
     <p class="bot-icon"></p>
     <p class="bot-message-text"> ${message.content} </p>
     <p class="bot-user-name">bot</p>
   </article>
   `);
}

function addUserMessageElementToDom(message){
 $('#messages-container').append(`
   <article class="message user-message" id=" ${ message.id }">
     <p class="user-icon"></p>
     <p class="user-message-text" contenteditable="true"> ${ message.content } </p>
     <button class="delete-button"></button>
     <p class="user-user-name">brett</p>
   </article>
   `);
}

function addBotMessagetoDom(message){
 $('#messages-container').append(`
   <article class="message bot-message" id="${ message.id }" >
     <p class="bot-icon"></p>
     <p class="bot-message-text"> ${message.content} </p>
     <p class="bot-user-name">bot</p>
   </article>
   `);
}

function findCharacterCount(){
  return getMessageInput().length;
}

function updateCharacterCount(){
  $('#character-count').html(findCharacterCount());
}

function getEditedText(e) {
  return $(e.target).closest('.user-message-text').text();
}

function getClosestArticleById(e) {
  var closestArticle = $(e.target).closest('.user-message');
    return parseInt(closestArticle.attr('id'));
}

function getOldestMessageInDomId() {
  var farthestArticle = $('article').first();
  var lastId = parseInt(farthestArticle.attr('id'));
  return lastId;
}

function postMessageAfterEvent(){
  $('article').remove();
  var newUserMessage = makeUserMessageObject();
  // addUserMessageElementToDom(newUserMessage);
  chatroom.updateMessagesProperty(newUserMessage);
  chatroom.orderMessages();
  chatroom.sendMessagesToStorage();
  clearInput();
  updateSendButton();
  var botMessage = makeBotMessageObject(newUserMessage);
  // addBotMessagetoDom(botMessage);
  chatroom.updateMessagesProperty(botMessage);
  chatroom.orderMessages();
  chatroom.sendMessagesToStorage();
  populateDom();
  updateCharacterCount();
  $("html, body").animate({ scrollTop: $(document).height()-$(window).height() });

}

$($messageInput).on('keyup', function() {
  updateSendButton();
  updateCharacterCount();
});

$($sendButton).on('click', postMessageAfterEvent);

$('#message-input').on('keydown', function(e){
    if (e.which == '13' && $messageInput.val() !== ''){
      e.preventDefault();
      postMessageAfterEvent();
    }
  });

$('#messages-container').on('keyup', '.user-message-text', function(e) {
  var id = getClosestArticleById(e);
  var content = getEditedText(e);
  chatroom.editMessageContent(id, content);
});

$('#messages-container').on('click', '.delete-button', deleteMessageFromDomAndStorage);

$('.load-more').on('click', renderAllMessages)
//   var id = getOldestMessageInDomId();
//   var previousMessages = chatroom.findPreviousMessages(id, 10);
//   addOlderMessagesToDom(previousMessages);
//   chatroom.orderMessages();
// });

$('.delete-all').on('click', function() {
  localStorage.clear();
  $('article').remove();
});

$('.show-menu-options').on('mouseenter', function() {
  showMenuOption();
});

$('.menu-options').on('mouseleave', function() {
  hideMenuOptions();
});
