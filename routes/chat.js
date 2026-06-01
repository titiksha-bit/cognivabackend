// routes/chat.js
const chatRouter = require("express").Router();
const { sendMessage, getChatHistory, getChat, deleteChat } = require("../controllers/chatController");
const { protect } = require("../middleware/auth");
chatRouter.use(protect);
chatRouter.post("/message", sendMessage);
chatRouter.get("/history",  getChatHistory);
chatRouter.get("/:id",      getChat);
chatRouter.delete("/:id",   deleteChat);
module.exports = chatRouter;
