'use strict';

const fs = require('fs');
const yaml = require('js-yaml');
const { FileSystemWallet, Gateway } = require('fabric-network');

const wallet = new FileSystemWallet(__dirname + '/../../../identity/user/owners/wallet');

const Estate = require(__dirname + '/../../contract/lib/estate.js');

class Fabric {
  static async estateContract(gateway) {
    // Specify userName for network access
    const userName = 'User1@org1.example.com';

    // Load connection profile; will be used to locate a gateway
    let connectionProfile = yaml.safeLoad(
      fs.readFileSync(__dirname + '/../../gateway/networkConnection.yaml', 'utf8')
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

    return await network.getContract('estatecontract', 'org.estatenet.estate');
  }

  static async create(estate) {
    const gateway = new Gateway();
    try {
      let contract = await Fabric.estateContract(gateway);
      let response = await contract.submitTransaction(
        'create',
        estate.code, // '000002',
        estate.ownercode, // 'SCFoundation',
        estate.name, // 'GoldWing 2',
        estate.category, // 'apart',
        estate.price, // '60000000',
        estate.unit, // '100000',
        estate.devideTerm, // '12',
        estate.establishedAt // '2010-05-12'
      );
      return Estate.fromBuffer(response);
    } catch (error) {
      console.log(`Error processing transaction. ${error}`);
      console.log(error.stack);
      return null;
    } finally {
      // Disconnect from the gateway
      console.log('Disconnect from Fabric gateway.');
      gateway.disconnect();
    }
  }

  static async find(category, code) {
    const gateway = new Gateway();
    try {
      let contract = await Fabric.estateContract(gateway);
      let response = await contract.submitTransaction('find', category, code);
      let estate = Estate.fromBuffer(response);
      let histories = {};

      for (let key in estate.histories) {
        let history = estate.histories[key];
        if (!histories[history.purchasedAt]) {
          histories[history.purchasedAt] = [];
        }
        histories[history.purchasedAt].push({
          ownercode: history.ownercode,
          amount: history.amount
        });
      }
      estate.histories = histories;
      return estate;
    } catch (error) {
      console.log(`Error processing transaction. ${error}`);
      console.log(error.stack);
      return null;
    } finally {
      // Disconnect from the gateway
      console.log('Disconnect from Fabric gateway.');
      gateway.disconnect();
    }
  }

  static async estates() {
    const gateway = new Gateway();
    try {
      let contract = await Fabric.estateContract(gateway);
      let response = await await contract.submitTransaction('findAll');
      let estates = Estate.fromBuffer(response);
      let result = [];
      for (var key in estates) {
        if (estates[key] && estates[key]['Record']) {
          console.log(key, estates[key]['Record']);
          result.push(estates[key]['Record']);
        }
      }
      return result;
    } catch (error) {
      console.log(`Error processing transaction. ${error}`);
      console.log(error.stack);
      return null;
    } finally {
      // Disconnect from the gateway
      console.log('Disconnect from Fabric gateway.');
      gateway.disconnect();
    }
  }
}

module.exports = Fabric;
