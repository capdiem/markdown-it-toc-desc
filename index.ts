import Markdown from "markdown-it";
import Token from "markdown-it/lib/token";

export interface MarkdownTocDescOption {
    includeLevel: number[];
    getTocTree: (tree: Heading[]) => void;
    slugify: (hash: string) => void;
}

export interface Heading {
    level: number;
    children: Heading[];
    content: string;
    parent: null | Heading;
}

function findHeadings(tokens: Token[], includeLevel: number[]) {
    const headings: Heading[] = [];
    const size = tokens.length;
    let index = 0;
    while (index < size) {
        const token = tokens[index];
        const level = +token.tag.substr(1, 1) ?? -1;
        if (token.type === "heading_open" && includeLevel.indexOf(level) !== -1) {
            const content = tokens[index + 1].content;
            const h: Heading = {
                level,
                content,
                parent: null,
                children: [],
            };
            headings.push(h);
            index += 3;
        } else {
            index++;
        }
    }
    return headings;
}

function flat2Tree(headings: Heading[]) {
    let current: Heading | null = null;
    const root: Heading[] = [];
    for (let i = 0; i < headings.length; i++) {
        const h = headings[i];
        if (h.level === 1) {
            root.push(h);
            current = null;
        }
        if (current === null) {
            current = h;
        } else {
            while (h.level !== current.level + 1) {
                if (h.level > current.level && current.children.length !== 0) {
                    current = current.children[current.children.length - 1];
                } else if (h.level <= current.level && current.parent !== null) {
                    current = current.parent;
                } else {
                    break;
                }
            }
            if (h.level === current.level + 1) {
                h.parent = current;
                current.children.push(h);
                current = h;
            }
        }
    }
    return root;
}

export default function MarkdownItTocDesc(md: Markdown, o: MarkdownTocDescOption) {
    md.core.ruler.push("toc_desc", (state) => {
        const headings = findHeadings(state.tokens, o.includeLevel);
        const tree = flat2Tree(headings);
        o?.getTocTree?.(tree);
        return true;
    });
}
