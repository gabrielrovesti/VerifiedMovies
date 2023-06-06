import * as fsPromises from "node:fs/promises";
import {PathLike} from "fs";

export class FileUtils {
    public static async readFileContent(path: PathLike): Promise<string> {
        return await fsPromises.readFile(path, {encoding: "utf-8"});
    }
}
