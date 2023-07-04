"use client";

import { useCustomToast } from "@/hooks/useCustomToast";
import { toast } from "@/hooks/useToast";
import { cn } from "@/lib/utils";
import { CommentVoteRequest } from "@/lib/validators/vote";
import { usePrevious } from "@mantine/hooks";
import { CommentVote, VoteType } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { ArrowBigDown, ArrowBigUp } from "lucide-react";
import React, { useState } from "react";
import { Button } from "@/components/ui/Button";

interface CommentVotesProps {
    commentId: string;
    numInitialVotes: number;
    initialVote?: Pick<CommentVote, "type">;
}

const CommentVotes: React.FC<CommentVotesProps> = ({
    commentId,
    numInitialVotes,
    initialVote,
}) => {
    const { loginToast } = useCustomToast();
    const [numVotes, setNumVotes] = useState(numInitialVotes);
    const [currentVote, setCurrentVote] = useState(initialVote);
    const prevVote = usePrevious(currentVote);

    const { mutate: vote } = useMutation({
        mutationFn: async (voteType: VoteType) => {
            const payload: CommentVoteRequest = {
                commentId,
                voteType,
            };

            await axios.patch("/api/community/post/comment/vote", payload);
        },
        onError: (error, voteType) => {
            if (voteType === "UP") {
                setNumVotes((prev) => prev - 1);
            } else {
                setNumVotes((prev) => prev + 1);
            }

            setCurrentVote(prevVote);

            if (error instanceof AxiosError) {
                if (error.response?.status === 401) {
                    return loginToast();
                }
            }

            return toast({
                title: "Something went wrong.",
                description: "Your vote did not register. Try again Later.",
                variant: "destructive",
            });
        },
        onMutate: (type) => {
            if (currentVote?.type === type) {
                setCurrentVote(undefined);
                if (type === "UP") {
                    setNumVotes((prev) => prev - 1);
                } else if (type === "DOWN") {
                    setNumVotes((prev) => prev + 1);
                }
            } else {
                setCurrentVote({ type });
                if (type === "UP") {
                    setNumVotes((prev) => prev + (currentVote ? 2 : 1));
                } else if (type === "DOWN") {
                    setNumVotes((prev) => prev - (currentVote ? 2 : 1));
                }
            }
        },
    });

    return (
        <div className="flex gap-1">
            <Button
                onClick={() => vote("UP")}
                size={"sm"}
                variant={"ghost"}
                aria-label="upvote"
            >
                <ArrowBigUp
                    className={cn("h-5 w-5 text-zinc-700", {
                        "text-emerald-500 fill-emerald-500":
                            currentVote?.type === "UP",
                    })}
                />
            </Button>

            <p className="text-center py-2 font-medium text-sm text-zinc-900">
                {numVotes}
            </p>

            <Button
                onClick={() => vote("DOWN")}
                size={"sm"}
                variant={"ghost"}
                aria-label="upvote"
            >
                <ArrowBigDown
                    className={cn("h-5 w-5 text-zinc-700", {
                        "text-red-500 fill-red-500":
                            currentVote?.type === "DOWN",
                    })}
                />
            </Button>
        </div>
    );
};

export default CommentVotes;
