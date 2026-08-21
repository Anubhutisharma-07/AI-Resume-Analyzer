import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Route, Map, ArrowRight, ShieldCheck, Star, Briefcase, Zap, Clock, Code, TrendingUp } from 'lucide-react';
import axios from 'axios';
import { Footer } from '../Footer';
import './CareerPath.css';

interface Milestone {
    id: number;
    title: string;
    timeframe: string;
    skills: string[];
    description: string;
    order: number;
}

interface CareerPathData {
    path_id: number;
    target_role: string;
    current_role: string;
    milestones: Milestone[];
}

export const CareerPathVisualizerPage: React.FC = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [targetRole, setTargetRole] = useState('Senior Software Engineer');
    const [pathData, setPathData] = useState<CareerPathData | null>(null);

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post(
                'http://localhost:8000/api/career-path/generate/',
                { target_role: targetRole },
                { headers: { Authorization: `Bearer ${localStorage.getItem('access')}` } }
            );
            setPathData(response.data);
        } catch (error) {
            console.error('Failed to generate career path:', error);
            alert('Failed to generate path. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="career-path-page min-h-screen">
            <div className="container mx-auto px-4 py-8">

                <div className="mb-8 border-b border-white/10 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500 flex items-center gap-3">
                            <Map className="text-purple-400" size={32} />
                            AI Career Path Visualizer
                        </h1>
                        <p className="text-slate-400 mt-2">Project your 5-10 year career trajectory and see exactly what skills you step towards.</p>
                    </div>

                    <form onSubmit={handleGenerate} className="flex max-w-lg w-full gap-2">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                value={targetRole}
                                onChange={(e) => setTargetRole(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-11 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                                placeholder="Ultimate Goal (e.g., Staff Engineer)"
                                required
                            />
                            <Briefcase size={18} className="absolute left-4 top-3.5 text-slate-400" />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`px-6 rounded-xl font-bold transition-all flex items-center gap-2 ${loading ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'app-btn-purple text-white hover:scale-105'
                                }`}
                        >
                            {loading ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            ) : (
                                <>Visualize <TrendingUp size={18} /></>
                            )}
                        </button>
                    </form>
                </div>

                {!pathData && !loading && (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-32 h-32 bg-purple-500/10 rounded-full flex items-center justify-center mb-6 border border-purple-500/20">
                            <Route size={48} className="text-purple-400 opacity-50" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Map Your Future</h2>
                        <p className="text-slate-400 max-w-lg text-lg">Enter your ultimate career goal above to generate a step-by-step roadmap tailored to your current resume skills.</p>
                    </div>
                )}

                {loading && (
                    <div className="flex flex-col items-center justify-center py-32">
                        <div className="relative w-24 h-24 mb-6">
                            <div className="absolute inset-0 border-4 border-purple-500/20 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-t-purple-500 rounded-full animate-spin"></div>
                            <Map size={32} className="absolute inset-0 m-auto text-purple-400" />
                        </div>
                        <p className="text-purple-300 font-medium text-lg pulsing-text">Analyzing career trajectories...</p>
                    </div>
                )}

                {pathData && !loading && (
                    <div className="timeline-container relative py-10 max-w-5xl mx-auto">
                        {/* The vertical connector line */}
                        <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 via-pink-500 to-orange-400 opacity-20 transform -translate-x-1/2 rounded-full"></div>

                        <div className="space-y-12">
                            {pathData.milestones.map((milestone, idx) => (
                                <div key={milestone.id} className={`flex flex-col md:flex-row items-center justify-between w-full relative milestone-card animate-fade-in`} style={{ animationDelay: `${idx * 150}ms` }}>

                                    {/* Timeline Badge (Center) */}
                                    <div className="hidden md:flex absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-slate-900 border-4 border-purple-500 rounded-full items-center justify-center z-10 box-glow text-white font-bold">
                                        {idx === 0 ? <Zap size={20} className="text-yellow-400" /> : idx === pathData.milestones.length - 1 ? <Star size={20} className="text-orange-400" /> : <ArrowRight size={20} className="text-purple-400" />}
                                    </div>

                                    {/* Left or Right Content Card */}
                                    <div className={`w-full md:w-5/12 ${idx % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12 md:text-left md:ml-auto'}`}>
                                        <div className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-purple-500/30 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-500/10">

                                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4 ${idx === 0 ? 'bg-teal-500/20 text-teal-300' : 'bg-purple-500/20 text-purple-300'
                                                }`}>
                                                <Clock size={12} /> {milestone.timeframe}
                                            </div>

                                            <h3 className="text-2xl font-bold text-white mb-2">{milestone.title}</h3>
                                            <p className="text-slate-400 mb-6 leading-relaxed">{milestone.description}</p>

                                            <div>
                                                <h4 className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-3 flex items-center gap-2 justify-start md:justify-start">
                                                    <Code size={14} /> Core Required Skills
                                                </h4>
                                                <div className={`flex flex-wrap gap-2 ${idx % 2 === 0 ? 'md:justify-end' : 'md:justify-start'}`}>
                                                    {milestone.skills.map((skill, sIdx) => (
                                                        <span key={sIdx} className="bg-white/5 border border-white/10 px-3 py-1 rounded-full text-sm text-slate-200">
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-16 text-center">
                            <h4 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500">
                                You've reached your goal: {pathData.target_role}
                            </h4>
                        </div>
                    </div>
                )}

            </div>
            <Footer />
        </div>
    );
};
