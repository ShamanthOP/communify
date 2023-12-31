"use client";

import { PostCreationPayload, PostValidator } from "@/lib/validators/post";
import { useForm } from "react-hook-form";
import TextareaAutosize from "react-textarea-autosize";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useRef, useState } from "react";
import type EditorJS from "@editorjs/editorjs";
import { uploadFiles } from "@/lib/uploadthing";
import { toast } from "@/hooks/useToast";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { usePathname, useRouter } from "next/navigation";

interface PostEditorProps {
    communityId: string;
}

const PostEditor: React.FC<PostEditorProps> = ({ communityId }) => {
    const pathname = usePathname();
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<PostCreationPayload>({
        resolver: zodResolver(PostValidator),
        defaultValues: {
            communityId,
            title: "",
            content: null,
        },
    });

    const ref = useRef<EditorJS | null>(null);
    const [isMounted, setIsMounted] = useState(false);
    const _titleRef = useRef<HTMLTextAreaElement | null>(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            setIsMounted(true);
        }
    }, []);

    const initializeEditor = useCallback(async () => {
        const EditorJS = (await import("@editorjs/editorjs")).default;
        const Header = (await import("@editorjs/header")).default;
        const Embed = (await import("@editorjs/embed")).default;
        const Table = (await import("@editorjs/table")).default;
        const List = (await import("@editorjs/list")).default;
        const Code = (await import("@editorjs/code")).default;
        const LinkTool = (await import("@editorjs/link")).default;
        const InlineCode = (await import("@editorjs/inline-code")).default;
        const ImageTool = (await import("@editorjs/image")).default;

        if (!ref.current) {
            const editor = new EditorJS({
                holder: "editor",
                onReady() {
                    ref.current = editor;
                },
                placeholder: "Type here to write your post...",
                inlineToolbar: true,
                data: {
                    blocks: [],
                },
                tools: {
                    header: Header,
                    linkTool: {
                        class: LinkTool,
                        config: {
                            endpoint: "/api/link",
                        },
                    },
                    image: {
                        class: ImageTool,
                        config: {
                            uploader: {
                                async uploadByFile(file: File) {
                                    const [res] = await uploadFiles({
                                        files: [file],
                                        endpoint: "imageUploader",
                                    });

                                    return {
                                        success: 1,
                                        file: {
                                            url: res.fileUrl,
                                        },
                                    };
                                },
                            },
                        },
                    },
                    list: List,
                    code: Code,
                    inlineCode: InlineCode,
                    table: Table,
                    embed: Embed,
                },
            });
        }
    }, []);

    useEffect(() => {
        if (Object.keys(errors).length) {
            for (const [_key, value] of Object.entries(errors)) {
                toast({
                    title: "Something went wrong.",
                    description: (value as { message: string }).message,
                    variant: "destructive",
                });
            }
        }
    }, [errors]);

    useEffect(() => {
        const init = async () => {
            await initializeEditor();

            setTimeout(() => {
                _titleRef.current?.focus();
            }, 0);
        };
        if (isMounted) {
            init();

            return () => {
                ref.current?.destroy();
                ref.current = null;
            };
        }
    }, [isMounted, initializeEditor]);

    const { mutate: createPost } = useMutation({
        mutationFn: async ({
            title,
            content,
            communityId,
        }: PostCreationPayload) => {
            const payload: PostCreationPayload = {
                title,
                content,
                communityId,
            };
            const { data } = await axios.post(
                "/api/community/post/create",
                payload
            );
            return data;
        },
        onError: () => {
            return toast({
                title: "Something went wrong:(",
                description: "Your post was not published, try again later",
                variant: "destructive",
            });
        },
        onSuccess: () => {
            const newPathname = pathname.split("/").slice(0, -1).join("/");
            router.push(newPathname);
            router.refresh();

            return toast({
                description: "Your post has been published!",
            });
        },
    });

    const onSubmit = async (data: PostCreationPayload) => {
        const blocks = await ref.current?.save();

        const payload: PostCreationPayload = {
            title: data.title,
            content: blocks,
            communityId: communityId,
        };

        createPost(payload);
    };

    const { ref: titleRef, ...rest } = register("title");

    return (
        <div className="w-full p-4 bg-zinc-50 rounded-lg border border-zinc-200">
            <form
                id="community-post-form"
                className="w-fit"
                onSubmit={handleSubmit(onSubmit)}
            >
                <div className="prose prose-stone dark:prose-invert">
                    <TextareaAutosize
                        ref={(e) => {
                            titleRef(e);
                            _titleRef.current = e;
                        }}
                        {...rest}
                        placeholder="Title"
                        className="w-full resize-none appearance-none overflow-hidden bg-transparent text-5xl font-bold border-none focus:outline-none focus:shadow-none ring-0 focus:ring-0"
                    />

                    <div id="editor" className="min-h-[500px]" />
                </div>
            </form>
        </div>
    );
};

export default PostEditor;
