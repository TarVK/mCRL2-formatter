import React, {FC, useEffect} from "react";
import {Stack, StackItem, getTheme, Dropdown, PrimaryButton} from "@fluentui/react";
import {useEditor} from "../editor/useEditor";
import {Tex} from "react-tex";
import {useTheme} from "@fluentui/react-theme-provider";

export const LatexOutput: FC<{latex: string | null}> = ({latex}) => {
    const theme = useTheme();
    const [editor, editorRef] = useEditor({
        value: "",
        height: "100%",
        options: {
            minimap: {enabled: false},
            scrollbar: {useShadows: false},
            scrollBeyondLastLine: false,
            language: "tex",
            readOnly: true,
        },
    });
    useEffect(() => {
        const editor = editorRef.current;
        if (!editor) return;
        if (!latex) {
            editor.setValue("");
        } else {
            editor.setValue(latex);
            editor.layout();
        }
    }, [latex]);

    return (
        <div style={{height: "100%", width: "100%"}}>
            <Stack horizontal styles={{root: {height: "100%", width: "100%"}}}>
                {/* <Stack horizontal styles={{root: {}}}> */}
                <StackItem grow={1} style={{minWidth: 0, flexBasis: 0}}>
                    {editor}
                </StackItem>
                <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.12.0/dist/katex.min.css" />
                <StackItem grow={1} style={{padding: theme.spacing.m, minWidth: 0, flexBasis: 0, overflow: "auto"}}>
                    {latex && <Tex texContent={latex} />}
                </StackItem>
            </Stack>
        </div>
    );
};
