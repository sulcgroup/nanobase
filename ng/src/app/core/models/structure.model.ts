import { Diagnostic } from 'typescript';
import { User } from './user.model';

// Structure displayed on the home page
export interface StructureCover {
    id: number;
    firstName: string;
    lastName: string;
    title: string;
    description: string;
    displayImage: string;
    uploadDate: Date;
}

// Structure displayed on the structure page
export interface Structure {
    description: string;
    files: {
        displayImage: [string];
        oxdnaFiles: [string];
        expProtocol: [{name: string, description: string}];
        expResults: [{name: string, description: string}];
        images: [{name: string, description: string}];
        simProtocol: [{name: string, description: string}];
        simResults: [{name: string, description: string}];
        structure: [{name: string, description: string}];
    };
    files_contents: Array<File>;
    id: string;
    private: number;
    publication: {
        authors: Array<string>;
        citation: string;
        licensing: string;
        link: string;
        publishDate: any;
    };
    size: number;
    tags: {
        applications: Array<string>;
        keywords: Array<string>;
        modifications: Array<string>;
    };
    title: string;
    uploadDate: Date;
    type: string;
    user: {
        firstName: string;
        id: number;
        institution: string;
        lastName: string;
    };
}

// Structure uploaded to database
export interface StructureUpload {
    id: number;
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
