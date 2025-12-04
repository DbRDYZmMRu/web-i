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
          // Standard 0.5 inch (720 twips) first-line indent for poetry/prose lines
          indent: { firstLine: 720 }, 
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
      // Style for the main book title on the title page
      {
        id: "TitleStyle",
        name: "Title Style",
        run: { size: 56, bold: true },
        paragraph: { alignment: AlignmentType.CENTER, spacing: { after: 1000 } },
      },
      // Style for the author name on the title page
      {
        id: "AuthorStyle",
        name: "Author Style",
        run: { size: 36 },
        paragraph: { alignment: AlignmentType.CENTER },
      },
    ],
  },
});

// --- Title Page ---
// FIX: Removed unnecessary wrapping array `[]` around children.
doc.addSection({
  children: [
    new Paragraph({
      children: [new TextRun({ text: book.bookTitle })],
      style: "TitleStyle", // Use custom style for title formatting
    }),
    new Paragraph({
      children: [new TextRun({ text: "Frith Hilton" })],
      style: "AuthorStyle", // Use custom style for author name
    }),
  ],
});

// --- Copyright & Dedication ---
doc.addSection({
  children: [
    new Paragraph({ text: book.bookTitle, alignment: AlignmentType.CENTER, keepLines: true }),
    new Paragraph({ text: "© 2025 Frith Hilton. All rights reserved.", alignment: AlignmentType.CENTER, keepLines: true }),
    new Paragraph({ 
        text: `Dedicated to ${book.dedicatee}`, 
        alignment: AlignmentType.CENTER, 
        spacing: { before: 400 }, 
        keepLines: true 
    }),
    new Paragraph({ text: `First edition — ${book.releaseDate}`, alignment: AlignmentType.CENTER, keepLines: true }),
  ],
});

// --- Table of Contents ---
doc.addSection({
  children: [
    // FIX: Use the custom Heading1 style for desired alignment and spacing
    new Paragraph({ text: "Contents", style: "Heading1" }),
    new Paragraph({ text: "", spacing: { after: 480 } }), 
    
    // Create TOC entries using the Normal style
    ...book.poems.map(poem => new Paragraph({ text: poem.title, style: "Normal" })),
    
    // Page break ensures the poems start on a fresh page
    new Paragraph({ break: 1 }),
  ],
});

// --- Poems ---
book.poems.forEach(poem => {
  const poemKey = String(poem.number);
  
  // FIX: Reverted content lookup to match the array structure of your JSON:
  // book.content is an array, and the content object is the first element [0]
  const rawHtml = book.content[0]?.[poemKey] || "";

  const lines = htmlToText(rawHtml, { wordwrap: false })
    .split("\n")
    .map(l => l.trim());
    // NOTE: We do NOT filter empty lines here to preserve stanza breaks.

  doc.addSection({
    // Add a page break to ensure each poem starts on a new page
    properties: { break: "page" },
    children: [
      new Paragraph({ 
          text: poem.title, 
          style: "Heading1", 
          alignment: AlignmentType.CENTER,
          // Ensure the title stays with the first line of the poem
          keepNext: true 
      }),
      // Map lines to paragraphs
      ...lines.map(line => new Paragraph({ 
          text: line, 
          style: "Normal",
          // Reset firstLine indent for intentional blank lines (stanza breaks)
          indent: line === "" ? { firstLine: 0 } : { firstLine: 720 }, 
          // Ensure stanzas don't break across pages where possible
          keepLines: true,
      })),
      new Paragraph(""), // Blank line at end of poem
    ],
  });
});

// --- Back matter ---
doc.addSection({
  children: [
    new Paragraph({ text: "More poetry by Frith Hilton", style: "Heading1" }),
    new Paragraph({
      children: [
        new TextRun("Visit my poetry collection: "),
        new TextRun({
          text: book.url,
          color: "0000EE",
          underline: true,
        }),
      ],
      alignment: AlignmentType.CENTER,
    }),
  ],
});

// --- Save file ---
const safeTitle = book.bookTitle.replace(/[<>:"/\\|?*]/g, ""); // remove invalid filename chars
const outputPath = `${safeTitle} – KDP ready.docx`;

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync(outputPath, buffer);
  console.log(`KDP-ready DOCX created: ${outputPath}`);
}).catch(err => {
    console.error("Error creating DOCX file:", err);
    // Include error details for debugging the CI/CD workflow
    if (err.stack) console.error(err.stack);
});
