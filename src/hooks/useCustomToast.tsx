import Link from "next/link";
import { toast } from "./useToast";
import { buttonVariants } from "@/components/ui/Button";

export const useCustomToast = () => {
    const loginToast = () => {
        const { dismiss } = toast({
            title: "Login required",
            description: "You need to be logged in to perform that action.",
            variant: "destructive",
            action: (
                <Link
                    href={"/sign-in"}
                    className={buttonVariants({ variant: "outline" })}
                    onClick={() => dismiss()}
                >
                    Login
                </Link>
            ),
        });
    };

    return { loginToast };
};
