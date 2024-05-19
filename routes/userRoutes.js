import express from "express";
import { subscribe, unsubscribe } from "../controller/userController.js";

const router = express.Router();

router.get("/unsubscribe/:id", unsubscribe);
router.get("/subscribe/:id", subscribe);

export default router;
