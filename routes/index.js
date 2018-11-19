var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var config = require('../data/config');
var serviceUrlConfig  = require("../data/serviceURL's");
var request = require('request');

/* GET home page. */
router.get('/si/suggestions', function(req, res, next) {
  var token = req.headers['x-access-token'];
  jwt.verify(token, config.secret , function(err, decodedObj){
    if (err) return res.status(500).json({ auth: false, message: 'Failed to authenticate token.' });
    var userName = decodedObj.username;
    request.get(serviceUrlConfig.dbUrl+'/'+userName+'-debit', function(err, response, body){
      if(err) return res.status(500).json({ message: 'Failed to load data'})
      console.log(body);
      var accountsArray = JSON.parse(body)['banks'].map((bank)=>{
        bank.accounts[0].bankName = bank.bankName;
        return bank.accounts[0]
      })
      var sortedArray = accountsArray.sort((a,b)=>{
        return a.interestRate-b.interestRate;
      });
      res.status(200).json({
        transfers: [
          {
            senderBank: sortedArray[1].bankName,
            senderAccountNumber: sortedArray[1].accountNumber,
            senderAer: sortedArray[1].interestRate,
            receiverBank:  sortedArray[0].bankName,
            receiverAccountNumber: sortedArray[0].accountNumber,
            receiverAer: sortedArray[0].interestRate,
            amount: sortedArray[0].balance - sortedArray[0].minBalance - sortedArray[0].standingInst
          }
        ]
      })
    })
  });
});


router.post('/si/suggestions', function(req, res, next) {
  var token = req.headers['x-access-token'];
  var postData = req.body;
  jwt.verify(token, config.secret , function(err, decodedObj){
    if (err) return res.status(500).json({ auth: false, message: 'Failed to authenticate token.' });
    var userName = decodedObj.username;
    request.get(serviceUrlConfig.dbUrl+'/'+userName+'-debit', function(err, response, body){
      if(err) return res.status(500).json({ message: 'Failed to load data'})
      console.log(body, postData.transfers);
      console.log("modify get data and then post it");
    })
  });
})

router.post('/mergeFunds', function(req, res, next) {
  var token = req.headers['x-access-token'];
  var postData = req.body;
  jwt.verify(token, config.secret , function(err, decodedObj){
    if (err) return res.status(500).json({ auth: false, message: 'Failed to authenticate token.' });
    var userName = decodedObj.username;
    request.get(serviceUrlConfig.dbUrl+'/'+userName+'-debit', function(err, response, body){
      if(err) return res.status(500).json({ message: 'Failed to load data'})
      console.log(body, postData);
      console.log("modify get data and then post it")
    })
  });
})

router.post('/mergeAccounts', function(req, res, next) {
  var token = req.headers['x-access-token'];
  var postData = req.body;
  jwt.verify(token, config.secret , function(err, decodedObj){
    if (err) return res.status(500).json({ auth: false, message: 'Failed to authenticate token.' });
    var userName = decodedObj.username;
    request.get(serviceUrlConfig.dbUrl+'/'+userName+'-debit', function(err, response, body){
      if(err) return res.status(500).json({ message: 'Failed to load data'})
      console.log(body, postData);
      console.log("modify get data and then post it")
    })
  });
})

module.exports = router;
