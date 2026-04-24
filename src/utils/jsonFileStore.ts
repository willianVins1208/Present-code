import fs from "fs";
import path from "path";
import { createStorageError } from "./errors";

export class JsonFileStore<T extends { id: number }> {
  private readonly filePath: string;

  constructor(filePath: string) {
    this.filePath = filePath;
    this.ensureStorage();
  }

  readAll(): T[] {
    this.ensureStorage();

    try {
      const content = fs.readFileSync(this.filePath, "utf-8");
      const entries = JSON.parse(content) as unknown;

      if (!Array.isArray(entries)) {
        throw new Error("storage must contain an array");
      }

      return entries as T[];
    } catch (error) {
      throw createStorageError((error as Error).message);
    }
  }

  writeAll(entries: T[]): void {
    this.ensureStorage();
    fs.writeFileSync(this.filePath, JSON.stringify(entries, null, 2));
  }

  reset(): void {
    this.writeAll([]);
  }

  nextId(entries: T[]): number {
    return entries.reduce((maxId, entry) => Math.max(maxId, entry.id), 0) + 1;
  }

  private ensureStorage(): void {
    const directory = path.dirname(this.filePath);
    fs.mkdirSync(directory, { recursive: true });

    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, "[]");
    }
  }
}
