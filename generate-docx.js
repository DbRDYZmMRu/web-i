// generate-docx.js
const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = require("docx");
const fs = require("fs");
const path = require("path");
const { htmlToText } = require("html-to-text");

// Load book data
const rawData = fs.readFileSync("book.json", "utf-8");
const book = JSON.parse(rawData);

// Create document
const doc = new Document({
  creator: "Frith Hilton",
  title: book.bookTitle,
  styles: {
    default: {
      document: {
        run: {
          font: "Georgia",
          size: 22, // 11 pt
        },
      },
    },
    paragraphStyles: [
      {
        id: "Normal",
        name: "Normal",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: {
          size: 22,
          font: "Georgia",
        },
        paragraph: {
          indent: { firstLine: 280 }, // ~0.2 inch first-line indent
          spacing: { after: 120 },
        },
      },
      {
        id: "Heading1",
        name: "Heading 1",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: {
          size: 32,
          bold: true,
        },
        paragraph: {
          alignment: AlignmentType.CENTER,
          spacing: { before: 480, after: 240 },
        },
      },
    ],
  },
});

// === Title Page ===
doc.addSection({
  children: [
    [
    new Paragraph({
      children: [new TextRun({ text: book.bookTitle, size: 56, bold: true })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 1000 },
    }),
    new Paragraph({
      children: [new TextRun({ text: "Frith Hilton", size: 36 })],
      alignment: AlignmentType.CENTER,
    }),
  ],
});

// === Copyright & Dedication ===
doc.addSection({
  children: [
    new Paragraph({ text: book.bookTitle, alignment: AlignmentType.CENTER }),
    new Paragraph({ text: "© 2025 Frith Hilton. All rights reserved.", alignment: AlignmentType.CENTER }),
    new Paragraph({ text: `Dedicated to ${book.dedicatee}`, alignment: AlignmentType.CENTER, spacing: { before: 400 } }),
    new Paragraph({ text: `First edition — ${book.releaseDate}`, alignment: AlignmentType.CENTER }),
  ],
});

// === Table of Contents ===
doc.addSection({
  children: [
    new Paragraph({ text: "Contents", heading: HeadingLevel.HEADING_1 }),
    ...book.poems.map(poem => new Paragraph({ text: poem.title, style: "Normal" })),
  ],
});

// === Poems ===
book.poems.forEach(poem => {
  const poemKey = String(poem.number);
  const rawHtml = book.content[0][poemKey] || "";

  const lines = htmlToText(rawHtml, { wordwrap: false })
    .split("\n")
    .map(l => l.trim())
    .filter(l => l !== "");

  doc.addSection({
    children: [
      new Paragraph({ text: poem.title, heading: HeadingLevel.HEADING_1 }),
      ...lines.map(line => new Paragraph({ text: line, style: "Normal" })),
      new Paragraph(""), // blank line at end of poem
    ],
  });
});

// === Back matter ===
doc.addSection({
  children: [
    new Paragraph({ text: "More poetry by Frith Hilton", heading: HeadingLevel.HEADING_1 }),
    new Paragraph({
      children: [
        new TextRun("Visit my poetry collection: "),
        new TextRun({
          text: book.url,
          color: "0000EE",
          underline: true,
        }),
      ],
    }),
  ],
});

// === Save file ===
const safeTitle = book.bookTitle.replace(/[<>:"/\\|?*]/g, ""); // remove invalid filename chars
const outputPath = `${safeTitle} – KDP ready.docx`;

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync(outputPath, buffer);
  console.log(`KDP-ready DOCX created: ${outputPath}`);
});