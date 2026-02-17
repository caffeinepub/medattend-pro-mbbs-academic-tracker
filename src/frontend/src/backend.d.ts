import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface FirstYearSubject {
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
    getAllFirstYearSubjects(): Promise<Array<FirstYearSubject>>;
    getFirstYearSubjectById(id: bigint): Promise<FirstYearSubject | null>;
    getModFromFirstYearSubject(subjectId: bigint, modName: string): Promise<Mod | null>;
}
