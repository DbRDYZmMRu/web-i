const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = require("docx");
const fs = require("fs");
const path = require("path");
const { htmlToText } = require("html-to-text");

// Load your book data
const rawData = fs.readFileSync("book.json", "utf-8");
const book = JSON.parse(rawData);

const doc = new Document({
  creator: "Frith Hilton",
  title: book.bookTitle,
  description: "Poetry collection for Kindle Direct Publishing",
  styles: {
    paragraphStyles: [
      {
        id: "Normal",
        name: "Normal",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: {
          font: "Georgia",
          size: 22, // 11pt = 22 half-points
        },
        paragraph: {
          indent: { left: 280, firstLine: 280 }, // ~0.2 inch first-line indent
          spacing: { after: 120 },
        },
      },
      {
        id: "Heading1",
        name: "Heading 1",
        basedOn: "Normal",
        next: "Normal,
        quickFormat: true,
        run: {
          size: 32,
          bold: true,
          color: "000000",
        },
        paragraph: {
          alignment: AlignmentType.CENTER,
          spacing: { before: 480, after: 240 },
        },
      },
    ],
  },
});

// Title page
doc.addSection({
  children: [
    new Paragraph({
      children: [new TextRun({ text: book.bookTitle, size: 56, bold: true })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 600 },
    }),
    new Paragraph({
      children: [new TextRun({ text: "Frith Hilton", size: 36 })],
      alignment: AlignmentType.CENTER,
    }),
  ],
});

// Cover image (will be embedded if you add cover.jpg later)
if (book.image) {
  // You can upload cover.jpg manually or let the script download it
  // For now we just add a placeholder
  doc.addSection({
    children: [
      new Paragraph({
        text: "[Cover Image]",
        heading: HeadingLevel.HEADING_1,
      }),
    ],
  });
}

// Copyright & dedication
doc.addSection({
  children: [
    new Paragraph({
      text: book.bookTitle,
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      text: "© 2025 Frith Hilton. All rights reserved.",
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      text: `Dedicated to ${book.dedicatee}`,
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      text: `First edition — ${book.releaseDate}`,
      alignment: AlignmentType.CENTER,
      spacing: { before: 400 },
    }),
  ],
});

// Table of Contents
doc.addSection({
  children: [
    new Paragraph({
      text: "Contents",
      heading: HeadingLevel.HEADING_1,
    }),
    ...book.poems.map(poem =>
      new Paragraph({
        text: poem.title,
        style: "Normal",
      })
    ),
  ],
});

// Poems
book.poems.forEach((poem, index) => {
  const poemKey = String(poem.number);
  const html = book.content[0][poemKey] || "";

  const lines = htmlToText(html, { wordwrap: false })
    .split("\n")
    .filter(line => line.trim() !== "");

  doc.addSection({
    children: [
      new Paragraph({
        text: poem.title,
        heading: HeadingLevel.HEADING_1,
      }),
      ...lines.map(line =>
        new Paragraph({
          text: line.trim(),
          style: "Normal",
          // Uncomment next line if you prefer centered poetry
          // alignment: AlignmentType.CENTER,
        })
      ),
      // Optional blank page after each poem
      new Paragraph(""),
    ],
  });
});

// Final page
doc.addSection({
  children: [
    new Paragraph({
      text: "More by Frith Hilton",
      heading: HeadingLevel.HEADING_1,
    }),
    new Paragraph({
      children: [
        new TextRun("Visit my poetry: "),
        new TextRun({
          text: book.url,
          color: "0000EE",
          underline: {},
        }),
      ],
    }),
  ],
});

// Save the file
const outputPath = path.join(process.cwd(), `${book.bookTitle.replace(/[^\w\s]/g, '')} – KDP ready.docx`);
Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(outputPath, buffer);
  console.log(`DOCX generated: ${outputPath}`);
});