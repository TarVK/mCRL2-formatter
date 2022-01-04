import React, {FC, Fragment, Suspense, useCallback, useEffect, useRef, useState} from "react";
import {useEditor} from "./editor/useEditor";
import {Stack, StackItem, getTheme, Dropdown, PrimaryButton, ActionButton, Pivot, PivotItem} from "@fluentui/react";
import {Header} from "./components/Header";
import {Sidebar} from "./components/Sidebar";
import {useTheme} from "@fluentui/react-theme-provider";
import {ILatexOptions} from "./_types/ILatexOptions";
import {useAnnotationRemover} from "./editor/useAnnotationRemove";
import {IAnyNode} from "mCRL2-formatter/build/parser/_types/INode";
import {ISyntaxError} from "./_types/ISyntaxError";
import {useErrorAnnotater} from "./editor/useErrorAnnotater";
import {nodeToLatex, stateFrmParser} from "mCRL2-formatter";
import {combineOptions} from "./utils/combineOptions";
import {LatexOutput} from "./components/LatexOutput";
import {CSTOutput} from "./components/CSTOutput";
import {ContributionModal} from "./components/ContributionModal";

export const App: FC = () => {
    const theme = useTheme();
    const [editor, editorRef] = useEditor({
        value: `[a||b&&c++d](\n    e || f\n)`,
        height: "100%",
        options: {
            minimap: {enabled: false},
            scrollbar: {useShadows: false},
            scrollBeyondLastLine: false,
        },
    });
    const latexOptions = useRef<ILatexOptions>({
        inputIndent: 4,
        tabCharacter: "\\text{\\hspace{2em}}",
    });
    const [contributionVisible, setContributionVisible] = useState(false);
    const [syntaxError, setSyntaxError] = useState<null | ISyntaxError>(null);
    const [node, setNode] = useState<IAnyNode | null>(null);

    const getNode = useCallback(() => {
        const val = editorRef.current?.getValue();
        if (!val) return;

        const result = stateFrmParser.parse(val);
        if (result.status) {
            setSyntaxError(null);
            setNode(result.value);
            return result.value;
        } else {
            setNode(null);
            setSyntaxError({
                ...result,
                message: `Syntax error, expected ${combineOptions(result.expected)}`,
            });
        }
    }, [editorRef]);
    const [latex, setLatex] = useState<string | null>(null);
    const toLatex = useCallback(() => {
        const node = getNode();
        if (!node) {
            setLatex(null);
        } else {
            const latex = nodeToLatex(node as any, {
                inputIndent: latexOptions.current.inputIndent,
                outputIndent: latexOptions.current.tabCharacter,
            });
            setLatex(latex);
        }
    }, [editorRef]);

    // Annotate any error in the editor
    useErrorAnnotater(syntaxError, editorRef.current);
    // Remove any annotation when the user changes the related line
    useAnnotationRemover(editorRef.current);

    return (
        <div>
            <Stack styles={{root: {height: "100%", overflow: "hidden"}}}>
                <ContributionModal visible={contributionVisible} onClose={() => setContributionVisible(false)} />
                <StackItem>
                    <Header></Header>
                </StackItem>
                <StackItem grow={1} style={{minHeight: 0}}>
                    <Stack horizontal styles={{root: {height: "100%"}}}>
                        <StackItem align="stretch" grow={1} shrink={1} styles={{root: {flexBasis: 0, minWidth: 0}}}>
                            <Stack styles={{root: {height: "100%", overflow: "hidden"}}}>
                                <StackItem grow={1} style={{minHeight: 0, flexBasis: 0}}>
                                    {editor}
                                </StackItem>
                                <StackItem>
                                    {syntaxError && (
                                        <div style={{padding: theme.spacing.m}}>
                                            <span style={{color: "rgb(175 20 20)"}}>{syntaxError.message}</span>
                                            <ActionButton
                                                onClick={() => setContributionVisible(true)}
                                                style={{marginLeft: theme.spacing.m, opacity: 0.5}}>
                                                Input is correct?
                                            </ActionButton>
                                        </div>
                                    )}
                                </StackItem>
                                <StackItem
                                    grow={1}
                                    style={{
                                        minHeight: 0,
                                        flexBasis: 0,
                                        boxShadow: theme.effects.elevation16,
                                        zIndex: 50,
                                        position: "relative",
                                    }}>
                                    <Pivot
                                        aria-label="Result"
                                        style={{display: "flex", flexDirection: "column", height: "100%"}}
                                        styles={{
                                            itemContainer: {
                                                flexBasis: 0,
                                                flexShrink: 1,
                                                flexGrow: 1,
                                                overflow: "hidden",
                                                minHeight: 0,
                                            },
                                        }}>
                                        <PivotItem headerText="Latex" itemKey="latex">
                                            <LatexOutput latex={latex} />
                                        </PivotItem>
                                        <PivotItem headerText="CST" itemKey="cst">
                                            <CSTOutput node={node} />
                                        </PivotItem>
                                    </Pivot>
                                </StackItem>
                            </Stack>
                        </StackItem>
                        <StackItem
                            style={{
                                minWidth: 200,
                                boxShadow: theme.effects.elevation8,
                                paddingLeft: theme.spacing.s1,
                                paddingRight: theme.spacing.s1,
                                zIndex: 100,
                            }}>
                            <Sidebar onToLatex={toLatex} latexOptions={latexOptions} />
                        </StackItem>
                    </Stack>
                </StackItem>
            </Stack>
        </div>
    );
};
