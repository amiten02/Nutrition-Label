import { useState, useEffect } from 'react'

// ── Field definitions per section ─────────────────────────────────────────────
const SECTIONS = [
  {
    id: 'core',
    label: 'Core Macronutrients',
    required: true,
    fields: [
      { key: 'energy_kcal', label: 'Energy', unit: 'kcal', required: true },
      { key: 'fat',         label: 'Fat',    unit: 'g',    required: true },
      { key: 'carbs',       label: 'Carbohydrate', unit: 'g', required: true },
      { key: 'fibre',       label: 'Fibre',  unit: 'g',    required: true },
      { key: 'protein',     label: 'Protein',unit: 'g',    required: true },
      { key: 'salt',        label: 'Salt',   unit: 'g',    required: true },
    ],
  },
  {
    id: 'fats',
    label: 'Fat Breakdown',
    fields: [
      { key: 'sat_fat',   label: 'Saturated Fat',       unit: 'g'  },
      { key: 'mono_fat',  label: 'Monounsaturated Fat',  unit: 'g'  },
      { key: 'poly_fat',  label: 'Polyunsaturated Fat',  unit: 'g'  },
      { key: 'trans_fat', label: 'Trans Fat',             unit: 'g'  },
      { key: 'cholesterol',label: 'Cholesterol',          unit: 'mg' },
      { key: 'omega_3',   label: 'Omega-3 Fatty Acids',  unit: 'mg' },
      { key: 'omega_6',   label: 'Omega-6 Fatty Acids',  unit: 'mg' },
    ],
  },
  {
    id: 'carbs',
    label: 'Carbohydrate Breakdown',
    fields: [
      { key: 'sugars',      label: 'Sugars',       unit: 'g'  },
      { key: 'added_sugars',label: 'Added Sugars', unit: 'g'  },
      { key: 'starch',      label: 'Starch',       unit: 'g'  },
      { key: 'sodium',      label: 'Sodium',       unit: 'mg' },
    ],
  },
  {
    id: 'vitamins',
    label: 'Vitamins',
    fields: [
      { key: 'vit_a',   label: 'Vitamin A',                   unit: 'mcg' },
      { key: 'vit_b1',  label: 'Vitamin B1 (Thiamine)',        unit: 'mg'  },
      { key: 'vit_b2',  label: 'Vitamin B2 (Riboflavin)',      unit: 'mg'  },
      { key: 'vit_b3',  label: 'Vitamin B3 (Niacin)',          unit: 'mg'  },
      { key: 'vit_b5',  label: 'Vitamin B5 (Pantothenic Acid)',unit: 'mg'  },
      { key: 'vit_b6',  label: 'Vitamin B6',                   unit: 'mg'  },
      { key: 'vit_b7',  label: 'Vitamin B7 (Biotin)',          unit: 'mcg' },
      { key: 'vit_b9',  label: 'Vitamin B9 (Folate)',          unit: 'mcg' },
      { key: 'vit_b12', label: 'Vitamin B12',                  unit: 'mcg' },
      { key: 'vit_c',   label: 'Vitamin C',                    unit: 'mg'  },
      { key: 'vit_d',   label: 'Vitamin D',                    unit: 'mcg' },
      { key: 'vit_e',   label: 'Vitamin E',                    unit: 'mg'  },
      { key: 'vit_k',   label: 'Vitamin K',                    unit: 'mcg' },
    ],
  },
  {
    id: 'minerals',
    label: 'Minerals',
    fields: [
      { key: 'calcium',    label: 'Calcium',    unit: 'mg'  },
      { key: 'chloride',   label: 'Chloride',   unit: 'mg'  },
      { key: 'chromium',   label: 'Chromium',   unit: 'mcg' },
      { key: 'copper',     label: 'Copper',     unit: 'mg'  },
      { key: 'fluoride',   label: 'Fluoride',   unit: 'mg'  },
      { key: 'iodine',     label: 'Iodine',     unit: 'mcg' },
      { key: 'iron',       label: 'Iron',       unit: 'mg'  },
      { key: 'magnesium',  label: 'Magnesium',  unit: 'mg'  },
      { key: 'manganese',  label: 'Manganese',  unit: 'mg'  },
      { key: 'molybdenum', label: 'Molybdenum', unit: 'mcg' },
      { key: 'phosphorus', label: 'Phosphorus', unit: 'mg'  },
      { key: 'potassium',  label: 'Potassium',  unit: 'mg'  },
      { key: 'selenium',   label: 'Selenium',   unit: 'mcg' },
      { key: 'zinc',       label: 'Zinc',       unit: 'mg'  },
    ],
  },
  {
    id: 'amino_e',
    label: 'Essential Amino Acids',
    fields: [
      { key: 'aa_histidine',    label: 'Histidine',    unit: 'g' },
      { key: 'aa_isoleucine',   label: 'Isoleucine',   unit: 'g' },
      { key: 'aa_leucine',      label: 'Leucine',      unit: 'g' },
      { key: 'aa_lysine',       label: 'Lysine',       unit: 'g' },
      { key: 'aa_methionine',   label: 'Methionine',   unit: 'g' },
      { key: 'aa_phenylalanine',label: 'Phenylalanine',unit: 'g' },
      { key: 'aa_threonine',    label: 'Threonine',    unit: 'g' },
      { key: 'aa_tryptophan',   label: 'Tryptophan',   unit: 'g' },
      { key: 'aa_valine',       label: 'Valine',       unit: 'g' },
    ],
  },
  {
    id: 'amino_ne',
    label: 'Non-Essential Amino Acids',
    fields: [
      { key: 'aa_alanine',      label: 'Alanine',      unit: 'g' },
      { key: 'aa_arginine',     label: 'Arginine',     unit: 'g' },
      { key: 'aa_asparagine',   label: 'Asparagine',   unit: 'g' },
      { key: 'aa_aspartic_acid',label: 'Aspartic Acid',unit: 'g' },
      { key: 'aa_cysteine',     label: 'Cysteine',     unit: 'g' },
      { key: 'aa_glutamic_acid',label: 'Glutamic Acid',unit: 'g' },
      { key: 'aa_glutamine',    label: 'Glutamine',    unit: 'g' },
      { key: 'aa_glycine',      label: 'Glycine',      unit: 'g' },
      { key: 'aa_proline',      label: 'Proline',      unit: 'g' },
      { key: 'aa_serine',       label: 'Serine',       unit: 'g' },
      { key: 'aa_tyrosine',     label: 'Tyrosine',     unit: 'g' },
    ],
  },
]

