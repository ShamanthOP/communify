"use client";

import { INFINITE_SCROLLING_PAGINATION_RESULTS } from "@/config";
import { ExtendedPost } from "@/types/db";
import { useIntersection } from "@mantine/hooks";
import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";
import React, { useEffect, useRef } from "react";
import Post from "./Post";

interface PostFeedProps {
    initialPosts: ExtendedPost[];
    communityName?: string;
}

const PostFeed: React.FC<PostFeedProps> = ({ initialPosts, communityName }) => {
    const lastPostRef = useRef<HTMLElement>(null);
    const { ref, entry } = useIntersection({
        root: lastPostRef.current,
        threshold: 1,
    });

    const { data: session } = useSession();

    const { data, fetchNextPage, isFetchingNextPage } = useInfiniteQuery(
        ["infinite-query"],
        async ({ pageParam = 1 }) => {
            const query =
                `/api/posts?limit=${INFINITE_SCROLLING_PAGINATION_RESULTS}&page=${pageParam}` +
                (!!communityName ? `&communityName=${communityName}` : "");

            const { data } = await axios.get(query);
            return data as ExtendedPost[];
        },
        {
            getNextPageParam: (_, pages) => {
                return pages.length + 1;
            },
            initialData: {
                pages: [initialPosts],
                pageParams: [1],
            },
        }
    );

    useEffect(() => {
        if (entry?.isIntersecting) {
            fetchNextPage();
        }
    }, [entry, fetchNextPage]);

    const posts = data?.pages.flatMap((page) => page) ?? initialPosts;

    return (
        <ul className="flex flex-col col-span-2 space-y-6">
            {posts.map((post, index) => {
                const votes = post.votes.reduce((acc, vote) => {
                    if (vote.type === "UP") return acc + 1;
                    if (vote.type === "DOWN") return acc - 1;
                    return acc;
                }, 0);

                const isVotedByCurrentUser = post.votes.find((vote) => {
                    return vote.userId === session?.user.id;
                });

                if (index === posts.length - 1) {
                    return (
                        <li key={post.id} ref={ref}>
                            <Post
                                communityName={post.community.name}
                                post={post}
                                numComments={post.comments.length}
                                numVotes={votes}
                                currentVote={isVotedByCurrentUser}
                            />
                        </li>
                    );
                } else {
                    return (
                        <li key={post.id}>
                            <Post
                                communityName={post.community.name}
                                post={post}
                                numComments={post.comments.length}
                                numVotes={votes}
                                currentVote={isVotedByCurrentUser}
                            />
                        </li>
                    );
                }
            })}
        </ul>
    );
};

export default PostFeed;
