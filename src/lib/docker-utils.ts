export interface DockerPort {
  host: string;
  container: string;
}

export interface DockerVolume {
  host: string;
  container: string;
}

export interface DockerEnv {
  key: string;
  value: string;
}

export interface DockerService {
  id: string; // Internal ID for React keys
  name: string;
  image: string;
  ports: DockerPort[];
  volumes: DockerVolume[];
  environment: DockerEnv[];
  restart: 'no' | 'always' | 'on-failure' | 'unless-stopped';
  dependsOn: string[];
}

export interface DockerComposeConfig {
  version: string;
  services: DockerService[];
}

export function generateDockerComposeYaml(config: DockerComposeConfig): string {
  if (!config.services || config.services.length === 0) {
    return `version: '${config.version}'\nservices: {}`;
  }

  let yaml = `version: '${config.version}'\n\nservices:\n`;

  config.services.forEach(service => {
    // Skip empty service names
    const serviceName = service.name.trim() || `service_${service.id.substring(0, 4)}`;
    
    yaml += `  ${serviceName}:\n`;
    yaml += `    image: ${service.image.trim() || 'nginx:latest'}\n`;
    
    if (service.restart !== 'no') {
      yaml += `    restart: ${service.restart}\n`;
    }

    if (service.ports && service.ports.length > 0) {
      const validPorts = service.ports.filter(p => p.host && p.container);
      if (validPorts.length > 0) {
        yaml += `    ports:\n`;
        validPorts.forEach(p => {
          yaml += `      - "${p.host}:${p.container}"\n`;
        });
      }
    }

    if (service.volumes && service.volumes.length > 0) {
      const validVolumes = service.volumes.filter(v => v.host && v.container);
      if (validVolumes.length > 0) {
        yaml += `    volumes:\n`;
        validVolumes.forEach(v => {
          yaml += `      - ${v.host}:${v.container}\n`;
        });
      }
    }

    if (service.environment && service.environment.length > 0) {
      const validEnvs = service.environment.filter(e => e.key);
      if (validEnvs.length > 0) {
        yaml += `    environment:\n`;
        validEnvs.forEach(e => {
          // Add quotes if value contains spaces
          const val = e.value.includes(' ') ? `"${e.value}"` : e.value;
          yaml += `      - ${e.key}=${val}\n`;
        });
      }
    }

    if (service.dependsOn && service.dependsOn.length > 0) {
      yaml += `    depends_on:\n`;
      service.dependsOn.forEach(dep => {
        yaml += `      - ${dep}\n`;
      });
    }

    yaml += `\n`;
  });

  return yaml.trim();
}
