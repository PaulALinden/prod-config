export function stripPTags(htmlString = '') {
    if (!htmlString) return '';
    return htmlString
        .replace(/<p>/gi, '')      // ta bort öppnande <p>
        .replace(/<\/p>/gi, '')    // ta bort stängande </p>
        .trim();                   // ta bort onödiga mellanslag
}
