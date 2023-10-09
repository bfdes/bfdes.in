import Repo from "./Repo";
import { About, NotFound, Post, Posts, RSS } from "./components";
import {
  avatarWEBP,
  githubPNG,
  rssPNG,
  faviconSVG,
  faviconICO,
  favicon180PNG,
  favicon192PNG,
  favicon512PNG,
} from "./images";
import JSX, { File, Dir } from "./jsx";
import mainCSS from "./main.css";
import manifest from "./manifest.webmanifest";
import slugify from "./slugify";
import githubCSS from "@wooorm/starry-night/style/light";
import KaTeXAMSRegularTTF from "katex/dist/fonts/KaTeX_AMS-Regular.ttf";
import KaTeXAMSRegularWOFF from "katex/dist/fonts/KaTeX_AMS-Regular.woff";
import KaTeXAMSRegularWOFF2 from "katex/dist/fonts/KaTeX_AMS-Regular.woff2";
import KaTeXCaligraphicBoldTTF from "katex/dist/fonts/KaTeX_Caligraphic-Bold.ttf";
import KaTeXCaligraphicBoldWOFF from "katex/dist/fonts/KaTeX_Caligraphic-Bold.woff";
import KaTeXCaligraphicBoldWOFF2 from "katex/dist/fonts/KaTeX_Caligraphic-Bold.woff2";
import KaTeXCaligraphicRegularTTF from "katex/dist/fonts/KaTeX_Caligraphic-Regular.ttf";
import KaTeXCaligraphicRegularWOFF from "katex/dist/fonts/KaTeX_Caligraphic-Regular.woff";
import KaTeXCaligraphicRegularWOFF2 from "katex/dist/fonts/KaTeX_Caligraphic-Regular.woff2";
import KaTeXFrakturBoldTTF from "katex/dist/fonts/KaTeX_Fraktur-Bold.ttf";
import KaTeXFrakturBoldWOFF from "katex/dist/fonts/KaTeX_Fraktur-Bold.woff";
import KaTeXFrakturBoldWOFF2 from "katex/dist/fonts/KaTeX_Fraktur-Bold.woff2";
import KaTeXFrakturRegularTTF from "katex/dist/fonts/KaTeX_Fraktur-Regular.ttf";
import KaTeXFrakturRegularWOFF from "katex/dist/fonts/KaTeX_Fraktur-Regular.woff";
import KaTeXFrakturRegularWOFF2 from "katex/dist/fonts/KaTeX_Fraktur-Regular.woff2";
import KaTeXMainBoldTTF from "katex/dist/fonts/KaTeX_Main-Bold.ttf";
import KaTeXMainBoldWOFF from "katex/dist/fonts/KaTeX_Main-Bold.woff";
import KaTeXMainBoldWOFF2 from "katex/dist/fonts/KaTeX_Main-Bold.woff2";
import KaTeXMainBoldItalicTTF from "katex/dist/fonts/KaTeX_Main-BoldItalic.ttf";
import KaTeXMainBoldItalicWOFF from "katex/dist/fonts/KaTeX_Main-BoldItalic.woff";
import KaTeXMainBoldItalicWOFF2 from "katex/dist/fonts/KaTeX_Main-BoldItalic.woff2";
import KaTeXMainItalicTTF from "katex/dist/fonts/KaTeX_Main-Italic.ttf";
import KaTeXMainItalicWOFF from "katex/dist/fonts/KaTeX_Main-Italic.woff";
import KaTeXMainItalicWOFF2 from "katex/dist/fonts/KaTeX_Main-Italic.woff2";
import KaTeXMainRegularTTF from "katex/dist/fonts/KaTeX_Main-Regular.ttf";
import KaTeXMainRegularWOFF from "katex/dist/fonts/KaTeX_Main-Regular.woff";
import KaTeXMainRegularWOFF2 from "katex/dist/fonts/KaTeX_Main-Regular.woff2";
import KaTeXMathBoldItalicTTF from "katex/dist/fonts/KaTeX_Math-BoldItalic.ttf";
import KaTeXMathBoldItalicWOFF from "katex/dist/fonts/KaTeX_Math-BoldItalic.woff";
import KaTeXMathBoldItalicWOFF2 from "katex/dist/fonts/KaTeX_Math-BoldItalic.woff2";
import KaTeXMathItalicTTF from "katex/dist/fonts/KaTeX_Math-Italic.ttf";
import KaTeXMathItalicWOFF from "katex/dist/fonts/KaTeX_Math-Italic.woff";
import KaTeXMathItalicWOFF2 from "katex/dist/fonts/KaTeX_Math-Italic.woff2";
import KaTeXSansSerifBoldTTF from "katex/dist/fonts/KaTeX_SansSerif-Bold.ttf";
import KaTeXSansSerifBoldWOFF from "katex/dist/fonts/KaTeX_SansSerif-Bold.woff";
import KaTeXSansSerifBoldWOFF2 from "katex/dist/fonts/KaTeX_SansSerif-Bold.woff2";
import KaTeXSansSerifItalicTTF from "katex/dist/fonts/KaTeX_SansSerif-Italic.ttf";
import KaTeXSansSerifItalicWOFF from "katex/dist/fonts/KaTeX_SansSerif-Italic.woff";
import KaTeXSansSerifItalicWOFF2 from "katex/dist/fonts/KaTeX_SansSerif-Italic.woff2";
import KaTeXSansSerifRegularTTF from "katex/dist/fonts/KaTeX_SansSerif-Regular.ttf";
import KaTeXSansSerifRegularWOFF from "katex/dist/fonts/KaTeX_SansSerif-Regular.woff";
import KaTeXSansSerifRegularWOFF2 from "katex/dist/fonts/KaTeX_SansSerif-Regular.woff2";
import KaTeXScriptRegularTFF from "katex/dist/fonts/KaTeX_Script-Regular.ttf";
import KaTeXScriptRegularWOFF from "katex/dist/fonts/KaTeX_Script-Regular.woff";
import KaTeXScriptRegularWOFF2 from "katex/dist/fonts/KaTeX_Script-Regular.woff2";
import KaTeXSize1RegularTFF from "katex/dist/fonts/KaTeX_Size1-Regular.ttf";
import KaTeXSize1RegularWOFF from "katex/dist/fonts/KaTeX_Size1-Regular.woff";
import KaTeXSize1RegularWOFF2 from "katex/dist/fonts/KaTeX_Size1-Regular.woff2";
import KaTeXSize2RegularTFF from "katex/dist/fonts/KaTeX_Size2-Regular.ttf";
import KaTeXSize2RegularWOFF from "katex/dist/fonts/KaTeX_Size2-Regular.woff";
import KaTeXSize2RegularWOFF2 from "katex/dist/fonts/KaTeX_Size2-Regular.woff2";
import KaTeXSize3RegularTTF from "katex/dist/fonts/KaTeX_Size3-Regular.ttf";
import KaTeXSize3RegularWOFF from "katex/dist/fonts/KaTeX_Size3-Regular.woff";
import KaTeXSize3RegularWOFF2 from "katex/dist/fonts/KaTeX_Size3-Regular.woff2";
import KaTeXSize4RegularTTF from "katex/dist/fonts/KaTeX_Size4-Regular.ttf";
import KaTeXSize4RegularWOFF from "katex/dist/fonts/KaTeX_Size4-Regular.woff";
import KaTeXSize4RegularWOFF2 from "katex/dist/fonts/KaTeX_Size4-Regular.woff2";
import KaTeXTypewriterRegularTTF from "katex/dist/fonts/KaTeX_Typewriter-Regular.ttf";
import KaTeXTypewriterRegularWOFF from "katex/dist/fonts/KaTeX_Typewriter-Regular.woff";
import KaTeXTypewriterRegularWOFF2 from "katex/dist/fonts/KaTeX_Typewriter-Regular.woff2";
import katexCSS from "katex/dist/katex.min.css";

