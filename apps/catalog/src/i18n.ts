import { useEffect, useState } from 'react';
import type { IconRecord } from './types';

export type Language = 'zh' | 'en';

export const messages = {
  zh: {
    pageTitle: 'SCMDI — Star Citizen 图标库',
    pageDescription: 'SCMDI · Star Citizen 图标库。搜索与预览图标、复制使用代码，下载 SVG 或 PNG。',
    home: 'SCMDI 首页', skipToIcons: '跳转到图标', caption: 'Star Citizen 图标库',
    darkTheme: '切换深色主题', lightTheme: '切换浅色主题',
    language: '语言', currentLanguage: '当前语言', chinese: '切换为中文', english: 'Switch to English',
    search: '搜索图标', searchPlaceholder: '搜索图标名称或用途', clearSearch: '清空搜索',
    allIcons: '全部图标', searchResults: '搜索结果', resultGrid: '图标搜索结果',
    filteredIcons: '筛选结果', sourceFilter: '筛选来源', currentFilter: '当前筛选', sourceAll: '全部来源', sourceOriginal: '原创', sourceMdiAlias: 'MDI 原图', sourceMdiDerived: 'MDI 改绘', sourceGame: '游戏素材',
    iconCount: (count: number) => `${count} 个图标`,
    gridDensity: '网格密度', gridLarge: '大图视图', gridMedium: '标准视图', gridCompact: '紧凑视图',
    noResults: '没有找到图标', showAll: '查看全部图标',
    details: '图标详情', closeDetails: '关闭图标详情', missingIcon: '图标不存在', backToLibrary: '返回图标库',
    copyLink: '复制图标链接', copied: '已复制', copyFailed: '复制失败，请手动选择代码复制',
    previewColors: '预览颜色', themeColor: '主题色', customColor: '自定义预览颜色',
    previewColor: (color: string) => `预览颜色 ${color}`, previewSize: '详情预览尺寸',
    usage: '使用代码', codeFormat: '代码格式', copyCode: (format: string) => `复制 ${format} 代码`,
    downloadSvg: '下载 SVG', downloadPng: '下载 PNG', pngFailed: 'PNG 导出失败，请重试', exportActions: '图标导出', actions: '游戏动作',
    provenance: '来源与许可', originalSource: '原创图标', licenseUnavailable: '许可信息未提供', mdiDerivative: 'MDI 改绘', derivedFromMdi: (name: string) => `基于 MDI ${name} 修改`, mdiReferenceVersion: (version: string) => `MDI 参考版本 ${version}`,
    gameRedrawn: '参考 Star Citizen 游戏内素材重绘并加工', gameProcessed: '参考 Star Citizen 游戏内素材并加工', additionalMdiSource: (name: string) => `另含改自 MDI ${name} 的部分`, sourceUnavailable: '来源信息未提供。', sourceFile: '源文件',
    license: '许可与署名', closeLicense: '关闭许可说明', projectCode: '项目代码',
    projectCodeLicense: 'SCMDI 项目源代码采用 Apache License 2.0。',
    iconAssets: '图标资产', iconAssetsLicense: '目录内图标采用 Apache License 2.0。已记录的来源、署名和修改声明见各图标详情。',
    websiteDependencies: '网站依赖', fonts: '字体', fontsLicense: 'Google Sans、Noto Sans SC 与 Fira Code 采用 SIL Open Font License 1.1。',
    communityAndTrademarks: '社区与商标声明', gameRightsNotice: '本项目许可不改变 Star Citizen 原始游戏素材及商标的上游权利。',
    otherAffiliations: '本项目与 Google、Pictogrammers 无隶属或背书关系。',
    fullNotices: '完整许可与署名', done: '知道了',
    unofficial: '非官方 Star Citizen 社区网站。', officialSite: 'RSI 官方网站',
  },
  en: {
    pageTitle: 'SCMDI — Star Citizen Icon Library',
    pageDescription: 'SCMDI · Star Citizen icon library. Search and preview icons, copy usage code, and download SVG or PNG.',
    home: 'SCMDI home', skipToIcons: 'Skip to icons', caption: 'Star Citizen Icon Library',
    darkTheme: 'Switch to dark theme', lightTheme: 'Switch to light theme',
    language: 'Language', currentLanguage: 'current language', chinese: 'Switch to Chinese', english: 'Switch to English',
    search: 'Search icons', searchPlaceholder: 'Search icons or actions', clearSearch: 'Clear search',
    allIcons: 'All icons', searchResults: 'Search results', resultGrid: 'Icon search results',
    filteredIcons: 'Filtered icons', sourceFilter: 'Filter by source', currentFilter: 'current filter', sourceAll: 'All sources', sourceOriginal: 'Original', sourceMdiAlias: 'MDI original', sourceMdiDerived: 'MDI modified', sourceGame: 'Game assets',
    iconCount: (count: number) => `${count} ${count === 1 ? 'icon' : 'icons'}`,
    gridDensity: 'Grid density', gridLarge: 'Large view', gridMedium: 'Standard view', gridCompact: 'Compact view',
    noResults: 'No icons found', showAll: 'Show all icons',
    details: 'Icon details', closeDetails: 'Close icon details', missingIcon: 'Icon not found', backToLibrary: 'Back to library',
    copyLink: 'Copy icon link', copied: 'Copied', copyFailed: 'Could not copy. Select the code and copy it manually.',
    previewColors: 'Preview colors', themeColor: 'Theme color', customColor: 'Custom preview color',
    previewColor: (color: string) => `Preview color ${color}`, previewSize: 'Icon preview size',
    usage: 'Usage code', codeFormat: 'Code format', copyCode: (format: string) => `Copy ${format} code`,
    downloadSvg: 'Download SVG', downloadPng: 'Download PNG', pngFailed: 'Could not export PNG. Please try again.', exportActions: 'Icon export', actions: 'Game actions',
    provenance: 'Source & license', originalSource: 'Original artwork', licenseUnavailable: 'License information not provided', mdiDerivative: 'Modified MDI artwork', derivedFromMdi: (name: string) => `Modified from MDI ${name}`, mdiReferenceVersion: (version: string) => `MDI reference version ${version}`,
    gameRedrawn: 'Redrawn and further modified using Star Citizen in-game assets as reference', gameProcessed: 'Modified using Star Citizen in-game assets as reference', additionalMdiSource: (name: string) => `Also includes artwork modified from MDI ${name}`, sourceUnavailable: 'Source information not provided.', sourceFile: 'Source file',
    license: 'License & credits', closeLicense: 'Close license information', projectCode: 'Project code',
    projectCodeLicense: 'The SCMDI project source code is licensed under the Apache License 2.0.',
    iconAssets: 'Icon artwork', iconAssetsLicense: 'Catalog icons are provided under the Apache License 2.0. Recorded sources, attribution and modification notices are available in each icon’s details.',
    websiteDependencies: 'Website dependencies', fonts: 'Fonts', fontsLicense: 'Google Sans, Noto Sans SC and Fira Code are licensed under the SIL Open Font License 1.1.',
    communityAndTrademarks: 'Community & trademarks', gameRightsNotice: 'The project license does not relicense original Star Citizen game assets or trademarks.',
    otherAffiliations: 'This project is not affiliated with or endorsed by Google or Pictogrammers.',
    fullNotices: 'Full licenses & credits', done: 'Done',
    unofficial: 'Unofficial Star Citizen fan site.', officialSite: 'Official RSI website',
  },
} as const;

export function useLanguage() {
  const [language, setLanguage] = useState<Language>(() => {
    try { return localStorage.getItem('scmdi:language') === 'en' ? 'en' : 'zh'; }
    catch { return 'zh'; }
  });
  useEffect(() => {
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
    document.title = messages[language].pageTitle;
    document.querySelector('meta[name="description"]')?.setAttribute('content', messages[language].pageDescription);
    try { localStorage.setItem('scmdi:language', language); } catch { /* Keep the current session usable without storage. */ }
  }, [language]);
  return { language, setLanguage, t: messages[language] };
}

export function iconLabel(icon: IconRecord, language: Language) {
  return icon.label[language] || icon.label.en || icon.exportName;
}

export function iconDescription(icon: IconRecord, language: Language) {
  return icon.description[language] || (language === 'en' ? icon.label.en : icon.description.en) || iconLabel(icon, language);
}
