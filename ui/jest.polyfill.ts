if (typeof globalThis.structuredClone !== "function") {
    globalThis.structuredClone = (val: any) => JSON.parse(JSON.stringify(val));
}
  