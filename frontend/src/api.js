const BASE_URL = import.meta.env.VITE_API_URL || '/api'

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(err || `HTTP ${res.status}`)
  }
  if (res.status === 204) return null
  return res.json()
}

export const getIngredients = (search = '') =>
  request(`/ingredients${search ? `?search=${encodeURIComponent(search)}` : ''}`)

export const createIngredient = (data) =>
  request('/ingredients', { method: 'POST', body: JSON.stringify(data) })

export const updateIngredient = (id, data) =>
  request(`/ingredients/${id}`, { method: 'PUT', body: JSON.stringify(data) })

export const deleteIngredient = (id) =>
  request(`/ingredients/${id}`, { method: 'DELETE' })

export const getRecipes = (search = '') =>
  request(`/recipes${search ? `?search=${encodeURIComponent(search)}` : ''}`)

export const createRecipe = (data) =>
  request('/recipes', { method: 'POST', body: JSON.stringify(data) })

export const getRecipe = (id) =>
  request(`/recipes/${id}`)

export const updateRecipe = (id, data) =>
  request(`/recipes/${id}`, { method: 'PUT', body: JSON.stringify(data) })

export const deleteRecipe = (id) =>
  request(`/recipes/${id}`, { method: 'DELETE' })

export const addIngredientToRecipe = (recipeId, data) =>
  request(`/recipes/${recipeId}/ingredients`, { method: 'POST', body: JSON.stringify(data) })

export const removeIngredientFromRecipe = (recipeId, riId) =>
  request(`/recipes/${recipeId}/ingredients/${riId}`, { method: 'DELETE' })

export const getNITable = (recipeId) =>
  request(`/recipes/${recipeId}/ni-table`)
