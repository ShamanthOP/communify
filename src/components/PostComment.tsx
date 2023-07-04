"use client";

import React, { useRef, useState } from "react";
import UserAvatar from "./UserAvatar";
import { Comment, CommentVote, User } from "@prisma/client";
import { formatTimeToNow } from "@/lib/utils";
import CommentVotes from "./CommentVotes";
import { Button } from "./ui/Button";
import { MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Label } from "./ui/Label";
import { Textarea } from "./ui/Textarea";
import { useMutation } from "@tanstack/react-query";
import { CommentPayload } from "@/lib/validators/comment";
import axios from "axios";
import { toast } from "@/hooks/useToast";

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
    const router = useRouter();
    const { data: session } = useSession();
    const commentRef = useRef<HTMLDivElement>(null);

    const [isReplying, setIsReplying] = useState(false);
    const [input, setInput] = useState("");

    const { mutate: createComment, isLoading } = useMutation({
        mutationFn: async ({ postId, text, replyToId }: CommentPayload) => {
            const payload: CommentPayload = {
                postId,
                text,
                replyToId,
            };

            const { data } = await axios.patch(
                "/api/community/post/comment",
                payload
            );
            return data;
        },
        onError: () => {
            return toast({
                title: "Something went wrong.",
                description: "Cannot post comment right now.",
                variant: "destructive",
            });
        },
        onSuccess: () => {
            router.refresh();
            setInput("");
            setIsReplying(false);
        },
    });

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

            <div className="flex gap-2 items-center flex-wrap">
                <CommentVotes
                    commentId={comment.id}
                    initialVote={currentVote}
                    numInitialVotes={numVotes}
                />

                <Button
                    variant={"ghost"}
                    size={"xs"}
                    onClick={() => {
                        if (!session) return router.push("/sign-in");
                        setIsReplying(true);
                    }}
                >
                    <MessageSquare className="h-4 w-4 mr-1.5" />
                    Reply
                </Button>

                {isReplying && (
                    <div className="grid w-full gap-1.5">
                        <Label htmlFor="comment">Your comment</Label>
                        <div className="mt-2">
                            <Textarea
                                id="comment"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                rows={1}
                                placeholder="What are your thoughts?"
                            />

                            <div className="mt-2 flex justify-end gap-2">
                                <Button
                                    tabIndex={-1}
                                    variant={"subtle"}
                                    onClick={() => setIsReplying(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    isLoading={isLoading}
                                    disabled={input.trim().length === 0}
                                    onClick={() =>
                                        createComment({
                                            postId,
                                            text: input,
                                            replyToId:
                                                comment.replyToId ?? comment.id,
                                        })
                                    }
                                >
                                    Post
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PostComment;
