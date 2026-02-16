import { useConfigStore, TABS, useCurrentTab, useVisitedTabs } from '../../store/useConfigStore'
import type { TabId } from '../../store/useConfigStore'

export function TabNavigation() {
    const currentTab = useCurrentTab()
    const visitedTabs = useVisitedTabs()
    const setCurrentTab = useConfigStore((state) => state.setCurrentTab)

    return (
        <nav className="bg-royal-900/50 border-b border-white/10">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex overflow-x-auto scrollbar-thin">
                    {TABS.map((tab) => {
                        const isActive = currentTab === tab.id
                        const isVisited = visitedTabs.includes(tab.id)

                        return (
                            <button
                                key={tab.id}
                                onClick={() => setCurrentTab(tab.id)}
                                className={`
                  relative px-5 py-4 text-sm font-medium whitespace-nowrap
                  transition-all duration-200
                  ${isActive
                                        ? 'text-gold'
                                        : isVisited
                                            ? 'text-white/70 hover:text-white'
                                            : 'text-white/40 hover:text-white/60'
                                    }
                `}
                            >
                                {/* Tab Label */}
                                <span className="relative z-10">{tab.label}</span>

                                {/* Active Indicator */}
                                {isActive && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold" />
                                )}

                                {/* Visited Indicator (small dot) */}
                                {!isActive && isVisited && (
                                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-gold/50" />
                                )}
                            </button>
                        )
                    })}
                </div>
            </div>
        </nav>
    )
}

// Navigation buttons for moving between tabs
interface TabNavButtonsProps {
    hideBack?: boolean
    hideNext?: boolean
    nextLabel?: string
    onNext?: () => void
    onBack?: () => void
}

export function TabNavButtons({
    hideBack = false,
    hideNext = false,
    nextLabel = 'Next',
    onNext,
    onBack
}: TabNavButtonsProps) {
    const currentTab = useCurrentTab()
    const setCurrentTab = useConfigStore((state) => state.setCurrentTab)

    const tabOrder: TabId[] = ['summary', 'configure', 'sow', 'cost', 'msa', 'vault']
    const currentIndex = tabOrder.indexOf(currentTab)
    const prevTab = currentIndex > 0 ? tabOrder[currentIndex - 1] : null
    const nextTab = currentIndex < tabOrder.length - 1 ? tabOrder[currentIndex + 1] : null

    const handleBack = () => {
        if (onBack) {
            onBack()
        } else if (prevTab) {
            setCurrentTab(prevTab)
        }
    }

    const handleNext = () => {
        if (onNext) {
            onNext()
        } else if (nextTab) {
            setCurrentTab(nextTab)
        }
    }

    return (
        <div className="flex justify-between items-center mt-16 mb-12">
            {/* Back Button */}
            {!hideBack && prevTab ? (
                <button onClick={handleBack} className="btn-secondary">
                    <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                    Back
                </button>
            ) : (
                <div />
            )}

            {/* Next Button */}
            {!hideNext && nextTab && (
                <button onClick={handleNext} className="btn-primary">
                    {nextLabel}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                </button>
            )}
        </div>
    )
}
