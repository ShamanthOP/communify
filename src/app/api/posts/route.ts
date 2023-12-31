import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

export async function GET(req: Request) {
    const url = new URL(req.url);

    const session = await getAuthSession();

    let followingCommunitiesIds: string[] = [];

    if (session?.user) {
        const followingCommunities = await db.membership.findMany({
            where: {
                userId: session.user.id,
            },
            include: {
                community: true,
            },
        });
        followingCommunitiesIds = followingCommunities.map(
            ({ community }) => community.id
        );
    }

    try {
        const { limit, page, communityName } = z
            .object({
                limit: z.string(),
                page: z.string(),
                communityName: z.string().nullish().optional(),
            })
            .parse({
                communityName: url.searchParams.get("communityName"),
                limit: url.searchParams.get("limit"),
                page: url.searchParams.get("page"),
            });

        let whereClause = {};
        if (communityName) {
            whereClause = {
                community: {
                    name: communityName,
                },
            };
        } else if (session?.user) {
            whereClause = {
                community: {
                    id: {
                        in: followingCommunitiesIds,
                    },
                },
            };
        }

        const posts = await db.post.findMany({
            take: parseInt(limit),
            skip: (parseInt(page) - 1) * parseInt(limit),
            orderBy: {
                createdAt: "desc",
            },
            include: {
                community: true,
                votes: true,
                author: true,
                comments: true,
            },
            where: whereClause,
        });

        return new Response(JSON.stringify(posts));
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new Response(error.message, { status: 422 });
        }

        return new Response("Cannot fetch more posts.", {
            status: 500,
        });
    }
}
