const express = require('express');
const app = express();
const PORT = 4320;

app.use(express.urlencoded());
app.use(express.json());












app.listen(PORT, () => {
    console.log('Server running on port' + PORT)
});