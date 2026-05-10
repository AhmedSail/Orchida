/**
 * Utility to handle downloads by using a proxy for external URLs to bypass CORS
 * and ensure the file is downloaded as an attachment.
 */
export const handleDownload = async (url: string, filename: string) => {
  if (!url) return;

  // If it's a data URL, download it directly
  if (url.startsWith("data:")) {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  }

  // Check if it's an external URL
  const isExternal = url.startsWith("http") && !url.includes(window.location.host);

  if (isExternal) {
    // For external URLs, use the proxy route to avoid CORS issues
    const proxyUrl = `/api/download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`;
    const link = document.createElement("a");
    link.href = proxyUrl;
    // We don't need 'download' attribute because the proxy sets Content-Disposition
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else {
    // For internal URLs, try to fetch to get the blob
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Fetch failed");
      const blob = await res.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(objectUrl);
    } catch (e) {
      // Fallback to proxy
      const proxyUrl = `/api/download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`;
      const link = document.createElement("a");
      link.href = proxyUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
};
