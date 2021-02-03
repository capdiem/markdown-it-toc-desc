# markdown-it-toc-desc

It's a markdown-it plugin which can get the descriptor of the table of content without any changes and markup.

# install

```shell
yarn add markdown-it-toc-desc
```

# Usage

```ts
import MarkdownItTocDesc, { Heading, MarkdownTocDescOption } from "markdown-it-toc-desc";
import Markdown from "markdown-it";

const md = new Markdown();
const article = `
# h1.1
## h2.1.1
# h1.2
## h2.2.1
## h2.2.2
# h1.3
#### h3.4.1
 `;
let headings: Heading[] = [];
const options: MarkdownTocDescOption = {
    includeLevel: [1, 2, 3, 4, 5, 6],
    slugify: (s) => s,
    getTocTree: (tree) => (headings = tree),
};
md.use(MarkdownItTocDesc, options);
md.render(article);
// then you will get the toc desc in headings
console.log(headings);
```

# Heading

Type `Heading` is the descriptor of toc we got.

here the properties:

| key      | type               |
| -------- | ------------------ |
| link     | string             |
| content  | string             |
| children | Array of `Heading` |

# MarkdownTocDescOption

| key          | type                      | desc                          |
| ------------ | ------------------------- | ----------------------------- |
| includeLevel | Array of number           | the layer we need             |
| slugify      | (s: string) => string     | content format function       |
| getTocTree   | ( tree:Heading[]) => void | get the heading tree function |

# Other declaration

Only adjacent layer can be obtained in this plugin

e.g. we could not get h3 under h1 from `# h1 ### h3`
