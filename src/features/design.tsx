import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/provider";
import { LanguageToggle } from "@/components/scent/shell";
import {
  UnderlineInput,
  DatePicker,
  TimePicker,
  CitySearch,
  ProgressLabel,
  LoadingLine,
  PlacementBadge,
  PlacementRow,
  ElementBar,
  SectionHeader,
  Skeleton,
  ReadingBlock,
} from "@/components/scent/controls";
import { ProductCard, AddButton } from "@/components/scent/product";
import { Logo, ChartWheel, Bottle } from "@/components/scent/artwork";
import {
  StarField,
  Orb,
  OrbitDiagram,
  NoteIcon,
  CellGrid,
  Cell,
  noteNames,
} from "@/components/scent/cosmos";
import { CrescentSpinner } from "./chart-loading";
import { FeedbackRow, AspectGlyph } from "./chart-result";
import { demoChart, perfumes } from "@/data/seed";
import type { BirthProfile } from "@/data/types";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="design-row">
      <p className="label muted">{label}</p>
      {children}
    </div>
  );
}

const demoProfile: BirthProfile = {
  name: "An",
  day: 14,
  month: 2,
  year: 1995,
  hour: 7,
  minute: 30,
  city: "Hanoi",
  country: "Vietnam",
};

function Library() {
  const { t } = useLanguage();
  const [profile, setProfile] = useState(demoProfile);
  const [city, setCity] = useState("Hanoi");
  const p = perfumes[0];
  return (
    <>
      <SectionHeader>{t.button}</SectionHeader>
      <Row label={`${t.primary} / ${t.default}`}>
        <Button>{t.next}</Button>
      </Row>
      <Row label={`${t.primary} / ${t.hover}`}>
        <Button data-demo="hover">{t.next}</Button>
      </Row>
      <Row label={`${t.primary} / ${t.focus}`}>
        <Button data-demo="focus">{t.next}</Button>
      </Row>
      <Row label={`${t.primary} / ${t.disabled}`}>
        <Button disabled>{t.next}</Button>
      </Row>
      <Row label={`${t.primary} / ${t.loading}`}>
        <Button loading>{t.next}</Button>
      </Row>
      <Row label={`${t.secondary} / ${t.default}`}>
        <Button variant="secondary">{t.save}</Button>
      </Row>
      <Row label={`${t.text} / ${t.default}`}>
        <Button variant="text">{t.back}</Button>
      </Row>

      <SectionHeader>{t.input}</SectionHeader>
      <Row label={t.default}>
        <UnderlineInput label={t.name} placeholder={t.firstName} />
      </Row>
      <Row label={t.filled}>
        <UnderlineInput label={t.name} defaultValue="An" />
      </Row>
      <Row label={t.error}>
        <UnderlineInput label={t.name} error={t.nameError} defaultValue="" />
      </Row>
      <Row label={t.disabled}>
        <UnderlineInput label={t.name} disabled />
      </Row>

      <SectionHeader>{t.datePicker}</SectionHeader>
      <Row label={t.default}>
        <DatePicker profile={{ ...profile, day: 0, month: 0, year: 0 }} onChange={setProfile} />
      </Row>
      <Row label={t.error}>
        <DatePicker
          profile={{ ...profile, day: 31, month: 2, year: 1995 }}
          onChange={setProfile}
          showError
        />
      </Row>

      <SectionHeader>{t.timePicker}</SectionHeader>
      <Row label={t.default}>
        <TimePicker profile={profile} onChange={setProfile} />
      </Row>
      <Row label={t.disabled}>
        <TimePicker profile={{ ...profile, hour: null, minute: null }} onChange={setProfile} />
      </Row>

      <SectionHeader>{t.citySearch}</SectionHeader>
      <Row label={t.default}>
        <CitySearch value={city} onSelect={(c) => setCity(c)} />
      </Row>
      <Row label={t.error}>
        <CitySearch value="" onSelect={() => {}} error={t.cityError} />
      </Row>

      <SectionHeader>{t.progress}</SectionHeader>
      <Row label={t.default}>
        <ProgressLabel step={2} />
      </Row>

      <SectionHeader>{t.loadingLine}</SectionHeader>
      <Row label={t.default}>
        <LoadingLine />
      </Row>

      <SectionHeader>{t.placement}</SectionHeader>
      <Row label={t.default}>
        <PlacementBadge label={t.sun} sign="Aquarius" index={0} />
      </Row>
      <Row label={t.empty}>
        <PlacementBadge label={t.rising} sign={null} index={2} />
      </Row>

      <SectionHeader>{t.placementRow}</SectionHeader>
      <Row label={t.default}>
        <PlacementRow label={t.venus} value={t.Pisces} explanation={t.venusReading} />
      </Row>

      <SectionHeader>{t.elementBar}</SectionHeader>
      <Row label={t.default}>
        <ElementBar label={t.air} value={40} />
      </Row>
      <Row label={t.empty}>
        <ElementBar label={t.fire} value={0} />
      </Row>

      <SectionHeader>{t.readingBlock}</SectionHeader>
      <Row label={t.filled}>
        <ReadingBlock heading={t.acc1} text={t.acc1Text} />
      </Row>
      <Row label={t.loading}>
        <ReadingBlock heading={t.acc1} text="" state="loading" />
      </Row>
      <Row label={t.error}>
        <ReadingBlock heading={t.acc1} text="" state="error" onRetry={() => {}} />
      </Row>

      <SectionHeader>{t.productCard}</SectionHeader>
      <Row label={t.default}>
        <ProductCard perfume={p} compact />
      </Row>
      <Row label={t.disabled}>
        <ProductCard perfume={{ ...p, sold_out: true }} compact />
      </Row>
      <Row label={t.loading}>
        <Skeleton product />
      </Row>

      <SectionHeader>feedback</SectionHeader>
      <Row label={t.default}>
        <FeedbackRow />
      </Row>

      <SectionHeader>evidence</SectionHeader>
      <Row label={t.default}>
        <EvidenceCell evidence={{ planet: "moon", sign: "Cancer", why: "why2" }} />
      </Row>

      <SectionHeader>{t.header}</SectionHeader>
      <Row label={t.default}>
        <Logo />
      </Row>
      <Row label="chart wheel">
        <ChartWheel />
      </Row>
      <Row label="bottle">
        <div className="product-image">
          <Bottle family="Floral" name={p.name} />
        </div>
      </Row>

      <SectionHeader>art</SectionHeader>
      <Row label="star field">
        <div className="design-stars">
          <StarField />
        </div>
      </Row>
      <Row label="orb / sun · moon · disc">
        <div className="design-icons">
          <Orb variant="sun" size="sm" />
          <Orb variant="moon" size="md" />
          <Orb variant="disc" size="sm" />
        </div>
      </Row>
      <Row label="orbit diagram">
        <OrbitDiagram />
      </Row>
      <Row label="note icons">
        <div className="design-icons">
          {noteNames.map((n) => {
            const key = `note${n[0].toUpperCase()}${n.slice(1)}` as const;
            return (
              <figure key={n}>
                <NoteIcon name={n} label={t[key as keyof typeof t] as string} />
                <figcaption className="label muted">
                  {t[key as keyof typeof t] as string}
                </figcaption>
              </figure>
            );
          })}
        </div>
      </Row>
      <Row label="cell grid">
        <CellGrid>
          <Cell>
            <p className="label">{t.youAsked}</p>
          </Cell>
          <Cell>
            <p>{t.askEvidence}</p>
          </Cell>
          <Cell wide>
            <p>{t.askAnswer}</p>
          </Cell>
        </CellGrid>
      </Row>
    </>
  );
}

export function DesignPage() {
  const { t } = useLanguage();

  return (
    <div className="narrow design-page">
      <p className="label muted">{t.designIntro}</p>
      <h1 className="xl">{t.designTitle}</h1>
      <LanguageToggle />

      <section className="design-theme" data-theme="light">
        <p className="label">{t.themeLight}</p>
        <Library />
      </section>
      <section className="design-theme" data-theme="dark">
        <p className="label">{t.themeDark}</p>
        <Library />
      </section>
    </div>
  );
}
