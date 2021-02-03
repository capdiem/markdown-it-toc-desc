import MarkdownItTocDesc, { Heading, MarkdownTocDescOption } from "../lib/index";
import Markdown from "markdown-it";
import assert from "assert";

const article = `
# first h1
## 1-2
### 1-3
pppppp
# second h1
## 2-2.1
### 2-3
## 2-2.2
ppp
##2-2.3
# third h1
###### 1-6
`;

describe("get article toc", () => {
    function slugify(hash: string) {
        return encodeURIComponent(
            hash
                .trim()
                .toLowerCase()
                .replace(/ /g, "-")
                .replace(/[　`~!@#$%^&*()=+\[{\]}\\|;:'",<.>/?·～！¥…（）—【「】」、；：‘“’”，《。》？]/g, "")
                .replace(/[\uff00-\uffff]/g, "")
        );
    }
    const md = new Markdown();
    let headings: Heading[] = [];
    const options: MarkdownTocDescOption = {
        includeLevel: [1, 2, 3, 4, 5, 6],
        slugify,
        getTocTree: (tree) => (headings = tree),
    };
    md.use(MarkdownItTocDesc, options);
    md.render(article);

    it("toc length shoule be 3", () => {
        assert.strictEqual(headings.length, 3);
    });

    describe("the first heading", () => {
        it("title should be first h1", () => {
            assert.strictEqual("first h1", headings[0].content);
        });
        it("the first heading should has one child", () => {
            assert.strictEqual(headings[0].children.length, 1);
        });
        it("the third should be h3 & content is 1-3 & no more child", () => {
            const h = headings[0].children[0].children[0];
            assert.strictEqual(h.content, "1-3");
            assert.strictEqual(h.children.length, 0);
        });
    });
    describe("the second heading", () => {
        it("title should be second h1", () => {
            assert.strictEqual("second h1", headings[1].content);
        });

        it("has 2 children & content exact", () => {
            assert.strictEqual(2, headings[1].children.length);
            assert.strictEqual("2-2.1", headings[1].children[0].content);
            assert.strictEqual("2-2.2", headings[1].children[1].content);
        });

        it("first child has one child & second has no child & content", () => {
            assert.strictEqual(1, headings[1].children[0].children.length);
            assert.strictEqual("2-3", headings[1].children[0].children[0].content);
            assert.strictEqual(0, headings[1].children[1].children.length);
        });
    });
    describe("the third heading", () => {
        it("title should be third h1", () => {
            assert.strictEqual("third h1", headings[2].content);
        });
        it("has no child", () => {
            assert.strictEqual(0, headings[2].children.length);
        });
    });

    describe("content slugify & link", () => {
        it("the link of #first h1 should be #first-h1", () => {
            assert.strictEqual("#first-h1", headings[0].link);
            assert.strictEqual("#" + slugify(headings[0].content), headings[0].link);
        });
    });
});
