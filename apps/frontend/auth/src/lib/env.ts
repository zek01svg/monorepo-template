export function getEnv() {
  console.log(import.meta.env.MODE);
  return window.__env ?? { ...import.meta.env, NODE_ENV: import.meta.env.MODE };
}
