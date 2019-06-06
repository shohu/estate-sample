/*
SPDX-License-Identifier: Apache-2.0
*/

'use strict';

// Utility class for collections of ledger states --  a state list
const StateList = require('./../ledger-api/statelist.js');

const Estate = require('./estate.js');

class EstateList extends StateList {
    constructor(ctx) {
        super(ctx, 'org.estatenet.estatelist');
        this.use(Estate);
    }

    async addEstate(estate) {
        return this.addState(estate);
    }

    async getEstate(estateKey) {
        return this.getState(estateKey);
    }

    async updateEstate(estate) {
        return this.updateState(estate);
    }

    async allEstates() {
        let query = `{
            "selector": {
                "price": {
                    "$gt": 0
                }
            }
        }`;
        return this.findByQuery(query);
    }
}

module.exports = EstateList;
