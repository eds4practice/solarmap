import { createOptimizedPicture } from "../../scripts/aem.js";

function buildFooterFromBody(li) {
  const body = li.querySelector(".cards-card-body");
  if (!body) return;

  const h2 = body.querySelector("h1, h2, h3, h4, h5, h6");
  if (!h2) return;

  // Extract the visible title text. If title is a link, use its text.
  const link = h2.querySelector("a");
  const titleText = (link ? link.textContent : h2.textContent).trim();
  if (!titleText) return;

  const footer = document.createElement("div");
  footer.className = "cards-card-footer";

  // Footer title must be plain text (no link). Also do NOT duplicate id.
  const footerH2 = document.createElement("h2");
  footerH2.textContent = titleText;

  footer.append(footerH2);
  li.append(footer);
}

export default function decorate(block) {
  const ul = document.createElement("ul");

  [...block.children].forEach((row) => {
    const li = document.createElement("li");

    // Move row columns into li
    while (row.firstElementChild) li.append(row.firstElementChild);

    // Classify children as image/body like before
    [...li.children].forEach((div) => {
      // Skip footer if already created (not the case initially, but safe)
      if (div.classList.contains("cards-card-footer")) return;

      if (div.children.length === 1 && div.querySelector("picture")) {
        div.className = "cards-card-image";
      } else {
        div.className = "cards-card-body";
      }
    });

    // Add footer based on body title
    buildFooterFromBody(li);

    ul.append(li);
  });

  // Optimize pictures (same as your existing code)
  ul.querySelectorAll("picture > img").forEach((img) => {
    const picture = img.closest("picture");
    if (!picture) return;

    picture.replaceWith(
      createOptimizedPicture(img.src, img.alt, false, [{ width: "750" }])
    );
  });

  block.replaceChildren(ul);
}
