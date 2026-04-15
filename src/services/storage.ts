import localforage from "localforage";
import { SimilarQuestion } from "./gemini";

export interface MistakeRecord {
  id: string;
  originalQuestion: string;
  knowledgePoint: string;
  similarQuestions: SimilarQuestion[];
  createdAt: number;
}

const store = localforage.createInstance({
  name: "MistakeLearningTool",
  storeName: "mistakes",
});

export async function saveMistakeRecord(record: Omit<MistakeRecord, "id" | "createdAt">): Promise<MistakeRecord> {
  const newRecord: MistakeRecord = {
    ...record,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
  };
  await store.setItem(newRecord.id, newRecord);
  return newRecord;
}

export async function getAllMistakeRecords(): Promise<MistakeRecord[]> {
  const records: MistakeRecord[] = [];
  await store.iterate((value: MistakeRecord) => {
    records.push(value);
  });
  // Sort by createdAt descending
  return records.sort((a, b) => b.createdAt - a.createdAt);
}

export async function deleteMistakeRecord(id: string): Promise<void> {
  await store.removeItem(id);
}

export async function deleteMultipleMistakeRecords(ids: string[]): Promise<void> {
  await Promise.all(ids.map((id) => store.removeItem(id)));
}
