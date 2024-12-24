const userRoutes = require("./services/User/routes/userRoutes")
const authRoutes = require("./services/Auth/routes/authRoutes")
const mediaRoutes = require("./services/Media/routes/mediaRoutes")

const configureRoutes = (app) => {
    app.use("/api/auth", authRoutes);
    app.use("/api/user", userRoutes);
    app.use("/api/media", mediaRoutes);
}

module.exports = configureRoutes;