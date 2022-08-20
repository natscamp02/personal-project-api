require('dotenv').config({ path: './config.env' });
const mongoose = require('mongoose');

const app = require('./app');
const port = process.env.PORT || 5000;

mongoose.connect(process.env.DB_URL).then(() => console.log('Connected to database...'));
app.listen(port, () => console.log(`Listening on port ${port}...`));
