// Fills in the owner's support contact (set in the Ad manager) on the privacy and terms pages.
fetch("/api/contact")
  .then((r) => r.json())
  .then((c) => {
    const support = typeof c.support === "string" ? c.support.trim() : "";
    if (!support) return;
    for (const el of document.querySelectorAll("[data-contact]")) {
      const email = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(support);
      const a = document.createElement("a");
      a.textContent = support;
      a.href = email ? `mailto:${support}` : `https://wa.me/${support.replace(/\D/g, "").replace(/^0/, "234")}`;
      el.replaceChildren(a);
    }
  })
  .catch(() => undefined);
