const express = require("express");
const app = express();
app.use(express.json());
const sqlite3 = require("sqlite3");
const path = require("path");
const { open } = require("sqlite");

const dbPath = path.join(__dirname, "cricketTeam.db");
let db = null;
const initializeDBandServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server running at port:3000");
    });
  } catch (err) {
    process.exit(1);
    response.send(err);
  }
};

initializeDBandServer();

const updatePlayersArray = (playerDetails) => {
  const newPlayerDetailsArray = playerDetails.map((player) => {
    const { player_id, player_name, jersey_number, role } = player;
    return {
      playerId: player_id,
      playerName: player_name,
      jerseyNumber: jersey_number,
      role: role,
    };
  });
  return newPlayerDetailsArray;
};

//GET players API
app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
    SELECT * FROM cricket_team ;
    `;
  const playersDetails = await db.all(getPlayersQuery);
  const updatedPlayerDetails = updatePlayersArray(playersDetails);
  response.send(updatedPlayerDetails);
});

//Add Player API
app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayerQuery = `
      INSERT INTO
      cricket_team(player_name,jersey_number,role)
      VALUES(
          '${playerName}',
          ${jerseyNumber},
          '${role}'
      );
      `;
  const addedPlayer = await db.run(addPlayerQuery);
  response.send({ playerId: addedPlayer.lastID });
});

//GET playerDetails from player_id API
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerDetailsQuery = `
    SELECT * 
    FROM cricket_team
    WHERE player_id = ${playerId}
    `;
  const playerDetails = await db.get(getPlayerDetailsQuery);
  const { player_id, player_name, jersey_number, role } = playerDetails;
  const updatedPlayerDetails = {
    playerId: player_id,
    playerName: player_name,
    jerseyNumber: jersey_number,
    role: role,
  };
  response.send(updatedPlayerDetails);
});

//UPDATE player details API
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updatePlayerDetailsQuery = `
  UPDATE cricket_team 
  SET 
      player_name='${playerName}',
      jersey_number=${jerseyNumber},
      role='${role}'
  
  WHERE player_id = ${playerId}
  `;
  await db.run(updatePlayerDetailsQuery);
  response.send("Player Details Updated ");
});

//DELETE playerDetails API
app.delete("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
  DELETE FROM cricket_team 
  WHERE player_id = ${playerId}
  `;
  db.run(deletePlayerQuery);
  response.send("Player Deleted Successfully!");
});
