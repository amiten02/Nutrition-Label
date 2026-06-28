import { useState, useEffect, useCallback } from 'react'
import { getIngredients, createIngredient, updateIngredient, deleteIngredient } from '../api.js'
import IngredientForm from '../components/IngredientForm.jsx'

export default function IngredientsPage() {
  const [ingredients, setIngredients] = useState([])
  const [selected, setSelected] = useState(null)
  const [isNew, setIsNew] = useState(false)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async (q) => {
    try {
      const data = await getIngredients(q !== undefined ? q : search)
      setIngredients(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    load('')
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => load(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  const handleSave = async (data) => {
    if (isNew) {
      const created = await createIngredient(data)
      await load(search)
      setIsNew(false)
      setSelected(created)
    } else {
      await updateIngredient(selected.id, data)
      await load(search)
      setSelected(prev => ({ ...prev, ...data }))
      setIsNew(false)
    }
  }

  const handleDelete = async (id) => {
    await deleteIngredient(id)
    setSelected(null)
    setIsNew(false)
    await load(search)
  }

  const handleCancel = () => {
    setSelected(null)
    setIsNew(false)
  }

  const showForm = isNew || selected !== null

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '1.5rem', alignItems: 'start' }}>
      {/* Left panel - ingredient list */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{
          padding: '0.75rem 1rem',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          gap: '0.5rem',
          alignItems: 'center'
        }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search ingredients..."
            style={{ flex: 1 }}
          />
          <button
            className="btn-primary"
            onClick={() => { setIsNew(true); setSelected(null) }}
            style={{ whiteSpace: 'nowrap' }}
          >
            + New
          </button>
        </div>

        {error && <div className="error-msg" style={{ margin: '0.5rem' }}>{error}</div>}

        {loading ? (
          <div style={{ padding: '1rem', color: 'var(--txt2)' }}>Loading...</div>
        ) : ingredients.length === 0 ? (
          <div style={{ padding: '1rem', color: 'var(--txt2)', fontSize: '0.875rem' }}>
            {search ? 'No matches found.' : 'No ingredients yet.'}
          </div>
        ) : (
          <ul style={{ listStyle: 'none', maxHeight: '65vh', overflowY: 'auto' }}>
            {ingredients.map(ing => (
              <li
                key={ing.id}
                onClick={() => { setSelected(ing); setIsNew(false) }}
                style={{
                  padding: '0.6rem 1rem',
                  cursor: 'pointer',
                  borderBottom: '1px solid var(--border)',
                  background: selected?.id === ing.id ? 'var(--green-light)' : 'transparent',
                  borderLeft: selected?.id === ing.id ? '3px solid var(--green)' : '3px solid transparent',
                  transition: 'background 0.1s',
                }}
              >
                <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{ing.name}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--txt2)', marginTop: '0.1rem' }}>
                  {ing.energy_kcal} kcal &bull; {ing.protein}g protein &bull; {ing.carbs}g carbs
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Right panel - form */}
      <div className="card" style={{ padding: '1.5rem' }}>
        {showForm ? (
          <>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--green)' }}>
              {isNew ? 'New Ingredient' : `Edit: ${selected?.name}`}
            </h2>
            <IngredientForm
              ingredient={isNew ? null : selected}
              onSave={handleSave}
              onCancel={handleCancel}
              onDelete={handleDelete}
            />
          </>
        ) : (
          <div style={{ color: 'var(--txt2)', textAlign: 'center', padding: '3rem 1rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🧪</div>
            <div style={{ fontSize: '0.95rem' }}>
              Select an ingredient to edit, or click <strong>+ New</strong> to add one.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
