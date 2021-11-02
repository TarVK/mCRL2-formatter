import {Range, editor as Editor} from "monaco-editor";
import {useEffect} from "react";
import {ISyntaxError} from "../_types/ISyntaxError";

/**
 * A hook to annotate the line at which an error occurred
 * @param syntaxError The error that occurred
 * @param editor The editor in which to annotate the corresponding line
 */
export function useErrorAnnotater(syntaxError: ISyntaxError | null, editor?: Editor.IStandaloneCodeEditor) {
    useEffect(() => {
        // Resize the editor on changes (sidebar may have changed size)
        if (editor) editor.layout();

        // Highlight syntax errors in the editor
        if (syntaxError && editor) {
            const index = syntaxError.index;
            const text = editor.getValue();
            const range = new Range(index.line, index.column, index.line, index.column + 1);
            const decorations = editor.deltaDecorations(
                [],
                [
                    {
                        range,
                        options: {
                            // Fixes the issue of there not being a character to highlight at the end of a line
                            before: index.offset == text.length ? {inlineClassName: "error", content: " "} : undefined,
                            marginClassName: "errorMargin",
                            inlineClassName: "error",
                            overviewRuler: {
                                color: "rgb(179, 82, 82)",
                                position: Editor.OverviewRulerLane.Left,
                            },
                            hoverMessage: {value: syntaxError.message},
                        },
                    },
                    {
                        range,
                        options: {
                            className: "errorLine",
                            isWholeLine: true,
                        },
                    },
                ]
            );
            return () => void editor.deltaDecorations(decorations, []);
        }
    }, [syntaxError]);
}
