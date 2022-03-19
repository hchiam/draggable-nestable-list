const rowsContainer = document.querySelector("#items");
Sortable.create(rowsContainer, {
  animation: 150,
  onChange: () => handleLevelChange(rowsContainer),
});

const divs = document.querySelectorAll("#items div");
divs.forEach((div) => {
  Sortable.create(div, {
    animation: 150,
    onChange: () => handleLevelChange(rowsContainer, div),
  });
});

function handleLevelChange(rowsContainer, div) {
  if (!div) div = rowsContainer.querySelectorAll("div")[0];
  showItemsData(div);
  indicateGroups(rowsContainer);
  enforceLevels(rowsContainer);
}

function showItemsData(div) {
  const data = getData().join("\n");
  $("#items_output").text(data);
}

function indicateGroups(rowsContainer) {
  $(rowsContainer)
    .find("> div")
    .each(function () {
      const jQDiv = $(this);
      const div = jQDiv[0];

      const level = getLevel(div);

      jQDiv.attr("data-level", level);
      const color = div.style.getPropertyValue("--color");

      if (level === 1) {
        div.style.removeProperty("--override-color");
        jQDiv.nextUntil('[data-level="0"]').each(function () {
          const nestedElement = $(this)[0];
          nestedElement.style.setProperty("--override-color", color);
        });
      }
    });
}

function enforceLevels(rowsContainer) {
  let isFirstRow = true;
  let previousLevel = 1;
  $(rowsContainer)
    .find("> div")
    .each(function () {
      const jQDiv = $(this);
      const div = jQDiv[0];

      const currentLevel = getLevel(div);
      const currentSpan = jQDiv.find(`span:nth-child(${currentLevel})`);

      const allSpansAfter = currentSpan.nextAll();
      const next1Span = currentSpan.next();
      allSpansAfter.css("pointer-events", "none");
      next1Span.css("pointer-events", "auto");

      const cannotNestDeeper = currentLevel > previousLevel;
      if (cannotNestDeeper || isFirstRow) {
        next1Span.css("pointer-events", "none");
      }

      const isInvalidNesting = currentLevel > 1 + previousLevel;
      if (isInvalidNesting || isFirstRow) {
        // swap span with its previous sibling:
        currentSpan.after(currentSpan.prev());
      }

      if (isFirstRow) {
        div.style.removeProperty("--override-color");
      }

      previousLevel = currentLevel;
      isFirstRow = false;
    });
}

function getData(jQueryDivRow) {
  const data = [];
  const divs = jQueryDivRow ? jQueryDivRow : $("#items").find("div");
  divs.each(function () {
    const div = $(this);
    const spans = div.find("span");
    const row = [...spans].map((span) => {
      const text = span.innerText;
      const emptyDataString = jQueryDivRow ? "" : "----------";
      return text ? text : emptyDataString;
    });
    data.push(row);
  });
  return data;
}

function getLevel(divRow) {
  const data = getData($(divRow));
  return 1 + data[0].findIndex((x) => x);
}
