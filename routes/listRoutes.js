import express from "express";
import { createList, sendEmailToUsers, uploadUserToList } from "../controller/listController.js";
import multer from "multer";

const router = express.Router();

const upload = multer({ dest: "uploads/" });

router.post("/", createList);
router.post("/:id/users", upload.single("file"), uploadUserToList);
router.post("/:id/send-mails", sendEmailToUsers);

export default router;
