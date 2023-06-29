import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { PostValidator } from "@/lib/validators/post";
import { z } from "zod";

export async function POST(req: Request) {
    try {
        const session = await getAuthSession();
        if (!session?.user) {
            return new Response("Not authorized.", { status: 401 });
        }

        const body = await req.json();
        const { communityId, title, content } = PostValidator.parse(body);

        const membershipExists = await db.membership.findFirst({
            where: {
                communityId,
                userId: session.user.id,
            },
        });

        if (!membershipExists) {
            return new Response("You are not a member of this community.", {
                status: 400,
            });
        }

        await db.post.create({
            data: {
                communityId,
                authorId: session.user.id,
                title,
                content,
            },
        });

        return new Response("OK");
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new Response(error.message, { status: 422 });
        }

        return new Response("Cannot post now. Try again later", {
            status: 500,
        });
    }
}
