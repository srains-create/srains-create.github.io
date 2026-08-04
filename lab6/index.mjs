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
    try {
        const [quotes] = await pool.query(`
            SELECT
                q.quoteId,
                q.quote,
                q.category,
                q.likes,
                a.firstName,
                a.lastName
            FROM q_quotes q
            JOIN q_authors a
                ON q.authorId = a.authorId
            ORDER BY q.quoteId DESC
        `);

        res.render("quotes", { quotes });

    } catch (error) {
        console.error("Quotes page error:", error);
        res.status(500).send("Unable to load quotes");
    }
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

app.get("/admin/authors/add", (req, res) => {
    res.render("addAuthor");
});

app.post("/admin/authors/add", async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            dob,
            dod,
            profession,
            country,
            portrait,
            biography
        } = req.body;

        const sql = `
            INSERT INTO q_authors (
                firstName,
                lastName,
                dob,
                dod,
                profession,
                country,
                portrait,
                biography
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        await pool.query(sql, [
            firstName,
            lastName,
            dob,
            dod || null,
            profession,
            country,
            portrait,
            biography
        ]);

        res.redirect("/authors");

    } catch (error) {
        console.error("Add author error:", error);
        res.status(500).send("Unable to add author");
    }
});

app.get("/admin/authors/edit/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await pool.query(
            "SELECT * FROM q_authors WHERE authorId = ?",
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).send("Author not found");
        }

        res.render("editAuthor", {
            author: rows[0]
        });

    } catch (error) {
        console.error("Edit author page error:", error);
        res.status(500).send("Unable to load author");
    }
});

app.post("/admin/authors/edit/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const {
            firstName,
            lastName,
            dob,
            dod,
            profession,
            country,
            portrait,
            biography
        } = req.body;

        const sql = `
            UPDATE q_authors
            SET
                firstName = ?,
                lastName = ?,
                dob = ?,
                dod = ?,
                profession = ?,
                country = ?,
                portrait = ?,
                biography = ?
            WHERE authorId = ?
        `;

        await pool.query(sql, [
            firstName,
            lastName,
            dob,
            dod || null,
            profession,
            country,
            portrait,
            biography,
            id
        ]);

        res.redirect("/authors");

    } catch (error) {
        console.error("Update author error:", error);
        res.status(500).send("Unable to update author");
    }
});

app.get("/admin/authors/delete/:id", async (req, res) => {
    const connection = await pool.getConnection();

    try {
        const { id } = req.params;

        await connection.beginTransaction();

        // Delete quotes connected to this author first
        await connection.query(
            "DELETE FROM q_quotes WHERE authorId = ?",
            [id]
        );

        // Then delete the author
        const [result] = await connection.query(
            "DELETE FROM q_authors WHERE authorId = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).send("Author not found");
        }

        await connection.commit();
        res.redirect("/authors");

    } catch (error) {
        await connection.rollback();
        console.error("Delete author error:", error);
        res.status(500).send("Unable to delete author");

    } finally {
        connection.release();
    }
});

app.get("/admin/quotes/add", async (req, res) => {
    try {

        const [authors] = await pool.query(
            "SELECT authorId, firstName, lastName FROM q_authors ORDER BY lastName"
        );

        const [categories] = await pool.query(
            "SELECT DISTINCT category FROM q_quotes ORDER BY category"
        );

        res.render("addQuote", {
            authors,
            categories
        });

    } catch (error) {
        console.error(error);
        res.status(500).send("Unable to load add quote page");
    }
});

app.post("/admin/quotes/add", async (req, res) => {
    try {
        const {
            quote,
            authorId,
            category,
            likes
        } = req.body;

        const sql = `
            INSERT INTO q_quotes
                (quote, authorId, category, likes)
            VALUES (?, ?, ?, ?)
        `;

        await pool.query(sql, [
            quote,
            authorId,
            category,
            likes
        ]);

        res.redirect("/quotes");

    } catch (error) {
        console.error("Add quote error:", error);
        res.status(500).send("Unable to add quote");
    }
});

app.get("/admin/quotes/edit/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const [quoteRows] = await pool.query(
            "SELECT * FROM q_quotes WHERE quoteId = ?",
            [id]
        );

        if (quoteRows.length === 0) {
            return res.status(404).send("Quote not found");
        }

        const [authors] = await pool.query(
            "SELECT authorId, firstName, lastName FROM q_authors ORDER BY lastName"
        );

        const [categories] = await pool.query(
            "SELECT DISTINCT category FROM q_quotes ORDER BY category"
        );

        res.render("editQuote", {
            currentQuote: quoteRows[0],
            authors,
            categories
        });

    } catch (error) {
        console.error("Edit quote page error:", error);
        res.status(500).send("Unable to load quote");
    }
});

app.post("/admin/quotes/edit/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const {
            quote,
            authorId,
            category,
            likes
        } = req.body;

        await pool.query(
            `
                UPDATE q_quotes
                SET
                    quote = ?,
                    authorId = ?,
                    category = ?,
                    likes = ?
                WHERE quoteId = ?
            `,
            [
                quote,
                authorId,
                category,
                likes,
                id
            ]
        );

        res.redirect("/quotes");

    } catch (error) {
        console.error("Update quote error:", error);
        res.status(500).send("Unable to update quote");
    }
});

app.get("/admin/quotes/delete/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await pool.query(
            "DELETE FROM q_quotes WHERE quoteId = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).send("Quote not found");
        }

        res.redirect("/quotes");

    } catch (error) {
        console.error("Delete quote error:", error);
        res.status(500).send("Unable to delete quote");
    }
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});