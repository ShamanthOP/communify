"use client";

import { formatTimeToNow } from "@/lib/utils";
import { Post, User, Vote } from "@prisma/client";
import { MessageSquare } from "lucide-react";
import React, { useRef } from "react";
import PostEditorOutput from "./PostEditorOutput";
import PostVoteClient from "./post-vote/PostVoteClient";

interface PostProps {
    communityName: string;
    post: Post & {
        author: User;
        votes: Vote[];
    };
    numComments: number;
    numVotes: number;
    currentVote?: Pick<Vote, "type">;
}

const Post: React.FC<PostProps> = ({
    communityName,
    post,
    numComments,
    numVotes,
    currentVote,
}) => {
    const postRef = useRef<HTMLDivElement>(null);

    return (
        <div className="rounded-md bg-white shadow">
            <div className="px-6 py-4 flex justify-between">
                <PostVoteClient
                    numInitialVotes={numVotes}
                    initialVote={currentVote?.type}
                    postId={post.id}
                />

                <div className="w-0 flex-1">
                    <div className="max-h-40 mt-1 text-xs text-gray-500">
                        {communityName ? (
                            <>
                                <a
                                    className="underline text-zinc-900 text-sm underline-offset-2"
                                    href={`/c/${communityName}`}
                                >
                                    c/{communityName}
                                </a>
                                <span className="px-1">.</span>
                            </>
                        ) : null}
                        <span>Posted by u/{post.author.username}</span>{" "}
                        {formatTimeToNow(new Date(post.createdAt))}
                    </div>

                    <a href={`/c/${communityName}/post/${post.id}`}>
                        <h1 className="text-lg font-semibold py-2 leading-6 text-gray-900">
                            {post.title}
                        </h1>
                    </a>

                    <div
                        className="relative text-sm max-h-40 w-full overflow-clip"
                        ref={postRef}
                    >
                        <PostEditorOutput content={post.content} />

                        {postRef.current?.clientHeight === 160 ? (
                            <div className="absolute bottom-0 left-0 h-24 w-full bg-gradient-to-t from-white to-transparent" />
                        ) : null}
                    </div>
                </div>
            </div>

            <div className="bg-gray-50 z-20 text-sm p-4 sm:px-6">
                <a
                    href={`/c/${communityName}/post/${post.id}`}
                    className="w-fit flex items-center gap-2"
                >
                    <MessageSquare className="h-4 w-4" /> {numComments} comments
                </a>
            </div>
        </div>
    );
};

export default Post;
