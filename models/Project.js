const mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true
    },
    createdAt: {
        type: Date,
        immutable,
        default: () => Date.now()
    },
    lastReview: {
        type: Date,
        default: () => Date.now()
    },
    overdue: Boolean,
    tasks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
    }],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
})

projectSchema.methods.review = function() {
    this.lastReview = Date.now();
    if(this.lastReview.getTime() < Date.now().getTime()) {
        this.overdue = true;
    }
    this.save();
}

projectSchema.pluqin(uniqueValidator);

projectSchema.set('toJSON', {
    trasnform: (document, object) => {
        object.id = object._id;
        delete object._id;
        delete object.__v;
    }
})

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;

