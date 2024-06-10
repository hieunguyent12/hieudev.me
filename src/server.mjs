import express from "express";
import { micromark } from "micromark";
import matter from "gray-matter";
import mustache from "mustache";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";

const app = express();
const port = 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, "../public");
const blogsDir = path.join(__dirname, "../blogs");
const HTML_TEMPLATE = fs.readFileSync(
  path.join(blogsDir, "postTemplate.html"),
  "utf-8"
);
mustache.parse(HTML_TEMPLATE); // parse the template ahead of time

app.use(express.static(publicDir, { extensions: ["html", "css"] }));

app.get("/getposts", (req, res) => {
  // get all available posts
  fs.readdir(blogsDir, (err, files) => {
    if (err) {
      return res.json({
        error: "unable to get posts",
      });
    }
    const posts = [];
    files.forEach((file) => {
      const f = path.parse(file);
      if (f.ext == ".md") {
        const content = fs.readFileSync(path.join(blogsDir, file), "utf-8");
        if (content.length !== 0) {
          const matterData = matter(content);
          posts.push(matterData.data.title);
        }
      }
    });
    return res.json(posts);
  });
});

app.get("/posts/:post", (req, res) => {
  fs.readdir(blogsDir, (err, files) => {
    if (err) {
      return res.json({
        error: "unable to retrieve post",
      });
    }
    // iteratate through all the posts and find the one with the matching title
    for (let i = 0; i < files.length; i++) {
      const file = path.parse(files[i]);
      if (file.ext == ".md") {
        const content = fs.readFileSync(
          path.join(blogsDir, file.base),
          "utf-8"
        );

        if (content.length === 0) continue; // empty file

        const matterData = matter(content);
        let title = matterData.data.title.toLowerCase();
        title = title.replace(/ +/g, "-"); // hyphenate the string ex. (this is a title) -> (this-is-a-title)

        if (title === req.params.post) {
          const out = mustache.render(HTML_TEMPLATE, {
            post: micromark(matterData.content), // pass the markdown content through micromark to transform to HTML
          });
          return res.send(out);
        }
      }
    }

    return res.json({
      error: "post not found",
    });
  });
});

app.get("/health", (req, res) => {
  res.send("working");
});

app.use((req, res, next) => {
  res.status(404).send("404 Error");
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
