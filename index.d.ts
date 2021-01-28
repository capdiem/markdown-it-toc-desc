import Markdown from "markdown-it";
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
export default function MarkdownItTocDesc(md: Markdown, o: MarkdownTocDescOption): void;
