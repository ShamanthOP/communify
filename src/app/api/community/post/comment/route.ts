import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { CommentValidator } from "@/lib/validators/comment";
import { z } from "zod";

export async function PATCH(req: Request) {
    try {
        const session = await getAuthSession();
        if (!session?.user) {
            return new Response("Not authorized.", { status: 401 });
        }

        const body = await req.json();

        const { postId, text, replyToId } = CommentValidator.parse(body);

        await db.comment.create({
            data: {
                postId,
                text,
                replyToId,
                authorId: session.user.id,
            },
        });

        return new Response("OK");
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new Response(error.message, { status: 422 });
        }

        return new Response("Cannot comment now. Try again later", {
            status: 500,
        });
    }
}
