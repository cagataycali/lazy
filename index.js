var BrainJSClassifier = require('natural-brain');
var Datastore = require('nedb');
var  _ = require('underscore')
const fs = require('fs');

function random(items) {return items[Math.floor(Math.random()*items.length)]};

class Lazy {
  constructor(db = 'data') {
    this.classifier = new BrainJSClassifier();
    this.categories = new Datastore({ filename: `${db}.db`, autoload: true });
    this.slient = false;
    this.db = db;
    this.categories.ensureIndex({ fieldName: 'name', unique: true }, function (err) {
      if (err) console.log(err);
    });
  }

  learn(obj) {
    let {classifier, categories} = this;
    return new Promise(function(resolve, reject) {
      classifier.addDocument(obj.phrase, obj.category);
      classifier.retrain();
      categories.insert({name:obj.category, responses: []}, function(err, doc) {
        resolve(doc)
      });
    });
  }

  getCategories() {
    var categories = this.categories;
    return new Promise(function(resolve, reject) {
      categories.find({}, function (err, docs) {
          if (err) {
            reject(err)
          } else {
            resolve(docs);
          }
      });
    });
  }

  quiet() {
    let {slient} = this;
    return new Promise(function(resolve, reject) {
      slient = !slient;
      resolve(slient);
    });
  }

  getResponses(obj) {
    var categories = this.categories;
    return new Promise(function(resolve, reject) {
      categories.findOne({name: obj.category}, function (err, docs) {
        if (err) {
          reject(err);
        } else {
          resolve(docs.responses)
        }
      });
    });
  }

  addResponse(obj) {
    var categories = this.categories;
    return new Promise(function(resolve, reject) {
      categories.update({ name: obj.category }, { $push: { responses: obj.response } }, {}, function (err) {
        if (err) {
          reject(err)
        } else {
          resolve(true);
        }
      });
    });
  }

  query(obj) {
    console.log(obj);
    let {slient, classifier} = this;
    var categories = this.categories;
    let classified = classifier.getClassifications(obj.phrase);
    classified = _.sortBy(classified, 'value')
    classified.reverse();
    let possibility = 0;
    let value = classified[0].value;
    if (value > 0.8) {
      possibility = 1;
    } else if (value > 0.3 && value < 0.8) {
      possibility = 0.5;
    } else {
      possibility = 0;
    }
    const category = classifier.classify(obj.phrase)

    return new Promise(function(resolve, reject) {
      categories.findOne({name: category}, function (err, docs) {
          if (!slient) {
            var response = random(docs.responses);
            resolve({status: true, possibility, response, details: classified})
          }
          classifier.addDocument(obj.phrase, category); // Add document
          classifier.retrain(); // Re train! :)
      });
    });
  }

  loadTrainedData() {
    var db = this.db;
    this.classifier = BrainJSClassifier.restore(JSON.parse(fs.readFileSync(`./${db}.json`, 'utf8')));
  }

  save() {
    let {classifier, db} = this;
    fs.writeFileSync(`${db}.json`, JSON.stringify(classifier), 'utf8');
  }

  removeDocument(obj) {
    var classifier = this.classifier;
    return new Promise(function(resolve, reject) {
      classifier.removeDocument(obj.phrase, obj.category);
      classifier.retrain();
      classifier.remove({ name:obj.category }, {}, function (err, numRemoved) {
        if (err) {
          reject(err)
        } else {
          resolve(true);
        }
      });
    });
  }
}

module.exports = Lazy;
