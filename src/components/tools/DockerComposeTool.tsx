'use client';

import React from 'react';
import { useDockerCompose } from '@/hooks/useDockerCompose';
import { DockerService } from '@/lib/docker-utils';

export default function DockerComposeTool() {
  const {
    version,
    setVersion,
    services,
    addService,
    removeService,
    updateService,
    yamlOutput
  } = useDockerCompose();

  const handleCopy = () => {
    navigator.clipboard.writeText(yamlOutput);
  };

  return (
    <div className="card-blueprint p-6 md:p-8 space-y-8">
      {/* HUD Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-indigo-600 bg-indigo-50 p-2.5 rounded-sm">view_in_ar</span>
          <div>
            <h2 className="text-slate-900 font-black uppercase tracking-widest text-sm">Compose YAML Architect</h2>
            <p className="text-slate-400 text-xs font-mono">SYSTEM: DOCKER_GEN_v1</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-[10px] font-black uppercase text-slate-400">Version</label>
            <select 
              value={version} 
              onChange={(e) => setVersion(e.target.value)}
              className="text-xs font-mono border border-slate-300 rounded-sm bg-white text-slate-700 px-2 py-1 shadow-none focus:outline-none focus:border-indigo-500"
            >
              <option value="3.8">3.8</option>
              <option value="3.7">3.7</option>
              <option value="3">3</option>
              <option value="2.4">2.4</option>
            </select>
          </div>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-sm border bg-emerald-50 text-emerald-700 border-emerald-200 uppercase flex items-center gap-2">
            <span className="relative inline-flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 animate-radar-ping"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            SYNCED
          </span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-stretch min-h-[600px]">
        {/* Left Column: Services Builder */}
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black text-slate-800 uppercase tracking-widest block">Services Cluster</label>
            <button 
              onClick={addService}
              className="text-[10px] font-black uppercase bg-indigo-50 text-indigo-600 border border-indigo-200 px-3 py-1.5 rounded-sm hover:bg-indigo-100 hover:border-indigo-300 transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[14px]">add</span>
              Add Service
            </button>
          </div>

          <div className="space-y-4 pr-2 max-h-[700px] overflow-y-auto">
            {services.map((service, index) => (
              <ServiceCard 
                key={service.id} 
                service={service} 
                index={index}
                onUpdate={(updates) => updateService(service.id, updates)}
                onRemove={() => removeService(service.id)}
              />
            ))}
          </div>
        </div>

        {/* Right Column: YAML Preview */}
        <div className="flex-1 flex flex-col min-h-[400px]">
          <div className="flex items-center justify-between mb-4">
            <label className="text-xs font-black text-slate-800 uppercase tracking-widest block">Generated YAML</label>
            <button 
              onClick={handleCopy}
              className="text-[10px] font-mono text-slate-400 hover:text-indigo-600 transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[14px]">content_copy</span>
              COPY
            </button>
          </div>
          
          <div className="flex-1 bg-slate-800 border border-slate-700 rounded-sm relative overflow-hidden flex flex-col group">
            <div className="absolute inset-0 bg-blueprint opacity-[0.05] pointer-events-none mix-blend-overlay"></div>
            
            <textarea
              readOnly
              value={yamlOutput}
              className="w-full h-full min-h-[400px] flex-1 bg-transparent text-indigo-200 p-4 font-mono text-xs focus:outline-none resize-none shadow-none"
              spellCheck={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-component for individual service configuration
interface ServiceCardProps {
  service: DockerService;
  index: number;
  onUpdate: (updates: Partial<DockerService>) => void;
  onRemove: () => void;
}

function ServiceCard({ service, index, onUpdate, onRemove }: ServiceCardProps) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-sm p-4 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Service #{index + 1}
        </span>
        <button 
          onClick={onRemove}
          className="text-rose-400 hover:text-rose-600 transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">delete</span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[9px] font-black uppercase text-slate-500">Service Name</label>
          <input 
            type="text" 
            value={service.name} 
            onChange={e => onUpdate({ name: e.target.value })}
            placeholder="e.g. web, db"
            className="w-full border border-slate-300 rounded-sm px-2 py-1 text-sm font-mono focus:border-indigo-400 focus:outline-none shadow-none"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[9px] font-black uppercase text-slate-500">Image</label>
          <input 
            type="text" 
            value={service.image} 
            onChange={e => onUpdate({ image: e.target.value })}
            placeholder="e.g. nginx:latest"
            className="w-full border border-slate-300 rounded-sm px-2 py-1 text-sm font-mono focus:border-indigo-400 focus:outline-none shadow-none"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-[9px] font-black uppercase text-slate-500">Restart Policy</label>
        <select 
          value={service.restart}
          onChange={e => onUpdate({ restart: e.target.value as any })}
          className="w-full border border-slate-300 rounded-sm px-2 py-1 text-xs font-mono bg-white focus:border-indigo-400 focus:outline-none shadow-none"
        >
          <option value="no">no</option>
          <option value="always">always</option>
          <option value="on-failure">on-failure</option>
          <option value="unless-stopped">unless-stopped</option>
        </select>
      </div>

      {/* Ports List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[9px] font-black uppercase text-slate-500">Ports</label>
          <button 
            onClick={() => onUpdate({ ports: [...service.ports, { host: '', container: '' }] })}
            className="text-[9px] font-bold text-indigo-500 hover:text-indigo-700 uppercase"
          >
            + Add Port
          </button>
        </div>
        {service.ports.map((port, pIdx) => (
          <div key={pIdx} className="flex items-center gap-2">
            <input 
              type="text" 
              placeholder="Host (e.g. 8080)" 
              value={port.host}
              onChange={e => {
                const newPorts = [...service.ports];
                newPorts[pIdx].host = e.target.value;
                onUpdate({ ports: newPorts });
              }}
              className="flex-1 border border-slate-300 rounded-sm px-2 py-1 text-xs font-mono focus:border-indigo-400 focus:outline-none shadow-none"
            />
            <span className="text-slate-400 font-bold">:</span>
            <input 
              type="text" 
              placeholder="Container (e.g. 80)" 
              value={port.container}
              onChange={e => {
                const newPorts = [...service.ports];
                newPorts[pIdx].container = e.target.value;
                onUpdate({ ports: newPorts });
              }}
              className="flex-1 border border-slate-300 rounded-sm px-2 py-1 text-xs font-mono focus:border-indigo-400 focus:outline-none shadow-none"
            />
            <button 
              onClick={() => {
                const newPorts = [...service.ports];
                newPorts.splice(pIdx, 1);
                onUpdate({ ports: newPorts });
              }}
              className="text-rose-400 hover:text-rose-600"
            >
              <span className="material-symbols-outlined text-[14px]">close</span>
            </button>
          </div>
        ))}
      </div>

      {/* Env List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[9px] font-black uppercase text-slate-500">Environment Variables</label>
          <button 
            onClick={() => onUpdate({ environment: [...service.environment, { key: '', value: '' }] })}
            className="text-[9px] font-bold text-indigo-500 hover:text-indigo-700 uppercase"
          >
            + Add Env
          </button>
        </div>
        {service.environment.map((env, eIdx) => (
          <div key={eIdx} className="flex items-center gap-2">
            <input 
              type="text" 
              placeholder="KEY" 
              value={env.key}
              onChange={e => {
                const newEnvs = [...service.environment];
                newEnvs[eIdx].key = e.target.value;
                onUpdate({ environment: newEnvs });
              }}
              className="flex-[0.4] border border-slate-300 rounded-sm px-2 py-1 text-xs font-mono focus:border-indigo-400 focus:outline-none shadow-none uppercase"
            />
            <span className="text-slate-400 font-bold">=</span>
            <input 
              type="text" 
              placeholder="value" 
              value={env.value}
              onChange={e => {
                const newEnvs = [...service.environment];
                newEnvs[eIdx].value = e.target.value;
                onUpdate({ environment: newEnvs });
              }}
              className="flex-1 border border-slate-300 rounded-sm px-2 py-1 text-xs font-mono focus:border-indigo-400 focus:outline-none shadow-none"
            />
            <button 
              onClick={() => {
                const newEnvs = [...service.environment];
                newEnvs.splice(eIdx, 1);
                onUpdate({ environment: newEnvs });
              }}
              className="text-rose-400 hover:text-rose-600"
            >
              <span className="material-symbols-outlined text-[14px]">close</span>
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}
