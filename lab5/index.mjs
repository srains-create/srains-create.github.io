import "dotenv/config";

import express from "express";
import mysql from "mysql2/promise";

const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10
});

app.get("/", async (req, res) => {

    const authorSql = `
        SELECT authorId,
               firstName,
               lastName
        FROM q_authors
        ORDER BY lastName
    `;

    const categorySql = `
        SELECT DISTINCT category
        FROM q_quotes
        ORDER BY category
    `;

    const [authors] = await pool.query(authorSql);
    const [categories] = await pool.query(categorySql);

    res.render("index", {
        authors,
        categories
    });
});

app.get("/searchByKeyword", async (req, res) => {

    const keyword = req.query.keyword;

    const sql = `
        SELECT 
            q.quote,
            q.category,
            q.likes,
            a.authorId,
            a.firstName,
            a.lastName
        FROM q_quotes q
        JOIN q_authors a
            ON q.authorId = a.authorId
        WHERE q.quote LIKE ?
        ORDER BY q.likes DESC
    `;

    const [quotes] = await pool.query(sql, [`%${keyword}%`]);

    res.render("results", { quotes });

});

app.get("/searchByAuthor", async (req, res) => {

    const authorId = req.query.authorId;

    const sql = `
        SELECT
            q.quote,
            q.category,
            q.likes,
            a.authorId,
            a.firstName,
            a.lastName
        FROM q_quotes q
        JOIN q_authors a
            ON q.authorId = a.authorId
        WHERE a.authorId = ?
        ORDER BY q.likes DESC
    `;

    const [quotes] = await pool.query(sql, [authorId]);

    res.render("results", { quotes });

});

app.get("/searchByCategory", async (req, res) => {

    const category = req.query.category;

    const sql = `
        SELECT
            q.quote,
            q.category,
            q.likes,
            a.authorId,
            a.firstName,
            a.lastName
        FROM q_quotes q
        JOIN q_authors a
            ON q.authorId = a.authorId
        WHERE q.category = ?
        ORDER BY q.likes DESC
    `;

    const [quotes] = await pool.query(sql, [category]);

    res.render("results", { quotes });
});

app.get("/searchByLikes", async (req, res) => {
    try {
        const minLikes = req.query.minLikes;
        const maxLikes = req.query.maxLikes;

        const sql = `
            SELECT
                q.quote,
                q.category,
                q.likes,
                a.authorId,
                a.firstName,
                a.lastName
            FROM q_quotes q
            JOIN q_authors a
                ON q.authorId = a.authorId
            WHERE q.likes BETWEEN ? AND ?
            ORDER BY q.likes DESC
        `;

        const [quotes] = await pool.query(sql, [
            minLikes,
            maxLikes
        ]);

        res.render("results", { quotes });

    } catch (err) {
        console.error("Likes search error:", err);
        res.status(500).send("Database error");
    }
});

app.get("/api/quotes", async (req, res) => {

    const sql = `
        SELECT
            q.quote,
            q.category,
            q.likes,
            a.firstName,
            a.lastName
        FROM q_quotes q
        JOIN q_authors a
            ON q.authorId = a.authorId
        ORDER BY q.likes DESC
    `;

    const [quotes] = await pool.query(sql);

    res.json(quotes);

});

app.get("/dbTest", async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT CURDATE() AS today");
        res.send(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send("Database Error");
    }
});


app.get("/authors", async (req, res) => {
    try {
        const [authors] = await pool.query(`
            SELECT
                authorId,
                firstName,
                lastName,
                profession,
                country,
                portrait
            FROM q_authors
            ORDER BY lastName
        `);

        res.render("authors", { authors });
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).send("Database error");
    }
});

app.get("/quotes", async (req, res) => {

    const sql = `
        SELECT q.quote,
               q.category,
               q.likes,
               a.firstName,
               a.lastName
        FROM q_quotes q
        JOIN q_authors a
            ON q.authorId = a.authorId
        ORDER BY q.likes DESC;
    `;

    const [quotes] = await pool.query(sql);

    res.render("quotes", { quotes });

});

app.get("/api/author/:id", async (req, res) => {
    try {
        const authorId = req.params.id;

        const sql = `
            SELECT *
            FROM q_authors
            WHERE authorId = ?
        `;

        const [rows] = await pool.query(sql, [authorId]);

        res.json(rows);
    } catch (err) {
        console.error("Author API error:", err);
        res.status(500).json({ error: "Database error" });
    }
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});