"use client";

import { useQuery } from "@tanstack/react-query";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "./ui/Command";
import { useCallback, useState } from "react";
import axios from "axios";
import { Community, Prisma } from "@prisma/client";
import { useRouter } from "next/navigation";
import { Users } from "lucide-react";
import debounce from "lodash.debounce";

const SearchBar = () => {
    const router = useRouter();
    const [input, setInput] = useState("");

    const {
        data: queryResult,
        refetch,
        isFetched,
        isFetching,
    } = useQuery({
        queryKey: ["search-query"],
        queryFn: async () => {
            if (input.trim().length === 0) {
                return [];
            }
            const { data } = await axios.get(`/api/search?q=${input}`);
            return data as (Community & {
                _count: Prisma.CommunityCountOutputType;
            })[];
        },
        enabled: false,
    });

    const request = debounce(() => {
        refetch();
    }, 500);

    const debounceRequest = useCallback(() => {
        request();
    }, [request]);

    return (
        <Command className="relative rounded-lg border max-w-lg z-50 overflow-visible">
            <CommandInput
                className="outline-none border-none focus:border-none focus:outline-none ring-0 focus:ring-0"
                placeholder="Search communitites..."
                value={input}
                onValueChange={(text) => {
                    setInput(text);
                    debounceRequest();
                }}
            />

            {input.length > 0 && (
                <CommandList className="absolute bg-white top-full inset-x-0 shadoe rounded-b-md">
                    {isFetched && (
                        <CommandEmpty>No results found.</CommandEmpty>
                    )}
                    {(queryResult?.length ?? 0) > 0 && (
                        <CommandGroup heading="Communities">
                            {queryResult?.map((community) => (
                                <CommandItem
                                    key={community.id}
                                    value={community.name}
                                    onSelect={(e) => {
                                        router.push(`/c/${e}`);
                                        router.refresh();
                                    }}
                                >
                                    <Users className="mr-2 h-4 w-4" />
                                    <a href={`/c/${community.name}`}>
                                        c/{community.name}
                                    </a>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}
                </CommandList>
            )}
        </Command>
    );
};

export default SearchBar;
