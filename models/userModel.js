import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    listId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "List",
        required: true,
    },
    subscribed: {
        type: Boolean,
        default: true,
    },
    customProperties: Map,
});

export default mongoose.model("User", UserSchema);
