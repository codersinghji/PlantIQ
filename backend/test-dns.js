import dns from "dns";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

console.log("Testing MongoDB DNS...");

dns.resolveSrv(
  "_mongodb._tcp.cluster0.0itmlor.mongodb.net",
  (error, records) => {
    if (error) {
      console.error("❌ DNS ERROR:");
      console.error(error);
      return;
    }

    console.log("✅ MongoDB DNS WORKS:");
    console.log(records);
  }
);