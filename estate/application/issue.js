/*
SPDX-License-Identifier: Apache-2.0
*/

/*
 * This application has 6 basic steps:
 * 1. Select an identity from a wallet
 * 2. Connect to network gateway
 * 3. Access EstateNet network
 * 4. Construct request to issue estate
 * 5. Submit transaction
 * 6. Process response
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

// Main program function
async function main() {
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

    const issueResponse = await contract.submitTransaction(
      'issue',
      'MagnetoCorp',
      '00001',
      '2020-05-31',
      '2020-11-30',
      '5000000'
    );

    // process response
    console.log('Process issue transaction response.');

    let estate = Estate.fromBuffer(issueResponse);

    console.log(
      `${estate.issuer} estate : ${estate.estateNumber} successfully issued for value ${
        estate.faceValue
      }`
    );
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
main()
  .then(() => {
    console.log('Issue program complete.');
  })
  .catch(e => {
    console.log('Issue program exception.');
    console.log(e);
    console.log(e.stack);
    process.exit(-1);
  });
