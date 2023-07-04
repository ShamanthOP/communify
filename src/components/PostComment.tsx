"use client";

import React, { useRef } from "react";
import UserAvatar from "./UserAvatar";
import { Comment, CommentVote, User } from "@prisma/client";
import { formatTimeToNow } from "@/lib/utils";
import CommentVotes from "./CommentVotes";

type ExtendedComment = Comment & {
    votes: CommentVote[];
    author: User;
};

interface PostCommentProps {
    comment: ExtendedComment;
    currentVote: CommentVote | undefined;
    numVotes: number;
    postId: string;
}

const PostComment: React.FC<PostCommentProps> = ({
    comment,
    currentVote,
    numVotes,
    postId,
}) => {
    const commentRef = useRef<HTMLDivElement>(null);

    return (
        <div className="flex flex-col" ref={commentRef}>
            <div className="flex items-center">
                <UserAvatar
                    user={{
                        name: comment.author.name || null,
                        image: comment.author.image || null,
                    }}
                    className="h-6 w-6"
                />

                <div className="ml-2 flex items-center gap-x-2">
                    <p className="text-sm font-medium text-gray-900">
                        u/{comment.author.username}
                    </p>
                    <p className="max-h-40 truncate text-xs text-zinc-500">
                        {formatTimeToNow(new Date(comment.createdAt))}
                    </p>
                </div>
            </div>

            <p className="text-sm text-zinc-900 mt-2">{comment.text}</p>

            <div className="flex gap-2 items-center">
                <CommentVotes
                    commentId={comment.id}
                    initialVote={currentVote}
                    numInitialVotes={numVotes}
                />
            </div>
        </div>
    );
};

export default PostComment;
