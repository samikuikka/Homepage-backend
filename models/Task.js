const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    done: {
        type: Boolean,
        default: false
    },
    dueDate: {
        type: Date,
    },
    context: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Context'
    }],
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    hiPriority: {
        type: Boolean,
        default: false
    },
    duration: {
        type: Number
    }
})

taskSchema.set('toJSON', {
    transform: (document, object) => {
        object.id = object._id;
        delete object._id;
        delete object.__v;
    }
})

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;