import FileWriter from "./FileWriter";
import { promises as fs } from "fs";

const fileWriter = new FileWriter(fs);

export default (file) => fileWriter.write(".", file);
