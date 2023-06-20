"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CommunityCreationPage() {
    const router = useRouter();
    const [input, setInput] = useState("");

    // const {} = useMutation({
    //     mutationFn: async () => {
    //         const payload = {

    //         }
    //         const {data} = await axios.post("/api/community", payload)
    //     }
    // })

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
                    <Button>Create Community</Button>
                </div>
            </div>
        </div>
    );
}