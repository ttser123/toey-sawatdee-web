import { useState, useMemo } from 'react';
import { DockerService, DockerComposeConfig, generateDockerComposeYaml } from '@/lib/docker-utils';

export function useDockerCompose() {
  const [version, setVersion] = useState<string>('3.8');
  
  const [services, setServices] = useState<DockerService[]>([
    {
      id: Math.random().toString(36).substring(7),
      name: 'web',
      image: 'nginx:alpine',
      ports: [{ host: '8080', container: '80' }],
      volumes: [],
      environment: [],
      restart: 'unless-stopped',
      dependsOn: []
    }
  ]);

  const addService = () => {
    setServices(prev => [
      ...prev,
      {
        id: Math.random().toString(36).substring(7),
        name: `service_${prev.length + 1}`,
        image: 'ubuntu:latest',
        ports: [],
        volumes: [],
        environment: [],
        restart: 'no',
        dependsOn: []
      }
    ]);
  };

  const removeService = (id: string) => {
    setServices(prev => prev.filter(s => s.id !== id));
  };

  const updateService = (id: string, updates: Partial<DockerService>) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  // Memoize YAML generation so it updates purely based on state
  const yamlOutput = useMemo(() => {
    const config: DockerComposeConfig = {
      version,
      services
    };
    return generateDockerComposeYaml(config);
  }, [version, services]);

  return {
    version,
    setVersion,
    services,
    addService,
    removeService,
    updateService,
    yamlOutput
  };
}
