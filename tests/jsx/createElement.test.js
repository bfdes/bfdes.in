import mk from "../mk";
import IllegalArgumentError from "src/IllegalArgumentError";
import JSX, { Dir, File } from "src/jsx";
import Attributes from "src/jsx/Attributes";
import Element from "src/jsx/Element";
import Fragment from "src/jsx/Fragment";

const HelloWorld = () => (
  <html lang="en">
    <head>
      <title>index.html</title>
    </head>
    <body>Hello, World!</body>
  </html>
);

const Languages = ({ children }) => (
  <ul>
    {children.map((language) => (
      <li>{language}</li>
    ))}
  </ul>
);

describe("JSX.createElement", () => {
  it("expands JSX elements", () => {
    expect(<HelloWorld />).toEqual(
      new Element("html", new Attributes([["lang", "en"]]), [
        new Element("head", Attributes.empty(), [
          new Element("title", Attributes.empty(), ["index.html"]),
        ]),
        new Element("body", Attributes.empty(), ["Hello, World!"]),
      ])
    );
  });

  it("rejects children passed through a named prop", () => {
    expect(() => <Languages children={["Python", "Java"]} />).toThrow(
      IllegalArgumentError
    );
  });

  it("flattens children", () => {
    const languages = ["Python", "Java"];

    expect(<Languages>{languages}</Languages>).toEqual(
      new Element(
        "ul",
        Attributes.empty(),
        languages.map(
          (language) => new Element("li", Attributes.empty(), [language])
        )
      )
    );
  });

  it("creates fragments", () => {
    expect(<></>).toEqual(new Fragment([]));
  });
});

describe("File", () => {
  it("creates files", () => {
    const name = "main.js";
    const content = 'console.log("Hello, World!")';

    expect(<File name={name}>{content}</File>).toEqual(mk(name, content));
  });

  it("requires name", () => {
    expect(() => (
      <File>
        <HelloWorld />
      </File>
    )).toThrow(IllegalArgumentError);

    expect(() => (
      <File name={1}>
        <HelloWorld />
      </File>
    )).toThrow(IllegalArgumentError);
  });

  it("requires content", () => {
    expect(() => <File name="index.html" />).toThrow(IllegalArgumentError);
    expect(() => <File name="index.html"></File>).toThrow(IllegalArgumentError);
  });

  it("adds DOCTYPE declaration to HTML files", () => {
    const name = "index.html";
    const content = <HelloWorld />;

    expect(<File name={name}>{content}</File>).toEqual(
      mk(name, `<!DOCTYPE html>${content}`)
    );
  });

  it("adds XML declaration to XML files", async () => {
    const name = "languages.xml";
    const content = <Languages>{["Python", "Java"]}</Languages>;

    expect(<File name={name}>{content}</File>).toEqual(
      mk(name, `<?xml version="1.0"?>${content}`)
    );
  });
});

describe("Dir", () => {
  it("creates directories", () => {
    const dirName = "src";
    const fileName = "main.js";
    const fileContent = 'console.log("Hello, World!")';

    expect(
      <Dir name={dirName}>
        <File name={fileName}>{fileContent}</File>
      </Dir>
    ).toEqual(mk(dirName, mk(fileName, fileContent)));
  });

  it("creates empty directories", () => {
    const name = "posts";
    expect(<Dir name={name} />).toEqual(mk(name));
    expect(<Dir name={name}></Dir>).toEqual(mk(name));
  });

  it("requires name", () => {
    expect(() => (
      <Dir>
        <File name="index.html">
          <HelloWorld />
        </File>
      </Dir>
    )).toThrow(IllegalArgumentError);
  });

  it("rejects invalid content", () => {
    expect(() => (
      <Dir name="site">
        <HelloWorld />
      </Dir>
    )).toThrow(IllegalArgumentError);
  });
});
