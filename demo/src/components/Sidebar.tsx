import React, {FC, Fragment, MutableRefObject, useCallback, useState} from "react";
import {Stack, StackItem, getTheme, Dropdown, TextField, PrimaryButton, Separator, Toggle} from "@fluentui/react";
import ReactJson from "react-json-view";
import {useTheme} from "@fluentui/react-theme-provider";
import {ILatexOptions} from "../_types/ILatexOptions";

export const Sidebar: FC<{
    onToLatex: () => void;
    latexOptions: MutableRefObject<ILatexOptions>;
}> = ({onToLatex, latexOptions}) => {
    const theme = useTheme();
    const [_, update] = useState({});
    const forceUpdate = useCallback(() => update({}), []);

    return (
        <Stack style={{maxHeight: "100%"}}>
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
        </Stack>
    );
};
