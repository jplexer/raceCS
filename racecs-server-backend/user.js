const WebSocket = require("./ws");

class User {
    visited = [];
    username = null;
    id = null;
    place = -1;
    team = null;

    constructor(username, id) {
        this.username = username;
        this.id = id;
    }

    markVisited(station, stationName) {
        this.visited.push(station);

        let isTeamVisitation = false;
        let body = `${this.username} has arrived at ${stationName}!`;
        let icon = "login_notification.png";
        let color = 0x008000;
        if (this.team) {
            if (!this.team.visited) this.team.visited = [];
            if (!this.team.visited.includes(station)) {
                this.team.visited.push(station);
                body = `${this.username} has arrived at ${stationName} and has claimed it for ${this.team.name}!`;
                // icon = "login_notification.png";
                isTeamVisitation = true;
            } else {
                icon = "arrive_no_claim_notification.png";
                color = 0x808080;
            }
        }

        WebSocket.broadcast({
            "type": "visitation",
            "user": this.username,
            "uuid": this.id,
            "station": station,
            "team": isTeamVisitation ? this.team?.id : null
        });
        WebSocket.broadcastNotification({
            body: body,
            icon: icon
        });
        WebSocket.broadcastDiscord({
            author: {
                name: "Arrival!",
                icon_url: `https://aircs.racing/${icon}`
            },
            description: body,
            color: color
        });
    }

    setPlace(place) {
        this.place = place;
        WebSocket.broadcast({
            "type": "completion",
            "username" : this.username,
            "place": place
        });
        WebSocket.broadcastNotification({
            body: `${this.username} has finished as #${place}!`,
            icon: "finish_notification.png"
        });
        WebSocket.broadcastDiscord({
            author: {
                name: "Finished!",
                icon_url: "https://aircs.racing/finish_notification.png"
            },
            description: `${this.username} has finished as #${place}!`,
            color: 16753920
        });
    }

    setTeam(team) {
        this.team = team;
    }

    clear() {
        this.visited = [];
        this.place = -1;
    }

    toObject() {
        return {
            uuid: this.id,
            visited: this.visited,
            place: this.place
        }
    }
}

module.exports = User;