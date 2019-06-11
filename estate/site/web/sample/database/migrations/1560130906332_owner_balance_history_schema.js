'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class OwnerBalanceHistorySchema extends Schema {
  up() {
    this.create('owner_balance_histories', table => {
      table.increments();
      table
        .integer('user_id')
        .unsigned()
        .references('id')
        .inTable('users');
      table.integer('amount').unsigned();
      table.timestamps();
    });
  }

  down() {
    this.drop('owner_balance_histories');
  }
}

module.exports = OwnerBalanceHistorySchema;
