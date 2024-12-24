const swaggerAutogen = require("swagger-autogen")();

const doc = {
    info: {
        title: "Backend",
        description: "Docs for all the API's"
    },
    host: "localhost:8080",
    schemes: ["http"],
    tags: [
        { name: "Auth", description: "All the Api's related to Authentications" },
        { name: "Players", description: "All the Api's related to player" },
        { name: "Stats", description: "All the Api's related to Stats" },
        { name: "Teams", description: "All the Api's related to Teams" },
        { name: "Matches", description: "All the Api's related to Matches" },
        { name: "Tournaments", description: "All the Api's related to Tournaments" },
        { name: "Academy", description: "All the Api's related to Academy" },
        { name: "Home", description: "All the Api's related to Home" },
        { name: "Media", description: "All the Api's related to Media" },
        { name: "MatchScore", description: "All the Api's related to MatchScore" },
        { name: "Notifications", description: "All the Api's related to Notifications" },
        { name: "Payments", description: "All the Api's related to Payments" },
        { name: "Pricings", description: "All the Api's related to Pricings" },
        { name: "Subscriptions", description: "All the Api's related to Subscriptions" },
        { name: "Posts", description: "All the Api's related to Posts" },
        { name: "Referral Codes", description: "All the Api's related to Referral Codes" },
        { name: "Reports", description: "All the Api's related to Reports" },
        { name: "Stream V1", description: "All the Api's related to Stream V1" },
        { name: "Stream V2", description: "All the Api's related to Stream V2" },
        { name: "WebApp", description: "All the Api's related to WebApp" },
        { name: "Chat V1", description: "All the Api's related to Chat V1" },
        { name: "Chat V2", description: "All the Api's related to Chat V2" },
        { name: "Admin", description: "All the Api's related to Admin" },
        { name: "SuperUser", description: "All the Api's related to SuperUser" },
    ]
};

const outputFile = "./swagger-output.json";
const routes = ["./src/routes.config.js"];

swaggerAutogen(outputFile, routes, doc);
