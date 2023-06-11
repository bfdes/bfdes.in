import { File, Dir, FileSystem } from "src/jsx";

export default function (name, ...children) {
  if (children.length == 0 || children.length > 1) {
    return new Dir(name, children);
  }
  const [child] = children;
  if (child instanceof FileSystem) {
    return new Dir(name, children);
  }
  return new File(name, child);
}
