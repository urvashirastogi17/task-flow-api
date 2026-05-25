import {User} from '../models/user.models.js';
import { Task } from '../models/task.models.js';
import { getIO } from '../socket/index.js';
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import {mongoose} from 'mongoose';

const createTask = asyncHandler(async(req,res)=>{
    const {title,description, priority} = req.body;

    if(!title){
        throw new ApiError(400, "Title is required")
    }

    const task = await Task.create({
        title,
        description,
        priority,

        owner: req.user._id
    });

    const io = getIO();

    io.emit("taskCreated", task);

    return res.status(201).json(
        new ApiResponse(
        201,
        task,
        "Task created Successfully"
    )
    );
});

const getTasks = asyncHandler(async(req,res)=>{

    // QUERY PARAMS
    const {
        page = 1,
        limit = 10,
        search = "",
        priority,
        completed,
        sortBy = "createdAt"
    } = req.query;

    // PAGINATION
    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    const skip = (pageNumber - 1) * limitNumber;

    // BASE QUERY
    const query = {
        owner: req.user._id
    };

    // SEARCH
    if(search){
        query.$or = [
            {
                title:{
                    $regex: search,
                    $options: "i"
                }
            },
            {
                description:{
                    $regex: search,
                    $options: "i"
                }
            }
        ]
    }

    // FILTER PRIORITY
    if(priority){
        query.priority = priority;
    }

    // FILTER COMPLETED
    if(completed !== undefined){
        query.completed = completed === "true";
    }

    // FETCH TASKS
    const tasks = await Task.find(query)
        .skip(skip)
        .limit(limitNumber)
        .sort({ [sortBy]: -1 })

        // POPULATE OWNER DETAILS
        .populate("owner", "username email");

    return res.status(200).json(
        new ApiResponse(
            200,
            tasks,
            "Tasks fetched successfully"
        )
    )
})

const getTaskById = asyncHandler(async(req,res)=>{
    const {taskId} = req.params;

    if(!mongoose.Types.ObjectId.isValid(taskId)){
    throw new ApiError(400, "Invalid Task ID")
    }

    const task = await Task.findOne({
        _id: taskId,
        owner: req.user._id
    })

    if(!task){
        throw new ApiError(400, "Task not found")
    }

    return res.status(200).json(
        new ApiResponse(
            200, 
            task,
            "Task fetched Successfully"
        )
    )
})

const updateTask = asyncHandler(async(req,res)=>{
    const {taskId} = req.params;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
    throw new ApiError(400, "Invalid Task ID");
    }

    if(Object.keys(req.body || {}).length === 0){
        throw new ApiError(
            400,
            "At least one field is required to update"
        )
    }

    const updatedTask = await Task.findOneAndUpdate(
        {
            _id: taskId,
            owner: req.user._id
        },
        {
            $set: req.body
        },
        {
            new: true
        }
    );

    if(!updatedTask){
        throw new ApiError(404, "Task not found")
    }

    const io = getIO();

    io.emit("taskUpdated", updatedTask);

    return res.status(200).json(
        new ApiResponse(
            200, 
            updatedTask,
            "Task Updated"
        )
    )
})

const deleteTask = asyncHandler(async(req,res)=>{
    const {taskId} = req.params;

    if(!mongoose.Types.ObjectId.isValid(taskId)){
    throw new ApiError(400, "Invalid Task ID")
    }

    const deletedTask = await Task.findOneAndDelete({
        _id: taskId,
        owner: req.user._id
    })

    if(!deletedTask){
        throw new ApiError(404, "Task not found")
    }

    const io = getIO();

    io.emit("taskDeleted", {
    taskId
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Task Deleted"
        )
    )
})

export{
createTask,
getTasks,
getTaskById,
updateTask,
deleteTask
}