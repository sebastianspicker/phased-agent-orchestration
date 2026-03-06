export interface AjvErrorObject {
  instancePath: string;
  message?: string;
}

export interface AjvValidateFunction {
  (data: unknown): boolean;
  errors?: AjvErrorObject[] | null;
}

export interface AjvInstance {
  compile(schema: Record<string, unknown>): AjvValidateFunction;
}

export type AjvConstructor = new (opts: Record<string, unknown>) => AjvInstance;
export type AjvFormatsFn = (ajv: AjvInstance, formats?: string[]) => void;

let _AjvClass: AjvConstructor | undefined;
let _addFormats: AjvFormatsFn | undefined;

export async function getAjv(): Promise<AjvConstructor> {
  if (_AjvClass) return _AjvClass;
  const mod: Record<string, unknown> = await import("ajv");
  const candidate = mod.default ?? mod;
  const inner =
    typeof candidate === "function"
      ? candidate
      : ((candidate as Record<string, unknown>).default ?? candidate);
  _AjvClass = inner as AjvConstructor;
  return _AjvClass;
}

export async function getAddFormats(): Promise<AjvFormatsFn> {
  if (_addFormats) return _addFormats;
  const mod: Record<string, unknown> = await import("ajv-formats");
  const candidate = mod.default ?? mod;
  const inner =
    typeof candidate === "function"
      ? candidate
      : ((candidate as Record<string, unknown>).default ?? candidate);
  _addFormats = inner as AjvFormatsFn;
  return _addFormats;
}

export async function createAjvInstance(
  formats: string[] = ["date-time", "uri"],
): Promise<AjvInstance> {
  const AjvClass = await getAjv();
  const addFormats = await getAddFormats();
  const ajv = new AjvClass({
    allErrors: true,
    strict: false,
    validateSchema: false,
  });
  addFormats(ajv, formats);
  return ajv;
}
