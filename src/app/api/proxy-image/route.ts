export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");
  if (!url) {
    return new Response(JSON.stringify({ error: "Missing url parameter" }), {
      status: 400,
    });
  }

  try {
    console.log("[proxy-image] Fetching:", url);
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        Referer: "https://www.instagram.com/",
      },
    });
    console.log("[proxy-image] Response status:", response.status);
    if (!response.ok) {
      return new Response(
        JSON.stringify({
          error: "Failed to fetch image",
          status: response.status,
        }),
        { status: response.status },
      );
    }
    const contentType = response.headers.get("content-type") || "image/jpeg";
    const buffer = await response.arrayBuffer();
    return new Response(Buffer.from(buffer), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("[proxy-image] Proxy error:", error);
    if (error instanceof Error) {
      return new Response(
        JSON.stringify({ error: "Proxy error", details: error.message }),
        { status: 500 },
      );
    }
    return new Response(JSON.stringify({ error: "Unknown error occurred" }), {
      status: 500,
    });
  }
}
