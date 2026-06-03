export type BackendName = "java" | "python";

export type BackendConfig = {
  name: BackendName;
  baseUrl: string;
  appEnv: string;
};

export type BackendRegistry = Record<BackendName, BackendConfig>;

export type BackendEnv = Readonly<{
  APP_ENV?: string;
  JAVA_API_BASE_URL?: string;
  PYTHON_API_BASE_URL?: string;
  [key: string]: string | undefined;
}>;

export function createBackendRegistry(env: BackendEnv = process.env): BackendRegistry {
  const appEnv = env.APP_ENV ?? "prod";

  return {
    java: {
      name: "java",
      baseUrl: requireEnvUrl(env.JAVA_API_BASE_URL, "JAVA_API_BASE_URL"),
      appEnv
    },
    python: {
      name: "python",
      baseUrl: requireEnvUrl(env.PYTHON_API_BASE_URL, "PYTHON_API_BASE_URL"),
      appEnv
    }
  };
}

export function resolveBackend(registry: BackendRegistry, backend: BackendName): BackendConfig {
  return registry[backend];
}

function requireEnvUrl(value: string | undefined, name: string) {
  if (!value) {
    throw new Error(`${name} is required.`);
  }

  return value.replace(/\/+$/, "");
}
