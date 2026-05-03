'use client';

import React, { useState, useEffect } from 'react';
import { Search, Sun, Moon } from 'lucide-react';

export default function FermahLexicon() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // The Complete 30-Term Fermah Lexicon Data
  const terminologies = [
    { term: 'Seeker', definition: 'The demand side of the market. Entities or protocols requesting zero-knowledge proof generation.' },
    { term: 'Operator', definition: 'The supply side of the market. Nodes providing the computational hardware to generate proofs in exchange for rewards.' },
    { term: 'Matchmaker', definition: 'The routing infrastructure that connects Seekers with optimal Operators based on price, hardware, and SLA requirements.' },
    { term: 'Orchestrator', definition: 'The system coordinating the end-to-end workflow between Seekers, Matchmakers, and Operators to ensure proof delivery.' },
    { term: 'ZK Bazaar', definition: 'The open, decentralized marketplace where zero-knowledge proofs are commoditized, priced, and traded.' },
    { term: 'PoG', definition: 'Proof of Generation. A protocol mechanism ensuring computation was actually performed by the Operator without requiring the network to re-run the task.' },
    { term: 'Universal Proof Generation', definition: 'The ability to generate proofs for various different zero-knowledge systems (Halo2, Plonk, Groth16) through a single, unified layer.' },
    { term: 'Matchmaker RPC', definition: 'The Remote Procedure Call endpoint used by Seekers to submit their proof requests directly to the network.' },
    { term: 'Confidential Proving', definition: 'Generating zero-knowledge proofs without revealing the underlying sensitive or private data to the Operator.' },
    { term: 'Asynchronous Compute', definition: 'The architectural ability to request a proof and retrieve it later without blocking or freezing the main application thread.' },
    { term: 'ZKP (Zero-Knowledge Proof)', definition: 'A cryptographic method where one party can prove to another that a statement is true, without revealing any information beyond the validity of the statement.' },
    { term: 'zkVM', definition: 'Zero-Knowledge Virtual Machine. A virtual machine that executes programs and outputs a cryptographic proof that the execution was correct.' },
    { term: 'Proof System', definition: 'The underlying cryptographic protocol (e.g., SNARK, STARK) utilized to generate and subsequently verify a proof.' },
    { term: 'Arithmetic Circuit', definition: 'A low-level mathematical representation of a computation, formatted specifically to be processed by zero-knowledge proof systems.' },
    { term: 'Hardware Acceleration', definition: 'Utilizing specialized hardware components (like GPUs, FPGAs, or ASICs) to drastically speed up the heavy computation of proof generation.' },
    { term: 'Dockerized Proof Systems', definition: 'Packaging proof generation environments into standardized Docker containers for isolated, predictable, and scalable execution.' },
    { term: 'Universal API', definition: 'A single, clean programming interface that allows developers to interact seamlessly with multiple different underlying proof systems.' },
    { term: 'Latency', definition: 'The total time elapsed from the moment a Seeker submits a proof request to the moment they receive the verified proof.' },
    { term: 'SLA', definition: 'Service Level Agreement. The guaranteed performance metrics (like maximum latency or minimum uptime) an Operator commits to delivering.' },
    { term: 'Resource Utilization', definition: 'The efficiency metric measuring how well an Operator’s hardware (CPU/GPU/RAM) is being used during the proof generation cycle.' },
    { term: 'Timeout Setting', definition: 'The maximum allowed time limit for an Operator to generate a proof before the request is aborted or reassigned to a different node.' },
    { term: 'Smart Contract Escrow', definition: 'A decentralized, on-chain mechanism that holds a Seeker’s funds securely until the requested proof is successfully delivered and verified.' },
    { term: 'Commitment Period', definition: 'The specific timeframe during which an Operator locks in their guarantee to generate a requested proof.' },
    { term: 'Verification Cost', definition: 'The computational expense or gas fee required to verify the authenticity of a generated proof, either on-chain or off-chain.' },
    { term: 'Incentivized Testnet', definition: 'A live testing phase where early community participants and operators are rewarded with tokens for stressing the network and identifying bugs.' },
    { term: 'Credible Neutrality', definition: 'A core system design principle ensuring the Fermah protocol does not unfairly advantage or disadvantage any specific participant or entity.' },
    { term: 'Prover Node', definition: 'A dedicated, high-performance machine running the Fermah operator software specifically to compute and generate zero-knowledge proofs.' },
    { term: 'Modular Compatibility', definition: 'The architectural design allowing the Fermah network to seamlessly plug into and support various rollups, L1 blockchains, and applications.' },
    { term: 'Programmable Execution', definition: 'The ability for developers to define complex, automated smart contract logic dictating exactly how and when proofs should be generated.' },
    { term: 'Coprocessor', definition: 'Off-chain infrastructure that handles heavy cryptographic computations on behalf of smart contracts, returning only the verified, lightweight result.' }
  ];

  const filtered = terminologies.filter(t => 
    t.term.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.definition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-fermah-soft dark:bg-fermah-navy text-slate-900 dark:text-gray-100 transition-colors duration-300 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-200 dark:border-fermah-slate bg-white/80 dark:bg-fermah-navy/80 backdrop-blur-md px-6 py-4">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-fermah-teal rounded-lg flex items-center justify-center text-fermah-navy font-bold text-xl">
              π
            </div>
            <span className="text-2xl font-extrabold tracking-tight">Fermah <span className="font-medium text-slate-500">Lexicon</span></span>
          </div>
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)} 
            className="p-2 rounded-xl bg-gray-100 dark:bg-fermah-slate text-fermah-teal hover:bg-gray-200 dark:hover:bg-slate-800 transition"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        
        {/* Search Bar */}
        <div className="relative mb-12">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-6 w-6 text-slate-400" />
          </div>
          <input 
            type="text" 
            placeholder="Search the Proof Market..." 
            className="w-full pl-14 pr-4 py-5 text-lg rounded-2xl bg-white dark:bg-fermah-slate border-2 border-transparent focus:border-fermah-teal focus:ring-4 focus:ring-fermah-teal/10 outline-none shadow-sm dark:shadow-none transition-all placeholder:text-slate-400"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.length > 0 ? (
            filtered.map((item, i) => (
              <div 
                key={i} 
                className="p-8 rounded-2xl bg-white dark:bg-fermah-slate/50 border border-gray-100 dark:border-fermah-slate hover:border-fermah-teal dark:hover:border-fermah-teal transition-colors shadow-sm hover:shadow-md"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{item.term}</h3>
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
                  {item.definition}
                </p>
              </div>
            ))
          ) : (
            <div className="col-span-1 md:col-span-2 text-center py-20">
              <p className="text-xl text-slate-500">No definitions found for "{searchTerm}"</p>
              <p className="text-sm text-slate-400 mt-2">Try searching for "Matchmaker" or "ZK"</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
