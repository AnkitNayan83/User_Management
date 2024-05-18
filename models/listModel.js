import mongoose from "mongoose";

const CustomFieldSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    defaultValue: {
        type: String,
    },
});

const listSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    customProperties: [CustomFieldSchema],
});

export default mongoose.model("List", listSchema);
