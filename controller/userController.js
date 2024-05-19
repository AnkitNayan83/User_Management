import User from "../models/userModel.js";

export const unsubscribe = async (req, res, next) => {
    try {
        const id = req.params.id;
        if (!id) {
            return next({ message: "User id is not found in the url", status: 400 });
        }
        const user = await User.findById(id);

        if (!user) {
            return next({ message: "user not found", status: 404 });
        }

        user.subscribed = false;
        await user.save();
        res.status(200).json({ message: "user unsubscribed successfully" });
    } catch (error) {
        next(error);
    }
};

export const subscribe = async (req, res, next) => {
    try {
        const id = req.params.id;
        if (!id) {
            return next({ message: "User id is not found in the url", status: 400 });
        }
        const user = await User.findById(id);

        if (!user) {
            return next({ message: "user not found", status: 404 });
        }

        user.subscribed = true;
        await user.save();
        res.status(200).json({ message: "user unsubscribed successfully" });
    } catch (error) {
        next(error);
    }
};
