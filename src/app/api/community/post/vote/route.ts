import { CACHE_AFTER_UPVOTES } from "@/config";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import { PostVoteValidator } from "@/lib/validators/vote";
import { CachedPost } from "@/types/redis";
import { z } from "zod";

export async function PATCH(req: Request) {
    try {
        const body = await req.json();

        const { postId, voteType } = PostVoteValidator.parse(body);

        const session = await getAuthSession();
        if (!session?.user) {
            return new Response("Not authorized.", { status: 401 });
        }

        const existingVote = await db.vote.findFirst({
            where: {
                userId: session.user.id,
                postId: postId,
            },
        });

        const post = await db.post.findUnique({
            where: {
                id: postId,
            },
            include: {
                author: true,
                votes: true,
            },
        });

        if (!post) {
            return new Response("Post not found.", { status: 404 });
        }

        if (existingVote) {
            if (existingVote.type === voteType) {
                await db.vote.delete({
                    where: {
                        userId_postId: {
                            postId,
                            userId: session.user.id,
                        },
                    },
                });
                return new Response("OK");
            }

            await db.vote.update({
                where: {
                    userId_postId: {
                        postId,
                        userId: session.user.id,
                    },
                },
                data: {
                    type: voteType,
                },
            });

            // Recount the votes
            const numVotes = post.votes.reduce((acc, vote) => {
                if (vote.type === "UP") return acc + 1;
                if (vote.type === "DOWN") return acc - 1;
                return acc;
            }, 0);

            if (numVotes >= CACHE_AFTER_UPVOTES) {
                const cachePayload: CachedPost = {
                    id: post.id,
                    authorUsername: post.author.username ?? "",
                    content: JSON.stringify(post.content),
                    title: post.title,
                    currentVote: voteType,
                    createdAt: post.createdAt,
                };

                await redis.hset(`post${postId}`, cachePayload);
            }
            return new Response("OK");
        }

        await db.vote.create({
            data: {
                type: voteType,
                userId: session.user.id,
                postId,
            },
        });

        // Recount the votes
        const numVotes = post.votes.reduce((acc, vote) => {
            if (vote.type === "UP") return acc + 1;
            if (vote.type === "DOWN") return acc - 1;
            return acc;
        }, 0);

        if (numVotes >= CACHE_AFTER_UPVOTES) {
            const cachePayload: CachedPost = {
                id: post.id,
                authorUsername: post.author.username ?? "",
                content: JSON.stringify(post.content),
                title: post.title,
                currentVote: voteType,
                createdAt: post.createdAt,
            };

            await redis.hset(`post${postId}`, cachePayload);
        }

        return new Response("OK");
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new Response(error.message, { status: 422 });
        }

        return new Response("Cannot vote now. Try again later", {
            status: 500,
        });
    }
}
