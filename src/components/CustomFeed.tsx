import { INFINITE_SCROLLING_PAGINATION_RESULTS } from "@/config";
import { db } from "@/lib/db";
import PostFeed from "./PostFeed";
import { getAuthSession } from "@/lib/auth";

const CustomFeed = async () => {
    const session = await getAuthSession();

    const followingCommunitites = await db.membership.findMany({
        where: {
            userId: session?.user.id,
        },
        include: {
            community: true,
        },
    });

    const posts = await db.post.findMany({
        where: {
            community: {
                name: {
                    in: followingCommunitites.map(
                        ({ community }) => community.id
                    ),
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
        include: {
            author: true,
            votes: true,
            comments: true,
            community: true,
        },
        take: INFINITE_SCROLLING_PAGINATION_RESULTS,
    });

    return <PostFeed initialPosts={posts} />;
};

export default CustomFeed;
