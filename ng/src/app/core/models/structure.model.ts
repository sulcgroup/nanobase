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
    descriptions: {
        description: string;
        expProtocolDescriptions: string;
        expResultsDescriptions: string;
        imageDescriptions: string;
        simProtocolDescriptions: string;
        simResultsDescriptions: string;
        structureDescriptions: string;
    };
    files: {
        displayImage: string;
        expProtocolFiles: string;
        expResultsFiles: string;
        imageFiles: string;
        simProtocolFiles: string;
        simResultsFiles: string;
        structureFiles: string;
    };
    files_contents: Array<File>;
    id: string;
    private: number;
    publication: {
        authors: Array<string>;
        citation: string;
        licensing: string;
        link: string;
        publishDate: string;
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
// export interface Structure {
//     id: number;
//     user: User;
//     title: string;
//     type: string;
//     applications: Array<Tag>;
//     modifications: Array<Tag>;
//     keywords: Array<Tag>;
//     description: string;
//     files_contents: Array<string>;

//     authors: Array<Tag>;
//     publishDate: Date;
//     citation: string;
//     link: URL;
//     licensing: string;

//     structureFiles: StructureFiles;

//     private: boolean;
//     uploadDate: Date;
// }

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
