import { useState, useEffect } from 'react'
import './styles/admin-layout.css'
import './styles/contract.css'
import './styles/themes.css'

import { Sidebar } from '../layout/Sidebar'
import { AdminHeader } from '../layout/AdminHeader'
import { ContractTabs } from '../layout/ContractTabs'
import { useCurrentTab } from '../../store/useConfigStore'

// Tab Components
import { ExecutiveSummary } from '../tabs/ExecutiveSummary'
import { ConfigureSolution } from '../tabs/ConfigureSolution'
import { StatementOfWork } from '../tabs/StatementOfWork'
import { CostValuation } from '../tabs/CostValuation'
import { MasterAgreement } from '../tabs/MasterAgreement'
import { SirsiVault } from '../tabs/SirsiVault'

export function AgreementWorkflow() {
  const currentTab = useCurrentTab()
  const searchParams = new URLSearchParams(window.location.search)
  const isSuccess = searchParams.get('session_id') !== null && window.location.pathname.includes('/payment/success')

  const [isLightTheme, setIsLightTheme] = useState(false)

  // Toggle theme on the body for global styles
  useEffect(() => {
    if (isLightTheme) {
      document.body.classList.add('theme-light')
    } else {
      document.body.classList.remove('theme-light')
    }
  }, [isLightTheme])

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
    <div className={`admin-wrapper ${isLightTheme ? 'theme-light' : ''}`} data-auth-protect="admin">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="main-content contract-view" style={{
        height: '100vh',
        overflowY: 'auto',
        position: 'relative',
        background: isLightTheme ? '#f8fafc' : 'transparent'
      }}>
        {/* Header */}
        <AdminHeader isLightTheme={isLightTheme} onToggleTheme={() => setIsLightTheme(!isLightTheme)} />

        {/* Contract Immersive Wrapper */}
        <div className="contract-immersive-wrapper" style={{
          paddingBottom: '12rem',
          maxWidth: '1200px',
          margin: '0 auto',
          width: '100%'
        }}>
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
            width: '100%'
          }}>
            <div className="contract-title-wrapper" style={{
              textAlign: 'center',
              width: '100%',
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <h1 className="contract-main-heading" style={{
                fontSize: '4.5rem',
                letterSpacing: '0.25em',
                marginBottom: '1rem',
                marginTop: '1rem',
                color: isLightTheme ? '#0f172a' : '#C8A951'
              }}>
                Technical Partnership Agreement
              </h1>
              <div className="contract-gold-divider" style={{
                width: '100px',
                height: '4px',
                background: '#C8A951',
                margin: '2rem 0'
              }} />
              <p className="contract-subtitle" style={{
                color: isLightTheme ? '#64748b' : 'rgba(255,255,255,0.7)'
              }}>
                Prepared for Tameeka Lockhart • <span id="date-proposal">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </p>
            </div>
          </div>

          {/* Main Card with Tabs */}
          <div className="main-card" style={{
            maxWidth: '1200px',
            margin: '0 auto',
            width: '100%',
            background: isLightTheme ? '#fff' : 'rgba(255,255,255,0.02)',
            border: isLightTheme ? '1px solid #e2e8f0' : '1px solid rgba(255,255,255,0.1)',
            boxShadow: isLightTheme ? '0 10px 15px -3px rgba(0, 0, 0, 0.1)' : 'none'
          }}>
            {isSuccess ? (
              <div style={{ padding: '4rem', textAlign: 'center' }}>
                <div style={{
                  fontSize: '64px',
                  marginBottom: '1rem'
                }}>✅</div>
                <h2 style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: '32px',
                  color: '#C8A951',
                  marginBottom: '1rem'
                }}>Payment Received!</h2>
                <p style={{
                  fontSize: '18px',
                  color: 'rgba(255,255,255,0.7)',
                  marginBottom: '2rem'
                }}>Your Technical Partnership with FinalWishes is now ACTIVE.</p>
                <button
                  onClick={() => window.location.href = '/vault'}
                  className="select-plan-btn"
                >
                  Access Your Sirsi Vault →
                </button>
              </div>
            ) : (
              <>
                {/* Tab Navigation */}
                <ContractTabs />

                {/* Tab Content */}
                <div className={`tab-content active`}>
                  {renderTab()}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default AgreementWorkflow
