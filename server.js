const express = require("express");
const path = require("path");

const app = express();

app.use(express.static(path.join(__dirname, "/public")));

app.get("/home", (req, res) => {
	res.sendFile(path.join(__dirname, "/public/index.html"));
});

app.get("/about", (req, res) => {
	res.sendFile(path.join(__dirname, "/public/about.html"));
});

app.use((req, res) => {
	res.status(404);
	res.sendFile(path.join(__dirname, "/public/404.html"));
});

app.listen(3000, () => {
	console.log("Server started on port 3000");
});
