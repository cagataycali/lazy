var BrainJSClassifier = require('natural-brain')
var classifier = new BrainJSClassifier();

var TelegramBot = require('node-telegram-bot-api');
const appUrl = `https://${process.env.APP_NAME}.herokuapp.com:443`;
const options = { webHook: { port: process.env.PORT } };
const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, options);

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

bot.on('message', (msg) => {
  if (msg.entities && msg.entities[0].type === "bot_command") {
    // Öğren => içerik - kategori deseni.
    matcher('/learn', /\/learn (.+) - (.+)/, msg, function(match) {
      classifier.addDocument(match[1], match[2]);
      classifier.train();
      categories.insert({name:match[2], responses: []}, function(err, doc) {
        if (!err) console.log('Inserted', doc.name, 'with ID', doc._id)
      });
      bot.sendMessage(msg.chat.id, 'Sanırım okul hiç bitmeyecek.. 😕', { disable_notification:true, reply_to_message_id:msg.message_id });
    }, empty);

    // Kategoriler
    matcher('/categories', /\/categories/, msg, function(match) {
      categories.find({}, function (err, docs) {
          bot.sendMessage(msg.chat.id, `${docs.map((item) => {return item.name}).join(',')}`, { disable_notification:true, reply_to_message_id:msg.message_id });
      });
    }, empty);

    // Sus
    matcher('/quiet', /\/quiet/, msg, function(match) {
      slient === true ? false : true;
    }, empty);

    // Save
    matcher('/save', /\/save/, msg, function(match) {
        classifier.save('./data.json', function() {
          console.log('Saved..');
        });
    }, empty);

    // Load
    matcher('/load', /\/load/, msg, function(match) {
      BrainJSClassifier.load('./data.json', null,
        function(err, newClassifier) {
          classifier = newClassifier;
          classifier.train();
        });
      }, empty);

    // Yanitlar
    matcher('/responses', /\/responses (.+)/, msg, function(match) {
      console.log(match[1]);
      categories.findOne({name: match[1]}, function (err, docs) {
        console.log(docs.responses);
        bot.sendMessage(msg.chat.id, `${docs.responses.join(', ')}`, { disable_notification:true, reply_to_message_id:msg.message_id });
      });
    }, empty);

    // Kategoriye yanıt ekleme
    matcher('/add', /\/add (.+) - (.+)/, msg, function (match) {
      categories.update({ name: match[1] }, { $push: { responses: match[2] } }, {}, function (err) {
        bot.sendMessage(msg.chat.id, 'Bana bir harf öğretenin kırk yıl kölesi olurum.. 😕', { disable_notification:true, reply_to_message_id:msg.message_id });
      });
    }, empty);
  } else if (slient) {
    console.log(msg.text);
  } else {
    try {
      var category = classifier.classify(msg.text);

      var classified = classifier.getClassifications(msg.text);
      classified = _.sortBy(classified, 'value')
      classified.reverse();
      console.log(classified[0].value);
      if (classified[0].value > 0.7) {
        categories.findOne({name: category}, function (err, docs) {
            bot.sendMessage(msg.chat.id, `${random(docs.responses)}`, { disable_notification:true, reply_to_message_id:msg.message_id });
        });
      } else {
        nonclassified.insert({word: msg.text}, function(err, doc) {
          if (!err) console.log('Inserted', doc.name, 'with ID', doc._id)
        });
      }
    } catch (e) {
      console.log(msg.text);
      nonclassified.insert({word: msg.text}, function(err, doc) {
        if (!err) console.log('Inserted', doc.word, 'with ID', doc._id)
      });
    }
  }

});
