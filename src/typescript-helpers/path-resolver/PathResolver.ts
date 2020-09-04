import path from 'path';
import fs from 'fs';
import { createMatchPath, MatchPath, loadConfig } from 'tsconfig-paths';
import { isPathRelative } from '../../utils/isPathRelative';
import { CompilerOptionsProvider } from '../../compiler-options-provider/CompilerOptionsProvider';

const extensionsToResolve: Array<string> = [
    '.ts',
    '.tsx',
    '.d.ts',
    '/index.ts',
    '/index.tsx',
    '/index.d.ts',
    '.js',
    '.jsx',
    '/index.js',
    '/index.jsx',
];

export class PathResolver {
    private static resolver: MatchPath;

    static init(): void {
        const tsConfigPath = CompilerOptionsProvider.options.configFilePath as string;
        const config = loadConfig(tsConfigPath);

        if (config.resultType === 'failed') {
            throw new Error('Can not load tsconfig file');
        }

        PathResolver.resolver = createMatchPath(config.absoluteBaseUrl, config.paths);
    }

    //Transform to absolute path, only if it's relative or aliased by paths defined in tsConfig.json
    static resolve(sourceFilePath: string, targetPath: string): string {
        if (isPathRelative(targetPath)) {
            const newSourceFilePath = path.dirname(sourceFilePath);
            return resolvePathWithExtension(path.resolve(newSourceFilePath, targetPath));
        }

        const resolved = PathResolver.resolver(targetPath) ?? targetPath;

        return path.isAbsolute(resolved)
            ? resolvePathWithExtension(resolved)
            : resolved;
    }
}


//TODO resolve with TS
function resolvePathWithExtension(filePath: string): string {
    const normalized = path.normalize(filePath);

    const filesPaths = extensionsToResolve.map(it => normalized + it);
    const resolved = filesPaths.find(it => fs.existsSync(it));

    if (resolved === undefined) {
        throw new Error(`Can not resolve file ${filePath}`);
    }

    return resolved;
}
