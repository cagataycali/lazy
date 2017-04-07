var BrainJSClassifier = require('natural-brain')
var classifier = new BrainJSClassifier();

var TelegramBot = require('node-telegram-bot-api');
var appUrl = `https://${process.env.APP_NAME}.herokuapp.com:443`;
var options = { webHook: { port: process.env.PORT } };
var bot = new TelegramBot(process.env.TELEGRAM_TOKEN, options);
bot.setWebHook(`${appUrl}/bot${process.env.TELEGRAM_TOKEN}`);

var  _ = require('underscore')

var Datastore = require('nedb');
var categories = new Datastore({ filename: 'categories.db', autoload: true });
var nonclassified = new Datastore({ filename: 'nonclassified.db', autoload: true });

categories.ensureIndex({ fieldName: 'name', unique: true }, function (err) {
  if (err) console.log(err);
});

nonclassified.ensureIndex({ fieldName: 'word', unique: true }, function (err) {
  if (err) console.log(err);
});

var slient = false;

const empty = () => {};

const random = (items) => {return items[Math.floor(Math.random()*items.length)]};

function matcher(matchs, pattern, message, callback, error) {
  if (message.text.includes(matchs)) {
    callback(message.text.match(pattern));
  } else {
    error();
  }
}

function check(text, callback) {
    var classified = classifier.getClassifications(text);
    classified = _.sortBy(classified, 'value')
    classified.reverse();
    var value = classified[0].value;
    if (value > 0.8) {
      callback(1);
    } else if (value > 0.3 && value < 0.8) {
      callback(0.5);
    } else {
      callback(0);
    }
  }

bot.on('message', (msg) => {

  if (msg.entities && msg.entities[0].type === "bot_command") {

    matcher('/learn', /\/learn (.+) - (.+)/, msg, function(match) {
      try {
        classifier.addDocument(match[1], match[2]);
        classifier.retrain();
        categories.insert({name:match[2], responses: []}, function(err, doc) {
          if (!err) console.log('Inserted', doc.name, 'with ID', doc._id)
        });
        bot.sendMessage(msg.chat.id, 'Hmm.. 😕', { disable_notification:true, reply_to_message_id:msg.message_id });
      } catch (e) {
        bot.sendMessage(msg.chat.id, 'I forgot already.. 😕', { disable_notification:true, reply_to_message_id:msg.message_id });
      }
    }, empty);

    matcher('/load', /\/load/, msg, function(match) {
      BrainJSClassifier.load('./data.json', null,
        function(err, newClassifier) {
          classifier = newClassifier;
          classifier.train();
        });
      }, empty);

    matcher('/save', /\/save/, msg, function(match) {
        classifier.save('./data.json', function() {
          console.log('Saved..');
        });
    }, empty);
    matcher('/forgot', /\/forgot (.+) - (.+)/, msg, function(match) {
      classifier.removeDocument(match[1], match[2]);
      classifier.retrain();
      classifier.remove({ name:match[2] }, {}, function (err, numRemoved) {
        console.log(numRemoved, 'row removed.');
      });
      bot.sendMessage(msg.chat.id, 'I forgot already.. 😕', { disable_notification:true, reply_to_message_id:msg.message_id });
    }, empty);

    matcher('/categories', /\/categories/, msg, function(match) {
      categories.find({}, function (err, docs) {
          bot.sendMessage(msg.chat.id, `${docs.map((item) => {return item.name}).join(',')}`, { disable_notification:true, reply_to_message_id:msg.message_id });
      });
    }, empty);

    matcher('/quiet', /\/quiet/, msg, function(match) {
      slient = slient === true ? false : true;
    }, empty);

    matcher('/responses', /\/responses (.+)/, msg, function(match) {
      try {
        categories.findOne({name: match[1]}, function (err, docs) {
          console.log(docs.responses);
          bot.sendMessage(msg.chat.id, `${docs.responses.join(', ')}`, { disable_notification:true, reply_to_message_id:msg.message_id });
        });
      } catch (e) {
        bot.sendMessage(msg.chat.id, `Pwiz check usage :(`, { disable_notification:true, reply_to_message_id:msg.message_id });
      }

    }, empty);

    matcher('/add', /\/add (.+) - (.+)/, msg, function (match) {
      try {
        categories.update({ name: match[1] }, { $push: { responses: match[2] } }, {}, function (err) {
          bot.sendMessage(msg.chat.id, 'I think I can! .. 😕', { disable_notification:true, reply_to_message_id:msg.message_id });
        });
      } catch (e) {
        bot.sendMessage(msg.chat.id, `I can't understand well, anybody can explain .. 😕`, { disable_notification:true, reply_to_message_id:msg.message_id });
      }
    }, empty);

  } else {
    try {
      var category = classifier.classify(msg.text);
      console.log(msg.text, category, classifier.getClassifications(msg.text));
      check(msg.text, function(status) {
        if (status === 1) {
          categories.findOne({name: category}, function (err, docs) {
              if (!slient) {
                bot.sendMessage(msg.chat.id, `${random(docs.responses)}`, { disable_notification:true, reply_to_message_id:msg.message_id });
              }
              classifier.addDocument(msg.text, category); // Add document
              classifier.retrain(); // Re train! :)
          });
        } else if (status === 0.5) {
          if (!slient) {
            bot.sendMessage(msg.chat.id, `I can't understand well, anybody can explain?`, { disable_notification:true, reply_to_message_id:msg.message_id });
          }
        }
      })

    } catch (e) {
      console.log('non classified',msg.text);
      nonclassified.insert({word: msg.text}, function(err, doc) {
        if (!err) console.log('Inserted', doc.word, 'with ID', doc._id)
      });
    }
  }
});
