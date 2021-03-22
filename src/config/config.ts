interface Config {
  url: string;
  apiUrl: string;
  uploadsUrl: string;
  dbUri: string;
  withConsoleTransport: boolean;
  port: number;
}

type EnvConfig = { [key: string]: Config };

const config: EnvConfig = {
  development: {
    url: "http://localhost:4000",
    apiUrl: "http://localhost:4000/api",
    uploadsUrl: "http://localhost:4000/uploads",
    dbUri: "mongodb://localhost:27017/stream_particles_development",
    withConsoleTransport: true,
    port: 4000,
  },
  test: {
    url: "http://localhost:4000",
    apiUrl: "http://localhost:4000/api",
    uploadsUrl: "http://localhost:4000/uploads",
    dbUri: "mongodb://localhost:27017/stream_particles_test",
    withConsoleTransport: false,
    port: 4000,
  },
  staging: {
    url: "https://staging.streamparticles.io",
    apiUrl: "https://staging.streamparticles.io/api",
    uploadsUrl: "https://staging.streamparticles.io/uploads",
    dbUri: "mongodb://localhost:27017/stream_particles_staging",
    withConsoleTransport: false,
    port: 4001,
  },
  production: {
    url: "https://streamparticles.io",
    apiUrl: "https://streamparticles.io/api",
    uploadsUrl: "https://streamparticles.io/uploads",
    dbUri: "mongodb://localhost:27017/stream_particles",
    withConsoleTransport: false,
    port: 4000,
  },
};

export default process.env.NODE_ENV && config[process.env.NODE_ENV]
  ? config[process.env.NODE_ENV]
  : config["development"];
