/**
 * ContractTabs Component
 * Tab navigation matching the original HTML - 2-line format
 */
import { useCurrentTab, useSetTab } from '../../store/useConfigStore'

type TabId = 'summary' | 'configure' | 'sow' | 'cost' | 'msa' | 'vault'

interface Tab {
    id: TabId
    line1: string
    line2: string
}

const tabs: Tab[] = [
    { id: 'summary', line1: 'Executive', line2: 'Summary' },
    { id: 'configure', line1: 'Configure', line2: 'Solution' },
    { id: 'sow', line1: 'Statement', line2: 'of Work' },
    { id: 'cost', line1: 'Cost &', line2: 'Valuation' },
    { id: 'msa', line1: 'Master Agreement', line2: '(MSA)' },
    { id: 'vault', line1: 'Sirsi', line2: 'Vault' },
]

export function ContractTabs() {
    const currentTab = useCurrentTab()
    const setTab = useSetTab()

    return (
        <div className="nav-tabs">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    className={`tab-btn ${currentTab === tab.id ? 'active' : ''}`}
                    onClick={() => setTab(tab.id)}
                >
                    <span className="tab-line1">{tab.line1}</span>
                    <span className="tab-line2">{tab.line2}</span>
                </button>
            ))}
        </div>
    )
}

