import React, {FC, Fragment, MutableRefObject, useCallback, useState} from "react";
import {Stack, StackItem, getTheme, Dropdown, TextField, PrimaryButton, Separator, Toggle} from "@fluentui/react";
import ReactJson from "react-json-view";
import {useTheme} from "@fluentui/react-theme-provider";
import {IFormatOptions} from "../_types/IFormatOptions";
import {ILatexOptions} from "../_types/ILatexOptions";

export const Sidebar: FC<{
    onFormat: () => void;
    onToLatex: () => void;
    formatOptions: MutableRefObject<IFormatOptions>;
    latexOptions: MutableRefObject<ILatexOptions>;
}> = ({onFormat, onToLatex, formatOptions, latexOptions}) => {
    const theme = useTheme();
    const [_, update] = useState({});
    const forceUpdate = useCallback(() => update({}), []);

    return (
        <Stack style={{maxHeight: "100%"}}>
            <StackItem>
                <TextField
                    label="Spaces per indent"
                    type="number"
                    value={formatOptions.current.outputIndents + ""}
                    onChange={(e, val) => {
                        if (val) formatOptions.current.outputIndents = Number(val);
                        forceUpdate();
                    }}
                />
            </StackItem>
            <StackItem>
                <Separator>Format</Separator>
                <TextField
                    label="Input spaces per indent"
                    type="number"
                    value={formatOptions.current.inputIndents + ""}
                    onChange={(e, val) => {
                        if (val) formatOptions.current.inputIndents = Number(val);
                        forceUpdate();
                    }}
                />
                <TextField
                    label="Maximum line length"
                    type="number"
                    value={formatOptions.current.maxLineLength + ""}
                    onChange={(e, val) => {
                        if (val) formatOptions.current.maxLineLength = Number(val);
                        forceUpdate();
                    }}
                />
                <Toggle
                    checked={formatOptions.current.resetLineBreaks}
                    onChange={(e, val) => {
                        if (val !== undefined) formatOptions.current.resetLineBreaks = val;
                        forceUpdate();
                    }}
                    label="Reset line breaks"
                    onText="Reset"
                    offText="Keep"
                />
                <Dropdown
                    placeholder="Brackets"
                    label="Brackets"
                    options={[
                        {
                            key: "keep",
                            text: "Keep",
                            selected: formatOptions.current.brackets == "keep",
                        },
                        {
                            key: "all",
                            text: "All",
                            selected: formatOptions.current.brackets == "all",
                        },
                        {
                            key: "required",
                            text: "Required",
                            selected: formatOptions.current.brackets == "required",
                        },
                    ]}
                    onChange={(e, option) => {
                        if (option) formatOptions.current.brackets = option.key as any;
                        forceUpdate();
                    }}
                />
                <PrimaryButton
                    text="Format"
                    onClick={() => onFormat()}
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
            <StackItem>
                <Separator>Latex</Separator>
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
