import * as XLSX from "xlsx";

export interface KraDefinition {
  discipline: string;
  kra_name: string;
  kra_order: number;
  sub_kra_name: string;
  sub_kra_order: number;
  level: string;
  description: string;
}

const STORAGE_KEY = "kra-definitions-cache-v1";

const safeJsonParse = <T,>(value: string | null, fallback: T): T => {
  if (!value) return fallback;

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

export const getStoredKraDefinitions = (): KraDefinition[] => {
  if (typeof window === "undefined") return [];
  return safeJsonParse<KraDefinition[]>(window.localStorage.getItem(STORAGE_KEY), []);
};

export const saveStoredKraDefinitions = (records: KraDefinition[], discipline: string) => {
  if (typeof window === "undefined") return;

  const existing = getStoredKraDefinitions().filter((row) => row.discipline !== discipline);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...existing, ...records]));
};

export const deleteStoredKraDefinitions = (discipline: string) => {
  if (typeof window === "undefined") return;
  const remaining = getStoredKraDefinitions().filter((row) => row.discipline !== discipline);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));
};

export const getStoredDisciplines = () => {
  const unique = new Set(getStoredKraDefinitions().map((row) => row.discipline));
  return Array.from(unique).sort();
};

export const getStoredKraSummary = (discipline: string) => {
  const rows = getStoredKraDefinitions().filter((row) => row.discipline === discipline);
  const kraMap = new Map<string, { order: number; levels: Set<string> }>();

  for (const row of rows) {
    if (!kraMap.has(row.kra_name)) {
      kraMap.set(row.kra_name, { order: row.kra_order, levels: new Set() });
    }

    kraMap.get(row.kra_name)?.levels.add(row.level);
  }

  return Array.from(kraMap.entries()).map(([name, info]) => ({
    name,
    order: info.order,
    levels: Array.from(info.levels).sort(),
  }));
};

export const parseKraWorkbook = async (file: File, discipline: string): Promise<KraDefinition[]> => {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: "array" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows: (string | number | null)[][] = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: "",
    blankrows: true,
  });

  if (rows.length < 2) {
    throw new Error("Sheet appears empty");
  }

  let headerIdx = -1;
  for (let i = 0; i < Math.min(5, rows.length); i++) {
    const rowStr = rows[i].map((cell) => String(cell).trim().toLowerCase());
    if (rowStr.includes("kra") && rowStr.includes("sub-kra")) {
      headerIdx = i;
      break;
    }
  }

  if (headerIdx === -1) {
    throw new Error("Could not find header row with 'KRA' and 'Sub-KRA' columns");
  }

  const header = rows[headerIdx].map((cell) => String(cell).trim());
  const kraCol = header.findIndex((cell) => cell.toLowerCase() === "kra");
  const subKraCol = header.findIndex((cell) => cell.toLowerCase() === "sub-kra");
  const levelCols: { level: string; col: number }[] = [];

  for (let col = 0; col < header.length; col++) {
    const match = header[col].match(/^L(\d)$/i);
    if (match) {
      levelCols.push({ level: `L${match[1]}`, col });
    }
  }

  if (kraCol === -1 || subKraCol === -1 || levelCols.length === 0) {
    throw new Error("Could not find required columns (KRA, Sub-KRA, L1-L6/L7)");
  }

  const records: KraDefinition[] = [];
  let currentKra = "";
  let kraOrder = 0;
  let subKraOrder = 0;

  for (let i = headerIdx + 1; i < rows.length; i++) {
    const row = rows[i];
    const kraVal = String(row[kraCol] ?? "").trim();
    const subKraVal = String(row[subKraCol] ?? "").trim();

    if (kraVal && kraVal !== currentKra) {
      currentKra = kraVal;
      kraOrder += 1;
      subKraOrder = 0;
    }

    if (!subKraVal || !currentKra) continue;

    subKraOrder += 1;

    for (const { level, col } of levelCols) {
      const description = String(row[col] ?? "").trim();
      records.push({
        discipline,
        kra_name: currentKra,
        kra_order: kraOrder,
        sub_kra_name: subKraVal,
        sub_kra_order: subKraOrder,
        level,
        description: description || "NIL",
      });
    }
  }

  if (records.length === 0) {
    throw new Error("No KRA data parsed from sheet");
  }

  return records;
};

export const withTimeout = async <T,>(promise: Promise<T>, ms = 5000, message = "Request timed out") => {
  let timeoutId: number | undefined;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = window.setTimeout(() => reject(new Error(message)), ms);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutId) window.clearTimeout(timeoutId);
  }
};
