module.exports = [
  {
    input: "src/api/datti",
    openapi: { inputFile: "https://haebeal.github.io/datti-api/openapi.yaml" },
  },
  {
    input: "src/api/banks",
    baseURL: "https://bank.teraren.com",
  },
];
