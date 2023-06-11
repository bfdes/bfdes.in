import FileReader from "./FileReader";
import { promises as fs } from "fs";

const fileReader = new FileReader(fs);

export default (path) => fileReader.read(path);
