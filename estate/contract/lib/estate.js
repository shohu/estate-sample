/*
SPDX-License-Identifier: Apache-2.0
*/

'use strict';

// Utility class for ledger state
const State = require('../ledger-api/state.js');

/**
 * Estate class extends State class
 * Class will be used by application and smart contract to define a estate
 */
class Estate extends State {
    constructor(obj) {
        super(Estate.getClass(), [obj.category, obj.code]);
        Object.assign(this, obj);
    }

    /**
     * Basic getters and setters
     */
    // getOwner() {
    //     return this.owner;
    // }

    // setOwner(newOwner) {
    //     this.owner = newOwner;
    // }

    /**
     * Useful methods to encapsulate commercial estate states
     */
    static fromBuffer(buffer) {
        return Estate.deserialize(Buffer.from(JSON.parse(buffer)));
    }

    toBuffer() {
        return Buffer.from(JSON.stringify(this));
    }

    /**
     * Deserialize a state data to commercial estate
     * @param {Buffer} data to form back into the object
     */
    static deserialize(data) {
        return State.deserializeClass(data, Estate);
    }

    /**
     * Factory method to create a estate object
     */
    static createInstance(code, name, category, price, unit, devideTerm, establishedAt, histories) {
        return new Estate({
            code,
            name,
            category,
            price,
            unit,
            devideTerm,
            establishedAt,
            histories
        });
    }

    static getClass() {
        return 'org.estatenet.estate';
    }
}

module.exports = Estate;
