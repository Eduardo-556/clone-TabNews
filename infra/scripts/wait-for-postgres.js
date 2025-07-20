import { exec } from "child_process";

function checkPostgres() {
  exec("docker exec postgres-dev pg_isready --host localhost", handleReturn);

  function handleReturn(error, stdout) {
    if (stdout.search("accepting connections") === -1) {
      process.stdout._write(".");
      checkPostgres();
      return;
    }
    console.log("\n🟢 Postgres está pronto e aceitando conexões\n");
  }
}

process.stdout._write("\n\n🔴 Aguardando Postgres aceitar conexões ");
checkPostgres();
