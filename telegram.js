var TelegramBot = require('node-telegram-bot-api');
var appUrl = `https://${process.env.APP_NAME}.herokuapp.com:443`;
var options = { webHook: { port: process.env.PORT } };
var bot = new TelegramBot(process.env.TELEGRAM_TOKEN, options);
bot.setWebHook(`${appUrl}/bot${process.env.TELEGRAM_TOKEN}`);

var Lazy = require('lazy.ai'); // It have to be lazy
var lazy = new Lazy();

var  _ = require('underscore')

const empty = () => {};

function matcher(matchs, pattern, message, callback, error) {
  if (message.text.includes(matchs)) {
    callback(message.text.match(pattern));
  } else {
    error();
  }
}

bot.on('message', async (msg) => {

  if (msg.entities && msg.entities[0].type === "bot_command") {

    matcher('/learn', /\/learn (.+) - (.+)/, msg, function(match) {
      lazy.learn({phrase: match[1], category: match[2]})
        .then(() => {
          bot.sendMessage(msg.chat.id, 'Hmm.. 😕', { disable_notification:true, reply_to_message_id:msg.message_id });
        })
        .catch((err) => {
          bot.sendMessage(msg.chat.id, 'I forgot already.. 😕', { disable_notification:true, reply_to_message_id:msg.message_id });
        })
    }, empty);

    matcher('/load', /\/load/, msg, function(match) {
      lazy.loadTrainedData();
      }, empty);

    matcher('/save', /\/save/, msg, function(match) {
        lazy.save();
    }, empty);
    matcher('/forgot', /\/forgot (.+) - (.+)/, msg, function(match) {
      lazy.removeDocument()
        .then(() => {
          bot.sendMessage(msg.chat.id, 'I forgot already.. 😕', { disable_notification:true, reply_to_message_id:msg.message_id });
        })
        .catch((err) => {
          console.log(err);
        })
    }, empty);

    matcher('/categories', /\/categories/, msg, function(match) {
      lazy.getCategories()
        .then((docs) => {
          bot.sendMessage(msg.chat.id, `${docs.map((item) => {return item.name}).join(',')}`, { disable_notification:true, reply_to_message_id:msg.message_id });
        })
        .catch((err) => {
          console.log(err);
        })
    }, empty);

    matcher('/quiet', /\/quiet/, msg, function(match) {
      lazy.quiet();
    }, empty);

    matcher('/responses', /\/responses (.+)/, msg, function(match) {
      lazy.getResponses({category: match[1]})
        .then((responses) => {
          bot.sendMessage(msg.chat.id, `${responses.join(', ')}`, { disable_notification:true, reply_to_message_id:msg.message_id });
        })
        .catch((err) => {
          console.log(err);
          bot.sendMessage(msg.chat.id, `Pwiz check usage :(`, { disable_notification:true, reply_to_message_id:msg.message_id });
        })
    }, empty);

    matcher('/add', /\/add (.+) - (.+)/, msg, function (match) {
      lazy.addResponse({category: match[1], response: match[2]})
        .then((value) => {
          bot.sendMessage(msg.chat.id, 'I think I can! .. 😕', { disable_notification:true, reply_to_message_id:msg.message_id });
        })
        .catch((err) => {
          bot.sendMessage(msg.chat.id, `I can't understand well, anybody can explain .. 😕`, { disable_notification:true, reply_to_message_id:msg.message_id });
        })
    }, empty);

  } else {
    lazy.query({phrase: msg.text})
      .then((out) => {
        if (out.possibility === 1) {
          bot.sendMessage(msg.chat.id, out.response, { disable_notification:true, reply_to_message_id:msg.message_id });
        } else if (out.possibility === 0.5) {
          bot.sendMessage(msg.chat.id, `I can't understand well, anybody can explain?`, { disable_notification:true, reply_to_message_id:msg.message_id });
        } else {
          console.log(`I can't understand ${msg.text}`);
        }
      })
      .catch((err) => {
        console.log(err);
      })
  }
});
