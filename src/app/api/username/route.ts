import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { UsernameValidator } from "@/lib/validators/username";
import { z } from "zod";

export async function PATCH(req: Request) {
    try {
        const session = await getAuthSession();
        if (!session?.user) {
            return new Response("Not authorized.", { status: 401 });
        }

        const body = await req.json();
        const { name } = UsernameValidator.parse(body);

        const usernameExists = await db.user.findFirst({
            where: {
                name,
            },
        });

        if (usernameExists) {
            return new Response("Username already exists.", {
                status: 400,
            });
        }

        await db.user.update({
            where: {
                id: session.user.id,
            },
            data: {
                username: name,
            },
        });

        return new Response("OK");
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new Response(error.message, { status: 422 });
        }

        return new Response("Cannot change username now. Try again later", {
            status: 500,
        });
    }
}
