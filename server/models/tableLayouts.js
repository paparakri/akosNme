const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const TableLayoutSchema = new mongoose.Schema({
    club: {
        type: ObjectId,
        required: true,
        min: 3,
        max: 50
    },
    name: {
        type: String,
        required: true,
        default: Date().toLocaleDateString('en-GB'),
        min: 3,
        max: 50
    },
    tables: {
        type: Array
    }
},{timestamps:true});

const TableLayout = mongoose.model('TableLayout', TableLayoutSchema);
module.exports = TableLayout;