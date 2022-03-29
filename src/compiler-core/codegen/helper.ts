// static 使用 JSON.stringify 加上引号
export const createText = ({ content = '', isStatic = true } = {}) => {
  return isStatic ? JSON.stringify(content) : content;
}
