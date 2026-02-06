import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
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
  const setContractId = useConfigStore(state => state.setContractId)
  const fetchContract = useConfigStore(state => state.fetchContract)
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

    if (docId) {
      setContractId(docId)
      fetchContract(docId)
    } else {
      // If no docId, we might be starting a new one or it's a generic project view
      setContractId(null)
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

  // Detect if we're in vault context (hide legacy FinalWishes admin sidebar)
  const isVaultContext = !!userId || !!category
  const navigate = useNavigate()

  return (
    <div className={`admin-wrapper ${isLightTheme ? 'theme-light' : ''}`} data-auth-protect="admin" style={isVaultContext ? { display: 'block' } : undefined}>
      {/* Sidebar - only in legacy admin mode */}
      {!isVaultContext && <Sidebar />}

      {/* Main Content */}
      <main className={`main-content contract-view ${isVaultContext ? 'vault-fullwidth' : ''}`} style={{
        height: '100vh',
        overflowY: 'auto',
        position: 'relative',
        ...(isVaultContext ? { marginLeft: 0, width: '100%' } : {})
      }}>

        {/* Vault Breadcrumb Bar */}
        {isVaultContext && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '12px 24px',
            background: 'rgba(0,0,0,0.3)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            backdropFilter: 'blur(10px)',
          }}>
            <button
              onClick={() => navigate('/vault')}
              style={{
                background: 'rgba(200,169,81,0.1)',
                border: '1px solid rgba(200,169,81,0.25)',
                color: '#C8A951',
                padding: '6px 16px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                letterSpacing: '0.05em',
                transition: 'all 0.2s ease',
              }}
            >
              ← Back to Vault
            </button>
            <div style={{ height: '16px', width: '1px', background: 'rgba(255,255,255,0.1)' }} />
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              {entityId || projectId || 'Contract'} {docId ? `• ${docId.substring(0, 8).toUpperCase()}` : ''}
            </span>
          </div>
        )}

        {/* Header - only in legacy admin mode */}
        {!isVaultContext && (
          <AdminHeader isLightTheme={isLightTheme} onToggleTheme={() => setIsLightTheme(!isLightTheme)} />
        )}

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
