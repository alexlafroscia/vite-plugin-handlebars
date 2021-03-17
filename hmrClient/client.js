function replacePartial(partialName, newContent) {
  const startMarkers = document.querySelectorAll(
    `template[data-vite-handlebars-partial-marker='start'][data-vite-handlebars-partial-name='${partialName}']`
  );

  for (const startMarker of startMarkers) {
    let currentElement = startMarker.nextSibling;
    let foundEndMarker = false;
    // Transverse through the DOM removing each element until we find the end marker
    while (!foundEndMarker) {
      if (
        currentElement?.getAttribute?.('data-vite-handlebars-partial-marker') === 'end' &&
        currentElement?.getAttribute?.('data-vite-handlebars-partial-name') === partialName
      ) {
        foundEndMarker = true;
      } else {
        const previousElement = currentElement;
        currentElement = previousElement.nextSibling;
        previousElement.remove();
      }
    }

    // Once the end marker is found we need to insert the new content
    // We're injecting trusted content so can safely ignore the eslint warning
    // eslint-disable-next-line no-unsanitized/property
    startMarker.outerHTML = startMarker.outerHTML + newContent;
  }
}

if (import.meta.hot) {
  import.meta.hot.on('plugin-handlebars-partial-update', (data) => {
    replacePartial(data.partialName, data.content); // Specifically using `childNodes` because `children` does not include text nodes it seems
  });
}
