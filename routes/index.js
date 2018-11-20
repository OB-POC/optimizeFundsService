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
            amount: Math.abs(parseInt(sortedArray[0].balance) - parseInt(sortedArray[0].minBalance) - parseInt(sortedArray[0].standingInst))
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
      // console.log(body, postData.transfers);
      postData.transfers.map((obj)=>{
        var filteredSenderBank = body.banks.filter((bank)=>{
          return bank.bankName == obj.senderBank;
        })[0];
        var filteredReceiverBank = body.banks.filter((bank)=>{
          return bank.bankName == obj.receiverBank;
        })[0];
        var restBankDetails = body.banks.filter((bank)=>{
          return bank.bankName != obj.receiverBank && bank.bankName != obj.senderBank;
        });
        filteredSenderBank.accounts[0].balance = parseInt(filteredSenderBank.accounts[0].balance) - parseInt(obj.amount);
        filteredReceiverBank.accounts[0].balance = parseInt(filteredReceiverBank.accounts[0].balance) + parseInt(obj.amount);
        body.banks = [...restBankDetails, filteredReceiverBank, filteredSenderBank];
      });
      request.patch({
        url: serviceUrlConfig.dbUrl+'/'+userName+'-debit',
        body: {
          'banks': body.banks
        },
        json: true
      }, function(err, response, body){
        if(err) return res.status(500).json({ message: 'Failed to patch data'})
        console.log(body);
        res.status(200).json(body);
      })
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
