import JSX from "../jsx";
import Sidebar from "./Sidebar";

const Head = () => (
  <head>
    <meta charSet="utf8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#202020" />
    <meta name="description" content="Personal blog" />
    <meta name="author" content="Bruno Fernandes" />
    <title>bfdes.in</title>
    <link rel="manifest" href="/manifest.webmanifest" />
    <link rel="icon" href="/images/favicon.ico" />
    <link rel="icon" href="/images/favicon.svg" type="image/svg+xml" />
    <link rel="apple-touch-icon" href="/images/favicon-180.png" />
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Roboto+Flex&family=Roboto+Mono&amp;display=swap"
    />
    <link rel="stylesheet" href="/styles/github.css" />
    <link rel="stylesheet" href="/styles/katex.css" />
    <link rel="stylesheet" href="/styles/main.css" />
  </head>
);

const Body = ({ children }) => (
  <body>
    <div id="root">
      <Sidebar />
      <div id="content">{children}</div>
    </div>
  </body>
);

export default ({ children }) => (
  <html lang="en">
    <Head />
    <Body>{children}</Body>
  </html>
);
