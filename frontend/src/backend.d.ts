import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface TimetableEntry {
    startTime: bigint;
    duration: bigint;
    subjectName: string;
    dayOfWeek: string;
    subjectId: bigint;
    category: string;
    classType: string;
}
export interface SubjectCategory {
    subjects: Array<Subject>;
    name: string;
}
export interface Subject {
    id: bigint;
    mods: Array<Mod>;
    name: string;
}
export interface Mod {
    content: Array<string>;
    name: string;
    description: string;
}
export interface backendInterface {
    addTimetableEntry(subjectId: bigint, subjectName: string, classType: string, category: string, dayOfWeek: string, startTime: bigint, duration: bigint): Promise<void>;
    clearTimetable(): Promise<void>;
    getAllCategories(): Promise<Array<SubjectCategory>>;
    getAllCategoryNames(): Promise<Array<string>>;
    getAllSubjects(): Promise<Array<Subject>>;
    getCategoryByName(name: string): Promise<SubjectCategory | null>;
    getCategoryCount(): Promise<bigint>;
    getModFromSubjects(categoryName: string, subjectId: bigint, modName: string): Promise<Mod | null>;
    getModsFromSubject(categoryName: string, subjectId: bigint): Promise<Array<Mod> | null>;
    getSubjectsByCategoryIndex(index: bigint): Promise<Array<Subject> | null>;
    getTimetable(): Promise<Array<TimetableEntry>>;
    getTimetableByDay(dayOfWeek: string): Promise<Array<TimetableEntry>>;
}
