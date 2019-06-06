/*
SPDX-License-Identifier: Apache-2.0
*/

'use strict';

// Bring key classes into scope, most importantly Fabric SDK network class
const fs = require('fs');
const yaml = require('js-yaml');
const { FileSystemWallet, Gateway } = require('fabric-network');
const Estate = require('../contract/lib/estate.js');

// A wallet stores a collection of identities for use
//const wallet = new FileSystemWallet('../user/owners/wallet');
const wallet = new FileSystemWallet('../identity/user/owners/wallet');

async function create(contract) {
  return await contract.submitTransaction(
    'create',
    '000003',
    'SCFoundation',
    'GoldWing',
    'apart',
    '50000000',
    '100000',
    '12',
    '2010-04-12'
  );
}

async function find(contract) {
  return await contract.submitTransaction('find', 'apart', '000002');
}

async function findAll(contract) {
  return await contract.submitTransaction('findAll');
}

async function addHistoris(contract) {
  let unit = 100000;
  let maxunit = 50000000 / unit;
  let establishedAt = '2012-05-28';
  let histories = [
    {
      ownercode: 'SCFoundation',
      amount: (maxunit / 2) * unit,
      purchasedAt: establishedAt
    },
    {
      ownercode: 'shohu',
      amount: (maxunit / 2) * unit,
      purchasedAt: establishedAt
    }
  ];
  console.log('========', JSON.stringify(histories));
  return await contract.submitTransaction(
    'addHistories',
    'apart',
    '000003',
    JSON.stringify(histories)
  );
}

// Main program function
async function main(method) {
  // A gateway defines the peers used to access Fabric networks
  const gateway = new Gateway();

  // Main try/catch block
  try {
    // Specify userName for network access
    // const userName = 'owners.issuer@magnetocorp.com';
    const userName = 'User1@org1.example.com';

    // Load connection profile; will be used to locate a gateway
    let connectionProfile = yaml.safeLoad(
      fs.readFileSync('../gateway/networkConnection.yaml', 'utf8')
    );

    // Set connection options; identity and wallet
    let connectionOptions = {
      identity: userName,
      wallet: wallet,
      discovery: { enabled: false, asLocalhost: true }
    };

    // Connect to gateway using application specified parameters
    console.log('Connect to Fabric gateway.');

    await gateway.connect(connectionProfile, connectionOptions);

    // Access EstateNet network
    console.log('Use network channel: mychannel.');

    const network = await gateway.getNetwork('mychannel');

    // Get addressability to estate contract
    console.log('Use org.estatenet.estate smart contract.');

    const contract = await network.getContract('estatecontract', 'org.estatenet.estate');

    // issue estate
    console.log('Submit estate issue transaction.');

    let response = null;
    if (method == 'create') {
      console.log('Process create estate.');
      response = await create(contract);
      let estate = Estate.fromBuffer(response);
      console.log(`estate : ${estate.category}:${estate.code} successfully. price ${estate.price}`);
    } else if (method == 'find') {
      console.log('Process find estate.');
      response = await find(contract);
      let estate = Estate.fromBuffer(response);
      console.log(`estate : ${estate.category}:${estate.code} successfully. price ${estate.price}`);
    } else if (method == 'all') {
      console.log('Process find all estate.');
      response = await findAll(contract);
      let results = Estate.fromBuffer(response);
      console.log(`all estates :`, results);
    } else if (method == 'addhistory') {
      console.log('Process add history to estate.');
      response = await addHistoris(contract);
      let results = Estate.fromBuffer(response);
      console.log(`all estates :`, results);
    }

    console.log('Process estate transaction response.');
    console.log('Transaction complete.');
  } catch (error) {
    console.log(`Error processing transaction. ${error}`);
    console.log(error.stack);
  } finally {
    // Disconnect from the gateway
    console.log('Disconnect from Fabric gateway.');
    gateway.disconnect();
  }
}

main(process.argv[2])
  .then(() => {
    console.log('Estate program complete.');
  })
  .catch(e => {
    console.log('Estate program exception.');
    console.log(e);
    console.log(e.stack);
    process.exit(-1);
  });
