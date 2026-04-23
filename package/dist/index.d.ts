import { StackFrame } from 'bippy/source';
export { StackFrame } from 'bippy/source';

interface ElementSourceInfo {
    filePath: string;
    lineNumber: number | null;
    columnNumber: number | null;
    componentName: string | null;
}
interface FrameworkResolver {
    name: string;
    resolveStack: (element: Element) => ElementSourceInfo[] | Promise<ElementSourceInfo[]>;
    resolveComponentName?: (element: Element) => string | null | Promise<string | null>;
}
interface ResolverOptions {
    resolvers?: FrameworkResolver[];
}
interface ElementInfo {
    tagName: string;
    componentName: string | null;
    source: ElementSourceInfo | null;
    stack: ElementSourceInfo[];
}
interface ParsedSourceLocation {
    filePath: string;
    lineNumber: number;
    columnNumber: number;
}

declare const createSourceResolver: (options?: ResolverOptions) => {
    resolveSource: (node: object) => Promise<ElementSourceInfo | null>;
    resolveStack: (node: object) => Promise<ElementSourceInfo[]>;
    resolveComponentName: (node: object) => Promise<string | null>;
    resolveElementInfo: (node: object) => Promise<ElementInfo>;
};
declare const resolveSource: (node: object) => Promise<ElementSourceInfo | null>;
declare const resolveStack: (node: object) => Promise<ElementSourceInfo[]>;
declare const resolveComponentName: (node: object) => Promise<string | null>;
declare const resolveElementInfo: (node: object) => Promise<ElementInfo>;

declare const checkIsNextProject: (revalidate?: boolean) => boolean;
declare const isSourceComponentName: (name: string) => boolean;
declare const getReactStack: (node: object) => Promise<StackFrame[] | null>;
declare const reactResolver: {
    name: "react";
    resolveStack: (node: object) => Promise<ElementSourceInfo[]>;
    resolveComponentName: (node: object) => Promise<string | null>;
};

declare const svelteResolver: FrameworkResolver;

declare const vueResolver: FrameworkResolver;

declare const solidResolver: FrameworkResolver;

declare const preactResolver: FrameworkResolver;

declare const formatStackFrame: (frame: ElementSourceInfo) => string;

declare const formatStack: (stack: ElementSourceInfo[], maxLines?: number) => string;

declare const mergeStackContext: (primary: string, secondary: string, maxLines: number) => string;

declare const parseSourceLocation: (location: string) => ParsedSourceLocation | null;

declare const getTagName: (node: object) => string;

export { type ElementInfo, type ElementSourceInfo, type FrameworkResolver, type ParsedSourceLocation, type ResolverOptions, checkIsNextProject, createSourceResolver, formatStack, formatStackFrame, getReactStack, getTagName, isSourceComponentName, mergeStackContext, parseSourceLocation, preactResolver, reactResolver, resolveComponentName, resolveElementInfo, resolveSource, resolveStack, solidResolver, svelteResolver, vueResolver };
