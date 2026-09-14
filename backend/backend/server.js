require('dotenv').config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const express = require('express');
const cors = require('cors');

const contactsRouter = require('./routes/contacts');
const alertsRouter = require('./routes/alerts');
const aiRouter = require('./routes/ai');
const twilioRouter = require('./routes/twilio');
const callmebotRouter = require('./routes/callmebot');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/contacts', contactsRouter);
app.use('/api/alerts', alertsRouter);
app.use('/api/ai', aiRouter);
app.use('/api/twilio', twilioRouter);
app.use('/api/callmebot', callmebotRouter);

app.get('/', (req, res) => {
    res.send('ULTRON Backend is running');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
