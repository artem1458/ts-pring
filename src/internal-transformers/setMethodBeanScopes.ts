import * as ts from 'typescript';
import { isMethodBean } from '../typescript-helpers/decorator-helpers/isMethodBean';
import { TypeRegisterRepository } from '../type-register/TypeRegisterRepository';
import { methodBeanTypeIdQualifier } from '../typescript-helpers/type-id-qualifier';
import { ICreateFactoriesContext } from '../factories/ICreateFactoriesContext';
import { getPrivateIdentifier } from '../typescript-helpers/getPrivateIdentifier';

export const setMethodBeanScopes = (factoryContext: ICreateFactoriesContext): ts.TransformerFactory<ts.SourceFile> => context => {
    return sourceFile => {
        const visitor: ts.Visitor = (node: ts.Node) => {
            if (isMethodBean(node)) {
                const { typeId } = methodBeanTypeIdQualifier(node);
                const typeInfo = TypeRegisterRepository.getTypeById(typeId);

                if (typeInfo.beanInfo.scope !== 'singleton') {
                    return node;
                }

                factoryContext.hasSingleton = true;

                const decorators = node.decorators || [];
                const decorator = ts.createDecorator(getPrivateIdentifier('Singleton'));

                return ts.updateMethod(
                    node,
                    [
                        decorator,
                        ...decorators,
                    ],
                    node.modifiers,
                    node.asteriskToken,
                    node.name,
                    node.questionToken,
                    node.typeParameters,
                    node.parameters,
                    node.type,
                    node.body,
                );
            }

            return ts.visitEachChild(node, visitor, context);
        };

        return ts.visitNode(sourceFile, visitor);
    };
};
