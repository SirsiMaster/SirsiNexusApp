import { useState, useEffect } from 'react';
import { db, auth } from '../../lib/firebase';
import { collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';
import { GithubAuthProvider, signInWithPopup } from 'firebase/auth';

interface Project {
    id: string;
    name: string;
    description: string;
    createdAt: string;
    githubRepo?: string;
    status: string;
}

export function DeveloperPortal() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [githubToken, setGithubToken] = useState<string | null>(null);

    const user = auth.currentUser;

    useEffect(() => {
        if (user) {
            loadProjects();
        }
    }, [user]);

    const loadProjects = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const q = query(collection(db, 'projects'), where('ownerId', '==', user.uid));
            const snapshot = await getDocs(q);
            const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
            setProjects(list);
        } catch (error) {
            console.error('Error loading projects:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGithubLink = async () => {
        const provider = new GithubAuthProvider();
        provider.addScope('repo');
        provider.addScope('user:email');

        try {
            const result = await signInWithPopup(auth, provider);
            const credential = GithubAuthProvider.credentialFromResult(result);
            setGithubToken(credential?.accessToken || null);

            // Re-sync profile
            if (result.user) {
                const devData = {
                    uid: result.user.uid,
                    email: result.user.email,
                    githubUsername: (result as any)._tokenResponse?.screenName,
                    lastLogin: new Date().toISOString()
                };
                await setDoc(doc(db, 'developers', result.user.uid), devData, { merge: true });
            }
        } catch (error) {
            console.error('GitHub link error:', error);
        }
    };

    return (
        <div className="flex flex-col gap-10">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="cinzel text-2xl text-gold tracking-widest">Developer Forge</h2>
                    <p className="inter text-xs text-slate-500 mt-1 uppercase tracking-tighter">SDK Management and Application Orchestration</p>
                </div>
                {!githubToken && (
                    <button
                        onClick={handleGithubLink}
                        className="px-6 py-2 bg-white/5 border border-white/10 rounded-lg text-[10px] uppercase font-bold text-slate-300 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                        Link GitHub Account
                    </button>
                )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="neo-glass-panel p-6 border border-white/10 rounded-xl">
                    <span className="inter text-[10px] text-slate-400 uppercase tracking-widest block mb-1">Active Projects</span>
                    <span className="cinzel text-2xl font-bold text-white">{projects.length}</span>
                </div>
                <div className="neo-glass-panel p-6 border border-white/10 rounded-xl">
                    <span className="inter text-[10px] text-slate-400 uppercase tracking-widest block mb-1">API Requests</span>
                    <span className="cinzel text-2xl font-bold text-emerald">24.1k</span>
                </div>
                <div className="neo-glass-panel p-6 border border-white/10 rounded-xl">
                    <span className="inter text-[10px] text-slate-400 uppercase tracking-widest block mb-1">System Latency</span>
                    <span className="cinzel text-2xl font-bold text-blue-400">14ms</span>
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Project List */}
                <div className="lg:col-span-3 flex flex-col gap-6">
                    <div className="neo-glass-panel border border-white/10 rounded-xl overflow-hidden">
                        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                            <h3 className="cinzel text-sm text-gold tracking-[0.2em] font-bold uppercase">Authorized Projects</h3>
                            <button className="px-4 py-2 bg-gold text-navy text-[10px] font-bold uppercase rounded-lg hover:bg-gold-bright transition-all">Create New</button>
                        </div>
                        <div className="p-0">
                            {isLoading ? (
                                <div className="p-10 text-center text-slate-500 inter text-xs uppercase animate-pulse">Synchronizing with registry...</div>
                            ) : projects.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
                                    {projects.map(p => (
                                        <div key={p.id} className="p-4 bg-black/20 border border-white/5 rounded-lg hover:border-gold/30 cursor-pointer transition-all group">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="inter text-sm font-bold text-white group-hover:text-gold transition-colors">{p.name}</h4>
                                                <span className="text-[8px] px-1.5 py-0.5 rounded border border-emerald/50 text-emerald uppercase font-bold">{p.status}</span>
                                            </div>
                                            <p className="inter text-[11px] text-slate-400 line-clamp-2 mb-4">{p.description}</p>
                                            <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono uppercase">
                                                <span>{new Date(p.createdAt).toLocaleDateString()}</span>
                                                {p.githubRepo && <span className="text-blue-400 hover:underline">GitHub Access ✓</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-20 text-center flex flex-col items-center gap-4">
                                    <div className="text-3xl grayscale opacity-30">🚀</div>
                                    <p className="inter text-xs text-slate-500 uppercase tracking-widest">No active deployments found for this identity.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar Tools */}
                <div className="flex flex-col gap-6">
                    <div className="neo-glass-panel p-6 border border-white/10 rounded-xl">
                        <h4 className="inter text-[9px] text-gold font-bold uppercase tracking-widest mb-4">Credentials</h4>
                        <div className="space-y-4">
                            <div className="p-3 bg-black/40 border border-white/10 rounded-lg">
                                <span className="inter text-[8px] text-slate-500 uppercase block mb-1">Production Key</span>
                                <div className="flex justify-between items-center">
                                    <code className="text-[10px] text-slate-300 font-mono">sk_live_...48f2</code>
                                    <button className="text-gold text-[9px] font-bold hover:underline">COPY</button>
                                </div>
                            </div>
                            <button className="w-full py-2 border border-white/10 rounded-lg text-[9px] text-slate-400 uppercase font-bold hover:bg-white/5 transition-all">Rotate Keys</button>
                        </div>
                    </div>

                    <div className="neo-glass-panel p-6 border border-white/10 rounded-xl">
                        <h4 className="inter text-[9px] text-gold font-bold uppercase tracking-widest mb-4">SDK Resources</h4>
                        <div className="flex flex-col gap-2">
                            {['Documentation', 'API Reference', 'Go Client', 'React Hooks'].map(item => (
                                <a key={item} href="#" className="inter text-[11px] text-slate-400 hover:text-white transition-colors flex justify-between items-center py-1 group">
                                    {item}
                                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
