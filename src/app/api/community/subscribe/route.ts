import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { CommunityMembershipValidator } from "@/lib/validators/community";
import { z } from "zod";

export async function POST(req: Request) {
    try {
        const session = await getAuthSession();
        if (!session?.user) {
            return new Response("Not authorized.", { status: 401 });
        }

        const body = await req.json();
        const { communityId } = CommunityMembershipValidator.parse(body);

        const membershipExists = await db.membership.findFirst({
            where: {
                communityId,
                userId: session.user.id,
            },
        });

        if (membershipExists) {
            return new Response("You are already a member of this community.", {
                status: 400,
            });
        }

        await db.membership.create({
            data: {
                communityId,
                userId: session.user.id,
            },
        });

        return new Response(communityId);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new Response(error.message, { status: 422 });
        }

        return new Response("Cannot subscribe now. Try again later", {
            status: 500,
        });
    }
}
