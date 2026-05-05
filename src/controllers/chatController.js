const aiService = require('../services/aiService');

const handleChat = async (req, res) => {
    const { prompt, history, image } = req.body;

    if (!prompt && !image) {
        return res.status(400).json({ error: "I need an input or image to process, Boss." });
    }

    try {
        const response = await aiService.generateResponse(prompt, history, image);
        res.status(200).json({ response });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { handleChat };
