import {createFormatters} from "./defineLatexFormatter";

/**
 * All standard latex node formatters
 */
export const latexFormatters = createFormatters()
    .a("d_apply", node => "")
    .a("d_map", node => "")
    .finish();
