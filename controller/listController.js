import List from "../models/listModel.js";
import User from "../models/userModel.js";
import fs from "fs";
import csv from "csv-parser";
import dotenv from "dotenv";
import sgMail from "@sendgrid/mail";
import { development } from "../domains.js";

dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const EMAIL = process.env.EMAIL;

/**
 * Creates a new list with the given title and custom properties.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @return {Promise<void>} - A promise that resolves when the list is successfully created.
 * @throws {Error} - If the title is missing in the request body.
 */
export const createList = async (req, res, next) => {
    try {
        const { title, customProperties } = req.body;

        if (!title) {
            return next({ message: "Title is required", status: 400 });
        }

        const list = new List({ title, customProperties });
        await list.save();

        res.status(201).json(list);
    } catch (error) {
        console.log(error);
        next(error);
    }
};

/**
 * Extract user data from csv file and stores it in the list. Takes list id int the request params.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @return {Promise<void>} - A promise that resolves when the users are successfully uploaded to the list.
 * @throws {Error} - If the list is not found or there is an error during the upload process.
 */
export const uploadUserToList = async (req, res, next) => {
    try {
        const listId = req.params.id;
        const errors = [];

        let successCount = 0;
        let failureCount = 0;

        const list = await List.findById(listId);
        if (!list) {
            return next({ message: "List not found", status: 404 });
        }

        const results = [];

        const processRow = async (row) => {
            const userData = { listId, name: row.name, email: row.email, customProperties: {} };
            list.customProperties.forEach((field) => {
                userData.customProperties[field.title] = row[field.title] || field.defaultValue;
            });

            try {
                const existingUser = await User.findOne({ email: userData.email, listId });
                if (existingUser) {
                    throw new Error("Email already exists in the list");
                }

                const user = new User(userData);
                await user.save();
                successCount++;
            } catch (error) {
                failureCount++;
                errors.push({ row, error: error.message });
            }
        };

        const stream = fs.createReadStream(req.file.path).pipe(csv());

        stream.on("data", (row) => {
            results.push(processRow(row));
        });

        stream.on("end", async () => {
            await Promise.all(results);
            fs.unlinkSync(req.file.path);
            res.status(200).json({
                successCount,
                failureCount,
                total: successCount + failureCount,
                errors,
            });
        });

        stream.on("error", (error) => {
            fs.unlinkSync(req.file.path);
            next(error);
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Sends emails to all users in a list.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @return {Promise<void>} - A promise that resolves when the emails are sent successfully.
 * @throws {Error} - If the list is not found or there is an error during the email sending process.
 */

export const sendEmailToUsers = async (req, res, next) => {
    try {
        const listId = req.params.id;
        const list = await List.findById(listId);
        if (!list) {
            return next({ message: "List not found", status: 404 });
        }

        const users = await User.find({ listId, subscribed: true });

        const emails = users.map((user) => ({
            to: user.email,
            from: EMAIL,
            subject: `Hello ${user.name}`,
            html: `<div>
                         <h1>Hello ${user.name}</h1>
                         <p>Thank you for signing up with your email ${user.email}. We have received your data.</p>
                         <p> If you dont wnat to recienve this email, please click here to <a href="${development}/api/user/unsubscribe/${user._id}">unsubscribe</a> </p>
                       </div>`,
        }));
        // for free tier we can only send 100 mails per day
        await sgMail.send(emails);

        res.status(200).json({ message: "Emails sent successfully" });
    } catch (error) {
        console.log(error);
        next(error);
    }
};
