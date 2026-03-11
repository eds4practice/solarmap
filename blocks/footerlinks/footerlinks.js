function extractIconToken(text = "") {
  // Matches: "{ti-home} Address text"
  const m = text.trim().match(/^\{([^}]+)\}\s*(.*)$/);
  if (!m) return { icon: null, rest: text.trim() };
  return { icon: m[1].trim(), rest: (m[2] || "").trim() };
}

function createIconEl(iconToken) {
  // Your Themify build needs both base class "ti" + icon class "ti-home" [1](https://www.npmjs.com/package/bootstrap/v/4.1.3)
  const i = document.createElement("i");
  i.classList.add("ti");

  const normalized = iconToken?.startsWith("ti-")
    ? iconToken
    : `ti-${iconToken}`;
  i.classList.add(normalized);

  return i;
}

function normalizeTextFromCell(cell) {
  return (cell?.textContent || "").replace(/\s+/g, " ").trim();
}

function getFirstAnchor(cell) {
  return cell ? cell.querySelector("a") : null;
}

function buildMenuList(items, ulId, containerClass) {
  const container = document.createElement("div");
  container.className = containerClass;

  const ul = document.createElement("ul");
  ul.className = "menu";
  if (ulId) ul.id = ulId;

  items.forEach((a) => {
    if (!a) return;
    const li = document.createElement("li");
    li.className = "menu-item";
    li.append(a.cloneNode(true));
    ul.append(li);
  });

  container.append(ul);
  return container;
}

function buildAddressItem(textWithToken) {
  const { icon, rest } = extractIconToken(textWithToken);

  const wrapper = document.createElement("div");
  wrapper.className = "footer_s_inner";

  const iconWrap = document.createElement("div");
  iconWrap.className = "footer-sociala-icon";
  if (icon) iconWrap.append(createIconEl(icon));

  const infoWrap = document.createElement("div");
  infoWrap.className = "footer-sociala-info";
  const p = document.createElement("p");
  p.textContent = rest || "";
  infoWrap.append(p);

  wrapper.append(iconWrap, infoWrap);
  return wrapper;
}

function buildSocialLink(iconToken, href, titleText) {
  const a = document.createElement("a");

  let cls = (iconToken || "").toLowerCase();
  if (cls.includes("facebook")) cls = "facebook";
  else if (cls.includes("instagram")) cls = "Instagram";
  else if (cls.includes("twitter") || cls.includes("x")) cls = "twitter";
  else cls = cls.replace(/^ti-/, "").replace(/^fa-/, "") || "social";

  a.className = cls;
  a.href = href || "#";
  a.title = titleText || cls;

  a.append(createIconEl(iconToken));
  return a;
}

function buildFooterBottom(copyrightText) {
  const footerBottom = document.createElement("div");
  footerBottom.className = "footer-bottom";

  const container = document.createElement("div");
  container.className = "container";

  const row = document.createElement("div");
  row.className = "row";

  const col = document.createElement("div");
  col.className = "col-md-12 footer_style_1";

  const copy = document.createElement("div");
  copy.className = "copy-right-text text-center";

  const p = document.createElement("p");
  p.textContent = copyrightText;

  copy.append(p);
  col.append(copy);
  row.append(col);
  container.append(row);
  footerBottom.append(container);

  return footerBottom;
}