export default function Router(posts) {
  const repo = new Repo(posts);
  const tags = Array.from(repo.tags);

  return (
    <Dir name="site">
      <File name="about.html">
        <About />
      </File>
      <File name="404.html">
        <NotFound />
      </File>
      <File name="index.html">
        <Posts>{repo.posts}</Posts>
      </File>
      <Dir name="posts">
        <File name="index.html">
          <Posts>{repo.posts}</Posts>
        </File>
        {repo.posts.map(({ slug, ...post }) => (
          <File name={`${slug}.html`}>
            <Post {...post} />
          </File>
        ))}
      </Dir>
      <Dir name="tags">
        {tags.map((tag) => (
          <File name={`${slugify(tag)}.html`}>
            <Posts>{repo.posts.filter(({ tags }) => tags.includes(tag))}</Posts>
          </File>
        ))}
      </Dir>
      <File name="feed.rss">
        <RSS>{repo.posts}</RSS>
      </File>
      <File name="feed.xml">
        <RSS>{repo.posts}</RSS>
      </File>
      <File name="rss.xml">
        <RSS>{repo.posts}</RSS>
      </File>
      <File name="manifest.webmanifest">{manifest}</File>
      <Dir name="images">
        <File name="avatar.webp">{avatarWEBP}</File>
        <File name="github.png">{githubPNG}</File>
        <File name="rss.png">{rssPNG}</File>
        <File name="favicon.svg">{faviconSVG}</File>
        <File name="favicon.ico">{faviconICO}</File>
        <File name="favicon-180.png">{favicon180PNG}</File>
        <File name="favicon-192.png">{favicon192PNG}</File>
        <File name="favicon-512.png">{favicon512PNG}</File>
      </Dir>
      <Dir name="styles">
        <File name="main.css">{mainCSS}</File>
        <File name="github.css">{githubCSS}</File>
        <File name="katex.css">{katexCSS}</File>
        <Dir name="fonts">
          <File name="KaTeX_AMS-Regular.ttf">{KaTeXAMSRegularTTF}</File>
          <File name="KaTeX_AMS-Regular.woff">{KaTeXAMSRegularWOFF}</File>
          <File name="KaTeX_AMS-Regular.woff2">{KaTeXAMSRegularWOFF2}</File>
          <File name="KaTeX_Caligraphic-Bold.ttf">
            {KaTeXCaligraphicBoldTTF}
          </File>
          <File name="KaTeX_Caligraphic-Bold.woff">
            {KaTeXCaligraphicBoldWOFF}
          </File>
          <File name="KaTeX_Caligraphic-Bold.woff2">
            {KaTeXCaligraphicBoldWOFF2}
          </File>
          <File name="KaTeX_Caligraphic-Regular.ttf">
            {KaTeXCaligraphicRegularTTF}
          </File>
          <File name="KaTeX_Caligraphic-Regular.woff">
            {KaTeXCaligraphicRegularWOFF}
          </File>
          <File name="KaTeX_Caligraphic-Regular.woff2">
            {KaTeXCaligraphicRegularWOFF2}
          </File>
          <File name="KaTeX_Fraktur-Bold.ttf">{KaTeXFrakturBoldTTF}</File>
          <File name="KaTeX_Fraktur-Bold.woff">{KaTeXFrakturBoldWOFF}</File>
          <File name="KaTeX_Fraktur-Bold.woff2">{KaTeXFrakturBoldWOFF2}</File>
          <File name="KaTeX_Fraktur-Regular.ttf">{KaTeXFrakturRegularTTF}</File>
          <File name="KaTeX_Fraktur-Regular.woff">
            {KaTeXFrakturRegularWOFF}
          </File>
          <File name="KaTeX_Fraktur-Regular.woff2">
            {KaTeXFrakturRegularWOFF2}
          </File>
          <File name="KaTeX_Main-Bold.ttf">{KaTeXMainBoldTTF}</File>
          <File name="KaTeX_Main-Bold.woff">{KaTeXMainBoldWOFF}</File>
          <File name="KaTeX_Main-Bold.woff2">{KaTeXMainBoldWOFF2}</File>
          <File name="KaTeX_Main-BoldItalic.ttf">{KaTeXMainBoldItalicTTF}</File>
          <File name="KaTeX_Main-BoldItalic.woff">
            {KaTeXMainBoldItalicWOFF}
          </File>
          <File name="KaTeX_Main-BoldItalic.woff2">
            {KaTeXMainBoldItalicWOFF2}
          </File>
          <File name="KaTeX_Main-Italic.ttf">{KaTeXMainItalicTTF}</File>
          <File name="KaTeX_Main-Italic.woff">{KaTeXMainItalicWOFF}</File>
          <File name="KaTeX_Main-Italic.woff2">{KaTeXMainItalicWOFF2}</File>
          <File name="KaTeX_Main-Regular.ttf">{KaTeXMainRegularTTF}</File>
          <File name="KaTeX_Main-Regular.woff">{KaTeXMainRegularWOFF}</File>
          <File name="KaTeX_Main-Regular.woff2">{KaTeXMainRegularWOFF2}</File>
          <File name="KaTeX_Math-BoldItalic.ttf">{KaTeXMathBoldItalicTTF}</File>
          <File name="KaTeX_Math-BoldItalic.woff">
            {KaTeXMathBoldItalicWOFF}
          </File>
          <File name="KaTeX_Math-BoldItalic.woff2">
            {KaTeXMathBoldItalicWOFF2}
          </File>
          <File name="KaTeX_Math-Italic.ttf">{KaTeXMathItalicTTF}</File>
          <File name="KaTeX_Math-Italic.woff">{KaTeXMathItalicWOFF}</File>
          <File name="KaTeX_Math-Italic.woff2">{KaTeXMathItalicWOFF2}</File>
          <File name="KaTeX_SansSerif-Bold.ttf">{KaTeXSansSerifBoldTTF}</File>
          <File name="KaTeX_SansSerif-Bold.woff">{KaTeXSansSerifBoldWOFF}</File>
          <File name="KaTeX_SansSerif-Bold.woff2">
            {KaTeXSansSerifBoldWOFF2}
          </File>
          <File name="KaTeX_SansSerif-Italic.ttf">
            {KaTeXSansSerifItalicTTF}
          </File>
          <File name="KaTeX_SansSerif-Italic.woff">
            {KaTeXSansSerifItalicWOFF}
          </File>
          <File name="KaTeX_SansSerif-Italic.woff2">
            {KaTeXSansSerifItalicWOFF2}
          </File>
          <File name="KaTeX_SansSerif-Regular.ttf">
            {KaTeXSansSerifRegularTTF}
          </File>
          <File name="KaTeX_SansSerif-Regular.woff">
            {KaTeXSansSerifRegularWOFF}
          </File>
          <File name="KaTeX_SansSerif-Regular.woff2">
            {KaTeXSansSerifRegularWOFF2}
          </File>
          <File name="KaTeX_Script-Regular.ttf">{KaTeXScriptRegularTFF}</File>
          <File name="KaTeX_Script-Regular.woff">{KaTeXScriptRegularWOFF}</File>
          <File name="KaTeX_Script-Regular.woff2">
            {KaTeXScriptRegularWOFF2}
          </File>
          <File name="KaTeX_Size1-Regular.ttf">{KaTeXSize1RegularTFF}</File>
          <File name="KaTeX_Size1-Regular.woff">{KaTeXSize1RegularWOFF}</File>
          <File name="KaTeX_Size1-Regular.woff2">{KaTeXSize1RegularWOFF2}</File>
          <File name="KaTeX_Size2-Regular.ttf">{KaTeXSize2RegularTFF}</File>
          <File name="KaTeX_Size2-Regular.woff">{KaTeXSize2RegularWOFF}</File>
          <File name="KaTeX_Size2-Regular.woff2">{KaTeXSize2RegularWOFF2}</File>
          <File name="KaTeX_Size3-Regular.ttf">{KaTeXSize3RegularTTF}</File>
          <File name="KaTeX_Size3-Regular.woff">{KaTeXSize3RegularWOFF}</File>
          <File name="KaTeX_Size3-Regular.woff2">{KaTeXSize3RegularWOFF2}</File>
          <File name="KaTeX_Size4-Regular.ttf">{KaTeXSize4RegularTTF}</File>
          <File name="KaTeX_Size4-Regular.woff">{KaTeXSize4RegularWOFF}</File>
          <File name="KaTeX_Size4-Regular.woff2">{KaTeXSize4RegularWOFF2}</File>
          <File name="KaTeX_Typewriter-Regular.ttf">
            {KaTeXTypewriterRegularTTF}
          </File>
          <File name="KaTeX_Typewriter-Regular.woff">
            {KaTeXTypewriterRegularWOFF}
          </File>
          <File name="KaTeX_Typewriter-Regular.woff2">
            {KaTeXTypewriterRegularWOFF2}
          </File>
        </Dir>
      </Dir>
    </Dir>
  );
}
