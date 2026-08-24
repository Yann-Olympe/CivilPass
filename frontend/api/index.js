export default async (req, res) => {
  const { reqHandler } = await import('../dist/frontend/server/server.mjs');
  return reqHandler(req, res);
};