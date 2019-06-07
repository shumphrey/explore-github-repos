export async function getToken(): Promise<string> {
  const { GITHUB_TOKEN } = process.env;
  if (!GITHUB_TOKEN) {
    throw new Error("Missing environment variable GITHUB_TOKEN");
  }
  return Promise.resolve(GITHUB_TOKEN);
}
