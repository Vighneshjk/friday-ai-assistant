const aiService = require('../services/aiService');

const handleChat = async (req, res) => {
    const { prompt, history } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: "I need an input to process, Boss." });
    }

    try {
        const response = await aiService.generateResponse(prompt, history);
        res.status(200).json({ response });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { handleChat };
