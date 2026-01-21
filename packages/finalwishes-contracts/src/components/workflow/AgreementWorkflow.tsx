import { useState, useEffect } from 'react'
import '../../styles/admin-layout.css'
import '../../styles/contract.css'
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
          maxWidth: '1500px',
          margin: '0 auto',
          width: '100%',
          background: 'transparent' // Allow main-content to show through if needed, but we want the gradient
        }}>
          {/* Contract Header - ALWAYS DARK HERO DESIGN */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '4rem',
            paddingTop: '6rem',
            paddingBottom: '4rem',
            paddingLeft: '2rem',
            paddingRight: '2rem',
            position: 'relative',
            width: '100%',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0f172a 100%)',
            borderBottom: '1px solid rgba(200, 169, 81, 0.2)'
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
                fontSize: '5rem',
                letterSpacing: '0.15em',
                marginBottom: '1rem',
                marginTop: '1rem',
                color: '#FFFFFF',
                textShadow: '0 4px 30px rgba(0,0,0,0.8), 0 0 20px rgba(200, 169, 81, 0.2)'
              }}>
                Technical Partnership Agreement
              </h1>
              <div className="contract-gold-divider" style={{
                width: '160px',
                height: '4px',
                background: '#C8A951',
                margin: '2rem 0',
                boxShadow: '0 0 15px rgba(200, 169, 81, 0.5)'
              }} />
              <p className="contract-subtitle" style={{
                color: '#FFFFFF',
                fontSize: '1.25rem',
                letterSpacing: '0.4em',
                opacity: 0.9,
                fontWeight: 600,
                textTransform: 'uppercase'
              }}>
                Prepared for Tameeka Lockhart • <span id="date-proposal">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </p>
            </div>
          </div>

          {/* Main Card with Tabs */}
          <div className="main-card" style={{
            maxWidth: '1500px',
            margin: '-2rem auto 0 auto',
            width: '95%',
            background: isLightTheme ? '#fff' : 'rgba(15, 23, 42, 0.8)',
            border: isLightTheme ? '1px solid #e2e8f0' : '1px solid rgba(200, 169, 81, 0.3)',
            boxShadow: isLightTheme ? '0 20px 40px rgba(0, 0, 0, 0.1)' : '0 30px 60px rgba(0,0,0,0.7)',
            backdropFilter: 'blur(20px)',
            zIndex: 10
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
