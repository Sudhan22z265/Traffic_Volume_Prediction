const express = require('express');
const app = express();
const holidayRouter = require('./holidayRouter');

app.use('/holidays', holidayRouter);

const PORT = process.env.PORT || 5500;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
