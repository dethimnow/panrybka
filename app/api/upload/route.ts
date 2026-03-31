import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import sharp from "sharp";
import { authOptions } from "@/lib/auth-options";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Brak autoryzacji" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const slugPrefix = String(formData.get("slug") ?? "upload").replace(/[^a-z0-9-]/gi, "-");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Brak pliku" }, { status: 400 });
    }

    const buf = Buffer.from(await file.arrayBuffer());
    const webpBuffer = await sharp(buf)
      .webp({ quality: 85 })
      .toBuffer();

    const path = `posts/${slugPrefix}-${Date.now()}.webp`;
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.storage.from("images").upload(path, webpBuffer, {
      contentType: "image/webp",
      upsert: true,
    });

    if (error) {
      console.error(error);
      return NextResponse.json(
        { error: "Upload do Supabase nie powiódł się. Sprawdź bucket „images” i klucz serwisowy." },
        { status: 502 }
      );
    }

    const { data: urlData } = supabase.storage.from("images").getPublicUrl(data.path);
    return NextResponse.json({ url: urlData.publicUrl });
  } catch (e) {
    console.error(e);
    if (e instanceof Error && e.message.includes("SUPABASE")) {
      return NextResponse.json({ error: e.message }, { status: 503 });
    }
    return NextResponse.json({ error: "Nie udało się przetworzyć obrazu" }, { status: 500 });
  }
}
