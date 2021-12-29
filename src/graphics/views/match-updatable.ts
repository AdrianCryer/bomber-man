import Match from "../../model/gamemodes/match";

export interface IMatchUpdatable {
    onUpdate: (match: Match) => void;
}