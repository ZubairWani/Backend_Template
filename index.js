const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const path = require('path');
const http = require('http');
const socket = require('./src/socket/socket.js');
const dbConnect = require('./database/db.connection.js');
const dotenv = require('dotenv');
const configureRoutes = require('./src/routes.config.js');
dotenv.config();
const swaggerUi = require("swagger-ui-express")
const swaggerDocument = require("./swagger-output.json")


const app = express();
app.use(express.json());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Configure CORS
const corsOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan('common'));

// Static file serving
app.use('/uploads/images', express.static(path.join(__dirname, 'uploads', 'images')));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Set up HTTP server and socket.io
const server = http.createServer(app);
const io = socket.init(server);

module.exports = {
    app,
    server,
    io
};

configureRoutes(app);
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument))
app.get("/", (req, res) => {
    return res.status(200).json({ message: "Backend" })
})

const port = process.env.BACKEND_PORT
server.listen(port, async () => {
    await dbConnect()
    console.log(`Backend server is running on port ${port}`);
});