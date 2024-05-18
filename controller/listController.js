import List from "../models/listModel.js";
import User from "../models/userModel.js";
import fs from "fs";
import csv from "csv-parser";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const EMAIL = process.env.EMAIL;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;

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

export const sendEmailToUsers = async (req, res, next) => {
    const listId = req.params.id;
    const list = await List.findById(listId);
    if (!list) {
        return next({ message: "List not found", status: 404 });
    }

    const users = await User.find({ listId });

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: EMAIL,
            pass: EMAIL_PASSWORD,
        },
    });

    const emailPromises = users.map((user) => {
        const mailOptions = {
            from: EMAIL,
            to: user.email,
            subject: "Hello from our app",
            html: `<div>
                    <h1>Hello ${user.name}</h1>
                    <p> Thankyou for signing up with your email ${user.email}. We have recieved your data.</p>
                </div>`,
        };

        return transporter.sendMail(mailOptions);
    });

    try {
        await Promise.all(emailPromises);
        res.status(200).send({ message: "Emails sent successfully" });
    } catch (error) {
        next(error);
    }
};
