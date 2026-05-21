export function buildVisibilityMap(tree) {
  const map = {};

  const walk = (nodes) => {
    for (const node of nodes) {
      map[node.id] = node.checked !== false;
      if (node.children?.length) {
        walk(node.children);
      }
    }
  };

  walk(tree);
  return map;
}

export function isFieldVisible(node, visibilityMap) {
  if (!node) return false;

  if (node.id && visibilityMap[node.id] === false) {
    return false;
  }

  if (node.children?.length) {
    return node.children.some((child) => isFieldVisible(child, visibilityMap));
  }

  return true;
}

export function filterVisibleDataNodes(nodes, visibilityMap) {
  if (!nodes?.length) return [];

  return nodes.reduce((visible, node) => {
    if (!isFieldVisible(node, visibilityMap)) {
      return visible;
    }

    if (node.children?.length) {
      const children = filterVisibleDataNodes(node.children, visibilityMap);
      if (children.length === 0) {
        return visible;
      }
      visible.push({ ...node, children });
      return visible;
    }

    visible.push(node);
    return visible;
  }, []);
}
