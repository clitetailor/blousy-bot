let neo4j = require('neo4j-driver').v1;

let driver = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("neo4j", "for server"));
let session = driver.session();

session
  .run("CREATE (a:Person {name: {name}, title: {title}})", { name: "Arthur", title: "King" })
  .then(function () {
    return session.run("MATCH (a:Person) WHERE a.name = {name} RETURN a.name AS name, a.title AS title",
      { name: "Arthur" })
  })
  .then(function (result) {
    console.log(result.records[0].get("title") + " " + result.records[0].get("name"));
    session.close();
    driver.close();
  });
