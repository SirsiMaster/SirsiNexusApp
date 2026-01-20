/**
 * FinalWishes Contracts App
 * Exact migration of the HTML UI to React components
 */
import './styles/admin-layout.css'
import './styles/contract.css'

import { Sidebar } from './components/layout/Sidebar'
import { AdminHeader } from './components/layout/AdminHeader'
import { ContractTabs } from './components/layout/ContractTabs'
import { useCurrentTab } from './store/useConfigStore'

// Tab Components
import { ExecutiveSummary } from './components/tabs/ExecutiveSummary'
import { ConfigureSolution } from './components/tabs/ConfigureSolution'
import { StatementOfWork } from './components/tabs/StatementOfWork'
import { CostValuation } from './components/tabs/CostValuation'
import { MasterAgreement } from './components/tabs/MasterAgreement'
import { SirsiVault } from './components/tabs/SirsiVault'

function App() {
  const currentTab = useCurrentTab()

  // Render the active tab
  const renderTab = () => {
    switch (currentTab) {
      case 'summary':
        return <ExecutiveSummary />
      case 'configure':
        return <ConfigureSolution />
      case 'sow':
        return <StatementOfWork />
      case 'cost':
        return <CostValuation />
      case 'msa':
        return <MasterAgreement />
      case 'vault':
        return <SirsiVault />
      default:
        return <ExecutiveSummary />
    }
  }

  return (
    <div className="admin-wrapper" data-auth-protect="admin">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="main-content contract-view">
        {/* Header */}
        <AdminHeader />

        {/* Contract Immersive Wrapper */}
        <div className="contract-immersive-wrapper" style={{ paddingBottom: '12rem' }}>
          {/* Contract Header */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '5rem',
            paddingTop: '5rem',
            paddingLeft: '1rem',
            paddingRight: '1rem',
            position: 'relative',
            width: '100%',
            maxWidth: '1400px',
            margin: '0 auto'
          }}>
            <div className="contract-title-wrapper" style={{
              textAlign: 'center',
              width: '100%',
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <h1 className="contract-main-heading">
                Technical Partnership Agreement
              </h1>
              <div className="contract-gold-divider" />
              <p className="contract-subtitle">
                Prepared for Tameeka Lockhart • <span id="date-proposal">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </p>
            </div>
          </div>

          {/* Main Card with Tabs */}
          <div className="main-card">
            {/* Tab Navigation */}
            <ContractTabs />

            {/* Tab Content */}
            <div className={`tab-content active`}>
              {renderTab()}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
