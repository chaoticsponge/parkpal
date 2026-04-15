import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";

export interface CsvUserRecord {
  _id: string;
  walletAddress: string;
  plates: string[];
  isHandicapped: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface CsvSlotRecord {
  _id: string;
  timeSlot: number[];
  date: string;
  plate: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

const dataDir = path.resolve(process.cwd(), "data");

const usersFile = path.join(dataDir, "users.csv");
const slotsFile = path.join(dataDir, "slots.csv");

const userHeaders = ["_id", "walletAddress", "plates", "isHandicapped", "version", "createdAt", "updatedAt"];
const slotHeaders = ["_id", "timeSlot", "date", "plate", "version", "createdAt", "updatedAt"];

const ensureCsvFile = async (filePath: string, headers: string[]) => {
  await mkdir(dataDir, { recursive: true });

  try {
    await readFile(filePath, "utf8");
  } catch {
    await writeFile(filePath, `${headers.join(",")}\n`, "utf8");
  }
};

const parseCsvLine = (line: string) => {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current);
  return values;
};

const escapeCsvValue = (value: string) => {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
};

const readRows = async (filePath: string, headers: string[]) => {
  await ensureCsvFile(filePath, headers);
  const content = await readFile(filePath, "utf8");
  const lines = content.split(/\r?\n/).filter((line) => line.trim().length > 0);

  if (lines.length <= 1) {
    return [];
  }

  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    return headers.reduce<Record<string, string>>((record, header, index) => {
      record[header] = values[index] ?? "";
      return record;
    }, {});
  });
};

const writeRows = async (
  filePath: string,
  headers: string[],
  rows: Array<Record<string, string>>,
) => {
  await ensureCsvFile(filePath, headers);
  const csv = [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => escapeCsvValue(row[header] ?? "")).join(",")),
  ].join("\n");

  await writeFile(filePath, `${csv}\n`, "utf8");
};

const safeJsonParse = <T>(value: string, fallback: T) => {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

const now = () => new Date().toISOString();

const createId = () => crypto.randomUUID();

const serializeUser = (user: CsvUserRecord) => ({
  _id: user._id,
  walletAddress: user.walletAddress,
  plates: JSON.stringify(user.plates),
  isHandicapped: String(user.isHandicapped),
  version: String(user.version),
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const serializeSlot = (slot: CsvSlotRecord) => ({
  _id: slot._id,
  timeSlot: JSON.stringify(slot.timeSlot),
  date: slot.date,
  plate: slot.plate,
  version: String(slot.version),
  createdAt: slot.createdAt,
  updatedAt: slot.updatedAt,
});

const parseSlotRows = (rows: Record<string, string>[]) =>
  rows.map<CsvSlotRecord>((row) => ({
    _id: row._id || createId(),
    timeSlot: safeJsonParse<number[]>(row.timeSlot, []),
    date: row.date,
    plate: row.plate,
    version: Number(row.version || 0),
    createdAt: row.createdAt || now(),
    updatedAt: row.updatedAt || now(),
  }));

export const getUsers = async () => {
  const rows = await readRows(usersFile, userHeaders);

  return rows.map<CsvUserRecord>((row) => ({
    _id: row._id || createId(),
    walletAddress: row.walletAddress,
    plates: safeJsonParse<string[]>(row.plates, []),
    isHandicapped: row.isHandicapped === "true",
    version: Number(row.version || 0),
    createdAt: row.createdAt || now(),
    updatedAt: row.updatedAt || now(),
  }));
};

export const saveUsers = async (users: CsvUserRecord[]) => {
  await writeRows(usersFile, userHeaders, users.map(serializeUser));
};

export const findUserByWalletAddress = async (walletAddress: string) => {
  const users = await getUsers();
  return users.find((user) => user.walletAddress === walletAddress) ?? null;
};

export const createUser = async (walletAddress: string) => {
  const users = await getUsers();
  const timestamp = now();

  const newUser: CsvUserRecord = {
    _id: createId(),
    walletAddress,
    plates: [],
    isHandicapped: false,
    version: 0,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  users.push(newUser);
  await saveUsers(users);
  return newUser;
};

export const updateUser = async (updatedUser: CsvUserRecord) => {
  const users = await getUsers();
  const nextUsers = users.map((user) =>
    user.walletAddress === updatedUser.walletAddress ? { ...updatedUser, updatedAt: now() } : user,
  );

  await saveUsers(nextUsers);
  return nextUsers.find((user) => user.walletAddress === updatedUser.walletAddress) ?? updatedUser;
};

export const getSlotsByDate = async (date: string) => {
  const rows = await readRows(slotsFile, slotHeaders);

  return parseSlotRows(rows).filter((slot) => slot.date === date);
};

export const getAllSlots = async () => {
  const rows = await readRows(slotsFile, slotHeaders);
  return parseSlotRows(rows);
};

export const findSlotByDateAndPlate = async (date: string, plate: string) => {
  const rows = await readRows(slotsFile, slotHeaders);
  const slots = parseSlotRows(rows);

  return slots.find((slot) => slot.date === date && slot.plate === plate) ?? null;
};

export const createSlot = async (date: string, timeSlot: number[], plate: string) => {
  const rows = await readRows(slotsFile, slotHeaders);
  const slots = parseSlotRows(rows);
  const timestamp = now();

  const newSlot: CsvSlotRecord = {
    _id: createId(),
    date,
    timeSlot,
    plate,
    version: 0,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  slots.push(newSlot);
  await writeRows(slotsFile, slotHeaders, slots.map(serializeSlot));
  return newSlot;
};

export const updateSlot = async (updatedSlot: CsvSlotRecord) => {
  const rows = await readRows(slotsFile, slotHeaders);
  const slots = parseSlotRows(rows);

  const nextSlots = slots.map((slot) =>
    slot._id === updatedSlot._id ? { ...updatedSlot, updatedAt: now() } : slot,
  );

  await writeRows(slotsFile, slotHeaders, nextSlots.map(serializeSlot));
  return nextSlots.find((slot) => slot._id === updatedSlot._id) ?? updatedSlot;
};
