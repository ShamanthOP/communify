"use client";

import { useMutation } from "@tanstack/react-query";
import { Button } from "./ui/Button";
import { CommunityMembershipPayload } from "@/lib/validators/community";
import React, { startTransition } from "react";
import axios, { AxiosError } from "axios";
import { useCustomToast } from "@/hooks/useCustomToast";
import { toast } from "@/hooks/useToast";
import { useRouter } from "next/navigation";

interface SubscribeLeaveToggleProps {
    communityId: string;
    communityName: string;
    isMember: boolean;
}

const SubscribeLeaveToggle: React.FC<SubscribeLeaveToggleProps> = ({
    communityId,
    communityName,
    isMember,
}) => {
    const { loginToast } = useCustomToast();
    const router = useRouter();

    const { mutate: createMembership, isLoading: isCreateMembershipLoading } =
        useMutation({
            mutationFn: async () => {
                const payload: CommunityMembershipPayload = {
                    communityId,
                };

                const { data } = await axios.post(
                    "/api/community/subscribe",
                    payload
                );
                return data as string;
            },
            onError: (error) => {
                if (error instanceof AxiosError) {
                    if (error.response?.status === 401) {
                        return loginToast();
                    }
                }

                return toast({
                    title: "There was a problem creating membership",
                    description: "Something went wrong. Try again later",
                    variant: "destructive",
                });
            },
            onSuccess: () => {
                startTransition(() => {
                    router.refresh();
                });

                return toast({
                    title: "Membership created successfully!",
                    description: `You are now a member of c/${communityName}`,
                });
            },
        });

    const { mutate: removeMembership, isLoading: isRemoveMembershipLoading } =
        useMutation({
            mutationFn: async () => {
                const payload: CommunityMembershipPayload = {
                    communityId,
                };

                const { data } = await axios.post(
                    "/api/community/unsubscribe",
                    payload
                );
                return data as string;
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
                startTransition(() => {
                    router.refresh();
                });

                return toast({
                    title: "Membership removed successfully",
                    description: `You are not a member of c/${communityName} anymore.`,
                });
            },
        });

    return isMember ? (
        <Button
            className="w-full mt-1 mb-4"
            onClick={() => removeMembership()}
            isLoading={isRemoveMembershipLoading}
        >
            Leave community
        </Button>
    ) : (
        <Button
            className="w-full mt-1 mb-4"
            onClick={() => createMembership()}
            isLoading={isCreateMembershipLoading}
        >
            Join to post
        </Button>
    );
};

export default SubscribeLeaveToggle;
