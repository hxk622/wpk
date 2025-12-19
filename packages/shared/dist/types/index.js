"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Rank = exports.Suit = exports.PlayerPosition = exports.PlayerStatus = exports.PlayerAction = exports.GameRound = exports.GameStatus = exports.RoomStatus = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["PLAYER"] = "player";
    UserRole["ADMIN"] = "admin";
    UserRole["GUEST"] = "guest";
})(UserRole || (exports.UserRole = UserRole = {}));
var RoomStatus;
(function (RoomStatus) {
    RoomStatus["WAITING"] = "waiting";
    RoomStatus["PLAYING"] = "playing";
    RoomStatus["CLOSED"] = "closed";
})(RoomStatus || (exports.RoomStatus = RoomStatus = {}));
var GameStatus;
(function (GameStatus) {
    GameStatus["PENDING"] = "pending";
    GameStatus["FLOP"] = "flop";
    GameStatus["TURN"] = "turn";
    GameStatus["RIVER"] = "river";
    GameStatus["SHOWDOWN"] = "showdown";
    GameStatus["COMPLETED"] = "completed";
})(GameStatus || (exports.GameStatus = GameStatus = {}));
var GameRound;
(function (GameRound) {
    GameRound["PREFLOP"] = "preflop";
    GameRound["FLOP"] = "flop";
    GameRound["TURN"] = "turn";
    GameRound["RIVER"] = "river";
    GameRound["SHOWDOWN"] = "showdown";
})(GameRound || (exports.GameRound = GameRound = {}));
var PlayerAction;
(function (PlayerAction) {
    PlayerAction["FOLD"] = "fold";
    PlayerAction["CHECK"] = "check";
    PlayerAction["CALL"] = "call";
    PlayerAction["RAISE"] = "raise";
    PlayerAction["BET"] = "bet";
    PlayerAction["ALL_IN"] = "all_in";
})(PlayerAction || (exports.PlayerAction = PlayerAction = {}));
var PlayerStatus;
(function (PlayerStatus) {
    PlayerStatus["ACTIVE"] = "active";
    PlayerStatus["FOLDED"] = "folded";
    PlayerStatus["ALL_IN"] = "all_in";
    PlayerStatus["OUT"] = "out";
})(PlayerStatus || (exports.PlayerStatus = PlayerStatus = {}));
var PlayerPosition;
(function (PlayerPosition) {
    PlayerPosition["SB"] = "sb";
    PlayerPosition["BB"] = "bb";
    PlayerPosition["UTG"] = "utg";
    PlayerPosition["MP"] = "mp";
    PlayerPosition["CO"] = "co";
    PlayerPosition["BTN"] = "btn";
})(PlayerPosition || (exports.PlayerPosition = PlayerPosition = {}));
var Suit;
(function (Suit) {
    Suit["HEARTS"] = "hearts";
    Suit["DIAMONDS"] = "diamonds";
    Suit["CLUBS"] = "clubs";
    Suit["SPADES"] = "spades";
})(Suit || (exports.Suit = Suit = {}));
var Rank;
(function (Rank) {
    Rank["TWO"] = "2";
    Rank["THREE"] = "3";
    Rank["FOUR"] = "4";
    Rank["FIVE"] = "5";
    Rank["SIX"] = "6";
    Rank["SEVEN"] = "7";
    Rank["EIGHT"] = "8";
    Rank["NINE"] = "9";
    Rank["TEN"] = "10";
    Rank["JACK"] = "J";
    Rank["QUEEN"] = "Q";
    Rank["KING"] = "K";
    Rank["ACE"] = "A";
})(Rank || (exports.Rank = Rank = {}));
