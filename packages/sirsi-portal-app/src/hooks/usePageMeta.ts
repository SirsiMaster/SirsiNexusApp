/**
 * usePageMeta — Sets document title and meta description for SEO
 *
 * Usage: usePageMeta('About | SirsiNexus', 'Learn about Sirsi Technologies...')
 */
import { useEffect } from 'react'

export function usePageMeta(title: string, description?: string) {
    useEffect(() => {
        // Set page title
        document.title = title

        // Set or create meta description
        if (description) {
            let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null
            if (!meta) {
                meta = document.createElement('meta')
                meta.name = 'description'
                document.head.appendChild(meta)
            }
            meta.content = description
        }

        // Cleanup: restore default on unmount
        return () => {
            document.title = 'SirsiNexus — Autonomous Infrastructure OS'
        }
    }, [title, description])
}
