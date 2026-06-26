import { describe, expect, test } from "vitest";

import { addSearchHistoryKeyword, clearSearchHistoryKeywords, readSearchHistoryKeywords, removeSearchHistoryKeyword } from "./search-history";

describe("search history storage", () => {
  test("stores submitted keywords locally with newest-first de-duplication", () => {
    const storage = createMemoryStorage();

    addSearchHistoryKeyword(storage, " 保健品 ");
    addSearchHistoryKeyword(storage, "生鲜");
    addSearchHistoryKeyword(storage, "保健品");

    expect(readSearchHistoryKeywords(storage)).toEqual(["保健品", "生鲜"]);
  });

  test("caps local search history to ten keywords", () => {
    const storage = createMemoryStorage();

    for (let index = 1; index <= 12; index += 1) {
      addSearchHistoryKeyword(storage, `关键词${index}`);
    }

    expect(readSearchHistoryKeywords(storage)).toEqual([
      "关键词12",
      "关键词11",
      "关键词10",
      "关键词9",
      "关键词8",
      "关键词7",
      "关键词6",
      "关键词5",
      "关键词4",
      "关键词3"
    ]);
  });

  test("clears local history with the delete action", () => {
    const storage = createMemoryStorage();

    addSearchHistoryKeyword(storage, "保健品");
    clearSearchHistoryKeywords(storage);

    expect(readSearchHistoryKeywords(storage)).toEqual([]);
  });

  test("removes one local history keyword without clearing the rest", () => {
    const storage = createMemoryStorage();

    addSearchHistoryKeyword(storage, "保健品");
    addSearchHistoryKeyword(storage, "生鲜");
    addSearchHistoryKeyword(storage, "米罗地儿");

    expect(removeSearchHistoryKeyword(storage, " 生鲜 ")).toEqual(["米罗地儿", "保健品"]);
    expect(readSearchHistoryKeywords(storage)).toEqual(["米罗地儿", "保健品"]);
  });

  test("ignores invalid stored payloads instead of showing mock history", () => {
    const storage = createMemoryStorage();
    storage.setItem("meumall.search.history", JSON.stringify({ keyword: "保健品" }));

    expect(readSearchHistoryKeywords(storage)).toEqual([]);
  });
});

function createMemoryStorage(): Storage {
  const values = new Map<string, string>();

  return {
    get length() {
      return values.size;
    },
    clear() {
      values.clear();
    },
    getItem(key: string) {
      return values.get(key) ?? null;
    },
    key(index: number) {
      return Array.from(values.keys())[index] ?? null;
    },
    removeItem(key: string) {
      values.delete(key);
    },
    setItem(key: string, value: string) {
      values.set(key, value);
    }
  };
}
