import { User } from './user.model';

// Structure displayed on the home page
export interface StructureCover {
    sid: number;
    user: User;
    title: string;
    description: string;
    img: string;
    uploadDate: Date;
}

// Structure displayed on the structure page
export interface Structure {
    sid: number;
    user: User;
    title: string;
    type: string;
    applications: Array<Tag>;
    modifications: Array<Tag>;
    keywords: Array<Tag>;
    description: string;

    authors: Array<Tag>;
    publishDate: Date;
    citation: string;
    link: URL;
    licensing: string;

    structureFiles: StructureFiles;

    private: boolean;
    uploadDate: Date;

    /*** TEMPORARY ***/
    img: string;
}

// Structure uploaded to database
export interface StructureUpload {
    sid: number;
    user: User;
    title: string;
    type: string;
    applications: Array<Tag>;
    modifications: Array<Tag>;
    keywords: Array<Tag>;
    description: string;

    authors: Array<Tag>;
    publishDate: Date;
    citation: string;
    link: URL;
    licensing: string;

    structureFiles: StructureFilesUpload;

    private: boolean;
    uploadDate: Date;
}

export interface StructureFiles {
    structure: Array<FileDisplay>;
    expProtocol: Array<FileDisplay>;
    expResults: Array<FileDisplay>;
    simProtocol: Array<FileDisplay>;
    simResults: Array<FileDisplay>;
    images: Array<FileDisplay>;
    displayImage: string;
}

export interface FileDisplay {
    file: string;
    description: string;
}

export interface StructureFilesUpload {
    structure: Array<File>;
    expProtocol: Array<File>;
    expResults: Array<File>;
    simProtocol: Array<File>;
    simResults: Array<File>;
    images: Array<File>;
    displayImage: string;
}

export interface File {
    file: string;
    description: string;
    contents: string;
}

export interface Tag {
    value: string;
}
