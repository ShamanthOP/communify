"use client";

import { useCustomToast } from "@/hooks/useCustomToast";
import { usePrevious } from "@mantine/hooks";
import { VoteType } from "@prisma/client";
import React, { useEffect, useState } from "react";
import { Button } from "../ui/Button";
import { ArrowBigDown, ArrowBigUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { PostVoteRequest } from "@/lib/validators/vote";
import axios, { AxiosError } from "axios";
import { toast } from "@/hooks/useToast";

interface PostVoteClientProps {
    postId: string;
    numInitialVotes: number;
    initialVote: VoteType | undefined | null;
}

const PostVoteClient: React.FC<PostVoteClientProps> = ({
    postId,
    numInitialVotes,
    initialVote,
}) => {
    const { loginToast } = useCustomToast();
    const [numVotes, setNumVotes] = useState(numInitialVotes);
    const [currentVote, setCurrentVote] = useState(initialVote);
    const prevVote = usePrevious(currentVote);

    useEffect(() => {
        setCurrentVote(initialVote);
    }, [initialVote]);

    useEffect(() => {
        setNumVotes(numInitialVotes);
    }, [numInitialVotes]);

    const { mutate: vote } = useMutation({
        mutationFn: async (voteType: VoteType) => {
            const payload: PostVoteRequest = {
                postId,
                voteType,
            };

            await axios.patch("/api/community/post/vote", payload);
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
        onMutate: (type: VoteType) => {
            if (currentVote === type) {
                setCurrentVote(undefined);
                if (type === "UP") {
                    setNumVotes((prev) => prev - 1);
                } else if (type === "DOWN") {
                    setNumVotes((prev) => prev + 1);
                }
            } else {
                setCurrentVote(type);
                if (type === "UP") {
                    setNumVotes((prev) => prev + (currentVote ? 2 : 1));
                } else if (type === "DOWN") {
                    setNumVotes((prev) => prev - (currentVote ? 2 : 1));
                }
            }
        },
    });

    return (
        <div className="flex flex-col gap-4 sm:gap-0 pr-6 sm:w-20 pb-4 sm:pb-0">
            <Button
                onClick={() => vote("UP")}
                size={"sm"}
                variant={"ghost"}
                aria-label="upvote"
            >
                <ArrowBigUp
                    className={cn("h-5 w-5 text-zinc-700", {
                        "text-emerald-500 fill-emerald-500":
                            currentVote === "UP",
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
                        "text-red-500 fill-red-500": currentVote === "DOWN",
                    })}
                />
            </Button>
        </div>
    );
};

export default PostVoteClient;
