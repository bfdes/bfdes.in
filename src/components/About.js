import JSX from "../jsx";
import Page from "./Page";

export default () => (
  <Page>
    <div class="about">
      <h1>About</h1>
      <h2>👋</h2>
      <p>
        Hello, my name is Bruno Fernandes, and I write code for fun and profit.
      </p>
      <p>
        I studied Chemical Engineering{" "}
        <a href="https://www.cam.ac.uk">at university</a>. My interests include
        motorcycles, photography, programming, and applied maths.
      </p>
      <p>
        I work at Disney Streaming in London. The views I express are my own and
        not those of my employer. And no, I can{"'"}t introduce you to{" "}
        <a href="https://google.com/search?q=Grogu">Grogu</a>.
      </p>
      <p>
        You can find the source code for this website on{" "}
        <a href="https://github.com/bfdes/bfdes.in">GitHub</a>.
      </p>
    </div>
  </Page>
);
