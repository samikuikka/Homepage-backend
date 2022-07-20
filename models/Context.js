const mongoose = require('mongoose');

const contextSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

contextSchema.set('toJSON', {
    transform: (document, object) => {
        object.id = object._id;
        delete object._id;
        delete object.__v;
    }
});

const Context = mongoose.model('Context', contextSchema);
module.exports = Context;
