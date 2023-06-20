"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useCustomToast } from "@/hooks/useCustomToast";
import { toast } from "@/hooks/useToast";
import { CreateCommunityPayload } from "@/lib/validators/community";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CommunityCreationPage() {
    const router = useRouter();
    const { loginToast } = useCustomToast();
    const [input, setInput] = useState("");

    const { mutate: createCommunity, isLoading } = useMutation({
        mutationFn: async () => {
            const payload: CreateCommunityPayload = {
                name: input,
            };
            const { data } = await axios.post("/api/community", payload);
            return data as string;
        },
        onError: (error) => {
            if (error instanceof AxiosError) {
                if (error.response?.status === 409) {
                    return toast({
                        title: "Community with this name already exists.",
                        description:
                            "Please choose a different Community name.",
                        variant: "destructive",
                    });
                }
                if (error.response?.status === 422) {
                    return toast({
                        title: "Invalid Community name.",
                        description:
                            "Please choose a name between 3 and 21 characters.",
                        variant: "destructive",
                    });
                }
                if (error.response?.status === 401) {
                    return loginToast();
                }
            }

            toast({
                title: "Something went wrong.",
                description: "Could not create a new community.",
                variant: "destructive",
            });
        },
        onSuccess: (data) => {
            router.push(`/c/${data}`);
        },
    });

    return (
        <div className="container flex items-center h-full max-w-3xl mx-auto">
            <div className="relative bg-white w-full h-fit p-4 rounded-lg space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold">
                        Create a Community
                    </h1>
                </div>

                <hr className="bg-zinc-500 h-px" />

                <div>
                    <p className="text-lg font-medium">Name</p>
                    <p className="text-xs pb-2">
                        Community names including capitalization cannot be
                        changed.
                    </p>
                </div>

                <div className="relative">
                    <p className="absolute text-sm left-0 w-8 inset-y-0 grid place-items-center text-zinc-400">
                        c/
                    </p>
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="pl-6"
                    />
                </div>

                <div className="flex justify-end gap-4">
                    <Button variant={"subtle"} onClick={() => router.back()}>
                        Cancel
                    </Button>
                    <Button
                        isLoading={isLoading}
                        disabled={input.length === 0}
                        onClick={() => createCommunity()}
                    >
                        Create Community
                    </Button>
                </div>
            </div>
        </div>
    );
}
