import DOMPurify from 'dompurify';

export function extractCanvasResources(rawHtml) {
  if (!rawHtml) return { files: [], links: [] };

  const parser = new DOMParser();
  const doc = parser.parseFromString(rawHtml, 'text/html');
  const anchors = doc.querySelectorAll('a[href]');

  const files = [];
  const links = [];

  anchors.forEach((a) => {
    const href = a.getAttribute('href') || '';
    const label = a.textContent.trim() || a.getAttribute('title') || href;
    const isCanvasFile =
      a.getAttribute('data-api-returntype') === 'File' ||
      a.classList.contains('instructure_file_link');

    const resource = {
      id: a.id || href,
      label,
      url: href,
      apiEndpoint: a.getAttribute('data-api-endpoint'),
      isPreviewable: a.getAttribute('data-canvas-previewable') === 'true',
    };

    if (isCanvasFile) {
      const extMatch = label.match(/\.([a-z0-9]+)$/i) || href.match(/\.([a-z0-9]+)\?/i);
      const extension = extMatch ? extMatch[1].toLowerCase() : 'file';
      
      files.push({ ...resource, extension });
    } else {
      links.push(resource);
    }
  });

  const cleanDescription = DOMPurify.sanitize(rawHtml, {
    FORBID_TAGS: ['style', 'link'],
  });

  return { cleanDescription, files, links };
}