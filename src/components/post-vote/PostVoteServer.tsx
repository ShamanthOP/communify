import { getAuthSession } from "@/lib/auth";
import { VoteType, Post, Vote } from "@prisma/client";
import { notFound } from "next/navigation";
import PostVoteClient from "./PostVoteClient";

interface PostVoteServerProps {
    postId: string;
    numInitialVotes?: number;
    initialVote?: VoteType | null;
    getData?: () => Promise<(Post & {votes: Vote[]}) | null>
}

const PostVoteServer = async ({postId, numInitialVotes, initialVote, getData}: PostVoteServerProps) => {
    const session = await getAuthSession();

    let _numVotes = 0;
    let _currentVote: VoteType | null | undefined = undefined;

    if(getData) {
        const post = await getData();
        if(!post) return notFound();

        _numVotes = post.votes.reduce((acc, vote) => {
            if(vote.type==="UP") return acc+1
            if(vote.type==="DOWN") return acc-1
            return acc
        }, 0)
        _currentVote = post.votes.find(vote => vote.userId===session?.user.id)?.type;
    } else {
        _numVotes = numInitialVotes!
        _currentVote = initialVote
    }

    return (
        <PostVoteClient postId={postId} initialVote={_currentVote} numInitialVotes={_numVotes}/>
    )
}

export default PostVoteServer;