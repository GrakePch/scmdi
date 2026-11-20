// Adapted from RSI's current Fan Sites guidance. The visible footer notice and
// official-site link complement the full notice in License & credits.
// This notice does not establish a license for any individual icon or asset.
const officialSite = 'https://robertsspaceindustries.com/';
const fanSitePolicy = 'https://support.robertsspaceindustries.com/hc/en-us/articles/360006895793-Star-Citizen-Fankit-and-Fandom-FAQ';

export const communityNotice = {
  zh: {
    shortText: '非官方《星际公民》社区网站，与 Cloud Imperium 无隶属关系。',
    text: 'SCMDI 是非官方的《星际公民》社区网站，与 Cloud Imperium 集团无隶属关系，亦未获得其背书。第三方内容的权利归各自权利人所有。',
    officialLink: { label: 'Star Citizen 官网', href: officialSite },
    links: [
      { label: 'Star Citizen 官网', href: officialSite },
      { label: 'RSI 社区网站指引', href: fanSitePolicy },
    ],
  },
  en: {
    shortText: 'Unofficial Star Citizen fan site. Not affiliated with Cloud Imperium.',
    text: 'SCMDI is an unofficial Star Citizen community website, independent of and not endorsed by the Cloud Imperium group of companies. Third-party content is owned by its respective rights holders.',
    officialLink: { label: 'Star Citizen official website', href: officialSite },
    links: [
      { label: 'Star Citizen official website', href: officialSite },
      { label: 'RSI fan-site guidelines', href: fanSitePolicy },
    ],
  },
};
