import { Button, Glyph, IconButton, Modal, ScrollSurface } from './material';
import { messages, type Language } from './i18n';
import { communityNotice } from './community-notice';
import './license.css';

const apache = 'https://www.apache.org/licenses/LICENSE-2.0';
const ofl = 'https://openfontlicense.org/open-font-license-official-text/';
const dependencies = [
  { name: 'React · React DOM · @mdi/react', license: 'MIT', href: 'https://opensource.org/license/mit/' },
  { name: 'Material Web · @mdi/js', license: 'Apache-2.0', href: apache },
  { name: 'Lit · @lit/react', license: 'BSD-3-Clause', href: 'https://opensource.org/license/bsd-3-clause/' },
  { name: 'tslib', license: '0BSD', href: 'https://opensource.org/license/0bsd/' },
];

export default function LicenseModal({ language, onClose }: { language: Language; onClose: () => void }) {
  const t = messages[language];
  const notice = communityNotice[language];
  return <Modal className="license-modal" labelledBy="license-title" onClose={onClose}>
    <ScrollSurface header={<header className="license-heading"><h2 id="license-title">{t.license}</h2><IconButton data-dialog-close aria-label={t.closeLicense} onClick={onClose}><Glyph name="close" /></IconButton></header>}>
    <div className="license-sections">
      <section className="license-section" aria-labelledby="license-code-heading">
        <div className="license-section-heading"><h3 id="license-code-heading">{t.projectCode}</h3><a className="license-badge" href={apache} target="_blank" rel="noreferrer">Apache-2.0 <Glyph name="external" size={12} /></a></div>
        <p>{t.projectCodeLicense}</p>
      </section>
      <section className="license-section" aria-labelledby="license-icons-heading">
        <div className="license-section-heading"><h3 id="license-icons-heading">{t.iconAssets}</h3><a className="license-badge" href={apache} target="_blank" rel="noreferrer">Apache-2.0 <Glyph name="external" size={12} /></a></div>
        <p>{t.iconAssetsLicense}</p>
      </section>
      <section className="license-section" aria-labelledby="license-dependencies-heading">
        <div className="license-section-heading"><h3 id="license-dependencies-heading">{t.websiteDependencies}</h3></div>
        <dl className="license-dependencies">{dependencies.map(dependency => <div key={dependency.license}>
          <dt>{dependency.name}</dt><dd><a href={dependency.href} target="_blank" rel="noreferrer">{dependency.license} <Glyph name="external" size={12} /></a></dd>
        </div>)}</dl>
      </section>
      <section className="license-section" aria-labelledby="license-fonts-heading">
        <div className="license-section-heading"><h3 id="license-fonts-heading">{t.fonts}</h3><a className="license-badge" href={ofl} target="_blank" rel="noreferrer">OFL-1.1 <Glyph name="external" size={12} /></a></div>
        <p>{t.fontsLicense}</p>
      </section>
      <section className="license-section" aria-labelledby="license-community-heading">
        <div className="license-section-heading"><h3 id="license-community-heading">{t.communityAndTrademarks}</h3></div>
        {notice.text.split('\n\n').map(paragraph => <p key={paragraph}>{paragraph}</p>)}
        <p>{t.otherAffiliations}</p>
        <p>{t.gameRightsNotice}</p>
        <div className="license-community-links">{notice.links.map(link => <a key={link.href} href={link.href} target="_blank" rel="noreferrer">{link.label} <Glyph name="external" size={12} /></a>)}</div>
      </section>
    </div>
    <footer className="license-actions"><a href="./THIRD_PARTY_NOTICES.txt" target="_blank" rel="noreferrer">{t.fullNotices} <Glyph name="external" size={13} /></a><Button color="filled" onClick={onClose}>{t.done}</Button></footer>
    </ScrollSurface>
  </Modal>;
}
