const fetch = require('node-fetch');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const sha256 = require('js-sha256');

const BlockchainNode = require('./BlockchainNode');
const Block = require('./block');
const Blockchain = require('./blockchain');
const Transaction = require('./transaction');
const DrivingRecordSmartContract = require('./smartContracts');

let port = 3000;

// access the arguments, no code duplication required to run on different nodes (server)
process.argv.forEach(function(val,index,array){
  port = array[2];
//  console.log("port :", port);
});

if(port == undefined) {
  port = 3000;
}

app.use(bodyParser.json()); // setting up the middleware

const nodes = [];

let transactions = [];
let genesisBlock = new Block();
let blockchain = new Blockchain(genesisBlock);

app.get('/',(req,res) => {
  res.send("hello world");
});

app.get('/resolve',(req,res) => {
  nodes.forEach(function(node){ // getting blockchain of all the registered nodes

      fetch(node.url + '/blockchain')
      .then((response) => response.json())
      .then((otherNodeBlockchain) => {
          if(blockchain.blocks.length < otherNodeBlockchain.blocks.length) {
            blockchain = otherNodeBlockchain;
          }

          res.send(blockchain);
      })
  })
});

app.post('/nodes/register',(req,res) => {

  let nodesLists = req.body.urls;
  nodesLists.forEach(function(nodeDictionary){
    let node = new BlockchainNode(nodeDictionary["url"]);
    nodes.push(node);
  })

  res.json(nodes);

});

app.get('/nodes',(req,res) => { // returns a list of connected nodes
  res.json(nodes)
});

app.get('/mine',(req,res) => {
  let block = blockchain.getNextBlock(transactions); // block is the mined block
  blockchain.addBlock(block);
  transactions = []; // make transactions empty as they have already been mined
  res.json(block);
});

app.post('/transactions',(req,res) => {
  console.log(transactions);
    let driverLicenseNumber = sha256(req.body.driverLicenseNumber);
    let voilationDate = req.body.voilationDate;
    let voilationType = req.body.voilationType;

    let transaction = new Transaction(driverLicenseNumber,voilationDate,voilationType);
    let drivingRecordSmartContract = new DrivingRecordSmartContract();

    console.log("blockchain :", blockchain);

    drivingRecordSmartContract.apply(transaction,blockchain.blocks); // apply the smart contract

    transactions.push(transaction);

    res.json(transactions);
  //res.end();
});

// driving-records/CA1234
app.get('/driving-records/:drivingLicenseNumber', (req,res) => {
  let drivingLicenseNumber = sha256(req.params.drivingLicenseNumber);
  let transactions = blockchain.transactionsByDrivingLicenseNumber(drivingLicenseNumber);
  res.json(transactions);
});

// exposing blockchain as a web api through express
app.get('/blockchain',(req,res) => {
  /*
  let genesisBlock = new Block();
  let blockchain = new Blockchain(genesisBlock);

  let transaction = new Transaction('Mary','Jerry',100);
  let block = blockchain.getNextBlock([transaction]); // on enterprise level, multiple transactions will be present
  blockchain.addBlock(block);

  let anotherTransaction = new Transaction("Tom","Jerry",10)
  let block1 = blockchain.getNextBlock([anotherTransaction,transaction])
  blockchain.addBlock(block1)

  console.log(blockchain);
 */

  res.json(blockchain);
});

app.listen(port, () => {
  console.log("server has started")
});
