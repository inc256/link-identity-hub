export type JsonValue =
  string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue | undefined };

export type Json = JsonValue;
export type JsonObject = { [key: string]: JsonValue };
