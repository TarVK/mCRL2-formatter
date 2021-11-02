import {IAnyNode} from "../parser/_types/INode";

/**
 * Takes a node and outputs a recursive function call encoding the same data
 * @param node The node to be converted
 * @returns a function call
 */
export function nodeToFunc(node: IAnyNode): string {
    const funcName = node.type.replace(/\:([\w])/g, ([a, s]) => s.toUpperCase());
    const children = node.children;
    const args = children.map(child => {
        if (!child) return child;
        if ("text" in child) return JSON.stringify(child.text);
        return nodeToFunc(child);
    });
    const isTerminal = children.length == 1 && children[0] && "text" in children[0];

    if (isTerminal) return `${funcName}(${args[0]})`;
    else return `${funcName}(\n${args.map(arg => (arg + "").replace(/^/gm, "    ")).join(",\n")}\n)`;
}
