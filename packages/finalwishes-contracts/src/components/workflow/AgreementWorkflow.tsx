import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import '../../styles/admin-layout.css'
import '../../styles/contract.css'
import './styles/themes.css'

import { Sidebar } from '../layout/Sidebar'
import { AdminHeader } from '../layout/AdminHeader'
import { ContractTabs } from '../layout/ContractTabs'
import { useConfigStore, useCurrentTab } from '../../store/useConfigStore'
import { useSettings } from '../../hooks/useAdmin'

// Tab Components
import { ExecutiveSummary } from '../tabs/ExecutiveSummary'
import { ConfigureSolution } from '../tabs/ConfigureSolution'
import { StatementOfWork } from '../tabs/StatementOfWork'
import { CostValuation } from '../tabs/CostValuation'
import { MasterAgreement } from '../tabs/MasterAgreement'
import { SirsiVault } from '../tabs/SirsiVault'

export function AgreementWorkflow() {
  const { projectId, userId, category, entityId, docId } = useParams()
  const currentTab = useCurrentTab()
  const setProjectId = useConfigStore(state => state.setProjectId)
  const storeProjectId = useConfigStore(state => state.projectId)
  const setCurrentTab = useConfigStore(state => state.setCurrentTab)

  const searchParams = new URLSearchParams(window.location.search)
  const isSuccess = searchParams.get('session_id') !== null && window.location.pathname.endsWith('/payment/success')

  const { data: settings } = useSettings()
  const setSystemSettings = useConfigStore(state => state.setSystemSettings)

  const setClientInfo = useConfigStore(state => state.setClientInfo)
  const setStore = useConfigStore.setState

  useEffect(() => {
    // Priority: entityId from hierarchical route > projectId from old route
    const targetProjectId = entityId || projectId
    if (targetProjectId) {
      setProjectId(targetProjectId)
    }

    // If we are in the vault hierarchy, we might want to default to the MSA/Review tab
    if (category === 'contracts' || category === 'partnership') {
      if (docId) {
        setCurrentTab('msa') // Default to review for specific documents
      }
    }

    // Dynamic Personalization via URL Parameters or Hierarchy
    const clientParam = searchParams.get('client') || (userId ? userId.charAt(0).toUpperCase() + userId.slice(1).replace(/-/g, ' ') : null)
    const emailParam = searchParams.get('email') || (userId ? `${userId}@lockhart.com` : null) // Mock fallbacks for Tameeka if userId is used
    const projectParam = searchParams.get('project')
    const companyParam = searchParams.get('company')

    // Counterparty / Entity Info
    const entityParam = searchParams.get('entity')
    const cpNameParam = searchParams.get('cpName')
    const cpTitleParam = searchParams.get('cpTitle')

    if (clientParam || emailParam) {
      setClientInfo(clientParam || '', emailParam || '')
    }
    if (projectParam) {
      setStore({ projectName: projectParam })
    }
    if (companyParam) {
      setStore({ companyName: companyParam })
    }
    if (entityParam || cpNameParam || cpTitleParam) {
      const current = useConfigStore.getState()
      useConfigStore.getState().setCounterpartyInfo(
        entityParam || current.entityLegalName,
        cpNameParam || current.counterpartyName,
        cpTitleParam || current.counterpartyTitle
      )
    }
  }, [projectId, setProjectId, setClientInfo, setStore])

  // Sync global settings (multiplier/maintenance) from Admin
  useEffect(() => {
    if (settings) {
      setSystemSettings({
        multiplier: settings.sirsiMultiplier,
        maintenanceMode: settings.maintenanceMode
      })
    }
  }, [settings, setSystemSettings])


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
        position: 'relative'
      }}>
        {/* Header */}
        <AdminHeader isLightTheme={isLightTheme} onToggleTheme={() => setIsLightTheme(!isLightTheme)} />

        {/* Contract Immersive Wrapper */}
        <div className="contract-immersive-wrapper" style={{
          paddingBottom: '12rem',
          maxWidth: '1500px',
          margin: '0 auto',
          width: '100%'
        }}>
          {/* Contract Header */}
          <div className="contract-hero" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '2rem',
            paddingTop: '2rem',
            paddingBottom: '1.5rem',
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
                fontSize: '3rem',
                letterSpacing: '0.08em',
                marginBottom: '0.5rem',
                marginTop: '0',
                whiteSpace: 'nowrap'
              }}>
                Master Service Agreement
              </h1>
              <div className="contract-gold-divider" style={{
                width: '120px',
                height: '3px',
                background: '#C8A951',
                margin: '1rem 0',
                boxShadow: '0 0 15px rgba(200, 169, 81, 0.5)'
              }} />
              <p className="contract-subtitle" style={{
                fontSize: '1rem',
                letterSpacing: '0.3em',
                fontWeight: 600,
                textTransform: 'uppercase',
                margin: '0'
              }}>
                Prepared for {useConfigStore(state => state.clientName) || 'The Client'} • <span id="date-proposal">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </p>
            </div>
          </div>

          {/* Main Card with Tabs */}
          <div className="main-card" style={{
            maxWidth: '1500px',
            margin: '-2rem auto 0 auto',
            width: '95%',
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
                }}>Your Master Service Agreement with {storeProjectId === 'finalwishes' ? 'FinalWishes' : storeProjectId} is now ACTIVE.</p>
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
