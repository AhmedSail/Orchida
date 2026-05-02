import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get("url");

    if (!url) {
      return new NextResponse("Missing url parameter", { status: 400 });
    }

    const response = await fetch(url);
    
    if (!response.ok) {
      return new NextResponse("Failed to fetch file", { status: response.status });
    }

    const headers = new Headers();
    const contentType = response.headers.get("Content-Type") || "application/octet-stream";
    headers.set("Content-Type", contentType);
    
    // Guess filename from URL or query param
    let filename = searchParams.get("filename") || url.split('/').pop() || "download";
    // Clean up query parameters from filename
    filename = filename.split('?')[0];

    // Ensure proper extension based on content type if missing
    if (!filename.includes('.')) {
      if (contentType.includes("video/mp4")) filename += ".mp4";
      else if (contentType.includes("image/jpeg")) filename += ".jpg";
      else if (contentType.includes("image/png")) filename += ".png";
      else if (contentType.includes("image/webp")) filename += ".webp";
      else if (contentType.includes("image/gif")) filename += ".gif";
      else if (contentType.includes("video/webm")) filename += ".webm";
      else if (contentType.includes("video/quicktime")) filename += ".mov";
    }

    headers.set("Content-Disposition", `attachment; filename="${filename}"`);

    return new NextResponse(response.body, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Download proxy error:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
