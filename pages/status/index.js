import useSWR from "swr";

async function feathAPI(key) {
  const response = await fetch(key);
  const responseBody = await response.json();
  return responseBody;
}

export default function StatusPage() {
  return (
    <>
      <h1>Status</h1>
      <UpdatedAt />
      <Database />
    </>
  );
}

function UpdatedAt() {
  const { isLoading, data } = useSWR("/api/v1/status", feathAPI, {
    refreshInterval: 2000,
  });

  let updatedAtText = "Carregando...";
  if (!isLoading && data) {
    updatedAtText = new Date(data.updated_at).toLocaleString("pt-BR");
  }
  return <div>Última atualização: {updatedAtText}</div>;
}

function Database() {
  const { isLoading, data } = useSWR("/api/v1/status", feathAPI, {
    refreshInterval: 2000,
  });
  let databaseTextVersion = "Carregando...";
  let databaseTextMaxConnections = "Carregando...";
  let databaseTextOpenedConnections = "Carregando...";
  if (!isLoading && data) {
    databaseTextVersion = data.dependencies.database.version;
    databaseTextMaxConnections = data.dependencies.database.max_connections;
    databaseTextOpenedConnections =
      data.dependencies.database.opened_connections;
  }
  return (
    <div>
      <p>Versão do Database: {databaseTextVersion}</p>
      <p>Número máximo de conexões: {databaseTextMaxConnections}</p>
      <p>Número de conexões abertas: {databaseTextOpenedConnections}</p>
    </div>
  );
}
