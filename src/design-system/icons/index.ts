export {
  iconFontClassMap,
  iconFontGlyphs,
  iconFontProject,
  type IconFontGeneratedName,
  type IconFontRawClass
} from "./iconfont.generated";
export { iconFontAliases, type IconFontAliasName } from "./iconfont-aliases";

import { iconFontAliases, type IconFontAliasName } from "./iconfont-aliases";
import { iconFontClassMap, type IconFontGeneratedName, type IconFontRawClass } from "./iconfont.generated";

export type IconFontName = IconFontAliasName | IconFontGeneratedName;

export function resolveIconFontClass(name: IconFontName): IconFontRawClass {
  if (name in iconFontAliases) {
    return iconFontAliases[name as IconFontAliasName];
  }

  return iconFontClassMap[name as IconFontGeneratedName];
}
