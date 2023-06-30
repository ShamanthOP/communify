import MiniCreatePost from "@/components/MiniCreatePost";
import PostFeed from "@/components/PostFeed";
import { INFINITE_SCROLLING_PAGINATION_RESULTS } from "@/config";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";

interface CommunityPageProps {
    params: {
        slug: string;
    };
}

export default async function CommunityPage({ params }: CommunityPageProps) {
    const { slug } = params;
    const session = await getAuthSession();

    const community = await db.community.findFirst({
        where: {
            name: slug,
        },
        include: {
            posts: {
                include: {
                    author: true,
                    votes: true,
                    comments: true,
                    community: true,
                },
                take: INFINITE_SCROLLING_PAGINATION_RESULTS,
            },
        },
    });

    if (!community) {
        return notFound();
    }

    return (
        <>
            <h1 className="font-bold text-3xl md:text-4xl h-14">
                c/{community.name}
            </h1>
            <MiniCreatePost session={session} />
            <PostFeed
                initialPosts={community.posts}
                communityName={community.name}
            />
        </>
    );
}
