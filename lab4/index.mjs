import express from "express";
import fetch from "node-fetch";

const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));

const planets = {
  mercury: { name: "Mercury", radius: 2439, moons: 0, distance: "57.9 million km" },
  venus: { name: "Venus", radius: 6052, moons: 0, distance: "108.2 million km" },
  earth: { name: "Earth", radius: 6371, moons: 1, distance: "149.6 million km" },
  mars: { name: "Mars", radius: 3389, moons: 2, distance: "227.9 million km" },
  jupiter: { name: "Jupiter", radius: 69911, moons: 95, distance: "778.5 million km" },
  saturn: { name: "Saturn", radius: 58232, moons: 146, distance: "1.43 billion km" },
  uranus: { name: "Uranus", radius: 25362, moons: 28, distance: "2.87 billion km" },
  neptune: { name: "Neptune", radius: 24622, moons: 16, distance: "4.50 billion km" }
};


app.get("/planet/:name", (req, res) => {
    const planet = planets[req.params.name.toLowerCase()];

    if (!planet) {
        return res.send("Planet not found");
    }

    res.render("planet", { planet });
});

app.get("/nasa", async (req, res) => {
  const apiUrl =
    "https://api.nasa.gov/planetary/apod?api_key=9mUzIkhlZCZaOoMfspg7jMmwZCZ4LiRHtkgkambD&date=2026-07-14";

  try {
    const response = await fetch(apiUrl);
    const nasa = await response.json();

    res.render("nasa", { nasa });
  } catch (error) {
    console.error("NASA API error:", error);
    res.send("Unable to load NASA Picture of the Day.");
  }
});

const backgrounds = [
    "/images/space1.jpg",
    "/images/space2.jpg",
    "/images/space3.jpg",
    "/images/space4.jpg",
    "/images/space5.jpg"
];

app.get("/", (req, res) => {

    const randomBackground =
        backgrounds[Math.floor(Math.random() * backgrounds.length)];

    res.render("index", {
        background: randomBackground
    });

});

app.listen(3000, () => {
  console.log("Server started at http://localhost:3000");
});