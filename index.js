const BrainJSClassifier = require('natural-brain');
const Datastore = require('nedb');
const  _ = require('underscore')
const fs = require('fs');
const request = require('request');

function random(items) {return items[Math.floor(Math.random()*items.length)]};

class Lazy {
  constructor(obj) {
    // obj => db = 'data', selfTrain = true, slient = false
    typeof obj !== 'object' ? obj = { db: 'data', slient: false, selfTrain: true } : ''
    this.db = obj.db || 'data';
    this.slient = obj.slient || false;
    this.selfTrain = obj.selfTrain || true;
    this.classifier = new BrainJSClassifier();
    this.categories = new Datastore({ filename: `${this.db}.db`, autoload: true });
    this.categories.ensureIndex({ fieldName: 'name', unique: true }, function (err) {
      if (err) console.log(err);
    });
  }

  learn(obj) {
    return new Promise(resolve => {
      this.classifier.addDocument(obj.phrase, obj.category);
      this.classifier.retrain();
      this.categories.insert({name:obj.category, responses: [], actions: []}, function(err, doc) {
        resolve(doc)
      });
    });
  }

  getCategories() {
    return new Promise((resolve, reject) => {
      this.categories.find({}, (err, docs) => {
        err ? reject(err) : resolve(docs);
      });
    });
  }

  quiet() {
    return new Promise(resolve => {
      this.slient = !this.slient;
      resolve(slient);
    });
  }

  getResponses(obj) {
    return new Promise((resolve, reject) => {
      this.categories.findOne({name: obj.category}, (err, docs) => {
        err ? reject(err) : resolve(docs.responses)
      });
    });
  }

  getActions(obj) {
    return new Promise((resolve, reject) => {
      this.categories.findOne({name: obj.category}, (err, docs) => {
        err ? reject(err) : resolve(docs.actions)
      });
    });
  }

  addResponse(obj) {
    return new Promise((resolve, reject) => {
      this.categories.update({ name: obj.category }, { $push: { responses: obj.response } }, {}, (err) => {
        err ? reject(err) : resolve(true)
      });
    });
  }

  addAction(obj) {
    return new Promise((resolve, reject) => {
      this.categories.update({ name: obj.category }, { $push: { actions: obj.actions } }, {}, (err) => {
        err ? reject(err) : resolve(true)
      });
    });
  }

  query(obj) {
    var categories = this.categories;
    let classified = this.classifier.getClassifications(obj.phrase);
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
    const category = this.classifier.classify(obj.phrase)

    return new Promise((resolve, reject) => {
      this.categories.findOne({name: category}, (err, docs) => {
          var response = "";
          if (docs.actions.length > 0) {
            request.post(random(docs.actions), {form:{input:obj.phrase, category:category, details:classified, possibility}}, (err, res, body) => {
              if (!err) {
                response = body;
                resolve({status: true, possibility, response, details: classified})
              } else {
                response = random(docs.responses);
                resolve({status: true, possibility, response, details: classified})
              }
            })
          } else {
            if (!this.slient) {
              response = random(docs.responses);
              resolve({status: true, possibility, response, details: classified})
            }
          }
          if (this.selfTrain) {
            this.classifier.addDocument(obj.phrase, category); // Add document
            this.classifier.retrain(); // Re train! :)
          }
      });
    });
  }

  loadTrainedData() {
    const db = this.db;
    this.classifier = BrainJSClassifier.restore(JSON.parse(fs.readFileSync(`./${db}.json`, 'utf8')));
  }

  save() {
    let {classifier, db} = this;
    fs.writeFileSync(`${db}.json`, JSON.stringify(classifier), 'utf8');
  }

  removeDocument(obj) {
    return new Promise((resolve, reject) => {
      this.classifier.removeDocument(obj.phrase, obj.category);
      this.classifier.retrain();
      this.classifier.remove({ name:obj.category }, {}, function (err, numRemoved) {
        err ? reject(err) : resolve(true)
      });
    });
  }
}

module.exports = Lazy;
