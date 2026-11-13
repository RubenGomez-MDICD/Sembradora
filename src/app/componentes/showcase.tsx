"use client";

import { useState } from "react";
import { Box, Button, Heading, IconButton, Stack, Text } from "@chakra-ui/react";
import { ArrowLeft, Baby, BookOpen, Bus, ChevronRight, Coins, CreditCard, Ellipsis, Handshake, HandCoins, HeartPulse, House, Plus, Smartphone, Sprout, Store, Trash2, Users, Utensils, Wallet } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { useGlosario } from "@/components/glosario";
import { Screen } from "@/components/screen";
import {
  AccordionList,
  Alert,
  BackupCode,
  BottomSheet,
  CategoryTiles,
  CheckboxCardItem,
  DangerButton,
  DataList,
  DateField,
  DebtCard,
  EmptyState,
  FeatureItem,
  FilterChips,
  IconOptions,
  LinkCard,
  MovementRow,
  NumberedSteps,
  PinField,
  ProgressBar,
  RadioCardGroup,
  RadioInline,
  SaveStatus,
  Segmented,
  SelectField,
  Stat,
  StepsBar,
  TextField,
  WeekBars,
  WeekPace,
  notify,
} from "@/components/ds";

function Section({ figma, children }: { figma: string; children: React.ReactNode }) {
  return (
    <Stack as="section" gap="3" pt="2">
      <Heading as="h2" textStyle="overline" color="content.subtle">
        {figma}
      </Heading>
      {children}
    </Stack>
  );
}

