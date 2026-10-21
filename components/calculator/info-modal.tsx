import { coefAt, formatPct, type Character } from '@/lib/characters'
import { currentUltimateName, type SlotState } from '@/lib/calc'
import { ModalShell, Templated } from './modal-shell'

export function InfoModal({
  open,
  onClose,
  character,
  slot,
}: {
  open: boolean
  onClose: () => void
  character: Character
  slot: SlotState
}) {
  const { normal, ultimate, passive, passive2, exclusive } = character
  const sections = [
    { title: '特性', body: character.trait },
    {
      title: '狂瞳深化',
      badge: slot.madness ? 'ON' : 'OFF',
      body: <Templated text={character.madness.text} values={{ v: formatPct(character.madness.dmgPct) }} />,
    },
    {
      title: '通常攻撃',
      badge: `Lv${slot.normalLv}`,
      body: <Templated text={normal.text} values={{ v: formatPct(coefAt(normal.base, normal.perLevel, slot.normalLv)) }} />,
    },
    {
      title: `必殺技【${currentUltimateName(character, slot.rebuild)}】`,
      badge: `Lv${slot.ultimateLv}`,
      body: (
        <Templated
          text={ultimate.text}
          values={{ v: formatPct(coefAt(ultimate.base, ultimate.perLevel, slot.ultimateLv)) }}
        />
      ),
    },
    {
      title: 'パッシブ1',
      badge: `Lv${slot.passiveLv}`,
      body: (
        <Templated
          text={passive.text}
          values={{
            v: formatPct(coefAt(passive.base, passive.perLevel, slot.passiveLv)),
            b: formatPct(coefAt(passive.buffBase, passive.buffPerLevel, slot.passiveLv)),
          }}
        />
      ),
    },
    {
      title: 'パッシブ2',
      badge: `Lv${slot.passive2Lv}`,
      body: (
        <Templated
          text={passive2.text}
          values={{ b: formatPct(coefAt(passive2.buffBase, passive2.buffPerLevel, slot.passive2Lv)) }}
        />
      ),
    },
  ]

  return (
    <ModalShell open={open} onClose={onClose} eyebrow="Convict Info" title={`${character.name}　情報`} size="lg">
      <div className="flex flex-col gap-6 p-5 sm:p-6">
        {sections.map((s) => (
          <InfoSection key={s.title} title={s.title} badge={s.badge}>
            {s.body}
          </InfoSection>
        ))}

        <InfoSection title="枷" badge={`${slot.shackle} / ${character.shackles.length}`}>
          <ol className="divide-y divide-border border border-border">
            {character.shackles.map((sh, i) => {
              const unlocked = i < slot.shackle
              return (
                <li
                  key={sh.name}
                  className={`grid grid-cols-[2rem_7rem_1fr] gap-3 px-3 py-2.5 text-sm sm:grid-cols-[2.5rem_9rem_1fr] ${
                    unlocked ? 'bg-primary/15' : 'text-muted-foreground'
                  }`}
                >
                  <span className={`font-mono ${unlocked ? 'text-primary' : ''}`}>{i + 1}</span>
                  <span className={unlocked ? 'font-bold text-foreground' : ''}>{sh.name}</span>
                  <span className="text-pretty">{sh.text}</span>
                </li>
              )
            })}
          </ol>
        </InfoSection>

        <InfoSection title="専属刻印" badge={slot.exclusiveLv > 0 ? `Lv${slot.exclusiveLv}` : '未所持'}>
          <span className={slot.exclusiveLv > 0 ? '' : 'text-muted-foreground'}>
            <Templated
              text={exclusive.text}
              values={{ v: formatPct(coefAt(exclusive.base, exclusive.perLevel, Math.max(1, slot.exclusiveLv))) }}
            />
          </span>
        </InfoSection>
      </div>
    </ModalShell>
  )
}

function InfoSection({ title, badge, children }: { title: string; badge?: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-1.5 flex items-center gap-2 font-bold">
        <span aria-hidden="true" className="h-4 w-1 bg-primary" />
        {title}
        {badge && (
          <span className="border border-accent/60 px-1.5 font-mono text-[10px] font-normal text-accent">{badge}</span>
        )}
      </h3>
      <div className="text-sm leading-relaxed text-pretty">{children}</div>
    </section>
  )
}
