import {makeStyles} from "@fluentui/react-theme-provider";
import {loader, useMonaco} from "@monaco-editor/react";
import {languages, editor} from "monaco-editor/esm/vs/editor/editor.api";
import React, {FC, useRef, useEffect, useState} from "react";
import {mCRL2Language, mCRL2Theme} from "./mCRL2LanguageMonacoDefinition";

const useStyle = makeStyles({
    editorStyle: {
        ".error": {
            backgroundColor: "rgb(237, 155, 155)",
        },
        ".errorLine": {
            backgroundColor: "rgb(255, 239, 239)",
        },
        ".errorMargin": {
            backgroundColor: "rgb(248, 217, 217)",
        },
    },
});

/**
 * Returns an editor element, and the editor that was created
 * @param config The configuration for the editor
 * @returns The element and editor ref
 */
export const useEditor = ({
    value,
    height,
    options,
}: {
    value: string;
    height: string;
    options: editor.IStandaloneEditorConstructionOptions;
}) => {
    const monaco = useMonaco();
    const elementRef = useRef<HTMLDivElement>(null);
    const editorRef = useRef<editor.IStandaloneCodeEditor>();
    const {editorStyle} = useStyle();

    useEffect(() => {
        if (elementRef.current) {
            const e = (editorRef.current = editor.create(elementRef.current, {
                value: value,
                language: mCRL2Language,
                theme: mCRL2Theme,
                folding: true,
                foldingStrategy: "auto",
                // showFoldingControls: "always",
                ...options,
            }));

            const resizeListener = () => e.layout();
            window.addEventListener("resize", resizeListener);

            return () => {
                e.dispose();
                window.removeEventListener("resize", resizeListener);
            };
        }
    }, [monaco]);

    return [
        <section
            className={editorStyle}
            style={{
                display: "flex",
                position: "relative",
                textAlign: "initial",
                height,
            }}>
            {monaco ? <div ref={elementRef} style={{width: "100%"}} /> : "Loading..."}
        </section>,
        editorRef,
    ] as const;
};
