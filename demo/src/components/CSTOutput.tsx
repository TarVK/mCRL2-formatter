import React, {FC, useEffect} from "react";
import {Stack, StackItem, getTheme, Dropdown, VerticalDivider} from "@fluentui/react";
import {useEditor} from "../editor/useEditor";
import {Tex} from "react-tex";
import {useTheme} from "@fluentui/react-theme-provider";
import ReactJson from "react-json-view";
import {IAnyNode} from "mCRL2-formatter/build/parser/_types/INode";
import {nodeToFunc} from "mCRL2-formatter";

export const CSTOutput: FC<{node: IAnyNode | null}> = ({node}) => {
    const theme = useTheme();
    const [editor, editorRef] = useEditor({
        value: "",
        height: "100%",
        options: {
            minimap: {enabled: false},
            scrollbar: {useShadows: false},
            scrollBeyondLastLine: false,
            language: "typescript",
            readOnly: true,
        },
    });
    useEffect(() => {
        const editor = editorRef.current;
        if (!editor) return;
        if (!node) {
            editor.setValue("");
        } else {
            const funcString = nodeToFunc(node);
            editor.setValue(funcString);
        }
    }, [node]);

    return (
        <Stack horizontal styles={{root: {height: "100%"}}}>
            <StackItem
                grow={1}
                style={{minWidth: 0, flexBasis: 0}}
                styles={{
                    root: {
                        ".copy-to-clipboard-container": {
                            verticalAlign: "middle!important", // Fix copy hover item
                        },
                    },
                }}>
                <div style={{height: "100%", overflow: "auto"}}>
                    {node && (
                        <ReactJson
                            src={node}
                            name={"root"}
                            collapsed={true}
                            displayDataTypes={false}
                            quotesOnKeys={false}
                            displayObjectSize={false}
                            sortKeys={true}
                        />
                    )}
                </div>
            </StackItem>
            <StackItem style={{padding: theme.spacing.m}}>
                <VerticalDivider />
            </StackItem>
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.12.0/dist/katex.min.css" />
            <StackItem grow={1} style={{minWidth: 0, flexBasis: 0}}>
                {editor}
            </StackItem>
        </Stack>
    );
};
