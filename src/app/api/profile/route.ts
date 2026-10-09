import { NextResponse } from "next/server";
import prisma from "@/lib/dbClient/prisma";
import { profileSchema } from "@/lib/zodSchema";
import { getSessionUser } from "@/server/marketplace";

export const PATCH = async (request: Request) => {
  const me = await getSessionUser();
  if (!me) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  const parsed = profileSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid profile" }, { status: 400 });
  }
  await prisma.user.update({
    where: { id: me.id },
    data: {
      name: parsed.data.name,
      image:
        parsed.data.image && parsed.data.image.trim() !== "" ?
          parsed.data.image.trim()
        : null,
    },
  });
  return NextResponse.json({ saved: true });
};
