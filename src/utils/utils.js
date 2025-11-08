//Hjälpfunktioner

// stripPTags: tar bort enkla <p>...</p> taggar från en HTML-sträng
// Används för att undvika att skicka HTML i API-responsen
export function stripPTags(htmlString = '') {
    if (!htmlString) return '';
    return htmlString
        .replace(/<p>/gi, '')      // ta bort öppnande <p>
        .replace(/<\/p>/gi, '')    // ta bort stängande </p>
        .trim();                   // ta bort onödiga mellanslag
}
