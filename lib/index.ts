import Markdown from "markdown-it";
import Token from "markdown-it/lib/token";

export interface MarkdownTocDescOption {
    includeLevel: number[];
    getTocTree: (tree: Heading[]) => void;
    slugify: (hash: string) => string;
}

export type Heading = {
    children: Heading[];
    content: string;
    link: string;
};

type HeadingDev = {
    level: number;
    parent: null | HeadingDev;
    children: HeadingDev[];
    content: string;
    link: string;
};

function findHeadings(tokens: Token[], option: MarkdownTocDescOption) {
    const headings: HeadingDev[] = [];
    const size = tokens.length;
    const slugify = typeof option.slugify === "function" ? option.slugify : (s: string) => s;
    let index = 0;
    while (index < size) {
        const token = tokens[index];
        const level = +token.tag.substr(1, 1) ?? -1;
        if (token.type === "heading_open" && option.includeLevel.indexOf(level) !== -1) {
            const content = tokens[index + 1].content;
            const h: HeadingDev = {
                level,
                content,
                parent: null,
                children: [],
                link: "#" + slugify(content),
            };
            headings.push(h);
            index += 3;
        } else {
            index++;
        }
    }
    return headings;
}

function flat2Tree(headings: HeadingDev[]) {
    let current: HeadingDev | null = null;
    const root: HeadingDev[] = [];
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

function removeUselessProperties(hsd: HeadingDev[]) {
    for (let i = 0; i < hsd.length; i++) {
        delete (hsd[i] as any).parent;
        delete (hsd[i] as any).level;
        removeUselessProperties(hsd[i].children);
    }
}

export default function MarkdownItTocDesc(md: Markdown, o: MarkdownTocDescOption) {
    md.core.ruler.push("toc_desc", (state) => {
        const headings = findHeadings(state.tokens, o);
        const tree = flat2Tree(headings);
        removeUselessProperties(tree);
        o?.getTocTree?.(tree);
        return true;
    });
}
