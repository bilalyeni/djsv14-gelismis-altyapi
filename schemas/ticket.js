const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    userId: { type: String, required: true },
    channelId: { type: String, required: true },
    ticketId: { type: String, required: true },
    createdAt: { type: Date, default: Date.now() },
    claimed: { type: Boolean, default: false },
    claimedBy: { type: String, default: null }    
})

module.exports = mongoose.model('Ticket', ticketSchema);
