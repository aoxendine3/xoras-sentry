/**
 * AST node analysis and trace generation.
 */

function getTrace(node, context = '') {
    const type = node.type;
    const start = node.loc ? `${node.loc.start.line}:${node.loc.start.column}` : 'unknown';
    
    let description = '';
    switch (type) {
        case 'MemberExpression':
            description = `Accessing property '${node.property.name || node.property.value}' of object '${node.object.name || 'expression'}'.`;
            break;
        case 'Literal':
            description = `Static value detected: '${node.value}'.`;
            break;
        case 'Property':
            description = `Object property definition: '${node.key.name || node.key.value}'.`;
            break;
        default:
            description = `AST Node Type: ${type}`;
    }

    return {
        type,
        location: start,
        description,
        context: context.substring(0, 100) + (context.length > 100 ? '...' : '')
    };
}

module.exports = { getTrace };
