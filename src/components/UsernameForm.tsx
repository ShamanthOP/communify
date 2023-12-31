"use client";

import { UsernamePayload, UsernameValidator } from "@/lib/validators/username";
import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "@prisma/client";
import React from "react";
import { useForm } from "react-hook-form";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "./ui/Card";
import { Label } from "./ui/Label";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { toast } from "@/hooks/useToast";
import { useRouter } from "next/navigation";

interface UsernameFormProps {
    user: Pick<User, "id" | "username">;
}

const UsernameForm: React.FC<UsernameFormProps> = ({ user }) => {
    const router = useRouter();

    const {
        handleSubmit,
        register,
        formState: { errors },
    } = useForm<UsernamePayload>({
        resolver: zodResolver(UsernameValidator),
        defaultValues: {
            name: user?.username || "",
        },
    });

    const { mutate: updateUsername, isLoading } = useMutation({
        mutationFn: async ({ name }: UsernamePayload) => {
            const payload: UsernamePayload = {
                name,
            };
            const { data } = await axios.patch("/api/username", payload);
            return data;
        },
        onError: (error) => {
            if (error instanceof AxiosError) {
                if (error.response?.status === 409) {
                    return toast({
                        title: "Username already exists.",
                        description: "Please choose a different Username.",
                        variant: "destructive",
                    });
                }
            }

            toast({
                title: "Something went wrong.",
                description: "Could not update the username.",
                variant: "destructive",
            });
        },
        onSuccess: () => {
            toast({
                description: "Username updated.",
            });
            router.refresh();
        },
    });

    return (
        <form onSubmit={handleSubmit((e) => updateUsername(e))}>
            <Card>
                <CardHeader>
                    <CardTitle>Your username</CardTitle>
                    <CardDescription>
                        Please enter a display name
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="relative grid gap-1">
                        <div className="absolute top-0 left-0 w-8 h-10 grid place-items-center">
                            <span className="text-sm text-zinc-400">u/</span>
                        </div>

                        <Label className="sr-only" htmlFor="name">
                            Name
                        </Label>
                        <Input
                            id="name"
                            className="w-[400px] pl-6"
                            size={32}
                            {...register("name")}
                        />

                        {errors.name && (
                            <p className="px-1 text-xs text-red-600">
                                {errors.name.message}
                            </p>
                        )}
                    </div>
                </CardContent>
                <CardFooter>
                    <Button isLoading={isLoading}>Change name</Button>
                </CardFooter>
            </Card>
        </form>
    );
};

export default UsernameForm;
