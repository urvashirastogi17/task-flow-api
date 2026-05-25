import mongoose, {Schema} from 'mongoose';
import { type } from 'node:os';
import { title } from 'node:process';

const taskSchema = new Schema({
    title:{
        type: String,
        required: true,
        trim: true
    },
    description:{
        type: String,
        trim: true
    },
    completed:{
        type: Boolean,
        default: false
    },
    priority:{
        type:String,
        enum:[ // Restricts Value 
            "low",
            "medium",
            "high"
        ],
        default: "medium"
    },
    owner:{
        type: Schema.Types.ObjectId,
        ref: "User", // creates relationship equivalent to foreign key
        required: true
    }
},{
    timestamps: true
});

export const Task = mongoose.model("Task", taskSchema);