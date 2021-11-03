import {mergeStyleSets, Modal, IconButton} from "office-ui-fabric-react";
import React, {FC} from "react";
import {useTheme} from "@fluentui/react-theme-provider";
import {makeStyles} from "@fluentui/react-theme-provider";

export const ContributionModal: FC<{visible: boolean; onClose: () => void}> = ({visible, onClose}) => {
    const {container, header, body} = useStyles();
    const theme = useTheme();

    return (
        <Modal
            titleAriaId="Contributing"
            isOpen={visible}
            onDismiss={onClose}
            isBlocking={false}
            containerClassName={container}
            styles={{main: {overflow: "hidden"}}}>
            <div className={header}>
                <span>Contributing</span>
                <IconButton
                    styles={{
                        root: {
                            color: theme.palette.neutralPrimary,
                            marginLeft: "auto",
                            marginTop: "4px",
                            marginRight: "2px",
                        },
                        rootHovered: {
                            color: theme.palette.neutralDark,
                        },
                    }}
                    iconProps={{iconName: "Cancel"}}
                    ariaLabel="Close popup modal"
                    onClick={onClose}
                />
            </div>
            <div className={body}>
                This code hasn't been tested very extensively, so it's likely it contains mistakes. <br />
                If you want to fix issues in the parser, or improve the latex formatting, any bug reports or PRs are welcome!
                <br />
                Please check reach out on Github to help:{" "}
                <a href="https://github.com/TarVK/mCRL2-formatter">github.com/TarVK/mCRL2-formatter</a>
            </div>
        </Modal>
    );
};

const useStyles = makeStyles(theme => ({
    container: {
        display: "flex",
        flexFlow: "column nowrap",
        alignItems: "stretch",
    },
    header: [
        // eslint-disable-next-line deprecation/deprecation
        theme.fonts.xLargePlus,
        {
            flex: "1 1 auto",
            borderTop: `4px solid ${theme.palette.themePrimary}`,
            color: theme.palette.neutralPrimary,
            display: "flex",
            alignItems: "center",
            fontWeight: "semibold",
            padding: "12px 12px 14px 24px",
        },
    ],
    body: {
        flex: "4 4 auto",
        padding: "0 24px 24px 24px",
        overflowY: "hidden",
        selectors: {
            p: {margin: "14px 0"},
            "p:first-child": {marginTop: 0},
            "p:last-child": {marginBottom: 0},
        },
    },
}));
