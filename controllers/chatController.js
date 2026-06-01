const Chat = require("../models/Chat");
const VitalLog = require("../models/VitalLog");

// @POST /api/chat/message
exports.sendMessage = async (req, res, next) => {
  try {
    const { message, chatId } = req.body;
    if (!message) return res.status(400).json({ success: false, message: "Message is required" });

    const user = req.user;

    // Get latest vitals for context
    const latestLog = await VitalLog.findOne({ user: user._id }).sort({ date: -1 });

    const systemPrompt = `You are Cogniva AI, an elite health assistant for ${user.name}, ${user.profile?.age || ""}${user.profile?.gender ? " " + user.profile.gender : ""} from ${user.profile?.city || "India"}.
Current vitals: ${latestLog ? `HR ${latestLog.heartRate || "N/A"} BPM, BP ${latestLog.systolic || "N/A"}/${latestLog.diastolic || "N/A"}, Sleep ${latestLog.sleepHours || "N/A"}h, Water ${latestLog.waterIntake ? (latestLog.waterIntake * 0.25).toFixed(1) + "L" : "N/A"}` : "No recent vitals logged."}
Health goal: ${user.profile?.goal || "Overall wellness"}. Streak: ${user.streak} days.
Be warm, concise, and actionable. Never diagnose — always recommend consulting a doctor for medical decisions. Use emojis sparingly.`;

    // Find or create chat session
    let chat;
    if (chatId) {
      chat = await Chat.findOne({ _id: chatId, user: user._id });
    }
    if (!chat) {
      chat = await Chat.create({ user: user._id, title: message.slice(0, 40) });
    }

    // Build message history for API
    const history = chat.messages.slice(-10).map(m => ({ role: m.role, content: m.content }));
    history.push({ role: "user", content: message });

    // Save user message
    chat.messages.push({ role: "user", content: message });

    // Call Anthropic API
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: systemPrompt,
        messages: history,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || "AI service unavailable");
    }

    const data = await response.json();
    const aiReply = data.content?.[0]?.text || "I couldn't generate a response.";

    // Save AI reply
    chat.messages.push({ role: "assistant", content: aiReply });
    await chat.save();

    res.json({ success: true, data: { reply: aiReply, chatId: chat._id } });
  } catch (err) { next(err); }
};

// @GET /api/chat/history
exports.getChatHistory = async (req, res, next) => {
  try {
    const chats = await Chat.find({ user: req.user._id, isActive: true })
      .sort({ updatedAt: -1 }).limit(20)
      .select("title updatedAt messages");

    res.json({ success: true, data: chats });
  } catch (err) { next(err); }
};

// @GET /api/chat/:id
exports.getChat = async (req, res, next) => {
  try {
    const chat = await Chat.findOne({ _id: req.params.id, user: req.user._id });
    if (!chat) return res.status(404).json({ success: false, message: "Chat not found" });
    res.json({ success: true, data: chat });
  } catch (err) { next(err); }
};

// @DELETE /api/chat/:id
exports.deleteChat = async (req, res, next) => {
  try {
    await Chat.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { isActive: false });
    res.json({ success: true, message: "Chat deleted" });
  } catch (err) { next(err); }
};
