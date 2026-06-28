import { useState, useEffect, useCallback } from 'react'
import {
  getRecipes, createRecipe, updateRecipe, deleteRecipe,
  getRecipe, addIngredientToRecipe, removeIngredientFromRecipe,
  getIngredients, getNITable
} from '../api.js'
import NITable from '../components/NITable.jsx'

export default function RecipesPage() {
  const [recipes, setRecipes] = useState([])
  const [selected, setSelected] = useState(null)
  const [recipeDetail, setRecipeDetail] = useState(null)
  const [niData, setNiData] = useState(null)
  const [allIngredients, setAllIngredients] = useState([])
  const [search, setSearch] = useState('')
  const [isNew, setIsNew] = useState(false)
  const [newName, setNewName] = useState('')
  const [newServings, setNewServings] = useState(4)
  const [editName, setEditName] = useState('')
  const [editServings, setEditServings] = useState(4)
  const [addIngId, setAddIngId] = useState('')
  const [addWeight, setAddWeight] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const loadRecipes = useCallback(async (q) => {
    try {
      const data = await getRecipes(q !== undefined ? q : search)
      setRecipes(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [search])

  const loadAllIngredients = useCallback(async () => {
    try {
      const data = await getIngredients()
      setAllIngredients(data)
    } catch (e) {
      console.error('Failed to load ingredients:', e)
    }
  }, [])

  useEffect(() => {
    loadRecipes('')
    loadAllIngredients()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => loadRecipes(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  const loadDetail = useCallback(async (id) => {
    try {
      const detail = await getRecipe(id)
      setRecipeDetail(detail)
      setEditName(detail.name)
      setEditServings(detail.servings)
    } catch (e) {
      setError(e.message)
    }
  }, [])

  const refreshNI = useCallback(async (id) => {
    try {
      const ni = await getNITable(id)
      setNiData(ni)
    } catch (e) {
      console.error('Failed to get NI table:', e)
    }
  }, [])

  const selectRecipe = (recipe) => {
    setSelected(recipe)
    setIsNew(false)
    setNiData(null)
    setRecipeDetail(null)
    setError('')
    loadDetail(recipe.id)
    refreshNI(recipe.id)
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!newName.trim()) return
    setSaving(true)
    setError('')
    try {
      const recipe = await createRecipe({ name: newName.trim(), servings: parseInt(newServings, 10) || 4 })
      setIsNew(false)
      setNewName('')
      setNewServings(4)
      await loadRecipes('')
      // Select the newly created recipe
      setSelected(recipe)
      setRecipeDetail(recipe)
      setEditName(recipe.name)
      setEditServings(recipe.servings)
      setNiData(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async () => {
    if (!recipeDetail) return
    setSaving(true)
    setError('')
    try {
      await updateRecipe(recipeDetail.id, {
        name: editName,
        servings: parseInt(editServings, 10) || 4
      })
      await loadRecipes(search)
      await loadDetail(recipeDetail.id)
      await refreshNI(recipeDetail.id)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!recipeDetail) return
    if (!window.confirm(`Delete recipe "${recipeDetail.name}"?`)) return
    setError('')
    try {
      await deleteRecipe(recipeDetail.id)
      setSelected(null)
      setRecipeDetail(null)
      setNiData(null)
      await loadRecipes(search)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleAddIngredient = async (e) => {
    e.preventDefault()
    if (!addIngId || !addWeight) return
    setError('')
    try {
      await addIngredientToRecipe(recipeDetail.id, {
        ingredient_id: addIngId,
        weight_g: parseFloat(addWeight)
      })
      setAddIngId('')
      setAddWeight('')
      await loadDetail(recipeDetail.id)
      await refreshNI(recipeDetail.id)
      await loadRecipes(search)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleRemoveIngredient = async (riId) => {
    setError('')
    try {
      await removeIngredientFromRecipe(recipeDetail.id, riId)
      await loadDetail(recipeDetail.id)
      await refreshNI(recipeDetail.id)
      await loadRecipes(search)
    } catch (err) {
      setError(err.message)
    }
  }

  const showDetail = selected !== null && !isNew

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.5rem', alignItems: 'start' }}>
      {/* Left panel - recipe list */}
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
            placeholder="Search recipes..."
            style={{ flex: 1 }}
          />
          <button
            className="btn-primary"
            onClick={() => {
              setIsNew(true)
              setSelected(null)
              setRecipeDetail(null)
              setNiData(null)
              setError('')
            }}
            style={{ whiteSpace: 'nowrap' }}
          >
            + New
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '1rem', color: 'var(--txt2)' }}>Loading...</div>
        ) : recipes.length === 0 ? (
          <div style={{ padding: '1rem', color: 'var(--txt2)', fontSize: '0.875rem' }}>
            {search ? 'No matches found.' : 'No recipes yet.'}
          </div>
        ) : (
          <ul style={{ listStyle: 'none', maxHeight: '65vh', overflowY: 'auto' }}>
            {recipes.map(r => (
              <li
                key={r.id}
                onClick={() => selectRecipe(r)}
                style={{
                  padding: '0.65rem 1rem',
                  cursor: 'pointer',
                  borderBottom: '1px solid var(--border)',
                  background: selected?.id === r.id ? 'var(--green-light)' : 'transparent',
                  borderLeft: selected?.id === r.id ? '3px solid var(--green)' : '3px solid transparent',
                  transition: 'background 0.1s',
                }}
              >
                <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{r.name}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--txt2)', marginTop: '0.1rem' }}>
                  {r.ingredient_count} ingredient{r.ingredient_count !== 1 ? 's' : ''} &bull; {r.total_kcal} kcal &bull; {r.servings} servings
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Right panel */}
      <div>
        {error && <div className="error-msg" style={{ marginBottom: '1rem' }}>{error}</div>}

        {/* New recipe form */}
        {isNew && (
          <div className="card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--green)' }}>
              New Recipe
            </h2>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label>Recipe Name</label>
                <input
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="e.g. Chicken Rice Bowl"
                  autoFocus
                />
              </div>
              <div style={{ maxWidth: '150px' }}>
                <label>Number of Servings</label>
                <input
                  type="number"
                  min="1"
                  value={newServings}
                  onChange={e => setNewServings(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="submit" className="btn-primary" disabled={saving || !newName.trim()}>
                  {saving ? 'Creating...' : 'Create Recipe'}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => { setIsNew(false); setError('') }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Recipe detail */}
        {showDetail && recipeDetail && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Recipe header - name and servings editor */}
            <div className="card" style={{ padding: '1rem 1.25rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <label>Recipe Name</label>
                  <input
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                  />
                </div>
                <div style={{ width: '110px' }}>
                  <label>Servings</label>
                  <input
                    type="number"
                    min="1"
                    value={editServings}
                    onChange={e => setEditServings(e.target.value)}
                  />
                </div>
                <button
                  className="btn-primary"
                  onClick={handleUpdate}
                  disabled={saving}
                  style={{ flexShrink: 0 }}
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  className="btn-danger"
                  onClick={handleDelete}
                  style={{ flexShrink: 0 }}
                >
                  Delete Recipe
                </button>
              </div>
            </div>

            {/* Add ingredient form */}
            <div className="card" style={{ padding: '1rem 1.25rem' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--txt)' }}>
                Add Ingredient
              </h3>
              <form
                onSubmit={handleAddIngredient}
                style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end', flexWrap: 'wrap' }}
              >
                <div style={{ flex: 2, minWidth: '180px' }}>
                  <label>Ingredient</label>
                  <select value={addIngId} onChange={e => setAddIngId(e.target.value)}>
                    <option value="">-- select ingredient --</option>
                    {allIngredients.map(ing => (
                      <option key={ing.id} value={ing.id}>{ing.name}</option>
                    ))}
                  </select>
                </div>
                <div style={{ flex: 1, minWidth: '110px' }}>
                  <label>Weight (g)</label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={addWeight}
                    onChange={e => setAddWeight(e.target.value)}
                    placeholder="e.g. 150"
                  />
                </div>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={!addIngId || !addWeight}
                  style={{ flexShrink: 0 }}
                >
                  Add
                </button>
              </form>
            </div>

            {/* Ingredients table + NI label */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'start' }}>
              {/* Ingredients table */}
              <div className="card" style={{ overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--green)', color: '#fff' }}>
                      <th style={{ padding: '0.5rem 1rem', textAlign: 'left', fontWeight: 600 }}>Ingredient</th>
                      <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right', fontWeight: 600 }}>Weight (g)</th>
                      <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right', fontWeight: 600 }}>kcal</th>
                      <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right', fontWeight: 600 }}>Fat (g)</th>
                      <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right', fontWeight: 600 }}>Protein (g)</th>
                      <th style={{ padding: '0.5rem 1rem', textAlign: 'center', fontWeight: 600 }}>Remove</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recipeDetail.recipe_ingredients.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          style={{ padding: '2rem', textAlign: 'center', color: 'var(--txt2)' }}
                        >
                          No ingredients yet. Add some above to get started.
                        </td>
                      </tr>
                    ) : (
                      recipeDetail.recipe_ingredients.map((ri, i) => {
                        const kcal = ((ri.weight_g / 100) * ri.ingredient.energy_kcal).toFixed(1)
                        const fat = ((ri.weight_g / 100) * ri.ingredient.fat).toFixed(1)
                        const protein = ((ri.weight_g / 100) * ri.ingredient.protein).toFixed(1)
                        return (
                          <tr
                            key={ri.id}
                            style={{
                              borderBottom: '1px solid var(--border)',
                              background: i % 2 === 0 ? '#fff' : '#fafafa'
                            }}
                          >
                            <td style={{ padding: '0.5rem 1rem', fontWeight: 500 }}>
                              {ri.ingredient.name}
                            </td>
                            <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right' }}>
                              {ri.weight_g}
                            </td>
                            <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right' }}>{kcal}</td>
                            <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right' }}>{fat}</td>
                            <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right' }}>{protein}</td>
                            <td style={{ padding: '0.5rem 1rem', textAlign: 'center' }}>
                              <button
                                className="btn-danger"
                                style={{ padding: '0.2rem 0.55rem', fontSize: '0.8rem' }}
                                onClick={() => handleRemoveIngredient(ri.id)}
                                title="Remove ingredient"
                              >
                                x
                              </button>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                  {recipeDetail.recipe_ingredients.length > 0 && (
                    <tfoot>
                      <tr style={{ background: 'var(--green-light)', fontWeight: 600, borderTop: '2px solid var(--green)' }}>
                        <td style={{ padding: '0.5rem 1rem' }}>Total</td>
                        <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right' }}>
                          {recipeDetail.recipe_ingredients
                            .reduce((s, ri) => s + ri.weight_g, 0)
                            .toFixed(1)}
                        </td>
                        <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right' }}>
                          {recipeDetail.recipe_ingredients
                            .reduce((s, ri) => s + (ri.weight_g / 100) * ri.ingredient.energy_kcal, 0)
                            .toFixed(1)}
                        </td>
                        <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right' }}>
                          {recipeDetail.recipe_ingredients
                            .reduce((s, ri) => s + (ri.weight_g / 100) * ri.ingredient.fat, 0)
                            .toFixed(1)}
                        </td>
                        <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right' }}>
                          {recipeDetail.recipe_ingredients
                            .reduce((s, ri) => s + (ri.weight_g / 100) * ri.ingredient.protein, 0)
                            .toFixed(1)}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>

              {/* NI Table */}
              <NITable niData={recipeDetail.recipe_ingredients.length > 0 ? niData : null} />
            </div>
          </div>
        )}

        {/* Empty state */}
        {!isNew && !showDetail && (
          <div className="card" style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--txt2)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📋</div>
            <div style={{ fontSize: '0.95rem' }}>
              Select a recipe to view its details, or click <strong>+ New</strong> to create one.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
