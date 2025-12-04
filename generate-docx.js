// generate-docx.js
const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = require("docx");
const fs = require("fs");
const path = require("path");
const { htmlToText } = require("html-to-text");

// Load book data
const rawData = fs.readFileSync("book.json", "utf-8");
const book = JSON.parse(rawData);

// Array to hold all sections before creating the final Document
const sections = [];

// Define custom styles once
const customStyles = {
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
          // Standard 0.5 inch (720 twips) first-line indent
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
};


// 1. --- Title Page Section ---
sections.push({
  children: [
    new Paragraph({
      children: [new TextRun({ text: book.bookTitle })],
      style: "TitleStyle",
    }),
    new Paragraph({
      children: [new TextRun({ text: "Frith Hilton" })],
      style: "AuthorStyle",
    }),
  ],
});


// 2. --- Copyright & Dedication Section ---
sections.push({
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


// 3. --- Table of Contents Section ---
sections.push({
  children: [
    new Paragraph({ text: "Contents", style: "Heading1" }),
    new Paragraph({ text: "", spacing: { after: 480 } }), 
    
    ...book.poems.map(poem => new Paragraph({ text: poem.title, style: "Normal" })),
    
    // Page break ensures the next content starts on a fresh page
    new Paragraph({ break: "page" }),
  ],
});


// 4. --- Poems Sections ---
book.poems.forEach(poem => {
  const poemKey = String(poem.number);
  
  // Correct content lookup matching the array structure: book.content[0]
  const rawHtml = book.content[0]?.[poemKey] || "";

  const lines = htmlToText(rawHtml, { wordwrap: false })
    .split("\n")
    .map(l => l.trim());

  sections.push({
    // Add a page break to ensure each poem starts on a new page
    properties: { break: "page" },
    children: [
      new Paragraph({ 
          text: poem.title, 
          style: "Heading1", 
          alignment: AlignmentType.CENTER,
          keepNext: true // Keep the title with the first line of the poem
      }),
      
      ...lines.map(line => new Paragraph({ 
          text: line, 
          style: "Normal",
          // Reset firstLine indent for intentional blank lines (stanza breaks)
          indent: line === "" ? { firstLine: 0 } : { firstLine: 720 }, 
          keepLines: true,
      })),
      new Paragraph(""), // Blank line at end of poem
    ],
  });
});


// 5. --- Back matter Section ---
sections.push({
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


// Create document - FIX APPLIED HERE: Pass the accumulated 'sections' array
const doc = new Document({
  creator: "Frith Hilton",
  title: book.bookTitle,
  styles: customStyles,
  // This is the FIX for "options.sections is not iterable"
  sections: sections, 
});


// --- Save file ---
const safeTitle = book.bookTitle.replace(/[<>:"/\\|?*]/g, ""); // remove invalid filename chars
const outputPath = `${safeTitle} – KDP ready.docx`;

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync(outputPath, buffer);
  console.log(`KDP-ready DOCX created: ${outputPath}`);
}).catch(err => {
    console.error("Error creating DOCX file:", err);
    if (err.stack) console.error(err.stack);
});