export function Showcase() {
  const [seg, setSeg] = useState("semana");
  const [chip, setChip] = useState("todas");
  const [icon, setIcon] = useState("book");
  const [sheet, setSheet] = useState(false);
  const [tipo, setTipo] = useState("gasto");
  const { abrir } = useGlosario();

  return (
    <>
      <AppHeader type="back" title="Componentes" meta="Librería" backHref="/" />
      <Screen gap="8">
        <Stack gap="1">
          <Heading as="h1" textStyle="h1">
            Librería de componentes
          </Heading>
          <Text textStyle="bodySm" color="content.muted">
            Cada bloque lleva el nombre del componente en Figma (página Componentes). Página solo para revisión; no aparece en buscadores.
          </Text>
        </Stack>

        <Section figma="Button · solid, subtle, outline, ghost · md y lg">
          <Button size="lg">
            <Plus /> Anotar otro movimiento
          </Button>
          <Button size="lg" variant="subtle">Anotar un ingreso</Button>
          <Button size="lg" variant="outline">Ver mis movimientos</Button>
          <Button size="lg" variant="ghost">Atrás</Button>
          <Button size="lg" disabled>Recuperar mis datos</Button>
          <Button size="lg" loading loadingText="Guardando…">Guardar</Button>
          <Stack direction="row" gap="2">
            <Button size="md">Siguiente <ChevronRight /></Button>
            <Button size="md" variant="outline">Cancelar</Button>
          </Stack>
        </Section>

        <Section figma="Button.Danger · solid, outline, ghost">
          <DangerButton size="lg"><Trash2 /> Borrar y reemplazar</DangerButton>
          <DangerButton size="lg" variant="outline"><Trash2 /> Borrar movimiento</DangerButton>
          <DangerButton size="lg" variant="ghost"><Trash2 /> Borrar movimiento</DangerButton>
        </Section>

        <Section figma="IconButton · ghost, outline, solid">
          <Stack direction="row" gap="2">
            <IconButton aria-label="Regresar" variant="ghost" colorPalette="gray"><ArrowLeft /></IconButton>
            <IconButton aria-label="Agregar" variant="outline"><Plus /></IconButton>
            <IconButton aria-label="Agregar" variant="solid"><Plus /></IconButton>
          </Stack>
        </Section>

        <Section figma="Card">
          <LinkCard href="/mi-dinero" title="Mi dinero" description="Anota tus gastos y mira tu balance." icon={Wallet} />
          <LinkCard href="/mi-dinero/ideas" eyebrow="Ordenarlo" title="Ideas para ordenar tu dinero" description="Con base en lo que anotaste." icon={Sprout} />
        </Section>

        <Section figma="Stat · primary, neutral">
          <Stat label="Te queda esta semana" value="$1,250" helpText="De $3,150 que te entraron · $1,900 en gastos" />
          <Stat tone="neutral" label="Esta semana te faltaron" value="-$350" helpText="Entraron $1,550 y gastaste $1,900." />
        </Section>

        <Section figma="Alert · info, success, warning, error">
          <Alert status="info" title="¿Ya te pagaron esta semana?">Anota lo que te entró para saber cuánto te queda.</Alert>
          <Alert status="success" title="Tu sueldo está dentro de lo justo">Te pagan $750 al día y lo que te toca es $725.</Alert>
          <Alert status="warning" title="Te faltan $275 al día">Es 38 % menos de lo que te toca por tu trabajo.</Alert>
          <Alert status="error" title="No encontramos ese código">Revisa que la O no sea un cero.</Alert>
        </Section>

        <Section figma="Toast · success, danger · SaveStatus">
          <Button variant="outline" onClick={() => notify({ title: "Se guardó: Comida · $120", action: { label: "Deshacer", onClick: () => {} } })}>Mostrar Toast de guardado</Button>
          <Button variant="outline" onClick={() => notify({ title: "Se borró: Comida · $120", status: "danger", action: { label: "Deshacer", onClick: () => {} } })}>Mostrar Toast de borrado</Button>
          <SaveStatus status="saved" />
          <SaveStatus status="saving" />
          <SaveStatus status="error" onRetry={() => {}} />
        </Section>

        <Section figma="Input · md, lg, con prefijo, sufijo y error">
          <TextField label="¿Cuánto fue?" size="lg" prefix="$" inputMode="numeric" defaultValue="120" helperText="Escribe solo el número, sin centavos si no los sabes." />
          <TextField label="¿Cuántas personas viven ahí?" suffix="personas" inputMode="numeric" defaultValue="4" />
          <TextField label="Código de respaldo" defaultValue="MILPA-7K3O-92XD" error="Ese código tiene una letra O y los códigos no la usan. Quizá es una Q." />
        </Section>

        <Section figma="Select · DateInput">
          <SelectField label="Categoría" icon={Utensils} defaultValue="comida" options={[{ value: "comida", label: "Comida" }, { value: "casa", label: "Casa" }, { value: "transporte", label: "Transporte" }]} />
          <DateField label="Fecha" defaultValue="2026-10-14" />
        </Section>

        <Section figma="CheckboxCard · RadioCard · Radio">
          <CheckboxCardItem label="Limpieza general" description="Barrer, trapear, sacudir, tender camas y lavar baños." defaultChecked />
          <CheckboxCardItem label="Lavado y planchado" description="Lavar, tender, doblar y planchar ropa." />
          <RadioCardGroup
            label="¿Sigues trabajando ahí?"
            defaultValue="si"
            options={[
              { value: "si", label: "Sí, sigo trabajando" },
              { value: "despido", label: "Ya no, me despidieron", description: "Calculamos también tu liquidación" },
              { value: "renuncia", label: "Ya no, yo me fui", description: "Calculamos tu finiquito" },
            ]}
          />
          <RadioInline label="Es un:" value={tipo} onValueChange={(e) => setTipo(e.value ?? "gasto")} options={[{ value: "gasto", label: "Gasto" }, { value: "ingreso", label: "Ingreso" }]} />
        </Section>

        <Section figma="CategoryTile · SegmentGroup · FilterChip · IconOption">
          <CategoryTiles
            label="¿En qué fue?"
            defaultValue="comida"
            onAdd={() => setSheet(true)}
            options={[
              { value: "comida", label: "Comida", icon: Utensils },
              { value: "casa", label: "Casa", icon: House },
              { value: "ninos", label: "Niños", icon: Baby },
              { value: "transporte", label: "Transporte", icon: Bus },
              { value: "salud", label: "Salud", icon: HeartPulse },
              { value: "tandas", label: "Tandas", icon: Users },
              { value: "otro", label: "Otro", icon: Ellipsis },
            ]}
          />
          <Segmented label="Periodo" value={seg} onValueChange={(e) => setSeg(e.value ?? "semana")} items={[{ value: "semana", label: "Esta semana" }, { value: "mes", label: "Este mes" }]} />
          <FilterChips label="Tema" value={chip} onChange={setChip} options={[{ value: "todas", label: "Todas" }, { value: "dinero", label: "Dinero" }, { value: "derechos", label: "Derechos" }, { value: "ahorro", label: "Ahorro" }]} />
          <IconOptions label="Elige un ícono" value={icon} onChange={setIcon} options={[{ value: "house", label: "Casa", icon: House }, { value: "baby", label: "Niñas y niños", icon: Baby }, { value: "book", label: "Escuela", icon: BookOpen }, { value: "heart", label: "Salud", icon: HeartPulse }, { value: "bus", label: "Transporte", icon: Bus }]} />
        </Section>

        <Section figma="Steps · Progress (valor exacto)">
          <StepsBar total={5} current={2} />
          <ProgressBar label="Comida" amount="$850" value={(850 / 1900) * 100} />
          <ProgressBar label="Casa" amount="$400" value={(400 / 1900) * 100} />
          <ProgressBar label="Te pagan" amount="$450" value={(450 / 725) * 100} tone="secondary" />
        </Section>

        <Section figma="DataList.Item · plain, glossary">
          <DataList
            rows={[
              { label: "Aguinaldo", value: "$6,750", note: "15 días de sueldo · art. 87 LFT", onTermClick: () => abrir("aguinaldo") },
              { label: "Vacaciones pagadas", value: "$8,100", note: "18 días · art. 76 LFT" },
              { label: "Prima vacacional", value: "$2,025", note: "25 % de tus vacaciones · art. 80 LFT", onTermClick: () => abrir("prima-vacacional") },
            ]}
          />
        </Section>

        <Section figma="MovementRow · gasto, ingreso">
          <Box>
            <MovementRow kind="gasto" category="Comida" note="Tortillas y verdura · 2:15 p. m." amountCents={12000} icon={Utensils} onSelect={() => {}} />
            <MovementRow kind="ingreso" category="Pago de la semana" note="Casa de la señora Ana · 7:00 a. m." amountCents={160000} icon={Coins} onSelect={() => {}} />
          </Box>
        </Section>

        <Section figma="DebtCard">
          <DebtCard href="/mi-dinero/deudas/ejemplo" title="Préstamo de mi hermana" kind="Préstamo de una persona" owedCents={150000} paidCents={150000} totalCents={300000} next="$500 el 31 de octubre" icon={Handshake} />
          <DebtCard href="/mi-dinero/deudas/ejemplo" title="Refrigerador" kind="Crédito en tienda, en abonos" owedCents={360000} paidCents={240000} totalCents={600000} next="Abono de $150 el viernes 16 de octubre" icon={Store} />
          <DebtCard href="/mi-dinero/deudas/ejemplo" title="Tarjeta del banco" kind="Tarjeta de crédito" owedCents={280000} paidCents={120000} totalCents={400000} next="Pago mínimo: $350 el 20 de octubre" icon={CreditCard} />
        </Section>

        <Section figma="Chart.WeekBars · neutral y referencia · Chart.WeekPace">
          <WeekBars totalLabel="$773 esta semana" note="Entró: $1,600 (hoy)" days={[{ day: "Lun", cents: 8500 }, { day: "Mar", cents: 55000 }, { day: "Hoy", cents: 13800, today: true }, { day: "Jue", cents: null }, { day: "Vie", cents: null }, { day: "Sáb", cents: null }, { day: "Dom", cents: null }]} />
          <WeekBars totalLabel="$773 esta semana" referenceCents={22900} note="Línea punteada: te alcanza $229 al día (lo que entró ÷ 7). En ámbar, los días arriba de eso." days={[{ day: "Lun", cents: 8500 }, { day: "Mar", cents: 55000 }, { day: "Hoy", cents: 13800, today: true }, { day: "Jue", cents: null }, { day: "Vie", cents: null }, { day: "Sáb", cents: null }, { day: "Dom", cents: null }]} />
          <WeekPace spentCents={77300} incomeCents={160000} daysPassed={3} note="Vas un poco arriba del ritmo: te quedan $827 para 4 días, unos $206 al día." />
        </Section>

        <Section figma="Accordion.Item">
          <AccordionList
            defaultOpen={["quien"]}
            items={[
              { value: "quien", title: "¿Quién paga el registro?", content: "Tus patrones hacen el registro y pagan las cuotas. El registro es gratis: nadie te puede cobrar por hacerlo." },
              { value: "como", title: "¿Cómo se hace?", content: "Tus patrones entran a imss.gob.mx/personas-trabajadoras-hogar con su CURP y su correo." },
              { value: "varias", title: "¿Y si trabajo en varias casas?", content: "Cada casa te registra por su lado y paga sus propias cuotas." },
            ]}
          />
        </Section>

        <Section figma="FeatureItem · Timeline.Item">
          <FeatureItem icon={Smartphone} title="Se queda en tu teléfono" description="No pedimos tu nombre, correo ni número." />
          <FeatureItem icon={HandCoins} title="Evitas pedir prestado" description="Un préstamo cuesta más de lo que te prestan." />
          <NumberedSteps items={[{ title: "Elige un buen momento", description: "Sin prisas, al inicio o al final del día." }, { title: "Lleva tu tarifa", description: "Muéstrales de dónde sale." }]} />
        </Section>

        <Section figma="EmptyState · BackupCode · PinInput">
          <EmptyState icon={Sprout} title="Aún no anotas nada" description="Cuando anotes lo que gastas o lo que te entra, aquí verás cuánto te queda.">
            <Button size="lg">Anotar un gasto</Button>
            <Button variant="outline">Anotar un ingreso</Button>
          </EmptyState>
          <BackupCode code="MILPA-7K3Q-92XD" />
          <PinField label="Elige 4 números que recuerdes" helperText="Para que nadie más vea tu dinero en este teléfono." />
        </Section>

        <Section figma="Drawer">
          <Button variant="outline" onClick={() => setSheet(true)}>Abrir Drawer</Button>
          <BottomSheet
            open={sheet}
            onOpenChange={setSheet}
            eyebrow="Glosario"
            title="Prima vacacional"
            footer={
              <>
                <Button size="lg" onClick={() => setSheet(false)}>Entendido, regresar</Button>
                <Button size="lg" variant="ghost">Ver más en el glosario</Button>
              </>
            }
          >
            Cómo lo decimos: un extra para tus vacaciones. Es un pago adicional del 25 % de lo que te pagan en tus días de vacaciones.
          </BottomSheet>
        </Section>
      </Screen>
    </>
  );
}
