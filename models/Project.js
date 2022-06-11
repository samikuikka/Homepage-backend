const mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

function isOverdue(lastReview, overdue) {
    let date = new Date();
    const noOverdue = new Date(date.getTime());
    noOverdue.setDate(date.getDate() - overdue);

    return noOverdue.getTime() > lastReview.getTime();
}


const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true
    },
    createdAt: {
        type: Date,
        immutable: true,
        default: () => Date.now()
    },
    lastReview: {
        type: Date,
        default: () => Date.now()
    },
    reviewFreq: {
        type: Number
    },
    overdue: {
        type: Boolean,
        default: function() {
            if(!this.reviewFreq) return false;
    
            if(isOverdue(this.lastReview, this.overdue)) {
                return true;
            } else {
                return false;
            }
        }
    },
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
    if(this.lastReview.getTime() < new Date().getTime()) {
        this.overdue = true;
    }
    this.lastReview = Date.now();
    this.save();
    return this;
}

projectSchema.plugin(uniqueValidator);

projectSchema.set('toJSON', {
    trasnform: (document, object) => {
        object.id = object._id;
        delete object._id;
        delete object.__v;
    }
})

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;

