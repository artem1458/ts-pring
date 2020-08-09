import * as ts from 'typescript';
import { DiConfigRepository } from '../di-config-repository';
import { TypeRegisterRepository } from './TypeRegisterRepository';
import { typeIdQualifier, TypeQualifierError } from '../type-id-qualifier';
import { ProgramRepository } from '../program/ProgramRepository';
import { isMethodBean } from '../bean/isMethodBean';
import { getMethodLocationMessage } from '../utils/getMethodLocationMessage';
import { checkTypeForCorrectness } from '../type-id-qualifier/utils/checkTypeForCorrectness';
import { ShouldReinitializeRepository } from '../transformer/ShouldReinitializeRepository';

export function registerTypes(): void {
    if (!ShouldReinitializeRepository.value) {
        return;
    }

    const program = ProgramRepository.program;

    DiConfigRepository.data.forEach(filePath => {
        const path = filePath as ts.Path;
        const sourceFile = program.getSourceFileByPath(path);

        if (sourceFile === undefined) {
            throw new Error(`SourceFile not found, path ${path}`);
        }

        travelSourceFile(sourceFile, filePath);
    });

    function travelSourceFile(node: ts.Node, configPath: string): void {
        if (isMethodBean(node)) {
            try {
                const { typeId, originalTypeName } = typeIdQualifier(node);
                let configName;

                if (ts.isClassDeclaration(node.parent) && node.parent.name) {
                    configName = node.parent.name?.getText();
                } else {
                    throw new Error('Configs must be a Named Class Declaration' + getMethodLocationMessage(node));
                }

                const beanName = node.name.getText();

                checkTypeForCorrectness(typeId);
                TypeRegisterRepository.registerType({
                    typeId,
                    originalTypeName,
                    configPath,
                    configName,
                    beanName,
                });
            } catch (error) {
                switch (error) {
                    case TypeQualifierError.HasNoType:
                        throw new Error('Bean should have return type' + getMethodLocationMessage(node));

                    case TypeQualifierError.TypeIsPrimitive:
                        throw new Error('Bean should have complex return type (interfaces, ...etc)' + getMethodLocationMessage(node));

                    case TypeQualifierError.CanNotGenerateType:
                        throw new Error('Can not generate type for' + getMethodLocationMessage(node));

                    default:
                        throw error;
                }
            }
        }

        ts.forEachChild(node, (node: ts.Node) => travelSourceFile(node, configPath));
    }
}
