(function () {
  const signals = window.archiveSignals || [];
  const grid = document.getElementById("archiveGrid");
  const filterRow = document.getElementById("filterRow");
  const searchInput = document.getElementById("searchInput");
  const emptyState = document.getElementById("emptyState");
  const signalCount = document.getElementById("signalCount");
  let activeCategory = "All";

  const categories = ["All", ...Array.from(new Set(signals.map((item) => item.category)))];

  function normalise(value) {
    return String(value || "").toLowerCase();
  }

  function renderFilters() {
    filterRow.innerHTML = categories.map((category) => {
      const active = category === activeCategory ? " is-active" : "";
      return `<button class="filter-button${active}" type="button" data-category="${category}">${category}</button>`;
    }).join("");
  }

  function cardTemplate(item) {
    const hasUrl = Boolean(item.url);
    const href = hasUrl ? item.url : "#";
    const disabled = hasUrl ? "" : " aria-disabled=\"true\"";
    const target = hasUrl ? " target=\"_blank\" rel=\"noreferrer\"" : "";
    const action = hasUrl ? "Open Signal" : "Link Pending";

    return `
      <article class="archive-card">
        <div class="card-meta">
          <span class="chip">${item.category}</span>
          <span class="chip">${item.year}</span>
          <span class="chip">${item.priority}</span>
        </div>
        <h3>${item.title}</h3>
        <p>${item.description}</p>
        <div class="card-meta" aria-label="Source metadata">
          <span class="chip">${item.source}</span>
          <span class="chip">${item.region}</span>
        </div>
        <a href="${href}"${target}${disabled}>${action}</a>
      </article>
    `;
  }

  function renderCards() {
    const query = normalise(searchInput.value);
    const filtered = signals.filter((item) => {
      const categoryMatch = activeCategory === "All" || item.category === activeCategory;
      const haystack = normalise([
        item.title,
        item.source,
        item.year,
        item.category,
        item.region,
        item.priority,
        item.description
      ].join(" "));
      return categoryMatch && haystack.includes(query);
    });

    grid.innerHTML = filtered.map(cardTemplate).join("");
    emptyState.hidden = filtered.length !== 0;
    signalCount.textContent = String(signals.length).padStart(2, "0");
  }

  filterRow.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-category]");
    if (!button) return;
    activeCategory = button.dataset.category;
    renderFilters();
    renderCards();
  });

  searchInput.addEventListener("input", renderCards);

  function startSignalCanvas() {
    const canvas = document.getElementById("signalCanvas");
    const context = canvas.getContext("2d");
    let width = 0;
    let height = 0;
    let frame = 0;

    function resize() {
      width = canvas.width = Math.floor(window.innerWidth * window.devicePixelRatio);
      height = canvas.height = Math.floor(window.innerHeight * window.devicePixelRatio);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    }

    function draw() {
      frame += 0.012;
      context.clearRect(0, 0, width, height);
      context.globalAlpha = 0.36;
      context.lineWidth = Math.max(1, window.devicePixelRatio);

      for (let row = 0; row < 10; row += 1) {
        const yBase = (height / 11) * (row + 1);
        context.beginPath();
        for (let x = 0; x <= width; x += 18 * window.devicePixelRatio) {
          const wave = Math.sin((x * 0.004) + frame + row) * 18 * window.devicePixelRatio;
          const pulse = Math.cos((x * 0.0016) + frame * 2 + row) * 7 * window.devicePixelRatio;
          const y = yBase + wave + pulse;
          if (x === 0) context.moveTo(x, y);
          else context.lineTo(x, y);
        }
        context.strokeStyle = row % 3 === 0 ? "rgba(217, 182, 93, 0.32)" : "rgba(86, 214, 223, 0.18)";
        context.stroke();
      }

      requestAnimationFrame(draw);
    }

    window.addEventListener("resize", resize);
    resize();
    draw();
  }

  renderFilters();
  renderCards();
  startSignalCanvas();
}());
