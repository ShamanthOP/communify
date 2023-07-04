"use client";

import React, { useState } from "react";
import { Label } from "./ui/Label";
import { Textarea } from "./ui/Textarea";
import { Button } from "./ui/Button";
import { useMutation } from "@tanstack/react-query";
import { CommentPayload } from "@/lib/validators/comment";
import axios, { AxiosError } from "axios";
import { toast } from "@/hooks/useToast";
import { useCustomToast } from "@/hooks/useCustomToast";
import { useRouter } from "next/navigation";

interface CreateCommentProps {
    postId: string;
    replyToId?: string;
}

const CreateComment: React.FC<CreateCommentProps> = ({ postId, replyToId }) => {
    const router = useRouter();
    const { loginToast } = useCustomToast();
    const [input, setInput] = useState("");

    const { mutate: comment, isLoading } = useMutation({
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
        onError: (error) => {
            if (error instanceof AxiosError) {
                if (error.response?.status === 401) {
                    return loginToast();
                }
            }

            return toast({
                title: "There was a problem removing membership",
                description: "Something went wrong. Try again later",
                variant: "destructive",
            });
        },
        onSuccess: () => {
            router.refresh();
            setInput("");
        },
    });

    return (
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

                <div className="mt-2 flex justify-end">
                    <Button
                        isLoading={isLoading}
                        disabled={input.trim().length === 0}
                        onClick={() =>
                            comment({ postId, text: input, replyToId })
                        }
                    >
                        Post
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default CreateComment;