export default function decorate(block) {
  const rows = [...block.children].filter((c) => c.tagName === "DIV");
  if (!rows.length) return;

  // Detect last row as copyright row:
  // Your last row has only 1 cell and contains a <p> with copyright text.
  let copyrightText = "";
  let workingRows = rows;

  const lastRow = rows[rows.length - 1];
  const lastRowCells = [...lastRow.children];

  if (lastRowCells.length === 1) {
    const p = lastRow.querySelector("p");
    const t = (p?.textContent || "").trim();
    if (t && /copyright/i.test(t)) {
      copyrightText = t;
      workingRows = rows.slice(0, -1); // exclude last row from footer-middle parsing
    }
  }

  // Now build footer-middle from remaining rows
  const headerRow = workingRows[0];
  const contentRows = workingRows.slice(1);
  const headerCells = [...headerRow.children];

  const hAddress =
    headerCells[0]?.querySelector("h2")?.textContent?.trim() || "Our Address";
  const pAddressIntro =
    headerCells[0]?.querySelector("p")?.textContent?.trim() || "";

  const hQuick =
    headerCells[1]?.querySelector("h2")?.textContent?.trim() || "Quick Link";
  const hService =
    headerCells[2]?.querySelector("h2")?.textContent?.trim() || "Our Service";

  // Column 4: logo + description
  const col4P = headerCells[3]?.querySelector("p");
  const imgEl =
    headerCells[3]?.querySelector("picture img") ||
    headerCells[3]?.querySelector("img");
  const logoImg = imgEl ? imgEl.cloneNode(true) : null;
  if (logoImg) logoImg.classList.add("logo");

  let col4Desc = "";
  if (col4P) {
    col4Desc = col4P.textContent.replace(/\s+/g, " ").trim();
    col4Desc = col4Desc.replace(/^logo\s*/i, "").trim();
  }

  const addressTexts = [];
  const quickAnchors = [];
  const serviceAnchors = [];
  const socialPairs = [];

  contentRows.forEach((row) => {
    const cells = [...row.children];

    const t1 = normalizeTextFromCell(cells[0]);
    if (t1) addressTexts.push(t1);

    const a2 = getFirstAnchor(cells[1]);
    if (a2) quickAnchors.push(a2);

    const a3 = getFirstAnchor(cells[2]);
    if (a3) serviceAnchors.push(a3);

    // Social column: {ti-facebook} in first <p>, link in second <p>
    const c4 = cells[3];
    if (c4) {
      const ps = [...c4.querySelectorAll("p")];
      if (ps.length >= 1) {
        const raw = ps[0].textContent.trim();
        const tokenMatch = raw.match(/^\{([^}]+)\}$/);
        const iconToken = tokenMatch ? tokenMatch[1].trim() : null;

        const a = c4.querySelector("a");
        if (iconToken && a?.getAttribute("href")) {
          socialPairs.push({ iconToken, href: a.getAttribute("href") });
        }
      }
    }
  });

  // footer-middle wrapper
  const footerMiddle = document.createElement("div");
  footerMiddle.className = "footer-middle";

  const container = document.createElement("div");
  container.className = "container";

  const row = document.createElement("div");
  row.className = "row";

  // Column 1: Address widget
  const col1 = document.createElement("div");
  col1.className =
    "solarmap_theme_widget solarmap_f_color col-sm-12 col-md-6 col-lg-4";

  const w1 = document.createElement("div");
  w1.id = "about_us-widget-1";
  w1.className = "widget about_us";

  const h2_1 = document.createElement("h2");
  h2_1.className = "widget-title";
  h2_1.textContent = hAddress;

  const aboutFooter = document.createElement("div");
  aboutFooter.className = "about-footer";

  const footerWidgetAddress = document.createElement("div");
  footerWidgetAddress.className = "footer-widget address";

  const footerLogo = document.createElement("div");
  footerLogo.className = "footer-logo";

  const introP = document.createElement("p");
  introP.textContent = pAddressIntro;
  footerLogo.append(introP);

  const footerAddress = document.createElement("div");
  footerAddress.className = "footer-address";
  addressTexts.forEach((t) => footerAddress.append(buildAddressItem(t)));

  footerWidgetAddress.append(footerLogo, footerAddress);
  aboutFooter.append(footerWidgetAddress);
  w1.append(h2_1, aboutFooter);
  col1.append(w1);

  // Column 2: Quick links
  const col2 = document.createElement("div");
  col2.className =
    "solarmap_theme_widget solarmap_f_color col-sm-12 col-md-6 col-lg-2";

  const w2 = document.createElement("div");
  w2.id = "nav_menu-1";
  w2.className = "widget widget_nav_menu";

  const h2_2 = document.createElement("h2");
  h2_2.className = "widget-title";
  h2_2.textContent = hQuick;

  const quickContainer = buildMenuList(
    quickAnchors,
    "menu-quick-link",
    "menu-quick-link-container"
  );
  w2.append(h2_2, quickContainer);
  col2.append(w2);

  // Column 3: Services
  const col3 = document.createElement("div");
  col3.className =
    "solarmap_theme_widget solarmap_f_color col-sm-12 col-md-6 col-lg-2";

  const w3 = document.createElement("div");
  w3.id = "nav_menu-2";
  w3.className = "widget widget_nav_menu";

  const h2_3 = document.createElement("h2");
  h2_3.className = "widget-title";
  h2_3.textContent = hService;

  const serviceContainer = buildMenuList(
    serviceAnchors,
    "menu-our-service",
    "menu-our-service-container"
  );
  w3.append(h2_3, serviceContainer);
  col3.append(w3);

  // Column 4: Logo + desc + socials
  const col4 = document.createElement("div");
  col4.className =
    "solarmap_theme_widget solarmap_f_color col-sm-12 col-md-6 col-lg-4";

  const w4 = document.createElement("div");
  w4.id = "twr_description_widget-2";
  w4.className = "widget widget_twr_description_widget";

  const descArea = document.createElement("div");
  descArea.className = "solarmap-description-area";

  const logoLink = document.createElement("a");
  logoLink.href = "/";
  if (logoImg) logoLink.append(logoImg);

  const descP = document.createElement("p");
  descP.textContent = col4Desc;

  const socialWrap = document.createElement("div");
  socialWrap.className = "social-icons";
  socialPairs.forEach(({ iconToken, href }) => {
    socialWrap.append(buildSocialLink(iconToken, href, iconToken));
  });

  descArea.append(logoLink, descP, socialWrap);
  w4.append(descArea);
  col4.append(w4);

  row.append(col1, col2, col3, col4);
  container.append(row);
  footerMiddle.append(container);

  // Build final block: footer-middle + footer-bottom
  block.textContent = "";
  block.append(footerMiddle);

  if (copyrightText) {
    block.append(buildFooterBottom(copyrightText));
  }

  block.dataset.blockStatus = "loaded";
}
