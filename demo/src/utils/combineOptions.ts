/**
 * Combines the items in a list, to represent options
 * [1,2,3] => "1, 2 or 3"
 * @param options The options to combine
 * @returns The string representing the options
 */
export function combineOptions(options: string[]): string {
    const last = options.pop();
    if (options.length == 0) return last ?? "";
    return options.join(", ") + " or " + last;
}
