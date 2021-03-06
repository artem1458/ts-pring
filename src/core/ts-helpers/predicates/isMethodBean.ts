import * as ts from 'typescript';
import { isBeanDecorator } from './isBeanDecorator';

export const isMethodBean = (node: ts.Node): node is ts.MethodDeclaration =>
    ts.isMethodDeclaration(node) && Boolean(node.decorators?.some(isBeanDecorator));
