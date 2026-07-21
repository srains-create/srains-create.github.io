import express from "express";
import axios from "axios";
import { faker } from "@faker-js/faker";

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("index", { page: "home" });
});

app.get("/qualification", (req, res) => {
  const sampleLead = {
    name: faker.person.fullName(),
    email: faker.internet.email(),
    company: faker.company.name(),
    jobTitle: faker.person.jobTitle()
  };

  res.render("qualification", {
    page: "qualification",
    sampleLead
  });
});

app.get("/automation", (req, res) => {
  res.render("automation", { page: "automation" });
});

app.get("/ethical-ai", (req, res) => {
  res.render("ethical-ai", { page: "ethical-ai" });
});

app.get("/news", async (req, res) => {
  try {
    const response = await axios.get(
      "https://hn.algolia.com/api/v1/search?query=artificial%20intelligence&tags=story"
    );

    const articles = response.data.hits.slice(0, 6);

    res.render("news", {
      page: "news",
      articles,
      error: null
    });
  } catch (error) {
    console.error(error.message);

    res.render("news", {
      page: "news",
      articles: [],
      error: "AI news is temporarily unavailable."
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});