interface Config {
  url: string;
  apiUrl: string;
  uploadsUrl: string;
}

type EnvConfig = { [key: string]: Config };

const config: EnvConfig = {
  development: {
    url: "http://localhost:4000",
    apiUrl: "http://localhost:4000/api",
    uploadsUrl: "http://localhost:4000/uploads",
  },
  production: {
    url: "https://streamparticles.io",
    apiUrl: "https://streamparticles.io/api",
    uploadsUrl: "https://streamparticles.io/uploads",
  },
};

export default process.env.NODE_ENV && config[process.env.NODE_ENV]
  ? config[process.env.NODE_ENV]
  : config["development"];
