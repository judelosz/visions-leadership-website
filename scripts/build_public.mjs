import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const output = path.join(root, "dist");
const domain = "https://www.visionsleadershipclc.com";
const pages = {
  "index.html": ["", "Visions Leadership Consultant and Life Coach", "Clear course access, transitional-health guidance, travel, events, and published work from Monique Foster."],
  "course.html": ["course.html", "Anger Management & Emotional Healing Program | Visions", "Individual and organization access to the seven-module Anger Management & Emotional Healing Program."],
  "travel.html": ["travel.html", "Dare to Dream Travel | Visions CLC", "Explore travel planning for individuals and groups with Dare to Dream Travel."],
  "transitional-health.html": ["transitional-health.html", "Transitional Health | Visions CLC", "Practical transitional-health guidance for changing health, home, and daily-life needs."],
  "about.html": ["about.html", "Story & Impact | Visions CLC", "Meet Monique Foster and see the community, business, teaching, and travel work connected to Visions."],
  "testimonials.html": ["testimonials.html", "Testimonials | Visions CLC", "Read client experiences with Monique Foster and Visions."],
  "events.html": ["events.html", "Events & Announcements | Visions CLC", "Current community events and announcements from Visions."],
  "store.html": ["store.html", "Store | Visions CLC", "Enroll in the course or request Monique Foster's published books and journal."],
  "contact.html": ["contact.html", "Contact | Visions CLC", "Contact Visions Leadership Consultant and Life Coach in Ypsilanti, Michigan."],
  "privacy.html": ["privacy.html", "Privacy | Visions CLC", "Privacy policy for the Visions website."],
  "terms.html": ["terms.html", "Terms | Visions CLC", "Terms of use for the Visions website and services."],
  "accessibility.html": ["accessibility.html", "Accessibility | Visions CLC", "Accessibility statement for the Visions website."],
  "thank-you.html": ["thank-you.html", "Message received | Visions CLC", "Thank you for contacting Visions."],
};
const passthroughPages = ["impact.html", "organizations.html", "services.html"];

const socialImage = `${domain}/assets/optimized/ocean-sunset-hero-1440.webp`;
const addMetadata = (html, route, title, description, file) => {
  const url = `${domain}/${route}`;
  const robots = file === "thank-you.html" ? '<meta name="robots" content="noindex">' : "";
  const schema = file === "index.html" ? `<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@type": "ProfessionalService", name: "Visions Leadership Consultant and Life Coach", url: `${domain}/`, email: "visionsdba@gmail.com", telephone: "+1-248-793-5060", areaServed: "Ypsilanti, Michigan", founder: { "@type": "Person", name: "Monique Foster" } })}</script>` : "";
  const tags = `${robots}<link rel="canonical" href="${url}"><link rel="icon" href="assets/optimized/visions-logo-280.webp" type="image/webp"><meta name="theme-color" content="#fffaf0"><meta property="og:type" content="website"><meta property="og:title" content="${title}"><meta property="og:description" content="${description}"><meta property="og:url" content="${url}"><meta property="og:image" content="${socialImage}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${title}"><meta name="twitter:description" content="${description}"><meta name="twitter:image" content="${socialImage}">${schema}`;
  return html.replace("</head>", `${tags}</head>`);
};

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

for (const [file, [route, title, description]] of Object.entries(pages)) {
  const html = await readFile(path.join(root, file), "utf8");
  await writeFile(path.join(output, file), addMetadata(html, route, title, description, file));
}
for (const file of passthroughPages) await cp(path.join(root, file), path.join(output, file));
for (const file of ["styles.css", "script.js", "robots.txt", "sitemap.xml", "_redirects"]) {
  await cp(path.join(root, file), path.join(output, file));
}
for (const directory of ["assets/optimized", "assets/event-uploads", "content", "admin"]) {
  const source = path.join(root, directory);
  try { await cp(source, path.join(output, directory), { recursive: true }); } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}
console.log("Built a public-only site in dist/. Private source documents and raw assets were excluded.");
