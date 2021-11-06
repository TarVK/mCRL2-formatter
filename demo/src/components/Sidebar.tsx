import React, {FC, Fragment, MutableRefObject, useCallback, useEffect, useState} from "react";
import {Stack, StackItem, getTheme, Dropdown, TextField, PrimaryButton, Separator, Toggle} from "@fluentui/react";
import ReactJson from "react-json-view";
import {useTheme} from "@fluentui/react-theme-provider";
import {ILatexOptions} from "../_types/ILatexOptions";
import {useEditor} from "../editor/useEditor";

export const Sidebar: FC<{
    onToLatex: () => void;
    latexOptions: MutableRefObject<ILatexOptions>;
}> = ({onToLatex, latexOptions}) => {
    const theme = useTheme();
    const [_, update] = useState({});
    const forceUpdate = useCallback(() => update({}), []);

    return (
        <Stack style={{height: "100%"}}>
            <StackItem>
                <TextField
                    label="Spaces per indent"
                    type="number"
                    value={latexOptions.current.inputIndent + ""}
                    onChange={(e, val) => {
                        if (val) latexOptions.current.inputIndent = Number(val);
                        forceUpdate();
                    }}
                />
                <TextField
                    label="Tab character"
                    value={latexOptions.current.tabCharacter}
                    onChange={(e, val) => {
                        if (val) latexOptions.current.tabCharacter = val;
                        forceUpdate();
                    }}
                />
                <PrimaryButton
                    text="Convert to latex"
                    onClick={() => onToLatex()}
                    allowDisabledFocus
                    styles={{
                        root: {
                            width: "100%",
                            marginTop: theme.spacing.m,
                            marginBottom: theme.spacing.m,
                        },
                    }}
                />
            </StackItem>
            <StackItem grow={1}>
                <div />
            </StackItem>
            <StackItem>
                Expected packages:
                <Packages />
            </StackItem>
        </Stack>
    );
};

const Packages: FC = () => {
    const [editor, editorRef] = useEditor({
        value: "",
        height: "100%",
        options: {
            minimap: {enabled: false},
            scrollbar: {useShadows: false},
            scrollBeyondLastLine: false,
            language: "tex",
            readOnly: true,
            lineNumbers: "off",
            wordWrap: "on",
        },
    });
    useEffect(() => {
        editorRef.current?.setValue(`\
\\usepackage{amsmath}
\\usepackage{mathtools}
\\usepackage{amsfonts}`);
    });
    return <div style={{height: 65, minWidth: 220}}>{editor}</div>;
};
