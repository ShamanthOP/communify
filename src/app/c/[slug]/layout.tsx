import BackButton from "@/components/BackButton";
import SubscribeLeaveToggle from "@/components/SubscribeLeaveToggle";
import { buttonVariants } from "@/components/ui/Button";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { format } from "date-fns";
import Link from "next/link";
import { notFound } from "next/navigation";
import React from "react";

export default async function CommunityLayout({
    children,
    params: { slug },
}: {
    children: React.ReactNode;
    params: { slug: string };
}) {
    const session = await getAuthSession();

    const community = await db.community.findFirst({
        where: {
            name: slug,
        },
        include: {
            posts: {
                include: {
                    author: true,
                    votes: true,
                },
            },
        },
    });

    const membership = session?.user
        ? await db.membership.findFirst({
              where: {
                  community: {
                      name: slug,
                  },
                  user: {
                      id: session.user.id,
                  },
              },
          })
        : undefined;

    const isMember = !!membership;

    if (!community) {
        notFound();
    }

    const memberCount = await db.membership.count({
        where: {
            community: {
                name: slug,
            },
        },
    });

    return (
        <div className="sm:container max-w-7xl mx-auto h-full pt-2">
            <div>
                {/* Back button */}
                <BackButton />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 md:gap-x-4 py-6">
                    <div className="flex flex-col col-span-2 space-y-6">
                        {children}
                    </div>

                    {/* Information sidebar */}
                    <div className="overflow-hidden h-fit rounded-lg border border-gray-200 order-first md:order-last">
                        <div className="px-6 py-4">
                            <p className="font-semibold py-3">
                                About c/{community.name}
                            </p>
                        </div>

                        <dl className="divide-y divide-gray-100 px-6 py-4 text-sm leading-6 bg-white">
                            <div className="flex justify-between gap-x-4 py-3">
                                <dt className="text-gray-500">Created</dt>
                                <dd className="text-gray-700">
                                    <time
                                        dateTime={community.createdAt.toDateString()}
                                    >
                                        {format(
                                            community.createdAt,
                                            "MMMM d, yyyy"
                                        )}
                                    </time>
                                </dd>
                            </div>

                            <div className="flex justify-between gap-x-4 py-3">
                                <dt className="text-gray-500">Members</dt>
                                <dd className="text-gray-700">
                                    <div className="text-gray-900">
                                        {memberCount}
                                    </div>
                                </dd>
                            </div>

                            {community.creatorId === session?.user.id ? (
                                <div className="flex justify-between gap-x-4 py-3">
                                    <p className="text-gray-500">
                                        You created this Community.
                                    </p>
                                </div>
                            ) : null}

                            {community.creatorId !== session?.user.id ? (
                                <SubscribeLeaveToggle
                                    communityId={community.id}
                                    communityName={community.name}
                                    isMember={isMember}
                                />
                            ) : null}

                            <Link
                                className={buttonVariants({
                                    variant: "outline",
                                    className: "w-full mb-6",
                                })}
                                href={`${slug}/submit`}
                            >
                                Create Post
                            </Link>
                        </dl>
                    </div>
                </div>
            </div>
        </div>
    );
}
