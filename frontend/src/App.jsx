import { useState } from 'react'
import IngredientsPage from './pages/IngredientsPage.jsx'
import RecipesPage from './pages/RecipesPage.jsx'

export default function App() {
  const [activeTab, setActiveTab] = useState('ingredients')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <header style={{
        background: 'var(--green)',
        color: '#fff',
        padding: '0.75rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '2rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
      }}>
        <h1 style={{ fontSize: '1.2rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
          NutriLabel
        </h1>
        <nav style={{ display: 'flex', gap: '0.5rem' }}>
          {['ingredients', 'recipes'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: activeTab === tab ? 'rgba(255,255,255,0.2)' : 'transparent',
                color: '#fff',
                border: activeTab === tab ? '1px solid rgba(255,255,255,0.4)' : '1px solid transparent',
                textTransform: 'capitalize',
                padding: '0.35rem 1rem',
              }}
            >
              {tab}
            </button>
          ))}
        </nav>
      </header>

      <main style={{ flex: 1, padding: '1.5rem', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        {activeTab === 'ingredients' ? <IngredientsPage /> : <RecipesPage />}
      </main>
    </div>
  )
}
