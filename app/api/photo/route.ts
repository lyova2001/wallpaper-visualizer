import path from "path";
import fs from "fs/promises";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("photo");

    if (!(file instanceof File)) {
      return Response.json(
        { ok: false, error: "No file 'photo' in form-data" },
        { status: 400 }
      );
    }

    // const arrayBuffer = await file.arrayBuffer();
    // const bytes = Buffer.from(arrayBuffer);

    const filePath = path.join(
      process.cwd(),
      "public",
      "result.jpeg"
    );

    const bytes = await fs.readFile(filePath);
    // Echo back as base64 for MVP demo
    const base64 = await new Promise((res) => {
        setTimeout(() => {
        res(`data:image/jpeg;base64,${bytes.toString("base64")}`);
    }, 2000)
    })

    return Response.json({ ok: true, imageBase64: base64 });
  } catch (e: any) {
    return Response.json(
      { ok: false, error: e?.message ?? "Server error" },
      { status: 500 }
    );
  }
}
