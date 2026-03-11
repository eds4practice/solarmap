export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector("picture");
      if (pic) {
        const picWrapper = pic.closest("div");
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add("columns-img-col");
        }
      }
    });
  });

  // ✅ NEW: Split column content into col1 / col2 based on the first two <hr>
  [...block.children].forEach((row) => {
    const rowCols = [...row.children];

    rowCols.forEach((col) => {
      const hrs = [...col.querySelectorAll(":scope > hr")];

      // only split if we have at least 2 hr in the SAME column
      if (hrs.length < 2) return;

      const hr1 = hrs[0];
      const hr2 = hrs[1];

      const col1 = document.createElement("div");
      col1.className = "col1";

      const col2 = document.createElement("div");
      col2.className = "col2";

      // Move everything after hr1 until hr2 into col1
      let node = hr1.nextSibling;
      while (node && node !== hr2) {
        const next = node.nextSibling;
        // Move both elements and meaningful text nodes
        if (
          node.nodeType === Node.ELEMENT_NODE ||
          (node.nodeType === Node.TEXT_NODE && node.textContent.trim())
        ) {
          col1.append(node);
        } else if (node.nodeType === Node.TEXT_NODE) {
          node.remove(); // remove empty whitespace nodes
        }
        node = next;
      }

      // Move everything after hr2 into col2
      node = hr2.nextSibling;
      while (node) {
        const next = node.nextSibling;
        if (
          node.nodeType === Node.ELEMENT_NODE ||
          (node.nodeType === Node.TEXT_NODE && node.textContent.trim())
        ) {
          col2.append(node);
        } else if (node.nodeType === Node.TEXT_NODE) {
          node.remove();
        }
        node = next;
      }

      // Remove the hr markers
      hr1.remove();
      hr2.remove();

      // Insert wrappers back into the column after the intro content
      // If col1 has content, append it
      if (col1.childNodes.length) col.append(col1);
      if (col2.childNodes.length) col.append(col2);
    });
  });
}
