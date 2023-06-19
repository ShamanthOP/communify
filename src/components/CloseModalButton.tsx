"use client";

import { X } from "lucide-react";
import { Button } from "./ui/Button";
import { useRouter } from "next/navigation";

const CloseModalButton = () => {
    const router = useRouter();

    return (
        <Button
            variant={"subtle"}
            className="h-6 w-6 p-0 rounded-md"
            onClick={() => router.back()}
            aria-label="Close Modal"
        >
            <X className="h-4 w-4" />
        </Button>
    );
};

export default CloseModalButton;