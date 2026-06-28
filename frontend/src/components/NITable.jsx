const SECTION_LABELS = {
  energy:          null,             // no header — shown as the prominent top block
  macros:          'Macronutrients',
  vitamins:        'Vitamins',
  minerals:        'Minerals',
  amino_essential: 'Essential Amino Acids',
  amino_ne:        'Non-Essential Amino Acids',
}

const fmt = (v, unit) => {
  const n = parseFloat(v)
  if (isNaN(n)) return '—'
  // decimals based on magnitude
  if (unit === 'kcal' || unit === 'kJ') return n.toFixed(0)
  if (n >= 10)  return n.toFixed(1)
  if (n >= 1)   return n.toFixed(2)
  return n.toFixed(3)
}

export default function NITable({ niData }) {
  if (!niData) {
    return (
      <div style={{
        border: '2.5px solid #1a2333', borderRadius: 3, padding: '2rem 1.25rem',
        fontFamily: 'Georgia, serif', maxWidth: 340,
        color: '#999', textAlign: 'center', background: '#fafafa', fontSize: '0.85rem',
      }}>
        <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.25 }}>🏷</div>
        Add ingredients to generate the Nutrition Information panel.
      </div>
    )
  }

  const { rows, servings, serving_weight_g, total_weight_g } = niData

  // Group rows by section, preserving NUTRIENTS order
  const energyRow = rows.find(r => r.section === 'energy')
  const grouped = {}
  for (const row of rows) {
    if (row.section === 'energy') continue
    if (!grouped[row.section]) grouped[row.section] = []
    grouped[row.section].push(row)
  }

  const toKj = kcal => Math.round(parseFloat(kcal) * 4.184)

  return (
    <div style={{
      border: '2.5px solid #1a2333',
      fontFamily: 'Georgia, "Times New Roman", serif',
      maxWidth: 340,
      background: '#fff',
      fontSize: '0.82rem',
      borderRadius: 3,
    }}>
      {/* Header */}
      <div style={{ background: '#1a2333', color: '#fff', padding: '0.6rem 0.85rem' }}>
        <div style={{ fontSize: '1.35rem', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
          Nutrition Information
        </div>
        <div style={{ fontSize: '0.72rem', marginTop: 4, opacity: 0.8 }}>
          {servings} serving{servings !== 1 ? 's' : ''} per recipe &bull; {serving_weight_g}g per serving
        </div>
      </div>

      {/* Column headers */}
      <div style={{
        display: 'flex', justifyContent: 'flex-end', gap: 0,
        padding: '0.3rem 0.85rem 0.1rem',
        borderBottom: '4px solid #1a2333',
        background: '#f5f5f0',
      }}>
        <ColHead>Per 100g</ColHead>
        <ColHead>Per serving<br />({serving_weight_g}g)</ColHead>
      </div>

      {/* Energy block */}
      {energyRow && (
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '0.45rem 0.85rem',
          borderBottom: '3px solid #1a2333',
          background: '#fffdf6',
        }}>
          <strong style={{ fontSize: '0.9rem' }}>Energy</strong>
          <div style={{ display: 'flex', gap: 0 }}>
            <EnergyCell kcal={energyRow.per_100g} toKj={toKj} />
            <EnergyCell kcal={energyRow.per_serving} toKj={toKj} />
          </div>
        </div>
      )}

      {/* Sections */}
      {Object.entries(grouped).map(([section, sectionRows]) => (
        <div key={section}>
          {SECTION_LABELS[section] && (
            <div style={{
              background: '#f0f0ea',
              padding: '0.25rem 0.85rem',
              fontSize: '0.7rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#555',
              borderTop: '2px solid #ccc',
              fontFamily: 'system-ui, sans-serif',
            }}>
              {SECTION_LABELS[section]}
            </div>
          )}
          {sectionRows.map((row, i) => (
            <NutrientRow key={row.label} row={row} shade={i % 2 === 1} fmt={fmt} />
          ))}
        </div>
      ))}

      <div style={{
        fontSize: '0.68rem', color: '#888', padding: '0.5rem 0.85rem',
        borderTop: '1px solid #ddd', lineHeight: 1.5,
        fontFamily: 'system-ui, sans-serif',
      }}>
        Values calculated from ingredient library (per 100g basis).<br />
        Reference intake: 8400 kJ / 2000 kcal per day.
      </div>
    </div>
  )
}

function ColHead({ children }) {
  return (
    <div style={{
      width: 90, textAlign: 'right',
      fontSize: '0.7rem', fontWeight: 700,
      color: '#1a2333', lineHeight: 1.3,
    }}>
      {children}
    </div>
  )
}

function EnergyCell({ kcal, toKj }) {
  return (
    <div style={{ width: 90, textAlign: 'right' }}>
      <div style={{ fontWeight: 700, fontSize: '0.95rem', fontVariantNumeric: 'tabular-nums' }}>
        {parseFloat(kcal).toFixed(0)} kcal
      </div>
      <div style={{ fontSize: '0.68rem', color: '#777', fontFamily: 'system-ui', fontVariantNumeric: 'tabular-nums' }}>
        {toKj(kcal)} kJ
      </div>
    </div>
  )
}

function NutrientRow({ row, shade, fmt }) {
  const { label, per_100g, per_serving, unit, is_sub_row } = row
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
      padding: `0.28rem ${is_sub_row ? '0.85rem' : '0.85rem'}`,
      paddingLeft: is_sub_row ? '1.6rem' : '0.85rem',
      borderBottom: '1px solid #e8e8e4',
      background: shade ? '#fafaf8' : '#fff',
    }}>
      <span style={{
        fontSize: is_sub_row ? '0.76rem' : '0.82rem',
        fontStyle: is_sub_row ? 'italic' : 'normal',
        color: is_sub_row ? '#555' : '#1a2333',
        fontWeight: is_sub_row ? 400 : 600,
        flex: 1,
      }}>
        {label}
      </span>
      <div style={{ display: 'flex', gap: 0, flexShrink: 0 }}>
        <ValCell value={per_100g} unit={unit} fmt={fmt} sub={is_sub_row} />
        <ValCell value={per_serving} unit={unit} fmt={fmt} sub={is_sub_row} />
      </div>
    </div>
  )
}

function ValCell({ value, unit, fmt, sub }) {
  return (
    <div style={{
      width: 90, textAlign: 'right',
      fontVariantNumeric: 'tabular-nums',
      fontWeight: sub ? 400 : 600,
      fontSize: sub ? '0.76rem' : '0.82rem',
      color: '#1a2333',
    }}>
      {fmt(value, unit)}{unit !== 'kcal' && unit !== 'kJ' ? <span style={{ fontSize: '0.68rem', color: '#888', marginLeft: 1 }}>{unit}</span> : ''}
    </div>
  )
}