// All field keys across all sections
const ALL_KEYS = SECTIONS.flatMap(s => s.fields.map(f => f.key))
const CORE_KEYS = new Set(SECTIONS[0].fields.map(f => f.key))

function emptyForm() {
  const f = { name: '' }
  ALL_KEYS.forEach(k => { f[k] = '' })
  return f
}

function ingredientToForm(ing) {
  const f = { name: ing.name || '' }
  ALL_KEYS.forEach(k => {
    const v = ing[k]
    f[k] = v !== null && v !== undefined ? String(v) : ''
  })
  return f
}

export default function IngredientForm({ ingredient, onSave, onCancel, onDelete }) {
  const [form, setForm]         = useState(emptyForm())
  const [open, setOpen]         = useState({ core: true })
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')

  useEffect(() => {
    setForm(ingredient ? ingredientToForm(ingredient) : emptyForm())
    setOpen({ core: true })
    setError('')
  }, [ingredient])

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))
  const toggle = id => setOpen(o => ({ ...o, [id]: !o[id] }))

  const kj = form.energy_kcal !== '' ? Math.round(parseFloat(form.energy_kcal) * 4.184) : null

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.name.trim()) { setError('Ingredient name is required'); return }
    setSaving(true); setError('')
    try {
      const data = { name: form.name.trim() }
      ALL_KEYS.forEach(k => {
        const raw = form[k]
        if (raw === '' || raw === null) {
          data[k] = CORE_KEYS.has(k) ? 0 : null
        } else {
          const n = parseFloat(raw)
          data[k] = isNaN(n) ? (CORE_KEYS.has(k) ? 0 : null) : n
        }
      })
      await onSave(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = () => {
    if (window.confirm(`Delete "${form.name}"? It will be removed from all recipes.`))
      onDelete(ingredient.id)
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

      {/* Name */}
      <div>
        <label>Ingredient Name *</label>
        <input
          value={form.name}
          onChange={e => set('name', e.target.value)}
          placeholder="e.g. Whole Wheat Flour"
          autoFocus
        />
      </div>

      <p style={{ fontSize: '0.78rem', color: 'var(--txt2)', marginTop: '-0.25rem' }}>
        All values per 100g · Optional sections can be left blank
      </p>

      {/* Sections */}
      {SECTIONS.map(section => {
        const isOpen = open[section.id] !== false
        const filledCount = section.fields.filter(f => form[f.key] !== '').length
        return (
          <div key={section.id} style={{
            border: '1px solid var(--border)',
            borderRadius: '6px',
            overflow: 'hidden',
          }}>
            <button
              type="button"
              onClick={() => toggle(section.id)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.6rem 0.875rem',
                background: isOpen ? 'var(--green-light)' : 'var(--bg)',
                border: 'none', cursor: 'pointer',
                fontFamily: 'inherit', fontWeight: 600, fontSize: '0.82rem',
                color: isOpen ? 'var(--green)' : 'var(--txt)',
                borderBottom: isOpen ? '1px solid var(--border)' : 'none',
              }}
            >
              <span>
                {section.label}
                {section.required && <span style={{ color: 'var(--danger)', marginLeft: 4 }}>*</span>}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem', fontWeight: 400, color: 'var(--txt2)' }}>
                {filledCount > 0 && !section.required && (
                  <span style={{ background: 'var(--green)', color: '#fff', borderRadius: 99, padding: '1px 7px', fontSize: '0.72rem', fontWeight: 600 }}>
                    {filledCount} filled
                  </span>
                )}
                {isOpen ? '▲' : '▼'}
              </span>
            </button>

            {isOpen && (
              <div style={{ padding: '0.875rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                {section.fields.map(f => (
                  <FieldInput
                    key={f.key}
                    field={f}
                    value={form[f.key]}
                    onChange={val => set(f.key, val)}
                    highlight={f.key === 'energy_kcal'}
                  />
                ))}
                {section.id === 'core' && kj !== null && (
                  <div style={{
                    gridColumn: '1/-1',
                    background: 'var(--green-light)',
                    padding: '0.4rem 0.65rem',
                    borderRadius: 4,
                    fontSize: '0.78rem',
                    color: 'var(--green)',
                  }}>
                    ⚡ {parseFloat(form.energy_kcal).toFixed(1)} kcal = {kj} kJ per 100g
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}

      {error && <div className="error-msg">{error}</div>}

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', paddingTop: '0.25rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving…' : ingredient ? 'Update' : 'Create'}
          </button>
          <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
        </div>
        {ingredient && (
          <button type="button" className="btn-danger" onClick={handleDelete}>Delete</button>
        )}
      </div>
    </form>
  )
}

function FieldInput({ field, value, onChange, highlight }) {
  return (
    <div>
      <label style={{ color: highlight ? 'var(--amber)' : undefined }}>
        {field.label}
        <span style={{ marginLeft: 4, fontWeight: 400, color: 'var(--txt3)', fontSize: '0.75rem' }}>
          ({field.unit})
        </span>
      </label>
      <div style={{ position: 'relative' }}>
        <input
          type="number"
          min="0"
          step="0.0001"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="—"
          style={{
            paddingRight: `${field.unit.length * 8 + 14}px`,
            borderColor: highlight && value ? 'var(--amber)' : undefined,
          }}
        />
        <span style={{
          position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
          fontSize: '0.75rem', color: 'var(--txt3)', pointerEvents: 'none',
        }}>
          {field.unit}
        </span>
      </div>
    </div>
  )
}
