/*
SPDX-License-Identifier: Apache-2.0
*/

'use strict';

// Fabric smart contract classes
const { Contract, Context } = require('fabric-contract-api');

// EstateNet specifc classes
const Estate = require('./estate.js');
const EstateList = require('./estatelist.js');

/**
 * A custom context provides easy access to list of all commercial papers
 */
class EstateContext extends Context {
    constructor() {
        super();
        // All estates are held in a list of papers
        this.estateList = new EstateList(this);
    }
}

/**
 * Define estate smart contract by extending Fabric Contract class
 *
 */
class EstateContract extends Contract {
    constructor() {
        // Unique name when multiple contracts per chaincode file
        super('org.estatenet.estate');
    }

    /**
     * Define a custom context for commercial paper
     */
    createContext() {
        return new EstateContext();
    }

    /**
     * Instantiate to perform any setup of the ledger that might be required.
     * @param {Context} ctx the transaction context
     */
    async instantiate(ctx) {
        // No implementation required with this example
        // It could be where data migration is performed, if necessary
        console.log('Instantiate the contract');
    }

    /**
     * Create Estate
     *
     * @param {Context} ctx the transaction context
     * @param {String} code estate code
     * @param {String} ownercode estate owner user code
     * @param {String} name estate name
     * @param {String} category estate category (ex. hotel, house, apart
     * @param {Integer} price estate price
     * @param {Integer} unit estate unit per yen.
     * @param {Integer} devideTerm devide term (ex. 6months = 6, 1year = 12
     * @param {Date} establishedAt established date
     */
    async create(ctx, code, ownercode, name, category, price, unit, devideTerm, establishedAt) {
        let histories = [
            {
                ownercode: ownercode,
                amount: price,
                purchasedAt: establishedAt
            }
        ];

        // create an instance of the estate
        let estate = Estate.createInstance(
            code,
            name,
            category,
            price,
            unit,
            devideTerm,
            establishedAt,
            histories
        );

        // Newly created estate is owned by the owner
        // estate.setOwner(owner);

        // Add the estate to the list of all similar estates in the ledger world state
        await ctx.estateList.addEstate(estate);

        // Must return a serialized estate to caller of smart contract
        return estate.toBuffer();
    }

    /**
     * Add histories for estate. (have a property)
     *
     * @param {Context} ctx the transaction context
     * @param {String} category estate category (ex. hotel, house, apart
     * @param {String} code estate code
     * @param {ArrayString} histories estate owner
     */
    async addHistories(ctx, category, code, histories) {
        let estateKey = Estate.makeKey([category, code]);
        let estate = await ctx.estateList.getEstate(estateKey);
        // TODO: 以下のエラー処理はうまく動かない。データがない場合の処理
        if (!estate) {
            console.error('[ERROR] Can not find estate');
            return JSON.stringify({
                status: 'ERROR',
                message: 'Can not find estate'
            });
        }
        let historiesJSON = JSON.parse(histories);
        if (!this.isValidHistories(estate, historiesJSON)) {
            return '[ERROR] histories is invalid'; // TODO: response形式を見直す
        }
        estate.histories = estate.histories.concat(historiesJSON);
        // Update the estate
        await ctx.estateList.updateEstate(estate);
        return estate.toBuffer();
    }

    // 以下validation
    //   - 署名がある
    //   - 新しいownerの配分がmax unit を超えていない
    isValidHistories(estate, histories) {
        // TODO: 署名チェック

        // validate max number
        var total = 0;
        for (let i = 0; i < histories.length; i++) {
            // check unit number
            let amount = histories[i].amount;
            if (amount % estate.unit != 0) {
                console.error('[ERROR] wrong amount = ' + amount);
                return false;
            }
            total += amount;
        }
        if (total > estate.price) {
            console.error('[ERROR] total unit[' + total + '] is over price[' + estate.price + ']');
            return false;
        }
        return true;
    }

    maxUnitNumber(price, unit) {
        return price / unit;
    }

    /**
     * Find estate
     *
     * @param {Context} ctx the transaction context
     * @param {String} category estate category
     * @param {String} code estate code
     */
    async find(ctx, category, code) {
        let estateKey = Estate.makeKey([category, code]);
        // TODO: 以下のエラー処理はうまく動かない。データがない場合の処理
        let estate = await ctx.estateList.getEstate(estateKey);
        if (!estate) {
            return JSON.stringify([]);
        }
        return estate.toBuffer();
    }

    /**
     * Find all estate
     *
     * @param {Context} ctx the transaction context
     */
    async findAll(ctx) {
        let allResults = await ctx.estateList.allEstates();
        return JSON.stringify(allResults);
    }
}

module.exports = EstateContract;
