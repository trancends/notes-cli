import fs from "node:fs/promises";
import http from "node:http";
import open, { apps } from "open";

/**
 * Replaces all the placeholders inside a string of HTML with corresponding values.
 *
 * @param {string} html - The string of HTML with placeholders to be replaced.
 * @param {object} data - An object containing key-value pairs of placeholder-value.
 * @return {string} The HTML string with all placeholders replaced by their corresponding values.
 */
export const interpolate = (html, data) => {
  // {{notes}} -> data.notes
  return html.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, placeholder) => {
    return data[placeholder] || "";
  });
};

export const formatNotes = (notes) => {
  return notes
    .map((note) => {
      return `<div class="note">
      <p>${note.content}</p>
      <div class="tags">
        ${note.tags.map((tag) => `<span class="tag>${tag}</span>`)}
      </div>
    </div>`;
    })
    .join("\n");
};

export const createServer = (notes) => {
  return http.createServer(async (req, res) => {
    const HTML_PATH = new URL("./template.html", import.meta.url).pathname;
    const template = await fs.readFile(HTML_PATH, "utf-8");
    const html = interpolate(template, { notes: formatNotes(notes) });

    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(html);
  });
};

export const start = (notes, port) => {
  const server = createServer(notes);

  server.listen(port, () => {
    const address = `http:localhost:${port}`;
    console.log(`server on ${address}`);
    open(address, {
      app: {
        name: apps.firefox,
      },
    });
  });
};
