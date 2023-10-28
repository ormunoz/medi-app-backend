require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const userRoutes = require('./router/users.routes');
const questionRoutes = require('./router/questionsOptions.routes');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static(path.join(__dirname, './public')));
app.use(express.json({ limit: '50mb' }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true,
    limit: '50mb'
}));
const url_default = '/api/v1/'
app.use(url_default + 'auth/', userRoutes);
app.use(url_default + 'question/', questionRoutes);

app.listen(PORT, err => {
    if (err) {
        console.error("Error escuchando: ", err);
        return;
    }
    console.log(`Escuchando en el puerto ${PORT}`);
});